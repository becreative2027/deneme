import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { FeedStackParamList, Post } from '../../types';
import { useFollowingFeed, useExploreFeed } from '../../hooks/useFeed';
import { useFeedStore, FeedTab } from '../../store/feedStore';
import { useAnalytics } from '../../hooks/useAnalytics';
import { haptic } from '../../utils/haptics';
import { useTheme, ThemeColors } from '../../theme';
import { PostCard } from '../../components/PostCard';
import { CommentsModal } from '../../components/CommentsModal';
import { ExploreTab } from './ExploreTab';
import { ForYouFeed } from './ForYouFeed';
import { PostSkeleton } from '../../components/SkeletonLoader';
import { ErrorState } from '../../components/ErrorState';
import { EmptyState } from '../../components/EmptyState';
import { useLikePost } from '../../hooks/usePosts';
import { useRatingPrompt } from '../../hooks/useRatingPrompt';

type Props = { navigation: NativeStackNavigationProp<FeedStackParamList, 'Feed'> };

// TABS is built dynamically inside the component so labels can be translated

export function FeedScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const TABS: { key: FeedTab; label: string }[] = [
    { key: 'following', label: t('feed.tabs.following') },
    { key: 'explore', label: t('feed.tabs.explore') },
    { key: 'personalized', label: t('feed.tabs.forYou') },
  ];
  const { activeTab, setActiveTab } = useFeedStore();
  const following = useFollowingFeed();
  const explore = useExploreFeed();
  const likeMutation = useLikePost();
  const [commentPostId, setCommentPostId] = useState<string | null>(null);
  const { trackScreen, trackEvent } = useAnalytics();
  const { trackAction } = useRatingPrompt();
  const theme = useTheme();
  const s = useMemo(() => createStyles(theme.colors), [theme.colors]);
  const tabBarHeight = useBottomTabBarHeight();

  useEffect(() => {
    trackScreen('FeedScreen');
  }, []);

  const activeQuery = activeTab === 'following' ? following : explore;
  const allPosts: Post[] = (activeQuery.data?.pages.flatMap((p) => p.items) ?? []).filter((p) => !!p.imageUrl);

  const handleTabChange = useCallback(
    (tab: FeedTab) => {
      setActiveTab(tab);
      haptic.medium();
      trackEvent('feed_tab_change', { tab });
    },
    [setActiveTab, trackEvent],
  );

  const handleLike = useCallback(
    (postId: string, currentlyLiked: boolean) => {
      likeMutation.mutate({ postId, liked: currentlyLiked });
      trackEvent('post_like', { postId, liked: !currentlyLiked });
      if (!currentlyLiked) trackAction(); // only track when liking (not unliking)
    },
    [likeMutation, trackEvent, trackAction],
  );

  const handlePressPlace = useCallback(
    (placeId: string) => {
      navigation.push('PlaceDetail', { placeId });
      trackEvent('place_open', { placeId, source: 'feed' });
      trackAction();
    },
    [navigation, trackEvent, trackAction],
  );

  const renderPost = useCallback(
    ({ item }: { item: Post }) => (
      <PostCard
        post={item}
        onLike={handleLike}
        onPressPlace={handlePressPlace}
        onPressUser={(userId) => navigation.push('UserProfile', { userId })}
        onPressComment={(postId) => setCommentPostId(postId)}
      />
    ),
    [handleLike, handlePressPlace, navigation],
  );

  const handleEndReached = useCallback(() => {
    if (activeQuery.hasNextPage && !activeQuery.isFetchingNextPage) {
      activeQuery.fetchNextPage();
    }
  }, [activeQuery]);

  const keyExtractor = useCallback((item: Post) => item.id, []);

  // For You tab: full-screen immersive feed (no SafeAreaView chrome, no tab bar)
  if (activeTab === 'personalized') {
    return (
      <View style={s.fullScreen}>
        {/* Floating tab bar overlay for tab switching */}
        <View style={s.floatingTabs}>
          {TABS.map((t) => (
            <TouchableOpacity
              key={t.key}
              onPress={() => { handleTabChange(t.key); }}
              style={s.floatingTab}
            >
              <Text style={[
                s.floatingTabText,
                activeTab === t.key && s.floatingTabTextActive,
              ]}>
                {t.label}
              </Text>
              {activeTab === t.key && <View style={s.floatingTabUnderline} />}
            </TouchableOpacity>
          ))}
        </View>
        <ForYouFeed navigation={navigation} bottomPadding={tabBarHeight} />
      </View>
    );
  }

  if (activeTab !== 'explore' && activeQuery.isLoading) {
    return (
      <SafeAreaView style={s.container} edges={['top']}>
        <TabBar activeTab={activeTab} onSelect={handleTabChange} colors={theme.colors} tabs={TABS} />
        {[0, 1, 2].map((i) => <PostSkeleton key={i} />)}
      </SafeAreaView>
    );
  }

  if (activeTab !== 'explore' && activeQuery.isError) {
    return (
      <SafeAreaView style={s.container} edges={['top']}>
        <TabBar activeTab={activeTab} onSelect={handleTabChange} colors={theme.colors} tabs={TABS} />
        <ErrorState onRetry={() => activeQuery.refetch()} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <TabBar activeTab={activeTab} onSelect={handleTabChange} colors={theme.colors} tabs={TABS} />

      {activeTab === 'explore' ? (
        <ExploreTab
          onPressPlace={(placeId) => {
            navigation.push('PlaceDetail', { placeId });
            trackEvent('place_open', { placeId, source: 'explore' });
          }}
          bottomPadding={tabBarHeight}
        />
      ) : (
        <FlatList
          data={allPosts}
          keyExtractor={keyExtractor}
          renderItem={renderPost}
          initialNumToRender={4}
          maxToRenderPerBatch={5}
          windowSize={8}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.4}
          refreshControl={
            <RefreshControl
              refreshing={activeQuery.isRefetching}
              onRefresh={() => activeQuery.refetch()}
              tintColor={theme.colors.primary}
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon="newspaper-outline"
              title={t('feed.empty.title')}
              subtitle={t('feed.empty.subtitle')}
            />
          }
          ListFooterComponent={
            activeQuery.isFetchingNextPage ? (
              <ActivityIndicator color={theme.colors.primary} style={{ padding: 16 }} />
            ) : null
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={allPosts.length === 0 ? { flex: 1 } : { paddingBottom: tabBarHeight }}
        />
      )}

      <CommentsModal
        visible={!!commentPostId}
        postId={commentPostId ?? ''}
        onClose={() => setCommentPostId(null)}
        onPressUser={(userId) => {
          setCommentPostId(null);
          navigation.push('UserProfile', { userId });
        }}
      />
    </SafeAreaView>
  );
}

// ── Tab bar ───────────────────────────────────────────────────────────────────

function TabBar({
  activeTab,
  onSelect,
  colors,
  tabs,
}: {
  activeTab: FeedTab;
  onSelect: (tab: FeedTab) => void;
  colors: ThemeColors;
  tabs: { key: FeedTab; label: string }[];
}) {
  const s = useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={s.tabBar}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={[s.tab, activeTab === tab.key && s.tabActive]}
          onPress={() => onSelect(tab.key)}
        >
          <Text style={[s.tabText, activeTab === tab.key && s.tabTextActive]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ── Theme-aware styles ────────────────────────────────────────────────────────

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background },
    tabBar: {
      flexDirection: 'row',
      backgroundColor: c.tabBar,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.tabBarBorder,
    },
    tab: { flex: 1, paddingVertical: 13, alignItems: 'center' },
    tabActive: { borderBottomWidth: 2, borderBottomColor: c.primary },
    tabText: { fontSize: 14, color: c.textMuted, fontWeight: '500' },
    tabTextActive: { color: c.primary, fontWeight: '700' },

    // ── For You immersive mode ─────────────────────────────────────────────
    fullScreen: { flex: 1, backgroundColor: '#000' },
    floatingTabs: {
      position: 'absolute',
      top: 56, // below status bar
      left: 0, right: 0,
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 24,
      zIndex: 10,
    },
    floatingTab: { alignItems: 'center', paddingHorizontal: 4, paddingBottom: 4 },
    floatingTabText: {
      fontSize: 15,
      fontWeight: '600',
      color: 'rgba(255,255,255,0.55)',
      textShadowColor: 'rgba(0,0,0,0.4)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 3,
    },
    floatingTabTextActive: {
      color: '#fff',
      fontWeight: '700',
    },
    floatingTabUnderline: {
      marginTop: 3,
      height: 2,
      width: '100%',
      backgroundColor: '#fff',
      borderRadius: 1,
    },
  });

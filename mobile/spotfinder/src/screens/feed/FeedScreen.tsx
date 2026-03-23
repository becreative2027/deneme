import React, { useCallback, useEffect, useMemo } from 'react';
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
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FeedStackParamList, Post } from '../../types';
import { useFollowingFeed, useExploreFeed, usePersonalizedFeed } from '../../hooks/useFeed';
import { useFeedStore, FeedTab } from '../../store/feedStore';
import { useAnalytics } from '../../hooks/useAnalytics';
import { haptic } from '../../utils/haptics';
import { useTheme, ThemeColors } from '../../theme';
import { PostCard } from '../../components/PostCard';
import { PostSkeleton } from '../../components/SkeletonLoader';
import { ErrorState } from '../../components/ErrorState';
import { EmptyState } from '../../components/EmptyState';
import { useLikePost } from '../../hooks/usePosts';

type Props = { navigation: NativeStackNavigationProp<FeedStackParamList, 'Feed'> };

const TABS: { key: FeedTab; label: string }[] = [
  { key: 'following', label: 'Following' },
  { key: 'explore', label: 'Explore' },
  { key: 'personalized', label: 'For You' },
];

export function FeedScreen({ navigation }: Props) {
  const { activeTab, setActiveTab } = useFeedStore();
  const following = useFollowingFeed();
  const explore = useExploreFeed();
  const personalized = usePersonalizedFeed();
  const likeMutation = useLikePost();
  const { trackScreen, trackEvent } = useAnalytics();
  const theme = useTheme();
  const s = useMemo(() => createStyles(theme.colors), [theme.colors]);

  useEffect(() => {
    trackScreen('FeedScreen');
  }, []);

  const activeQuery =
    activeTab === 'following' ? following
    : activeTab === 'explore' ? explore
    : personalized;

  const allPosts: Post[] = activeQuery.data?.pages.flatMap((p) => p.items) ?? [];

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
    },
    [likeMutation, trackEvent],
  );

  const handlePressPlace = useCallback(
    (placeId: string) => {
      navigation.push('PlaceDetail', { placeId });
      trackEvent('place_open', { placeId, source: 'feed' });
    },
    [navigation, trackEvent],
  );

  const renderPost = useCallback(
    ({ item }: { item: Post }) => (
      <PostCard
        post={item}
        onLike={handleLike}
        onPressPlace={handlePressPlace}
        onPressUser={(userId) => navigation.push('UserProfile', { userId })}
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

  if (activeQuery.isLoading) {
    return (
      <SafeAreaView style={s.container} edges={['top']}>
        <TabBar activeTab={activeTab} onSelect={handleTabChange} colors={theme.colors} />
        {[0, 1, 2].map((i) => <PostSkeleton key={i} />)}
      </SafeAreaView>
    );
  }

  if (activeQuery.isError) {
    return (
      <SafeAreaView style={s.container} edges={['top']}>
        <TabBar activeTab={activeTab} onSelect={handleTabChange} colors={theme.colors} />
        <ErrorState onRetry={() => activeQuery.refetch()} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <TabBar activeTab={activeTab} onSelect={handleTabChange} colors={theme.colors} />
      <FlatList
        data={allPosts}
        keyExtractor={keyExtractor}
        renderItem={renderPost}
        initialNumToRender={4}
        maxToRenderPerBatch={5}
        windowSize={8}
        removeClippedSubviews
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
            title="No posts yet"
            subtitle="Follow people or explore to see content here."
          />
        }
        ListFooterComponent={
          activeQuery.isFetchingNextPage ? (
            <ActivityIndicator color={theme.colors.primary} style={{ padding: 16 }} />
          ) : null
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={allPosts.length === 0 ? { flex: 1 } : undefined}
      />
    </SafeAreaView>
  );
}

// ── Tab bar ───────────────────────────────────────────────────────────────────

function TabBar({
  activeTab,
  onSelect,
  colors,
}: {
  activeTab: FeedTab;
  onSelect: (tab: FeedTab) => void;
  colors: ThemeColors;
}) {
  const s = useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={s.tabBar}>
      {TABS.map((t) => (
        <TouchableOpacity
          key={t.key}
          style={[s.tab, activeTab === t.key && s.tabActive]}
          onPress={() => onSelect(t.key)}
        >
          <Text style={[s.tabText, activeTab === t.key && s.tabTextActive]}>
            {t.label}
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
  });

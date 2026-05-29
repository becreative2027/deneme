import React, { useCallback, useRef, useState } from 'react';
import {
  FlatList,
  View,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  ViewToken,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FeedStackParamList, Post } from '../../types';
import { usePersonalizedFeed } from '../../hooks/useFeed';
import { useLikePost } from '../../hooks/usePosts';
import { useTheme } from '../../theme';
import { ForYouCard } from './ForYouCard';
import { EmptyState } from '../../components/EmptyState';
import { PostSkeleton } from '../../components/SkeletonLoader';
import { CommentsModal } from '../../components/CommentsModal';

const { height: H } = Dimensions.get('window');

interface Props {
  navigation: NativeStackNavigationProp<FeedStackParamList, 'Feed'>;
  bottomPadding?: number;
}

export function ForYouFeed({ navigation, bottomPadding = 0 }: Props) {
  const { colors } = useTheme();
  const feed = usePersonalizedFeed();
  const likeMutation = useLikePost();
  const [commentPostId, setCommentPostId] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const allPosts: Post[] = (feed.data?.pages.flatMap((p) => p.items) ?? []).filter(
    (p) => !!p.imageUrl,
  );

  // Track active (visible) item for potential future use (e.g. auto-play video)
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setActiveIndex(viewableItems[0].index);
      }
    },
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 60,
  }).current;

  const handleLike = useCallback(
    (postId: string, currentlyLiked: boolean) => {
      likeMutation.mutate({ postId, liked: currentlyLiked });
    },
    [likeMutation],
  );

  const handleEndReached = useCallback(() => {
    if (feed.hasNextPage && !feed.isFetchingNextPage) {
      feed.fetchNextPage();
    }
  }, [feed]);

  const getItemLayout = useCallback(
    (_: any, index: number) => ({ length: H, offset: H * index, index }),
    [],
  );

  const keyExtractor = useCallback((item: Post) => item.id, []);

  const renderItem = useCallback(
    ({ item, index }: { item: Post; index: number }) => (
      <ForYouCard
        post={item}
        isActive={index === activeIndex}
        onLike={handleLike}
        onComment={(postId) => setCommentPostId(postId)}
        onPressPlace={(placeId) => navigation.push('PlaceDetail', { placeId })}
        onPressUser={(userId) => navigation.push('UserProfile', { userId })}
      />
    ),
    [activeIndex, handleLike, navigation],
  );

  if (feed.isLoading) {
    return (
      <View style={[s.container, { backgroundColor: colors.background }]}>
        {[0, 1, 2].map((i) => <PostSkeleton key={i} />)}
      </View>
    );
  }

  return (
    <>
      <FlatList
        data={allPosts}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        getItemLayout={getItemLayout}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        decelerationRate="fast"
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.3}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        initialNumToRender={2}
        maxToRenderPerBatch={3}
        windowSize={5}
        removeClippedSubviews
        ListEmptyComponent={
          <View style={[s.empty, { backgroundColor: colors.background }]}>
            <EmptyState
              icon="compass-outline"
              title="Henüz içerik yok"
              subtitle="Uygulamayı kullandıkça For You sana göre şekillenecek."
            />
          </View>
        }
        ListFooterComponent={
          feed.isFetchingNextPage ? (
            <View style={s.footer}>
              <ActivityIndicator color="#fff" />
            </View>
          ) : null
        }
      />

      <CommentsModal
        visible={!!commentPostId}
        postId={commentPostId ?? ''}
        onClose={() => setCommentPostId(null)}
        onPressUser={(userId) => {
          setCommentPostId(null);
          navigation.push('UserProfile', { userId });
        }}
      />
    </>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  empty: {
    height: H,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    height: H,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
  },
});

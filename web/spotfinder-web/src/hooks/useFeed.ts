'use client';

import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getFollowingFeed, getExploreFeed, getPersonalizedFeed } from '@/api/feed';
import { likePost, unlikePost } from '@/api/posts';
import { FeedPage, Post } from '@/lib/types';

export function useFollowingFeed() {
  return useInfiniteQuery({
    queryKey: ['feed', 'following'],
    queryFn: ({ pageParam }) => getFollowingFeed(pageParam as string | undefined),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage: FeedPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
  });
}

export function useExploreFeed() {
  return useInfiniteQuery({
    queryKey: ['feed', 'explore'],
    queryFn: ({ pageParam }) => getExploreFeed(pageParam as string | undefined),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage: FeedPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
  });
}

export function usePersonalizedFeed() {
  return useInfiniteQuery({
    queryKey: ['feed', 'personalized'],
    queryFn: ({ pageParam }) => getPersonalizedFeed(pageParam as string | undefined),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage: FeedPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
  });
}

export function useLikePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, liked }: { postId: string; liked: boolean }) => {
      if (liked) {
        await unlikePost(postId);
      } else {
        await likePost(postId);
      }
    },
    onMutate: async ({ postId, liked }) => {
      // Optimistic update across all feed queries
      const feedKeys = [
        ['feed', 'following'],
        ['feed', 'explore'],
        ['feed', 'personalized'],
      ];

      for (const key of feedKeys) {
        await queryClient.cancelQueries({ queryKey: key });
        queryClient.setQueryData(key, (old: any) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page: FeedPage) => ({
              ...page,
              items: page.items.map((post: Post) =>
                post.id === postId
                  ? {
                      ...post,
                      isLiked: !liked,
                      likeCount: liked ? post.likeCount - 1 : post.likeCount + 1,
                    }
                  : post,
              ),
            })),
          };
        });
      }

      // Also update place posts and user posts queries
      queryClient.setQueriesData({ queryKey: ['placePosts'] }, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: FeedPage) => ({
            ...page,
            items: page.items.map((post: Post) =>
              post.id === postId
                ? { ...post, isLiked: !liked, likeCount: liked ? post.likeCount - 1 : post.likeCount + 1 }
                : post,
            ),
          })),
        };
      });

      queryClient.setQueriesData({ queryKey: ['userPosts'] }, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: FeedPage) => ({
            ...page,
            items: page.items.map((post: Post) =>
              post.id === postId
                ? {
                    ...post,
                    isLiked: !liked,
                    likeCount: liked ? post.likeCount - 1 : post.likeCount + 1,
                  }
                : post,
            ),
          })),
        };
      });
    },
  });
}

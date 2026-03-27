'use client';

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getUserProfile, getUserPosts, followUser, unfollowUser, getFollowerIds, getFollowingIds, getUsersByIds } from '@/api/users';
import { useAuthStore } from '@/store/authStore';
import { FeedPage } from '@/lib/types';

export function useMe() {
  const userId = useAuthStore((s) => s.user?.id);
  return useQuery({
    queryKey: ['me', userId],
    queryFn: () => getUserProfile(userId!),
    enabled: !!userId,
    staleTime: 60_000,
  });
}

export function useUserProfile(userId: string) {
  return useQuery({
    queryKey: ['userProfile', userId],
    queryFn: () => getUserProfile(userId),
    enabled: !!userId,
    staleTime: 30_000,
  });
}

export function useUserPosts(userId: string) {
  return useInfiniteQuery({
    queryKey: ['userPosts', userId],
    queryFn: ({ pageParam }) => getUserPosts(userId, pageParam as string | undefined),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage: FeedPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
    enabled: !!userId,
  });
}

export function useFollowList(userId: string, type: 'followers' | 'following') {
  return useQuery({
    queryKey: ['followList', userId, type],
    queryFn: async () => {
      const ids = type === 'followers'
        ? await getFollowerIds(userId)
        : await getFollowingIds(userId);
      if (ids.length === 0) return [];
      return getUsersByIds(ids);
    },
    enabled: !!userId,
    staleTime: 30_000,
  });
}

export function useFollowUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, isFollowing }: { userId: string; isFollowing: boolean }) => {
      if (isFollowing) {
        await unfollowUser(userId);
      } else {
        await followUser(userId);
      }
    },
    onSuccess: (_, { userId, isFollowing }) => {
      // Update the user profile cache
      queryClient.setQueryData(['userProfile', userId], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          isFollowing: !isFollowing,
          followersCount: isFollowing ? old.followersCount - 1 : old.followersCount + 1,
        };
      });
      // Invalidate me query since my following count changes
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
  });
}

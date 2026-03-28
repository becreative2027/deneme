'use client';

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getUserProfile, getUserPosts, followUser, unfollowUser, getFollowerIds, getFollowingIds, getUsersByIds, searchUsers } from '@/api/users';
import { UserSearchResponse } from '@/api/users';
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

export function useUserSearch(query: string, enabled: boolean) {
  return useQuery<UserSearchResponse>({
    queryKey: ['userSearch', query],
    queryFn: () => searchUsers(query),
    enabled: enabled && query.length >= 2,
    staleTime: 15_000,
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
      queryClient.setQueryData(['userProfile', userId], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          isFollowing: !isFollowing,
          followersCount: isFollowing ? old.followersCount - 1 : old.followersCount + 1,
        };
      });
      // Unfollow → kişiyi "Takip Edilenler" listesinden anında çıkar
      queryClient.setQueriesData(
        { queryKey: ['followList'], exact: false },
        (old: any) => {
          if (!Array.isArray(old)) return old;
          if (isFollowing) {
            // takipten çıkıldı → listeden kaldır
            return old.filter((u: any) => u.id !== userId);
          }
          return old;
        },
      );
      queryClient.invalidateQueries({ queryKey: ['me'] });
      queryClient.invalidateQueries({ queryKey: ['followList'] });
    },
  });
}

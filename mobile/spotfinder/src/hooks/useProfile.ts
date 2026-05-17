import { useQuery, useMutation, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { getMe, getUserProfile, getUserPosts, followUser, unfollowUser, updateProfile, getFollowerIds, getFollowingIds, getUsersByIds } from '../api/users';
import { useAuthStore } from '../store/authStore';
import { FeedPage, UserProfile } from '../types';

export function useMe() {
  return useQuery({
    queryKey: ['users', 'me'],
    queryFn: getMe,
    staleTime: 1000 * 60 * 2,
  });
}

export function useUserProfile(userId: string) {
  return useQuery({
    queryKey: ['users', userId],
    queryFn: async () => {
      const profile = await getUserProfile(userId);
      // Backend may not populate isFollowing — check explicitly via following list
      if (profile.isFollowing === undefined || profile.isFollowing === null) {
        const meId = useAuthStore.getState().user?.id;
        if (meId && meId !== userId) {
          try {
            const followingIds = await getFollowingIds(meId);
            profile.isFollowing = followingIds.includes(userId);
          } catch {
            profile.isFollowing = false;
          }
        }
      }
      return profile;
    },
    enabled: !!userId,
    staleTime: 1000 * 60,
  });
}

export function useUserPosts(userId: string) {
  return useInfiniteQuery({
    queryKey: ['users', userId, 'posts'],
    queryFn: ({ pageParam }) => getUserPosts(userId, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last: FeedPage) => (last.hasNextPage ? last.cursor : undefined),
    enabled: !!userId,
    staleTime: 1000 * 60,
  });
}

export function useFollowUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, isFollowing }: { userId: string; isFollowing: boolean }) =>
      isFollowing ? unfollowUser(userId) : followUser(userId),
    onMutate: async ({ userId, isFollowing }) => {
      await qc.cancelQueries({ queryKey: ['users', userId] });
      await qc.cancelQueries({ queryKey: ['users', 'me'] });

      const prevTarget = qc.getQueryData<UserProfile>(['users', userId]);
      const prevMe     = qc.getQueryData<UserProfile>(['users', 'me']);

      // Optimistically update the target user's profile (isFollowing + followersCount)
      qc.setQueryData<UserProfile>(['users', userId], (old) =>
        old
          ? {
              ...old,
              isFollowing: !isFollowing,
              followersCount: old.followersCount + (isFollowing ? -1 : 1),
            }
          : old,
      );

      // Optimistically update current user's followingCount
      qc.setQueryData<UserProfile>(['users', 'me'], (old) =>
        old
          ? { ...old, followingCount: old.followingCount + (isFollowing ? -1 : 1) }
          : old,
      );

      return { prevTarget, prevMe, userId };
    },
    onError: (_err, _vars, context) => {
      if (context?.prevTarget) qc.setQueryData(['users', context.userId], context.prevTarget);
      if (context?.prevMe)     qc.setQueryData(['users', 'me'], context.prevMe);
    },
    onSettled: (_data, _err, { userId }) => {
      qc.invalidateQueries({ queryKey: ['users', userId] });
      qc.invalidateQueries({ queryKey: ['users', 'me'] });
    },
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

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<Pick<UserProfile, 'displayName' | 'bio' | 'avatarUrl'>>) =>
      updateProfile(payload),
    onSuccess: (updated) => {
      qc.setQueryData(['users', 'me'], updated);
    },
  });
}

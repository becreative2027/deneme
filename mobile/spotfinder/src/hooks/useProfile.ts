import { useQuery, useMutation, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { getMe, getUserProfile, getUserPosts, followUser, unfollowUser, updateProfile } from '../api/users';
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
    queryFn: () => getUserProfile(userId),
    staleTime: 1000 * 60,
  });
}

export function useUserPosts(userId: string) {
  return useInfiniteQuery({
    queryKey: ['users', userId, 'posts'],
    queryFn: ({ pageParam }) => getUserPosts(userId, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last: FeedPage) => (last.hasNextPage ? last.cursor : undefined),
    staleTime: 1000 * 60,
  });
}

export function useFollowUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, isFollowing }: { userId: string; isFollowing: boolean }) =>
      isFollowing ? unfollowUser(userId) : followUser(userId),
    onSuccess: (_data, { userId }) => {
      qc.invalidateQueries({ queryKey: ['users', userId] });
    },
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<Pick<UserProfile, 'displayName' | 'bio'>>) =>
      updateProfile(payload),
    onSuccess: (updated) => {
      qc.setQueryData(['users', 'me'], updated);
    },
  });
}

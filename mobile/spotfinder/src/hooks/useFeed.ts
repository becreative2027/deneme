import { useInfiniteQuery } from '@tanstack/react-query';
import { getFollowingFeed, getExploreFeed, getPersonalizedFeed } from '../api/feed';
import { FeedPage } from '../types';

const STALE = 1000 * 60; // 60 s

function infiniteOptions(fetcher: (cursor?: string) => Promise<FeedPage>) {
  return {
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last: FeedPage) => (last.hasNextPage ? last.cursor : undefined),
    staleTime: STALE,
  };
}

export function useFollowingFeed() {
  return useInfiniteQuery({
    queryKey: ['feed', 'following'],
    queryFn: ({ pageParam }) => getFollowingFeed(pageParam),
    ...infiniteOptions(getFollowingFeed),
  });
}

export function useExploreFeed() {
  return useInfiniteQuery({
    queryKey: ['feed', 'explore'],
    queryFn: ({ pageParam }) => getExploreFeed(pageParam),
    ...infiniteOptions(getExploreFeed),
  });
}

export function usePersonalizedFeed() {
  return useInfiniteQuery({
    queryKey: ['feed', 'personalized'],
    queryFn: ({ pageParam }) => getPersonalizedFeed(pageParam),
    ...infiniteOptions(getPersonalizedFeed),
  });
}

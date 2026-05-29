import { useInfiniteQuery } from '@tanstack/react-query';
import { getFollowingFeed, getExploreFeed, getPersonalizedFeed, markPostsSeen } from '../api/feed';
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
    queryFn: async ({ pageParam }) => {
      const page = await getPersonalizedFeed(pageParam);
      // Fire-and-forget: record these posts as seen for future ranking penalty
      markPostsSeen(page.items.map((p) => p.id));
      return page;
    },
    ...infiniteOptions(getPersonalizedFeed),
  });
}

import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { searchPlaces, getPlaceById, getRecommendations, getFilters, getPlacePosts } from '../api/places';
import { PlaceSearchRequest, FeedPage } from '../types';

export function usePlaceSearch(req: PlaceSearchRequest, enabled = true) {
  return useQuery({
    queryKey: ['places', 'search', req],
    queryFn:  () => searchPlaces(req),
    enabled:  enabled && (!!req.query || (req.labelIds?.length ?? 0) > 0
                          || (req.priceLevels?.length ?? 0) > 0
                          || (req.venueTypes?.length ?? 0) > 0),
    staleTime: 1000 * 30,
  });
}

export function usePlaceDetail(placeId: string) {
  return useQuery({
    queryKey: ['places', placeId],
    queryFn:  () => getPlaceById(placeId),
    staleTime: 1000 * 60 * 5,
  });
}

export function useRecommendations(pageSize = 10) {
  return useQuery({
    queryKey: ['places', 'recommendations', pageSize],
    queryFn:  () => getRecommendations(pageSize),
    staleTime: 1000 * 60,
  });
}

export function useFilters(langId = 1) {
  return useQuery({
    queryKey: ['filters', langId],
    queryFn:  () => getFilters(langId),
    staleTime: 1000 * 60 * 10,
  });
}

export function usePopularPlaces(pageSize = 20) {
  return useQuery({
    queryKey: ['places', 'popular', pageSize],
    queryFn:  () => searchPlaces({ pageSize, langId: 1 }),
    staleTime: 1000 * 60 * 5,
  });
}

export function usePlacePosts(placeId: string) {
  return useInfiniteQuery({
    queryKey: ['placePosts', placeId],
    queryFn:  ({ pageParam }) => getPlacePosts(placeId, pageParam as string | undefined),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last: FeedPage) => (last.hasNextPage ? last.cursor : undefined),
    enabled: !!placeId,
    staleTime: 1000 * 60,
  });
}

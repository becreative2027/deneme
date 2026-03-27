'use client';

import { useQuery } from '@tanstack/react-query';
import { searchPlaces, getPlaceById, getRecommendations, getFilters } from '@/api/places';
import { PlaceSearchRequest } from '@/lib/types';

export function usePlaceSearch(params: PlaceSearchRequest, enabled: boolean) {
  return useQuery({
    queryKey: ['placeSearch', params.query, params.labelIds, params.matchMode],
    queryFn: () => searchPlaces(params),
    enabled,
    staleTime: 30_000,
  });
}

export function usePlaceDetail(placeId: string) {
  return useQuery({
    queryKey: ['place', placeId],
    queryFn: () => getPlaceById(placeId),
    enabled: !!placeId,
    staleTime: 60_000,
  });
}

export function useRecommendations(pageSize = 10) {
  return useQuery({
    queryKey: ['recommendations', pageSize],
    queryFn: () => getRecommendations(pageSize),
    staleTime: 5 * 60_000,
  });
}

export function useFilters(langId = 1) {
  return useQuery({
    queryKey: ['filters', langId],
    queryFn: () => getFilters(langId),
    staleTime: 10 * 60_000,
  });
}

export function usePopularPlaces(pageSize = 20) {
  return useQuery({
    queryKey: ['popularPlaces', pageSize],
    queryFn: () => searchPlaces({ pageSize }),
    staleTime: 5 * 60_000,
  });
}

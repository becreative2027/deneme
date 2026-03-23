import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { searchPlaces, getPlaceById, getRecommendations } from '../api/places';
import { PlaceSearchRequest } from '../types';

export function usePlaceSearch(body: PlaceSearchRequest, enabled = true) {
  return useQuery({
    queryKey: ['places', 'search', body],
    queryFn: () => searchPlaces(body),
    enabled: enabled && (!!body.query || !!body.categoryId || !!body.city),
    staleTime: 1000 * 30,
  });
}

export function usePlaceDetail(placeId: string) {
  return useQuery({
    queryKey: ['places', placeId],
    queryFn: () => getPlaceById(placeId),
    staleTime: 1000 * 60 * 5,
  });
}

export function useRecommendations(pageSize = 10) {
  return useQuery({
    queryKey: ['places', 'recommendations', pageSize],
    queryFn: () => getRecommendations(pageSize),
    staleTime: 1000 * 60,
  });
}

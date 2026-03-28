'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  addFavorite,
  removeFavorite,
  getFavoritePlaceIds,
  getFavoritePlaces,
} from '@/api/favorites';

export function useMyFavoritePlaceIds() {
  return useQuery({
    queryKey: ['favorites'],
    queryFn: getFavoritePlaceIds,
    staleTime: 60_000,
  });
}

export function useMyFavoritePlaces() {
  return useQuery({
    queryKey: ['favoritePlaces'],
    queryFn: getFavoritePlaces,
    staleTime: 60_000,
  });
}

export function useIsFavorited(placeId: string) {
  const { data: ids } = useMyFavoritePlaceIds();
  return ids?.includes(placeId) ?? false;
}

export function useToggleFavorite(placeId: string) {
  const queryClient = useQueryClient();
  const isFavorited = useIsFavorited(placeId);

  return useMutation({
    mutationFn: () => (isFavorited ? removeFavorite(placeId) : addFavorite(placeId)),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['favorites'] });
      const prev = queryClient.getQueryData<string[]>(['favorites']);
      queryClient.setQueryData<string[]>(['favorites'], (old = []) =>
        isFavorited ? old.filter((id) => id !== placeId) : [...old, placeId],
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev !== undefined) {
        queryClient.setQueryData(['favorites'], ctx.prev);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      queryClient.invalidateQueries({ queryKey: ['favoritePlaces'] });
    },
  });
}

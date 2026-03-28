import { apiClient } from './client';
import { getPlaceById } from './places';
import { Place } from '@/lib/types';

export async function addFavorite(placeId: string): Promise<void> {
  await apiClient.post('/api/social/favorites', { placeId });
}

export async function removeFavorite(placeId: string): Promise<void> {
  await apiClient.delete(`/api/social/favorites/${placeId}`);
}

export async function getFavoritePlaceIds(): Promise<string[]> {
  const { data } = await apiClient.get<any>('/api/social/favorites');
  const payload = data?.data ?? data;
  return (payload?.placeIds ?? []).map((id: any) => String(id));
}

export async function getFavoritePlaces(): Promise<Place[]> {
  const ids = await getFavoritePlaceIds();
  if (ids.length === 0) return [];
  const results = await Promise.allSettled(ids.map((id) => getPlaceById(id)));
  return results
    .filter((r): r is PromiseFulfilledResult<Place> => r.status === 'fulfilled')
    .map((r) => r.value);
}

import { apiClient } from './client';

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

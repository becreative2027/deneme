import { apiClient } from './client';
import {
  ApiResponse,
  Place,
  PlaceSearchRequest,
  PlaceSearchResponse,
  RecommendationResponse,
} from '../types';

export async function searchPlaces(body: PlaceSearchRequest): Promise<PlaceSearchResponse> {
  const { data } = await apiClient.post<ApiResponse<PlaceSearchResponse>>(
    '/api/places/search',
    body,
  );
  if (!data.success || !data.data) throw new Error(data.errors?.join('; ') ?? 'Search failed');
  return data.data;
}

export async function getPlaceById(id: string): Promise<Place> {
  const { data } = await apiClient.get<ApiResponse<Place>>(`/api/places/${id}`);
  if (!data.success || !data.data) throw new Error(data.errors?.join('; ') ?? 'Place not found');
  return data.data;
}

export async function getRecommendations(pageSize = 10): Promise<RecommendationResponse> {
  const { data } = await apiClient.get<ApiResponse<RecommendationResponse>>(
    '/api/places/recommendations',
    { params: { pageSize } },
  );
  if (!data.success || !data.data) throw new Error(data.errors?.join('; ') ?? 'No recommendations');
  return data.data;
}

import { apiClient } from './client';

export interface ReviewDto {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface ReviewsPage {
  items: ReviewDto[];
  total: number;
  page: number;
  pageSize: number;
}

export async function getPlaceReviews(placeId: string, page = 1, pageSize = 20): Promise<ReviewsPage> {
  const { data } = await apiClient.get<ReviewsPage>(`/api/places/${placeId}/reviews`, {
    params: { page, pageSize },
  });
  return data;
}

export async function addOrUpdateReview(
  placeId: string,
  payload: {
    userId: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
    rating: number;
    comment?: string;
  },
): Promise<void> {
  await apiClient.post(`/api/places/${placeId}/reviews`, payload);
}

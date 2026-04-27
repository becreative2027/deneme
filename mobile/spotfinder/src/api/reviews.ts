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

export async function getPlaceReviews(placeId: string, page = 1, pageSize = 50): Promise<ReviewsPage> {
  const { data } = await apiClient.get<any>(`/api/places/${placeId}/reviews`, {
    params: { page, pageSize },
  });
  // Normalize whatever shape the API returns
  const items: ReviewDto[] = (data?.items ?? data?.reviews ?? []).map((r: any) => ({
    id:          r.id          ?? '',
    userId:      r.userId      ?? r.user?.id ?? '',
    username:    r.username    ?? r.user?.username ?? '',
    displayName: r.displayName ?? r.user?.displayName ?? r.username ?? '',
    avatarUrl:   r.avatarUrl   ?? r.user?.avatarUrl ?? r.user?.profileImageUrl ?? undefined,
    rating:      r.rating      ?? 0,
    comment:     r.comment     ?? r.text ?? undefined,
    createdAt:   r.createdAt   ?? new Date().toISOString(),
  }));
  return {
    items,
    total:    data?.total    ?? data?.totalCount ?? items.length,
    page:     data?.page     ?? page,
    pageSize: data?.pageSize ?? pageSize,
  };
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

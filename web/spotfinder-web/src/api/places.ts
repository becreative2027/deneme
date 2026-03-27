import { apiClient } from './client';
import {
  FeedPage,
  FilterCategory,
  Place,
  PlaceSearchRequest,
  PlaceSearchResponse,
  Post,
  RecommendationResponse,
} from '@/lib/types';

function normalizePlace(p: any): Place {
  return {
    id: p.id,
    name: p.name,
    categoryName: p.categoryName ?? p.category ?? '',
    city: p.cityName ?? p.city ?? '',
    country: p.country ?? '',
    address: p.address ?? '',
    imageUrl: p.imageUrl ?? p.coverImageUrl ?? undefined,
    averageRating: p.averageRating ?? p.rating ?? 0,
    reviewCount: p.reviewCount ?? 0,
    description: p.description ?? undefined,
    labels: Array.isArray(p.labels)
      ? p.labels.map((l: any) => (typeof l === 'string' ? l : (l.displayName ?? l.name ?? l.key ?? '')))
      : [],
    trendScore: p.trendScore ?? p.score ?? undefined,
    parkingStatus: p.parkingStatus ?? undefined,
    menuUrl: p.menuUrl ?? undefined,
    menuImageUrls: Array.isArray(p.menuImageUrls) ? p.menuImageUrls : [],
    districtName: p.districtName ?? undefined,
    latitude: p.latitude ?? undefined,
    longitude: p.longitude ?? undefined,
  };
}

function isOk(raw: any): boolean {
  return raw?.success === true || raw?.isSuccess === true;
}

export async function searchPlaces(req: PlaceSearchRequest): Promise<PlaceSearchResponse> {
  const body = {
    query: req.query || undefined,
    languageId: 1,
    labelIds: req.labelIds?.length ? req.labelIds : undefined,
    matchMode: req.matchMode ?? 'ANY',
    page: req.page ?? 1,
    pageSize: req.pageSize ?? 20,
  };
  const { data } = await apiClient.post<any>('/api/places/search', body);
  if (!isOk(data)) throw new Error(data?.errors?.join('; ') ?? 'Search failed');
  const payload = data.data ?? data;
  const rawItems: any[] = payload?.places ?? payload?.items ?? [];
  return {
    items: rawItems.map(normalizePlace),
    totalCount: payload?.totalCount ?? rawItems.length,
  };
}

export async function getFilters(langId = 1): Promise<FilterCategory[]> {
  const { data } = await apiClient.get<any>('/api/filters', { params: { langId } });
  const payload = data?.data ?? data;
  const categories: any[] = payload?.categories ?? [];
  return categories.map((c: any) => ({
    id: c.id,
    key: c.key,
    displayName: c.displayName,
    labels: (c.labels ?? []).map((l: any) => ({
      id: l.id,
      key: l.key,
      displayName: l.displayName,
    })),
  }));
}

export async function getPlaceById(id: string): Promise<Place> {
  const { data } = await apiClient.get<any>(`/api/places/${id}`);
  if (!isOk(data)) throw new Error(data?.errors?.join('; ') ?? 'Place not found');
  return normalizePlace(data.data ?? data);
}

function normalizePlacePost(p: any): Post {
  const user = p.user ?? {};
  const place = p.place ?? {};
  return {
    id: p.id,
    userId: p.userId ?? user.id ?? '',
    username: p.username ?? user.username ?? '',
    displayName: p.displayName ?? user.displayName ?? user.username ?? '',
    avatarUrl: p.avatarUrl ?? user.avatarUrl ?? user.profileImageUrl ?? undefined,
    placeId: p.placeId ?? place.id ?? '',
    placeName: p.placeName ?? place.name ?? '',
    placeCity: p.placeCity ?? place.city ?? place.cityName ?? '',
    caption: p.caption ?? undefined,
    imageUrl: p.imageUrl ?? (Array.isArray(p.media) && p.media.length > 0 ? p.media[0] : undefined),
    likeCount: p.likeCount ?? 0,
    commentCount: p.commentCount ?? 0,
    isLiked: p.isLiked ?? false,
    createdAt: p.createdAt ?? new Date().toISOString(),
  };
}

export async function getPlacePosts(placeId: string, cursor?: string): Promise<FeedPage> {
  const { data } = await apiClient.get<any>(`/api/feed/place/${placeId}`, {
    params: { cursor, pageSize: 20 },
  });
  const payload = data?.success !== undefined ? data.data ?? data : data;
  const rawItems: any[] = payload?.items ?? payload?.posts ?? [];
  return {
    items: rawItems.map(normalizePlacePost),
    hasMore: payload?.hasMore ?? false,
    nextCursor: payload?.nextCursor ?? undefined,
  };
}

export async function getRecommendations(pageSize = 10): Promise<RecommendationResponse> {
  const { data } = await apiClient.get<any>('/api/places/recommendations', { params: { pageSize } });
  const payload = isOk(data) ? (data.data ?? data) : data;
  const rawRecs: any[] = payload?.recommendations ?? payload?.items ?? [];
  return {
    recommendations: rawRecs.map((r: any) => ({
      place: normalizePlace(r.place ?? r),
      score: r.score ?? 0,
      reason: r.reason ?? undefined,
    })),
  };
}

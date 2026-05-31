import { apiClient } from './client';
import {
  FilterCategory,
  FeedPage,
  Place,
  PlaceSearchRequest,
  PlaceSearchResponse,
  Post,
  RecommendationResponse,
} from '../types';

// Identical normalizer to web — handles all field-name variants
function normalizePlace(p: any): Place {
  return {
    id:            p.id,
    name:          p.name,
    categoryName:  p.categoryName ?? p.category ?? '',
    city:          p.cityName ?? p.city ?? '',
    country:       p.country ?? '',
    address:       p.address ?? '',
    districtName:  p.districtName ?? undefined,
    imageUrl:      p.imageUrl ?? p.coverImageUrl ?? undefined,
    averageRating: p.averageRating ?? p.rating ?? 0,
    reviewCount:   p.reviewCount ?? p.userRatingsTotal ?? 0,
    description:   p.description ?? undefined,
    labels:        Array.isArray(p.labels)
                    ? p.labels.map((l: any) =>
                        typeof l === 'string' ? l : (l.displayName ?? l.name ?? l.key ?? ''))
                    : [],
    trendScore:    p.trendScore ?? p.score?.trendScore ?? undefined,
    parkingStatus: p.parkingStatus ?? undefined,
    menuUrl:       p.menuUrl ?? undefined,
    menuImageUrls: Array.isArray(p.menuImageUrls) ? p.menuImageUrls : [],
    latitude:      p.latitude ?? undefined,
    longitude:     p.longitude ?? undefined,
    favoriteCount: p.favoriteCount ?? p.favoritesCount ?? undefined,
    wishlistCount: p.wishlistCount ?? p.wishlists ?? undefined,
    priceLevel:    p.priceLevel ?? undefined,
    venueType:     p.venueType ?? undefined,
  };
}

function isOk(raw: any): boolean {
  return raw?.success === true || raw?.isSuccess === true;
}

function normalizeFeedPost(p: any): Post {
  const user = p.user ?? {};
  const place = p.place ?? {};
  return {
    id:           p.id,
    userId:       user.id   ?? p.userId ?? '',
    username:     user.username  ?? p.username ?? '',
    displayName:  user.displayName ?? user.username ?? p.displayName ?? '',
    avatarUrl:    user.profileImageUrl ?? user.avatarUrl ?? undefined,
    placeId:      place.id   ?? p.placeId ?? '',
    placeName:    place.name ?? p.placeName ?? '',
    placeCity:    place.cityName ?? place.city ?? p.placeCity ?? '',
    caption:      p.caption ?? undefined,
    imageUrl:     p.imageUrl ?? (Array.isArray(p.media) && p.media.length > 0 ? p.media[0] : undefined),
    likeCount:    p.likeCount ?? 0,
    commentCount: p.commentCount ?? 0,
    isLiked:      p.isLiked ?? false,
    createdAt:    p.createdAt ?? new Date().toISOString(),
  };
}

export async function searchPlaces(req: PlaceSearchRequest): Promise<PlaceSearchResponse> {
  const body = {
    query:      req.query      || undefined,
    languageId: req.langId     ?? 1,
    labelIds:   req.labelIds?.length   ? req.labelIds   : undefined,
    matchMode:  req.matchMode  ?? 'ANY',
    page:       req.page       ?? 1,
    pageSize:   req.pageSize   ?? 20,
    priceLevels: req.priceLevels?.length ? req.priceLevels : undefined,
    venueTypes:  req.venueTypes?.length  ? req.venueTypes  : undefined,
  };
  const { data } = await apiClient.post<any>('/api/places/search', body);
  if (!isOk(data)) throw new Error((data?.errors ?? []).join('; ') || 'Search failed');
  const payload = data.data ?? data;
  const rawItems: any[] = payload?.places ?? payload?.items ?? [];
  return {
    items:      rawItems.map(normalizePlace),
    totalCount: payload?.totalCount ?? rawItems.length,
  };
}

export async function trackPlaceView(placeId: string, userId: string, durationSeconds?: number): Promise<void> {
  try {
    await apiClient.post(`/api/places/${placeId}/view`, { userId, durationSeconds });
  } catch {
    // fire-and-forget — silently ignore errors
  }
}

export async function getPlaceById(id: string, langId = 1): Promise<Place> {
  const { data } = await apiClient.get<any>(`/api/places/${id}`, { params: { langId } });
  if (!isOk(data)) throw new Error((data?.errors ?? []).join('; ') || 'Place not found');
  return normalizePlace(data.data ?? data);
}

export async function getRecommendations(pageSize = 10): Promise<RecommendationResponse> {
  const { data } = await apiClient.get<any>('/api/places/recommendations', {
    params: { pageSize },
  });
  // API returns { places: [{placeId, placeName, totalScore, ...}], debugInfo }
  const rawList: any[] = data?.places ?? data?.recommendations ?? data?.items ?? [];
  return {
    recommendations: rawList.map((r: any) => ({
      // Flat shape: {placeId, placeName, ...} — remap to normalizePlace-compatible object
      place: normalizePlace(r.place ?? { ...r, id: r.placeId ?? r.id, name: r.placeName ?? r.name }),
      score: r.totalScore ?? r.score ?? 0,
    })),
  };
}

export async function getFilters(langId = 1): Promise<FilterCategory[]> {
  const { data } = await apiClient.get<any>('/api/filters', { params: { langId } });
  const payload = data?.data ?? data;
  const categories: any[] = payload?.categories ?? [];
  return categories.map((c: any) => ({
    id:          c.id,
    key:         c.key,
    displayName: c.displayName,
    labels:      (c.labels ?? []).map((l: any) => ({
      id:          l.id,
      key:         l.key,
      displayName: l.displayName,
    })),
  }));
}

export async function getPlacePosts(placeId: string, cursor?: string): Promise<FeedPage> {
  const { data } = await apiClient.get<any>(`/api/feed/place/${placeId}`, {
    params: { cursor, pageSize: 20 },
  });
  const rawItems: any[] = data?.posts ?? data?.items ?? [];
  return {
    items:       rawItems.map(normalizeFeedPost),
    cursor:      data?.nextCursor ?? undefined,
    hasNextPage: data?.hasMore ?? false,
  };
}

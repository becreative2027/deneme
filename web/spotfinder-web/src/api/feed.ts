import { apiClient } from './client';
import { FeedPage, Post } from '@/lib/types';

function normalizePost(p: any): Post {
  // Backend: { id, user: { id, username, displayName, profileImageUrl }, place: { id, name }, media[], ... }
  // Frontend Post: flat fields { userId, username, displayName, avatarUrl, placeId, placeName, placeCity, imageUrl, ... }
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

function normalizeFeedPage(raw: any): FeedPage {
  // Backend returns either { posts, nextCursor, hasMore } or { items, nextCursor, hasMore }
  // or wrapped in { success, data: { ... } }
  const payload = raw?.success !== undefined ? raw.data ?? raw : raw;
  const rawItems: any[] = payload?.items ?? payload?.posts ?? [];
  return {
    items: rawItems.map(normalizePost),
    hasMore: payload?.hasMore ?? false,
    nextCursor: payload?.nextCursor ?? undefined,
  };
}

export async function getFollowingFeed(cursor?: string, pageSize = 10): Promise<FeedPage> {
  const { data } = await apiClient.get<any>('/api/feed/following', {
    params: { pageSize },
  });
  return normalizeFeedPage(data);
}

export async function getExploreFeed(cursor?: string, pageSize = 10): Promise<FeedPage> {
  const { data } = await apiClient.get<any>('/api/feed/explore', {
    params: { pageSize },
  });
  return normalizeFeedPage(data);
}

export async function getPersonalizedFeed(cursor?: string, pageSize = 10): Promise<FeedPage> {
  const { data } = await apiClient.get<any>('/api/feed/personalized', {
    params: { pageSize },
  });
  return normalizeFeedPage(data);
}

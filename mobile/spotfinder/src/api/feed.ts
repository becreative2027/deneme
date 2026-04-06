import { apiClient } from './client';
import { ApiResponse, FeedPage, Post } from '../types';

// Backend returns a nested structure: { user: { id, username, displayName, profileImageUrl },
// place: { id, name }, media: string[], hasMore: bool }
// This normalizer maps it to the flat Post shape the UI expects.
function normalizeFeedPage(raw: any): FeedPage {
  const items: Post[] = (raw.items ?? []).map((item: any) => ({
    id:           item.id,
    userId:       item.user?.id       ?? '',
    username:     item.user?.username ?? '',
    displayName:  item.user?.displayName ?? item.user?.username ?? '',
    avatarUrl:    item.user?.profileImageUrl ?? undefined,
    placeId:      item.place?.id   ?? '',
    placeName:    item.place?.name ?? '',
    placeCity:    '',
    imageUrl:     item.media?.[0]  ?? undefined,
    caption:      item.caption     ?? undefined,
    likeCount:    item.likeCount   ?? 0,
    commentCount: item.commentCount ?? 0,
    isLiked:      item.isLiked     ?? false,
    createdAt:    item.createdAt,
  }));
  return {
    items,
    cursor:      raw.cursor ?? undefined,
    hasNextPage: raw.hasMore ?? false,
  };
}

export async function getFollowingFeed(cursor?: string, pageSize = 20): Promise<FeedPage> {
  const { data } = await apiClient.get<ApiResponse<any>>('/api/feed/following', {
    params: { cursor, pageSize },
  });
  if (!data.success || !data.data) throw new Error(data.errors?.join('; ') ?? 'Feed error');
  return normalizeFeedPage(data.data);
}

export async function getExploreFeed(cursor?: string, pageSize = 20): Promise<FeedPage> {
  const { data } = await apiClient.get<ApiResponse<any>>('/api/feed/explore', {
    params: { cursor, pageSize },
  });
  if (!data.success || !data.data) throw new Error(data.errors?.join('; ') ?? 'Feed error');
  return normalizeFeedPage(data.data);
}

export async function getPersonalizedFeed(cursor?: string, pageSize = 20): Promise<FeedPage> {
  const { data } = await apiClient.get<ApiResponse<any>>('/api/feed/personalized', {
    params: { cursor, pageSize },
  });
  if (!data.success || !data.data) throw new Error(data.errors?.join('; ') ?? 'Feed error');
  return normalizeFeedPage(data.data);
}

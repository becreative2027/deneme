import { apiClient } from './client';
import { FeedPage, Post } from '../types';

// Backend returns: { posts: [...], nextCursor: string|null, hasMore: bool }
// This normalizer maps it to the flat Post shape the UI expects.
function normalizeFeedPage(raw: any): FeedPage {
  const items: Post[] = (raw.posts ?? []).map((item: any) => ({
    id:           item.id,
    userId:       item.user?.id       ?? '',
    username:     item.user?.username ?? '',
    displayName:  item.user?.displayName ?? item.user?.username ?? '',
    avatarUrl:    item.user?.profileImageUrl ?? undefined,
    placeId:      item.place?.id   ?? '',
    placeName:    item.place?.name ?? '',
    placeCity:    item.place?.city ?? '',
    imageUrl:     item.media?.[0]  ?? undefined,
    caption:      item.caption     ?? undefined,
    likeCount:    item.likeCount   ?? 0,
    commentCount: item.commentCount ?? 0,
    isLiked:      item.isLiked     ?? false,
    createdAt:    item.createdAt,
  }));
  return {
    items,
    cursor:      raw.nextCursor ?? undefined,
    hasNextPage: raw.hasMore ?? false,
  };
}

export async function getFollowingFeed(cursor?: string, pageSize = 20): Promise<FeedPage> {
  const { data } = await apiClient.get<any>('/api/feed/following', {
    params: { cursor, pageSize },
  });
  return normalizeFeedPage(data);
}

export async function getExploreFeed(cursor?: string, pageSize = 20): Promise<FeedPage> {
  const { data } = await apiClient.get<any>('/api/feed/explore', {
    params: { cursor, pageSize },
  });
  return normalizeFeedPage(data);
}

export async function getPersonalizedFeed(cursor?: string, pageSize = 20): Promise<FeedPage> {
  const { data } = await apiClient.get<any>('/api/feed/personalized', {
    params: { cursor, pageSize },
  });
  return normalizeFeedPage(data);
}

/** Fire-and-forget: tell backend which posts the user has seen. */
export function markPostsSeen(postIds: string[]): void {
  if (postIds.length === 0) return;
  apiClient.post('/api/feed/seen', { postIds }).catch(() => {});
}

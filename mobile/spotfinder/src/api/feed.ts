import { apiClient } from './client';
import { ApiResponse, FeedPage } from '../types';

export async function getFollowingFeed(cursor?: string, pageSize = 20): Promise<FeedPage> {
  const { data } = await apiClient.get<ApiResponse<FeedPage>>('/api/feed/following', {
    params: { cursor, pageSize },
  });
  if (!data.success || !data.data) throw new Error(data.errors?.join('; ') ?? 'Feed error');
  return data.data;
}

export async function getExploreFeed(cursor?: string, pageSize = 20): Promise<FeedPage> {
  const { data } = await apiClient.get<ApiResponse<FeedPage>>('/api/feed/explore', {
    params: { cursor, pageSize },
  });
  if (!data.success || !data.data) throw new Error(data.errors?.join('; ') ?? 'Feed error');
  return data.data;
}

export async function getPersonalizedFeed(cursor?: string, pageSize = 20): Promise<FeedPage> {
  const { data } = await apiClient.get<ApiResponse<FeedPage>>('/api/feed/personalized', {
    params: { cursor, pageSize },
  });
  if (!data.success || !data.data) throw new Error(data.errors?.join('; ') ?? 'Feed error');
  return data.data;
}

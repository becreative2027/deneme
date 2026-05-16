import { apiClient } from './client';
import { ApiResponse, FeedPage, Post, UserProfile } from '../types';

function normalizeUserPost(p: any): Post {
  const user = p.user ?? {};
  const place = p.place ?? {};
  return {
    id:           p.id,
    userId:       p.userId       ?? user.id       ?? '',
    username:     p.username     ?? user.username ?? '',
    displayName:  p.displayName  ?? user.displayName ?? user.username ?? '',
    avatarUrl:    p.avatarUrl    ?? user.avatarUrl ?? user.profileImageUrl ?? undefined,
    placeId:      p.placeId      ?? place.id   ?? '',
    placeName:    p.placeName    ?? place.name ?? '',
    placeCity:    p.placeCity    ?? place.city ?? place.cityName ?? '',
    caption:      p.caption      ?? undefined,
    imageUrl:     p.imageUrl     ?? (Array.isArray(p.media) && p.media.length > 0 ? p.media[0] : undefined),
    likeCount:    p.likeCount    ?? 0,
    commentCount: p.commentCount ?? 0,
    isLiked:      p.isLiked      ?? false,
    createdAt:    p.createdAt    ?? new Date().toISOString(),
  };
}

export async function getMe(): Promise<UserProfile> {
  const { data } = await apiClient.get<ApiResponse<any>>('/api/users/me');
  if (!data.success || !data.data) throw new Error('Failed to load profile');
  const raw = data.data;
  const userId = raw.id ?? '';

  const [countsRes, postCountRes] = await Promise.allSettled([
    apiClient.get<any>(`/api/social/counts/${userId}`),
    apiClient.get<any>(`/api/users/${userId}/posts/count`),
  ]);

  const counts    = countsRes.status    === 'fulfilled' ? countsRes.value.data    : null;
  const postsCount = postCountRes.status === 'fulfilled' ? (postCountRes.value.data?.count ?? 0) : (raw.postsCount ?? 0);

  return {
    id:             userId,
    username:       raw.username    ?? '',
    displayName:    raw.displayName ?? raw.username ?? '',
    email:          raw.email       ?? '',
    bio:            raw.bio         ?? undefined,
    avatarUrl:      raw.avatarUrl   ?? raw.profileImageUrl ?? undefined,
    postsCount,
    followersCount: counts?.followersCount ?? raw.followersCount ?? 0,
    followingCount: counts?.followingCount ?? raw.followingCount ?? 0,
  };
}

export async function getUserProfile(userId: string): Promise<UserProfile> {
  const [userRes, countsRes, postCountRes] = await Promise.allSettled([
    apiClient.get<ApiResponse<any>>(`/api/users/${userId}`),
    apiClient.get<any>(`/api/social/counts/${userId}`),
    apiClient.get<any>(`/api/users/${userId}/posts/count`),
  ]);

  if (userRes.status === 'rejected') throw new Error('User not found');
  const { data } = userRes.value;
  if (!data.success || !data.data) throw new Error('User not found');
  const raw = data.data;

  const counts    = countsRes.status    === 'fulfilled' ? countsRes.value.data    : null;
  const postCount = postCountRes.status === 'fulfilled' ? (postCountRes.value.data?.count ?? 0) : 0;

  return {
    id:             raw.id ?? raw.userId ?? '',
    username:       raw.username    ?? '',
    displayName:    raw.displayName ?? raw.username ?? '',
    email:          raw.email       ?? '',
    bio:            raw.bio         ?? undefined,
    avatarUrl:      raw.avatarUrl   ?? raw.profileImageUrl ?? undefined,
    postsCount:     postCount || (raw.postsCount ?? raw.postCount ?? 0),
    followersCount: counts?.followersCount ?? raw.followersCount ?? 0,
    followingCount: counts?.followingCount ?? raw.followingCount ?? 0,
    isFollowing:    raw.isFollowing ?? undefined,
  };
}

export async function getUserPosts(userId: string, cursor?: string): Promise<FeedPage> {
  const { data } = await apiClient.get<any>(`/api/users/${userId}/posts`, {
    params: { cursor, pageSize: 20 },
  });
  const payload = data?.success !== undefined ? (data.data ?? data) : data;
  const rawItems: any[] = payload?.items ?? payload?.posts ?? [];
  return {
    items:       rawItems.map(normalizeUserPost),
    cursor:      payload?.nextCursor ?? undefined,
    hasNextPage: payload?.hasMore    ?? false,
  };
}

export interface UserSearchResult {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
}

export async function searchUsers(q: string): Promise<UserSearchResult[]> {
  const { data } = await apiClient.get<any>('/api/users/search', { params: { q, pageSize: 20 } });
  const items: any[] = data?.users ?? data?.items ?? data?.data ?? [];
  return items.map((u: any) => ({
    id:          u.id          ?? '',
    username:    u.username    ?? '',
    displayName: u.displayName ?? u.username ?? '',
    avatarUrl:   u.avatarUrl   ?? u.profileImageUrl ?? undefined,
  }));
}

export async function getFollowerIds(userId: string): Promise<string[]> {
  const { data } = await apiClient.get<any>(`/api/social/followers/${userId}`);
  return data?.userIds ?? [];
}

export async function getFollowingIds(userId: string): Promise<string[]> {
  const { data } = await apiClient.get<any>(`/api/social/following/${userId}`);
  return data?.userIds ?? [];
}

export async function getUsersByIds(ids: string[]): Promise<UserProfile[]> {
  if (ids.length === 0) return [];
  const { data } = await apiClient.post<any>('/api/users/batch', { ids });
  const raw: any[] = Array.isArray(data) ? data : (data?.data ?? []);
  return raw.map((r: any) => ({
    id:             r.id          ?? '',
    username:       r.username    ?? '',
    displayName:    r.displayName ?? r.username ?? '',
    email:          r.email       ?? '',
    bio:            r.bio         ?? undefined,
    avatarUrl:      r.avatarUrl   ?? r.profileImageUrl ?? undefined,
    postsCount:     r.postsCount  ?? 0,
    followersCount: r.followersCount ?? 0,
    followingCount: r.followingCount ?? 0,
    isFollowing:    r.isFollowing ?? undefined,
  }));
}

export async function updateUsername(username: string): Promise<void> {
  await apiClient.patch('/api/users/me/username', { username });
}

export async function deleteAccount(): Promise<void> {
  await apiClient.delete('/api/users/me');
}

export async function followUser(userId: string): Promise<void> {
  await apiClient.post('/api/social/follow', { followingId: userId });
}

export async function unfollowUser(userId: string): Promise<void> {
  await apiClient.post('/api/social/unfollow', { followingId: userId });
}

export async function updateProfile(
  payload: Partial<Pick<UserProfile, 'displayName' | 'bio' | 'avatarUrl'>>,
): Promise<UserProfile> {
  await apiClient.put('/api/users/profile', {
    displayName: payload.displayName,
    bio: payload.bio,
    profileImageUrl: payload.avatarUrl,
  });
  return getMe();
}

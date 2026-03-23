import { apiClient } from './client';
import { ApiResponse, FeedPage, UserProfile } from '../types';

export async function getMe(): Promise<UserProfile> {
  const { data } = await apiClient.get<ApiResponse<UserProfile>>('/api/users/me');
  if (!data.success || !data.data) throw new Error('Failed to load profile');
  return data.data;
}

export async function getUserProfile(userId: string): Promise<UserProfile> {
  const { data } = await apiClient.get<ApiResponse<UserProfile>>(`/api/users/${userId}`);
  if (!data.success || !data.data) throw new Error('User not found');
  return data.data;
}

export async function getUserPosts(userId: string, cursor?: string): Promise<FeedPage> {
  const { data } = await apiClient.get<ApiResponse<FeedPage>>(`/api/users/${userId}/posts`, {
    params: { cursor, pageSize: 20 },
  });
  if (!data.success || !data.data) throw new Error('Failed to load posts');
  return data.data;
}

export async function followUser(userId: string): Promise<void> {
  await apiClient.post(`/api/users/${userId}/follow`);
}

export async function unfollowUser(userId: string): Promise<void> {
  await apiClient.delete(`/api/users/${userId}/follow`);
}

export async function updateProfile(
  payload: Partial<Pick<UserProfile, 'displayName' | 'bio'>>,
): Promise<UserProfile> {
  const { data } = await apiClient.patch<ApiResponse<UserProfile>>('/api/users/me', payload);
  if (!data.success || !data.data) throw new Error('Update failed');
  return data.data;
}

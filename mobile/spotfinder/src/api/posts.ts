import { apiClient } from './client';
import { CreatePostRequest } from '../types';

export async function createPost(body: CreatePostRequest): Promise<string> {
  const { data } = await apiClient.post<any>('/api/posts', body);
  // API returns { success, data: "<post-id>" }
  if (!data.success) throw new Error(data.error ?? 'Post failed');
  return data.data as string;
}

export async function attachPostMedia(postId: string, url: string): Promise<void> {
  await apiClient.post(`/api/posts/${postId}/media`, { url, type: 'image' });
}

export async function likePost(postId: string): Promise<void> {
  await apiClient.post(`/api/posts/${postId}/like`);
}

export async function unlikePost(postId: string): Promise<void> {
  await apiClient.delete(`/api/posts/${postId}/like`);
}

export async function deletePost(postId: string): Promise<void> {
  await apiClient.delete(`/api/posts/${postId}`);
}

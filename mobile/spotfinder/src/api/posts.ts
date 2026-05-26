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
  await apiClient.post(`/api/posts/${postId}/unlike`);
}

export async function deletePost(postId: string): Promise<void> {
  await apiClient.delete(`/api/posts/${postId}`);
}

export interface PostComment {
  id: string;
  userId: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  text: string;
  createdAt: string;
}

export interface PostSummary {
  id: string;
  placeId: string;
  userId: string;
}

export async function getPost(postId: string): Promise<PostSummary> {
  const { data } = await apiClient.get<any>(`/api/posts/${postId}`);
  return (data.data ?? data) as PostSummary;
}

export async function getPostComments(postId: string, page = 1, pageSize = 30): Promise<PostComment[]> {
  const { data } = await apiClient.get<any>(`/api/posts/${postId}/comments`, { params: { page, pageSize } });
  return (data.data ?? []) as PostComment[];
}

export async function createComment(postId: string, text: string): Promise<void> {
  await apiClient.post(`/api/posts/${postId}/comment`, { text });
}

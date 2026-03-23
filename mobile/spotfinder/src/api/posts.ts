import { apiClient } from './client';
import { ApiResponse, CreatePostRequest, Post } from '../types';

export async function createPost(body: CreatePostRequest): Promise<Post> {
  const { data } = await apiClient.post<ApiResponse<Post>>('/api/posts', body);
  if (!data.success || !data.data) throw new Error(data.errors?.join('; ') ?? 'Post failed');
  return data.data;
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

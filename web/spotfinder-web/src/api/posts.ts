import { apiClient } from './client';
import { uploadImage } from '@/lib/cloudinary';
import { ApiResponse, CreatePostRequest } from '@/lib/types';

export async function createPost(body: CreatePostRequest): Promise<{ id: string }> {
  const { data } = await apiClient.post<ApiResponse<string>>('/api/posts', body);
  if (!data.success || !data.data) throw new Error(data.errors?.join('; ') ?? 'Post failed');
  return { id: data.data };
}

export async function createPostWithImage(
  placeId: string,
  caption: string | undefined,
  imageFile: File,
  onProgress?: (fraction: number) => void,
): Promise<{ id: string }> {
  // Step 1: Upload image to Cloudinary (0% → 60%)
  const uploaded = await uploadImage(imageFile, (fraction) => {
    onProgress?.(fraction * 0.6);
  });

  // Step 2: Create the post record (60% → 80%)
  onProgress?.(0.6);
  const { id: postId } = await createPost({ placeId, caption });

  // Step 3: Attach Cloudinary URL to the post (80% → 100%)
  onProgress?.(0.8);
  await apiClient.post(`/api/posts/${postId}/media`, {
    url: uploaded.secureUrl,
    type: 'image',
  });
  onProgress?.(1);

  return { id: postId };
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

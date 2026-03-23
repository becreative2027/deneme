import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createPost, likePost, unlikePost } from '../api/posts';
import { CreatePostRequest } from '../types';

export function useCreatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreatePostRequest) => createPost(body),
    onSuccess: () => {
      // Invalidate all feed caches after new post
      qc.invalidateQueries({ queryKey: ['feed'] });
    },
  });
}

export function useLikePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, liked }: { postId: string; liked: boolean }) =>
      liked ? unlikePost(postId) : likePost(postId),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['feed'] });
    },
  });
}

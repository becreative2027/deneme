import { useMutation, useQueryClient, InfiniteData } from '@tanstack/react-query';
import { createPost, likePost, unlikePost } from '../api/posts';
import { CreatePostRequest, FeedPage } from '../types';

export function useCreatePost() {
  const qc = useQueryClient();
  return useMutation<string, Error, CreatePostRequest>({
    mutationFn: (body: CreatePostRequest) => createPost(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['feed'] });
    },
  });
}

// Feed query keys that may contain the post being liked
const FEED_KEYS = [
  ['feed', 'following'],
  ['feed', 'explore'],
  ['feed', 'personalized'],
];

export function useLikePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, liked }: { postId: string; liked: boolean }) =>
      liked ? unlikePost(postId) : likePost(postId),

    onMutate: async ({ postId, liked }) => {
      // Cancel outgoing refetches so they don't overwrite the optimistic update
      await qc.cancelQueries({ queryKey: ['feed'] });

      // Update a single post inside an infinite feed query
      const applyUpdate = (data: InfiniteData<FeedPage> | undefined) => {
        if (!data) return data;
        return {
          ...data,
          pages: data.pages.map((page) => ({
            ...page,
            items: page.items.map((post) =>
              post.id === postId
                ? { ...post, isLiked: !liked, likeCount: post.likeCount + (liked ? -1 : 1) }
                : post,
            ),
          })),
        };
      };

      // Snapshot all feed caches for rollback, then apply optimistic update
      const snapshots = FEED_KEYS.map((key) => ({
        key,
        data: qc.getQueryData<InfiniteData<FeedPage>>(key),
      }));

      for (const { key } of snapshots) {
        qc.setQueryData<InfiniteData<FeedPage>>(key, applyUpdate);
      }

      return { snapshots };
    },

    onError: (_err, _vars, context) => {
      // Roll back to the snapshot on failure
      context?.snapshots?.forEach(({ key, data }) => {
        qc.setQueryData(key, data);
      });
    },

    onSettled: () => {
      // Background sync to reconcile server state
      qc.invalidateQueries({ queryKey: ['feed'] });
    },
  });
}

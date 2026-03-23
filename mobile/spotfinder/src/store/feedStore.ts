import { create } from 'zustand';

export type FeedTab = 'following' | 'explore' | 'personalized';

interface FeedState {
  activeTab: FeedTab;
  setActiveTab: (tab: FeedTab) => void;

  // Tracks which postIds the user has liked locally (optimistic)
  likedPosts: Set<string>;
  toggleLike: (postId: string, currentlyLiked: boolean) => void;
}

export const useFeedStore = create<FeedState>((set) => ({
  activeTab: 'following',
  setActiveTab: (tab) => set({ activeTab: tab }),

  likedPosts: new Set(),
  toggleLike: (postId, currentlyLiked) =>
    set((state) => {
      const next = new Set(state.likedPosts);
      if (currentlyLiked) {
        next.delete(postId);
      } else {
        next.add(postId);
      }
      return { likedPosts: next };
    }),
}));

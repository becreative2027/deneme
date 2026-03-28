'use client';

import { create } from 'zustand';

function loadIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('sf_wishlist');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveIds(ids: string[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('sf_wishlist', JSON.stringify(ids));
  }
}

interface WishlistState {
  placeIds: string[];
  addPlace: (id: string) => void;
  removePlace: (id: string) => void;
  togglePlace: (id: string) => void;
  hasPlace: (id: string) => boolean;
  clearAll: () => void;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  placeIds: loadIds(),
  addPlace: (id) => {
    const next = [...get().placeIds.filter((x) => x !== id), id];
    set({ placeIds: next });
    saveIds(next);
  },
  removePlace: (id) => {
    const next = get().placeIds.filter((x) => x !== id);
    set({ placeIds: next });
    saveIds(next);
  },
  togglePlace: (id) => {
    if (get().hasPlace(id)) get().removePlace(id);
    else get().addPlace(id);
  },
  hasPlace: (id) => get().placeIds.includes(id),
  clearAll: () => {
    set({ placeIds: [] });
    saveIds([]);
  },
}));

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'sf_wishlist';

async function loadIds(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

async function saveIds(ids: string[]) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {}
}

interface WishlistState {
  placeIds: string[];
  hydrated: boolean;
  hydrate: () => Promise<void>;
  addPlace: (id: string) => void;
  removePlace: (id: string) => void;
  togglePlace: (id: string) => void;
  hasPlace: (id: string) => boolean;
  clearAll: () => void;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  placeIds: [],
  hydrated: false,

  hydrate: async () => {
    const ids = await loadIds();
    set({ placeIds: ids, hydrated: true });
  },

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

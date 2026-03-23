import { create } from 'zustand';
import { UserProfile } from '../types';

interface UserState {
  // Cache of loaded profiles (userId → profile)
  profiles: Record<string, UserProfile>;
  setProfile: (profile: UserProfile) => void;
  getProfile: (userId: string) => UserProfile | undefined;
}

export const useUserStore = create<UserState>((set, get) => ({
  profiles: {},

  setProfile: (profile) =>
    set((state) => ({ profiles: { ...state.profiles, [profile.id]: profile } })),

  getProfile: (userId) => get().profiles[userId],
}));

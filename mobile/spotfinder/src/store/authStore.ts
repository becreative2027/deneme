import { create } from 'zustand';
import { UserProfile } from '../types';
import { clearAll, saveToken, saveRefreshToken } from '../utils/storage';
import { setAuthToken, clearAuthToken } from '../api/client';

interface AuthState {
  token: string | null;
  user: UserProfile | null;
  isAuthenticated: boolean;
  isHydrated: boolean;

  setAuth: (token: string, refreshToken: string, user: UserProfile) => Promise<void>;
  setUser: (user: UserProfile) => void;
  logout: () => Promise<void>;
  setHydrated: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  isHydrated: false,

  setAuth: async (token, refreshToken, user) => {
    await saveToken(token);
    await saveRefreshToken(refreshToken);
    setAuthToken(token);
    set({ token, user, isAuthenticated: true });
  },

  setUser: (user) => set({ user }),

  logout: async () => {
    await clearAll();
    clearAuthToken();
    set({ token: null, user: null, isAuthenticated: false });
  },

  setHydrated: () => set({ isHydrated: true }),
}));

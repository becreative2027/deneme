'use client';

import { create } from 'zustand';
import { UserProfile } from '@/lib/types';
import { setAuthToken, clearAuthToken } from '@/api/client';

interface AuthState {
  token: string | null;
  user: UserProfile | null;
  isAuthenticated: boolean;
  isHydrated: boolean;

  setAuth: (token: string, refreshToken: string, user: UserProfile) => void;
  setUser: (user: UserProfile) => void;
  logout: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  isHydrated: false,

  setAuth: (token, refreshToken, user) => {
    setAuthToken(token);
    if (typeof window !== 'undefined') {
      localStorage.setItem('sf_token', token);
      localStorage.setItem('sf_refresh_token', refreshToken);
      localStorage.setItem('sf_user', JSON.stringify(user));
    }
    set({ token, user, isAuthenticated: true });
  },

  setUser: (user) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sf_user', JSON.stringify(user));
    }
    set({ user });
  },

  logout: () => {
    clearAuthToken();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('sf_token');
      localStorage.removeItem('sf_refresh_token');
      localStorage.removeItem('sf_user');
    }
    set({ token: null, user: null, isAuthenticated: false });
  },

  hydrate: () => {
    if (typeof window === 'undefined') {
      set({ isHydrated: true });
      return;
    }
    const token = localStorage.getItem('sf_token');
    const userRaw = localStorage.getItem('sf_user');
    let user: UserProfile | null = null;
    try {
      if (userRaw) user = JSON.parse(userRaw);
    } catch {}
    if (token) {
      setAuthToken(token);
    }
    set({
      token,
      user,
      isAuthenticated: !!token,
      isHydrated: true,
    });
  },
}));

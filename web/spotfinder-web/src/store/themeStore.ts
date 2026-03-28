'use client';

import { create } from 'zustand';

type ThemeMode = 'light' | 'dark' | null;

interface ThemeState {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggle: () => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: null,

  setMode: (mode) => {
    set({ mode });
    if (typeof window !== 'undefined') {
      if (mode) {
        localStorage.setItem('sf_theme', mode);
        document.documentElement.classList.toggle('dark', mode === 'dark');
      } else {
        localStorage.removeItem('sf_theme');
        document.documentElement.classList.remove('dark');
      }
    }
  },

  toggle: () => {
    const current = get().mode;
    const next = current === 'dark' ? 'light' : 'dark';
    get().setMode(next);
  },
}));

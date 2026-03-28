import { create } from 'zustand';
import { AdminUser, parseAdminUser } from '@/lib/types';

const TOKEN_KEY = 'sf_admin_token';

interface AdminAuthStore {
  token: string | null;
  user: AdminUser | null;
  setToken: (token: string) => void;
  logout: () => void;
}

function loadFromStorage(): { token: string | null; user: AdminUser | null } {
  if (typeof window === 'undefined') return { token: null, user: null };
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return { token: null, user: null };
  try {
    return { token, user: parseAdminUser(token) };
  } catch {
    return { token: null, user: null };
  }
}

const initial = loadFromStorage();

export const useAdminAuthStore = create<AdminAuthStore>((set) => ({
  token: initial.token,
  user: initial.user,

  setToken: (token) => {
    localStorage.setItem(TOKEN_KEY, token);
    set({ token, user: parseAdminUser(token) });
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    set({ token: null, user: null });
  },
}));

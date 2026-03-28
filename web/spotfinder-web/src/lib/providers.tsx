'use client';

import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@/components/Toast';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { useLocaleStore } from '@/store/localeStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

function AppInitializer({ children }: { children: React.ReactNode }) {
  const hydrate = useAuthStore((s) => s.hydrate);
  const setMode = useThemeStore((s) => s.setMode);
  const setLocale = useLocaleStore((s) => s.setLocale);

  useEffect(() => {
    // Hydrate auth from localStorage
    hydrate();

    // Hydrate theme from localStorage
    const savedTheme = localStorage.getItem('sf_theme');
    if (savedTheme === 'dark' || savedTheme === 'light') {
      setMode(savedTheme);
    } else {
      // Use system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', prefersDark);
    }

    // Hydrate locale from localStorage
    const savedLocale = localStorage.getItem('sf_locale');
    if (savedLocale === 'tr' || savedLocale === 'en') {
      setLocale(savedLocale);
    }
  }, [hydrate, setMode, setLocale]);

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AppInitializer>{children}</AppInitializer>
      </ToastProvider>
    </QueryClientProvider>
  );
}

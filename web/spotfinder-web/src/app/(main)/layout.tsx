'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BottomNav } from '@/components/BottomNav';
import { useAuthStore } from '@/store/authStore';
import { Moon, Sun, MapPin } from 'lucide-react';
import { useThemeStore } from '@/store/themeStore';

function ThemeToggle() {
  const { mode, toggle } = useThemeStore();

  return (
    <button
      onClick={toggle}
      className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      aria-label="Toggle dark mode"
    >
      {mode === 'dark' ? (
        <Sun size={20} className="text-amber-400" />
      ) : (
        <Moon size={20} className="text-gray-500" />
      )}
    </button>
  );
}

function TopHeader() {
  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-surface-dark/90 backdrop-blur-sm border-b border-border-light dark:border-border-dark">
      <div className="flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#6c63ff] rounded-lg flex items-center justify-center">
            <MapPin size={16} className="text-white" />
          </div>
          <span className="text-[17px] font-extrabold text-text-light dark:text-text-dark tracking-tight">
            SpotFinder
          </span>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isHydrated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, isHydrated, router]);

  if (!isHydrated) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-bg-light dark:bg-bg-dark">
        <div className="w-10 h-10 border-4 border-[#6c63ff] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-dvh bg-bg-light dark:bg-bg-dark">
      <TopHeader />
      <main className="flex-1 pb-[calc(64px+env(safe-area-inset-bottom))]">{children}</main>
      <BottomNav />
    </div>
  );
}

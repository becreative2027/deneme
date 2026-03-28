'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Store, Bell, Star, LogOut, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import { useAdminAuthStore } from '@/store/adminAuthStore';

const NAV = [
  { href: '/place/dashboard',      label: 'Dashboard',      icon: LayoutDashboard },
  { href: '/place/my-place',       label: 'Mekanım',        icon: Store },
  { href: '/place/notifications',  label: 'Bildirimler',    icon: Bell },
  { href: '/place/reviews',        label: 'Yorumlar',       icon: Star },
];

export default function PlaceSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAdminAuthStore();

  function handleLogout() {
    logout();
    router.replace('/login');
  }

  return (
    <aside className="w-64 min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Brand */}
      <div className="px-6 py-5 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center text-sm font-bold">S</div>
          <div>
            <p className="text-sm font-bold leading-none">SpotFinder</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Mekan Paneli</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-brand text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800',
              )}
            >
              <Icon size={17} />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight size={14} className="opacity-60" />}
            </Link>
          );
        })}
      </nav>

      {/* User + logout */}
      <div className="px-4 py-4 border-t border-gray-700">
        <p className="text-xs text-gray-400 truncate mb-3">{user?.email}</p>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-red-400 transition-colors"
        >
          <LogOut size={15} />
          Çıkış Yap
        </button>
      </div>
    </aside>
  );
}

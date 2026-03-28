'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, MapPin, Users, KeyRound,
  Shield, FileText, LogOut, ChevronRight,
  Tag, Star, Settings, Globe, MessageSquarePlus,
} from 'lucide-react';
import clsx from 'clsx';
import { useAdminAuthStore } from '@/store/adminAuthStore';

const NAV = [
  { href: '/super/dashboard',   label: 'Dashboard',        icon: LayoutDashboard },
  { href: '/super/places',      label: 'Mekanlar',          icon: MapPin },
  { href: '/super/reviews',     label: 'Yorumlar',          icon: Star },
  { href: '/super/labels',      label: 'Etiketler',         icon: Tag },
  { href: '/super/users',       label: 'Kullanıcılar',      icon: Users },
  { href: '/super/ownership',   label: 'Mekan Sahipleri',   icon: KeyRound },
  { href: '/super/moderation',  label: 'Moderasyon',        icon: Shield },
  { href: '/super/feedback',    label: 'Geri Bildirimler',  icon: MessageSquarePlus },
  { href: '/super/config',      label: 'Konfigürasyon',     icon: Settings },
  { href: '/super/audit-logs',  label: 'Audit Logs',        icon: FileText },
];

export default function SuperSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAdminAuthStore();

  function handleLogout() {
    logout();
    router.replace('/login');
  }

  return (
    <aside className="w-64 min-h-screen bg-gray-900 text-white flex flex-col shrink-0">
      {/* Brand */}
      <div className="px-6 py-5 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center text-sm font-bold">S</div>
          <div>
            <p className="text-sm font-bold leading-none">SpotFinder</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Super Admin</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group',
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
        <p className="text-xs text-gray-400 truncate mb-1">{user?.email}</p>
        <p className="text-[10px] text-brand font-semibold mb-3">{user?.role}</p>
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

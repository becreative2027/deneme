'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, PlusSquare, Bookmark, User } from 'lucide-react';
import clsx from 'clsx';
import { useT } from '@/lib/i18n';
import { useWishlistStore } from '@/store/wishlistStore';

const TABS = [
  { href: '/feed', labelKey: 'nav.feed', icon: Home },
  { href: '/search', labelKey: 'nav.search', icon: Search },
  { href: '/create', labelKey: 'nav.create', icon: PlusSquare },
  { href: '/wishlist', labelKey: 'nav.wishlist', icon: Bookmark },
  { href: '/profile', labelKey: 'nav.profile', icon: User },
];

export function BottomNav() {
  const pathname = usePathname();
  const t = useT();
  const wishlistCount = useWishlistStore((s) => s.placeIds.length);

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-mobile bg-white dark:bg-surface-dark border-t border-border-light dark:border-border-dark z-50">
      <div className="flex items-stretch">
        {TABS.map(({ href, labelKey, icon: Icon }) => {
          const isActive =
            href === '/profile'
              ? pathname === '/profile'
              : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 transition-colors',
                isActive
                  ? 'text-[#6c63ff]'
                  : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300',
              )}
            >
              {href === '/create' ? (
                <div className="bg-[#6c63ff] rounded-xl p-2 -mt-1">
                  <Icon
                    size={22}
                    className="text-white"
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                </div>
              ) : href === '/wishlist' ? (
                <div className="relative">
                  <Icon
                    size={24}
                    strokeWidth={isActive ? 2.5 : 2}
                    className={isActive ? 'fill-[#6c63ff]' : ''}
                  />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1.5 min-w-[14px] h-[14px] bg-[#6c63ff] text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5">
                      {wishlistCount > 99 ? '99+' : wishlistCount}
                    </span>
                  )}
                </div>
              ) : (
                <Icon
                  size={24}
                  strokeWidth={isActive ? 2.5 : 2}
                />
              )}
              <span
                className={clsx(
                  'text-[10px] font-medium',
                  href === '/create' ? 'text-[#6c63ff]' : '',
                )}
              >
                {t(labelKey)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

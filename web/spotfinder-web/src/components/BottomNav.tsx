'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, PlusSquare, User } from 'lucide-react';
import clsx from 'clsx';

const TABS = [
  { href: '/feed', label: 'Feed', icon: Home },
  { href: '/search', label: 'Search', icon: Search },
  { href: '/create', label: 'Create', icon: PlusSquare },
  { href: '/profile', label: 'Profile', icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-mobile bg-white dark:bg-surface-dark border-t border-border-light dark:border-border-dark z-50">
      <div className="flex items-stretch">
        {TABS.map(({ href, label, icon: Icon }) => {
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
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

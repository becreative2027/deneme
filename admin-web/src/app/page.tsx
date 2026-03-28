'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuthStore } from '@/store/adminAuthStore';
import { isAdminRole } from '@/lib/types';

export default function RootPage() {
  const { token, user } = useAdminAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!token || !user) { router.replace('/login'); return; }
    if (isAdminRole(user.role)) router.replace('/super/dashboard');
    else if (user.role === 'PlaceOwner') router.replace('/place/dashboard');
    else router.replace('/login');
  }, [token, user, router]);

  return null;
}

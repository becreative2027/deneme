'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuthStore } from '@/store/adminAuthStore';
import type { UserRole } from '@/lib/types';

export function useRequireRole(allowed: UserRole[]) {
  const { token, user } = useAdminAuthStore();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
    if (!token || !user) {
      router.replace('/login');
      return;
    }
    if (!allowed.includes(user.role)) {
      if (user.role === 'PlaceOwner') router.replace('/place/dashboard');
      else router.replace('/super/dashboard');
    }
  }, [token, user]);

  return { user: ready ? user : null, token };
}

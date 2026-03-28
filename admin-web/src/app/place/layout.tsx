'use client';

import { useEffect, useState } from 'react';
import { useRequireRole } from '@/hooks/useRequireRole';
import PlaceSidebar from '@/components/PlaceSidebar';

export default function PlaceLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { user } = useRequireRole(['PlaceOwner']);

  if (!mounted || !user) return null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <PlaceSidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}

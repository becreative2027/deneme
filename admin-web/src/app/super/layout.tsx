'use client';

import { useEffect, useState } from 'react';
import { useRequireRole } from '@/hooks/useRequireRole';
import SuperSidebar from '@/components/SuperSidebar';

export default function SuperLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { user } = useRequireRole(['Admin', 'SuperAdmin']);

  if (!mounted || !user) return null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SuperSidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}

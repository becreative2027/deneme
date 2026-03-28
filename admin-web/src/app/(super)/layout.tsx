'use client';

import { useRequireRole } from '@/hooks/useRequireRole';
import SuperSidebar from '@/components/SuperSidebar';

export default function SuperLayout({ children }: { children: React.ReactNode }) {
  const { user } = useRequireRole(['Admin', 'SuperAdmin']);
  if (!user) return null;

  return (
    <div className="flex min-h-screen">
      <SuperSidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}

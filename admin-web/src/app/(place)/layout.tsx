'use client';

import { useRequireRole } from '@/hooks/useRequireRole';
import PlaceSidebar from '@/components/PlaceSidebar';

export default function PlaceLayout({ children }: { children: React.ReactNode }) {
  const { user } = useRequireRole(['PlaceOwner']);
  if (!user) return null;

  return (
    <div className="flex min-h-screen">
      <PlaceSidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}

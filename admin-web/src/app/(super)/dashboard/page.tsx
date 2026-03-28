'use client';

import { useEffect, useState } from 'react';
import { useAdminAuthStore } from '@/store/adminAuthStore';
import { MapPin, Users, Shield, Tag, ArrowRight } from 'lucide-react';
import { getPlaces, getPendingModeration, getFilters } from '@/api/admin';
import Link from 'next/link';

export default function SuperDashboardPage() {
  const { user } = useAdminAuthStore();
  const [stats, setStats] = useState({ places: 0, pendingMod: 0, labels: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      getPlaces(1, 1),
      getPendingModeration(1, 1),
      getFilters(1),
    ]).then(([placesRes, modRes, filtersRes]) => {
      const places = placesRes.status === 'fulfilled' ? (placesRes.value.totalCount ?? 0) : 0;
      const pendingMod = modRes.status === 'fulfilled'
        ? (modRes.value.totalCount ?? modRes.value.items?.length ?? 0) : 0;
      const labels = filtersRes.status === 'fulfilled'
        ? (filtersRes.value.categories ?? []).reduce((s: number, c: any) => s + (c.labels?.length ?? 0), 0) : 0;
      setStats({ places, pendingMod, labels });
    }).finally(() => setLoading(false));
  }, []);

  const CARDS = [
    { label: 'Toplam Mekan', icon: MapPin, color: 'bg-violet-100 text-violet-600', value: stats.places, href: '/super/places' },
    { label: 'Bekleyen Moderasyon', icon: Shield, color: 'bg-orange-100 text-orange-600', value: stats.pendingMod, href: '/super/moderation' },
    { label: 'Toplam Etiket', icon: Tag, color: 'bg-blue-100 text-blue-600', value: stats.labels, href: '/super/labels' },
  ];

  const QUICK_LINKS = [
    { label: 'Yeni mekan ekle', href: '/super/places', desc: 'Mekan oluştur ve etiket ata' },
    { label: 'Kullanıcı rolü değiştir', href: '/super/users', desc: 'Kullanıcı ara ve rol güncelle' },
    { label: 'Mekan sahipliği ver', href: '/super/ownership', desc: 'PlaceOwner hesabına mekan ata' },
    { label: 'Yorum sil', href: '/super/reviews', desc: 'Mekan ID ile yorumları yönet' },
    { label: 'Feature flag yönet', href: '/super/config', desc: 'Runtime config ve flag güncelle' },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Hoş geldin 👋</h1>
        <p className="text-gray-500 text-sm mt-1">{user?.email} · <span className="text-brand font-semibold">{user?.role}</span></p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {CARDS.map(({ label, icon: Icon, color, value, href }) => (
          <Link key={label} href={href}
            className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4 hover:border-brand/30 hover:shadow-sm transition-all group">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color} shrink-0`}>
              <Icon size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 font-medium">{label}</p>
              <p className="text-xl font-bold text-gray-900 mt-0.5">
                {loading ? '—' : value.toLocaleString('tr-TR')}
              </p>
            </div>
            <ArrowRight size={14} className="text-gray-300 group-hover:text-brand transition-colors" />
          </Link>
        ))}
      </div>

      {/* Quick links */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-4">Hızlı Erişim</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {QUICK_LINKS.map(({ label, href, desc }) => (
            <Link key={href} href={href}
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors group">
              <ArrowRight size={14} className="text-brand shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-800 group-hover:text-brand transition-colors">{label}</p>
                <p className="text-xs text-gray-400">{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

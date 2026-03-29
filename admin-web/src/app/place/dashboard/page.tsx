'use client';

import { useEffect, useState } from 'react';
import { useAdminAuthStore } from '@/store/adminAuthStore';
import { MapPin, Star, Heart, Bookmark, Loader2 } from 'lucide-react';
import { getPlaceDetail } from '@/api/admin';

interface PlaceStat {
  id: string;
  name: string;
  rating?: number;
  favoriteCount?: number;
  wishlistCount?: number;
  reviewCount?: number;
  cityName?: string;
  districtName?: string;
}

export default function PlaceDashboardPage() {
  const { user } = useAdminAuthStore();
  const placeCount = user?.ownedPlaceIds.length ?? 0;
  const [places, setPlaces] = useState<PlaceStat[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (placeCount === 0) return;
    setLoading(true);
    Promise.all(
      user!.ownedPlaceIds.map((id) =>
        getPlaceDetail(id).then((d: any) => ({
          id,
          name:          d?.data?.name          ?? d?.name          ?? id,
          rating:        d?.data?.rating         ?? d?.rating,
          favoriteCount: d?.data?.favoriteCount  ?? d?.favoriteCount,
          wishlistCount: d?.data?.wishlistCount  ?? d?.wishlistCount,
          reviewCount:   d?.data?.reviewCount    ?? d?.reviewCount,
          cityName:      d?.data?.cityName       ?? d?.cityName,
          districtName:  d?.data?.districtName   ?? d?.districtName,
        }))
      )
    )
      .then(setPlaces)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [placeCount]);

  const totalFavorites  = places.reduce((s, p) => s + (p.favoriteCount  ?? 0), 0);
  const totalWishlists  = places.reduce((s, p) => s + (p.wishlistCount  ?? 0), 0);
  const avgRating       = places.length
    ? (places.reduce((s, p) => s + (p.rating ?? 0), 0) / places.length).toFixed(1)
    : null;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Mekan Paneliniz</h1>
        <p className="text-gray-500 text-sm mt-1">
          {placeCount === 0
            ? 'Henüz size atanmış bir mekan yok.'
            : `${placeCount} mekan yönetiyorsunuz.`}
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 size={24} className="animate-spin text-brand" />
        </div>
      ) : placeCount > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <StatCard icon={Star} label="Ortalama Puan" value={avgRating ?? '—'} color="bg-yellow-100 text-yellow-600" />
            <StatCard icon={Heart} label="Favori Sayısı" value={totalFavorites > 0 ? totalFavorites.toString() : '—'} color="bg-red-100 text-red-500" />
            <StatCard icon={Bookmark} label="Listeleme Sayısı" value={totalWishlists > 0 ? totalWishlists.toString() : '—'} color="bg-violet-100 text-violet-600" />
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <MapPin size={15} className="text-brand" /> Mekanlarınız
            </h2>
            <ul className="space-y-3">
              {places.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-4 bg-gray-50 px-4 py-3 rounded-xl">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{p.name}</p>
                    {(p.cityName || p.districtName) && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        {[p.districtName, p.cityName].filter(Boolean).join(', ')}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-4 shrink-0 text-xs text-gray-500">
                    {p.rating != null && <span className="flex items-center gap-1"><Star size={12} className="text-yellow-500" />{p.rating.toFixed(1)}</span>}
                    {p.favoriteCount != null && <span className="flex items-center gap-1"><Heart size={12} className="text-red-400" />{p.favoriteCount}</span>}
                    {p.wishlistCount != null && <span className="flex items-center gap-1"><Bookmark size={12} className="text-violet-400" />{p.wishlistCount}</span>}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      {placeCount === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-400">Yönetici tarafından size bir mekan atanmamış.</p>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

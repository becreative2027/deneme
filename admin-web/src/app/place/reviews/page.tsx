'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAdminAuthStore } from '@/store/adminAuthStore';
import { adminClient } from '@/api/adminClient';
import { Star, Loader2, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';
import clsx from 'clsx';

interface Review {
  id: string;
  displayName: string;
  username: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

const RATING_OPTIONS = [
  { label: 'Tümü',   value: 0 },
  { label: '⭐ 1',   value: 1 },
  { label: '⭐⭐ 2', value: 2 },
  { label: '⭐⭐⭐ 3', value: 3 },
  { label: '⭐⭐⭐⭐ 4', value: 4 },
  { label: '⭐⭐⭐⭐⭐ 5', value: 5 },
];

const PAGE_SIZE = 15;

function Stars({ n }: { n: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={13}
          className={i <= n ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}
        />
      ))}
    </div>
  );
}

export default function PlaceReviewsPage() {
  const { user } = useAdminAuthStore();
  const placeId = user?.ownedPlaceIds[0];

  const [reviews,     setReviews]     = useState<Review[]>([]);
  const [totalCount,  setTotalCount]  = useState(0);
  const [loading,     setLoading]     = useState(true);
  const [page,        setPage]        = useState(1);
  const [minRating,   setMinRating]   = useState(0);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  // Rating distribution
  const [dist, setDist] = useState<Record<number, number>>({});

  const load = useCallback(async () => {
    if (!placeId) { setLoading(false); return; }
    setLoading(true);
    try {
      const params: Record<string, any> = { page, pageSize: PAGE_SIZE };
      if (minRating > 0) params.minRating = minRating;
      const r = await adminClient.get(`/api/places/${placeId}/reviews`, { params });
      const inner = r.data?.data ?? r.data;
      const items: Review[] = inner?.items ?? inner?.reviews ?? inner ?? [];
      setReviews(items);
      setTotalCount(inner?.totalCount ?? items.length);

      // Build distribution from returned items (rough, only first page)
      if (page === 1 && minRating === 0) {
        const d: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        items.forEach((rv) => { d[rv.rating] = (d[rv.rating] ?? 0) + 1; });
        setDist(d);
      }
    } finally {
      setLoading(false);
    }
  }, [placeId, page, minRating]);

  useEffect(() => { load(); }, [load]);

  // Reset page when filter changes
  useEffect(() => { setPage(1); }, [minRating]);

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  if (!placeId) return <div className="p-8 text-sm text-gray-400">Mekan atanmamış.</div>;

  return (
    <div className="p-8 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Yorumlar</h1>
          {totalCount > 0 && (
            <p className="text-sm text-gray-400 mt-0.5">
              {totalCount} yorum{avgRating ? ` · ${avgRating} ortalama` : ''}
            </p>
          )}
        </div>

        {/* Rating filter */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
          <SlidersHorizontal size={14} className="text-gray-400 ml-1 mr-0.5" />
          {RATING_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setMinRating(opt.value)}
              className={clsx(
                'px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap',
                minRating === opt.value
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700',
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={28} className="animate-spin text-brand" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-20 text-sm text-gray-400">
          {minRating > 0 ? `${minRating} yıldızlı yorum bulunamadı.` : 'Henüz yorum yok.'}
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {reviews.map((r) => (
              <div key={r.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full bg-brand/10 text-brand flex items-center justify-center text-sm font-bold shrink-0">
                    {(r.displayName ?? r.username ?? '?')[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {r.displayName ?? r.username}
                      </p>
                      <span className="text-xs text-gray-400 shrink-0">
                        {new Date(r.createdAt).toLocaleDateString('tr-TR', {
                          day: '2-digit', month: 'short', year: 'numeric',
                        })}
                      </span>
                    </div>
                    <Stars n={r.rating} />
                    {r.comment && (
                      <p className="text-sm text-gray-600 mt-2 leading-relaxed">{r.comment}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-xs text-gray-400">
                Sayfa {page} / {totalPages} ({totalCount} yorum)
              </p>
              <div className="flex gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                {/* Page numbers (max 5 around current) */}
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                  .reduce<(number | '...')[]>((acc, p, idx, arr) => {
                    if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('...');
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((item, i) =>
                    item === '...' ? (
                      <span key={`ellipsis-${i}`} className="px-2 py-1 text-gray-400 text-sm">…</span>
                    ) : (
                      <button
                        key={item}
                        onClick={() => setPage(item as number)}
                        className={clsx(
                          'w-9 h-9 rounded-lg text-sm font-medium transition-colors',
                          page === item
                            ? 'bg-brand text-white'
                            : 'border border-gray-200 hover:bg-gray-50 text-gray-700',
                        )}
                      >
                        {item}
                      </button>
                    )
                  )}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

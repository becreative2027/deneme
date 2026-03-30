'use client';

import { useState, useEffect } from 'react';
import { Loader2, Star, Trash2, MessageSquare, ChevronDown } from 'lucide-react';
import { getPlaceReviews, deleteReviewAdmin, getPlaces } from '@/api/admin';
import type { Review, Place } from '@/lib/types';

function Stars({ n }: { n: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} size={12} className={i <= n ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'} />
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [placesLoading, setPlacesLoading] = useState(true);
  const [selectedPlaceId, setSelectedPlaceId] = useState('');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getPlaces(1, 100)
      .then(r => setPlaces(r.items))
      .catch(() => {})
      .finally(() => setPlacesLoading(false));
  }, []);

  async function load(pid: string, p: number) {
    if (!pid) return;
    setLoading(true);
    setError('');
    try {
      const data = await getPlaceReviews(pid, p, 20);
      const items: Review[] = data.items ?? data.reviews ?? data ?? [];
      const tot: number = data.totalCount ?? data.total ?? items.length;
      setReviews(items);
      setTotal(tot);
    } catch {
      setError('Yorumlar yüklenemedi.');
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }

  function handleSelect(e: React.ChangeEvent<HTMLSelectElement>) {
    const pid = e.target.value;
    setSelectedPlaceId(pid);
    setPage(1);
    setReviews([]);
    setTotal(0);
    if (pid) load(pid, 1);
  }

  async function handleDelete(reviewId: string) {
    if (!confirm('Bu yorumu silmek istediğinize emin misiniz?')) return;
    setDeleting(reviewId);
    try {
      await deleteReviewAdmin(selectedPlaceId, reviewId);
      setReviews(prev => prev.filter(r => r.id !== reviewId));
      setTotal(prev => prev - 1);
    } finally {
      setDeleting(null);
    }
  }

  function handlePage(newPage: number) {
    setPage(newPage);
    load(selectedPlaceId, newPage);
  }

  const selectedPlace = places.find(p => p.id === selectedPlaceId);

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Yorumlar</h1>
        <p className="text-sm text-gray-500 mt-0.5">Mekan seçerek yorumları görüntüle ve yönet</p>
      </div>

      {/* Place selector */}
      <div className="mb-6 max-w-md">
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Mekan Seç</label>
        <div className="relative">
          <select
            value={selectedPlaceId}
            onChange={handleSelect}
            disabled={placesLoading}
            className="w-full appearance-none border border-gray-200 rounded-xl px-4 py-2.5 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-brand/30 bg-white disabled:opacity-50"
          >
            <option value="">{placesLoading ? 'Mekanlar yükleniyor…' : 'Mekan seçin…'}</option>
            {places.map(p => (
              <option key={p.id} value={p.id}>
                {p.name}{p.districtName ? ` · ${p.districtName}` : ''}{p.cityName ? `, ${p.cityName}` : ''}
              </option>
            ))}
          </select>
          <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>
      )}

      {/* Stats bar */}
      {selectedPlaceId && !loading && reviews.length > 0 && (
        <div className="flex items-center gap-4 mb-4">
          <span className="text-sm font-semibold text-gray-700">{selectedPlace?.name}</span>
          <div className="flex items-center gap-1.5 text-sm text-gray-600">
            <MessageSquare size={14} />
            <span><strong className="text-gray-900">{total}</strong> yorum</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-gray-600">
            <Star size={14} className="text-yellow-400 fill-yellow-400" />
            <span>Ort. <strong className="text-gray-900">
              {(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)}
            </strong></span>
          </div>
        </div>
      )}

      {/* Reviews list */}
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 size={28} className="animate-spin text-brand" /></div>
      ) : reviews.length > 0 ? (
        <>
          <div className="space-y-3">
            {reviews.map(r => (
              <div key={r.id} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-sm font-semibold text-gray-900">
                        {r.displayName ?? r.username}
                      </span>
                      <Stars n={r.rating} />
                      <span className="text-xs text-gray-400 ml-auto">
                        {new Date(r.createdAt).toLocaleDateString('tr-TR')}
                      </span>
                    </div>
                    {r.comment && (
                      <p className="text-sm text-gray-600">{r.comment}</p>
                    )}
                    <p className="text-[10px] text-gray-300 font-mono mt-1.5">{r.id}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(r.id)}
                    disabled={deleting === r.id}
                    className="shrink-0 text-gray-300 hover:text-red-500 transition-colors disabled:opacity-50"
                    title="Yorumu sil"
                  >
                    {deleting === r.id
                      ? <Loader2 size={16} className="animate-spin" />
                      : <Trash2 size={16} />
                    }
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-4">
            <button onClick={() => handlePage(page - 1)} disabled={page === 1}
              className="text-sm text-gray-500 hover:text-gray-800 disabled:opacity-30">← Önceki</button>
            <span className="text-sm text-gray-500">Sayfa {page} · {total} yorum</span>
            <button onClick={() => handlePage(page + 1)} disabled={reviews.length < 20}
              className="text-sm text-gray-500 hover:text-gray-800 disabled:opacity-30">Sonraki →</button>
          </div>
        </>
      ) : selectedPlaceId && !loading ? (
        <div className="text-center py-20 text-gray-400">
          <MessageSquare size={36} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Bu mekana ait yorum bulunamadı.</p>
        </div>
      ) : (
        <div className="text-center py-20 text-gray-400">
          <MessageSquare size={36} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Yukarıdan bir mekan seçin.</p>
        </div>
      )}
    </div>
  );
}

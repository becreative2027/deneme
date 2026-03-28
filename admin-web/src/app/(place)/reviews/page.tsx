'use client';

import { useEffect, useState } from 'react';
import { useAdminAuthStore } from '@/store/adminAuthStore';
import { adminClient } from '@/api/adminClient';
import { Star, Loader2 } from 'lucide-react';

export default function PlaceReviewsPage() {
  const { user } = useAdminAuthStore();
  const placeId = user?.ownedPlaceIds[0];
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!placeId) { setLoading(false); return; }
    adminClient.get(`/api/places/${placeId}/reviews`)
      .then((r) => setReviews(r.data.data ?? r.data.items ?? r.data ?? []))
      .finally(() => setLoading(false));
  }, [placeId]);

  function Stars({ n }: { n: number }) {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star key={i} size={12} className={i <= n ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'} />
        ))}
      </div>
    );
  }

  if (!placeId) return <div className="p-8 text-sm text-gray-400">Mekan atanmamış.</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Yorumlar</h1>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 size={28} className="animate-spin text-brand" /></div>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-20">Henüz yorum yok.</p>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r.id} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-gray-800">{r.displayName ?? r.username}</p>
                <div className="flex items-center gap-2">
                  <Stars n={r.rating} />
                  <span className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString('tr-TR')}</span>
                </div>
              </div>
              {r.comment && <p className="text-sm text-gray-600">{r.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

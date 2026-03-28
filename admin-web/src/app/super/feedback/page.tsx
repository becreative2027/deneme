'use client';

import { useEffect, useState } from 'react';
import { MessageSquarePlus, Loader2, CheckCircle, Inbox } from 'lucide-react';
import { getFeedback, markFeedbackReviewed } from '@/api/admin';

const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  PlaceRequest:   { label: 'Mekan Talebi',   color: 'bg-blue-100 text-blue-700' },
  LabelRequest:   { label: 'Etiket Talebi',  color: 'bg-purple-100 text-purple-700' },
  BugReport:      { label: 'Hata Bildirimi', color: 'bg-red-100 text-red-600' },
  FeatureRequest: { label: 'Özellik Talebi', color: 'bg-amber-100 text-amber-700' },
  Other:          { label: 'Diğer',          color: 'bg-gray-100 text-gray-600' },
};

export default function FeedbackPage() {
  const [items, setItems]     = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState<'pending' | 'reviewed'>('pending');

  useEffect(() => {
    setLoading(true);
    getFeedback(filter === 'reviewed')
      .then((d) => setItems(d.items ?? []))
      .finally(() => setLoading(false));
  }, [filter]);

  async function handleReview(id: string) {
    await markFeedbackReviewed(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  return (
    <div className="p-8">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquarePlus size={22} className="text-brand" />
        <h1 className="text-2xl font-bold text-gray-900">Geri Bildirimler</h1>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5">
        {(['pending', 'reviewed'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
              filter === tab
                ? 'bg-brand text-white'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {tab === 'pending' ? 'Bekleyenler' : 'İncelenenler'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={28} className="animate-spin text-brand" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Inbox size={40} className="mx-auto mb-3 text-gray-300" />
          <p className="text-sm">
            {filter === 'pending' ? 'Bekleyen geri bildirim yok.' : 'İncelenmiş geri bildirim yok.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const cat = CATEGORY_LABELS[item.category] ?? { label: item.category, color: 'bg-gray-100 text-gray-600' };
            return (
              <div key={item.id} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cat.color}`}>
                        {cat.label}
                      </span>
                      {item.userEmail && (
                        <span className="text-xs text-gray-500 font-mono">{item.userEmail}</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-800 leading-relaxed">{item.message}</p>
                    <p className="text-xs text-gray-300 mt-2">
                      {new Date(item.createdAt).toLocaleString('tr-TR')}
                    </p>
                  </div>
                  {filter === 'pending' && (
                    <button
                      onClick={() => handleReview(item.id)}
                      title="İncelendi olarak işaretle"
                      className="shrink-0 text-green-500 hover:text-green-700 transition-colors"
                    >
                      <CheckCircle size={22} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

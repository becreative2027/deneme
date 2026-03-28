'use client';

import { useEffect, useState } from 'react';
import { Shield, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { getPendingModeration, reviewModerationItem } from '@/api/admin';
import { useAdminAuthStore } from '@/store/adminAuthStore';

export default function ModerationPage() {
  const { user } = useAdminAuthStore();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPendingModeration()
      .then((d) => setItems(d.items ?? d))
      .finally(() => setLoading(false));
  }, []);

  async function handle(id: string, approve: boolean) {
    await reviewModerationItem(id, approve, user?.id ?? '');
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  return (
    <div className="p-8">
      <div className="flex items-center gap-2 mb-6">
        <Shield size={22} className="text-brand" />
        <h1 className="text-2xl font-bold text-gray-900">Moderasyon</h1>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 size={28} className="animate-spin text-brand" /></div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <CheckCircle size={40} className="mx-auto mb-3 text-green-400" />
          <p className="text-sm">Bekleyen moderasyon öğesi yok.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${item.targetType === 'Post' ? 'bg-blue-100 text-blue-700' : item.targetType === 'Review' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>
                    {item.targetType}
                  </span>
                  <span className="text-xs text-gray-400 font-mono truncate">{item.targetId}</span>
                </div>
                {item.reporterId && (
                  <p className="text-xs text-gray-500 mt-1.5">
                    <span className="font-semibold text-gray-600">Şikayetçi:</span>{' '}
                    <span className="font-mono">{item.reporterId}</span>
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-0.5 italic">
                  {item.reporterNote ? `"${item.reporterNote}"` : 'Sebep belirtilmemiş'}
                </p>
                <p className="text-xs text-gray-300 mt-0.5">
                  {new Date(item.createdAt).toLocaleString('tr-TR')}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => handle(item.id, true)} className="text-green-500 hover:text-green-700 transition-colors">
                  <CheckCircle size={20} />
                </button>
                <button onClick={() => handle(item.id, false)} className="text-red-400 hover:text-red-600 transition-colors">
                  <XCircle size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

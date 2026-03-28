'use client';

import { useState } from 'react';
import { Loader2, Plus, Trash2, KeyRound } from 'lucide-react';
import { grantOwnership, revokeOwnership, getOwnedPlaces } from '@/api/admin';

export default function OwnershipPage() {
  const [userId, setUserId] = useState('');
  const [placeId, setPlaceId] = useState('');
  const [ownedPlaces, setOwnedPlaces] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [grantLoading, setGrantLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  async function handleLookup() {
    if (!userId.trim()) return;
    setLoading(true);
    try {
      const ids = await getOwnedPlaces(userId.trim());
      setOwnedPlaces(ids);
    } catch {
      setMsg({ type: 'err', text: 'Kullanıcı bulunamadı.' });
    } finally {
      setLoading(false);
    }
  }

  async function handleGrant() {
    if (!userId.trim() || !placeId.trim()) return;
    setGrantLoading(true);
    setMsg(null);
    try {
      await grantOwnership(userId.trim(), placeId.trim());
      setMsg({ type: 'ok', text: 'Mekan sahipliği verildi.' });
      setOwnedPlaces((prev) => [...prev, placeId.trim()]);
      setPlaceId('');
    } catch (err: any) {
      setMsg({ type: 'err', text: err?.response?.data?.message ?? 'İşlem başarısız.' });
    } finally {
      setGrantLoading(false);
    }
  }

  async function handleRevoke(pid: string) {
    try {
      await revokeOwnership(userId.trim(), pid);
      setOwnedPlaces((prev) => prev.filter((p) => p !== pid));
      setMsg({ type: 'ok', text: 'Sahiplik kaldırıldı.' });
    } catch {
      setMsg({ type: 'err', text: 'Kaldırma işlemi başarısız.' });
    }
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center gap-2 mb-6">
        <KeyRound size={22} className="text-brand" />
        <h1 className="text-2xl font-bold text-gray-900">Mekan Sahipleri</h1>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Kullanıcı ID</label>
          <div className="flex gap-2">
            <input
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="UUID"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            />
            <button
              onClick={handleLookup}
              disabled={loading}
              className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors flex items-center gap-1"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : 'Sorgula'}
            </button>
          </div>
        </div>

        {ownedPlaces.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-2">Sahip olunan mekanlar:</p>
            <ul className="space-y-1.5">
              {ownedPlaces.map((pid) => (
                <li key={pid} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg text-sm">
                  <span className="text-gray-700 font-mono text-xs">{pid}</span>
                  <button onClick={() => handleRevoke(pid)} className="text-red-400 hover:text-red-600 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="border-t border-gray-100 pt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Mekan Ekle</label>
          <div className="flex gap-2">
            <input
              value={placeId}
              onChange={(e) => setPlaceId(e.target.value)}
              placeholder="Place UUID"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            />
            <button
              onClick={handleGrant}
              disabled={grantLoading || !placeId.trim()}
              className="bg-brand text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-brand-dark transition-colors flex items-center gap-1 disabled:opacity-50"
            >
              {grantLoading ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              Ekle
            </button>
          </div>
        </div>

        {msg && (
          <p className={`text-sm px-3 py-2 rounded-lg ${msg.type === 'ok' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {msg.text}
          </p>
        )}
      </div>
    </div>
  );
}

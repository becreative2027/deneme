'use client';

import { useEffect, useState } from 'react';
import {
  Bell, Send, Loader2, Users, Heart, Bookmark, MapPin,
  CheckCircle2, Clock, AlertCircle,
} from 'lucide-react';
import { useAdminAuthStore } from '@/store/adminAuthStore';
import {
  sendPlaceNotification,
  getPlaceNotificationHistory,
  type NotificationAudience,
} from '@/api/admin';

const NOTIF_TYPES = [
  { value: 'announcement', label: 'Duyuru' },
  { value: 'promotion',    label: 'Kampanya' },
  { value: 'event',        label: 'Etkinlik' },
  { value: 'update',       label: 'Güncelleme' },
];

const AUDIENCES: { value: NotificationAudience; label: string; desc: string; icon: React.ElementType }[] = [
  {
    value: 'Favorites',
    label: 'Favorilerine Ekleyenler',
    desc:  'Mekanı favorilerine almış kullanıcılar',
    icon:  Heart,
  },
  {
    value: 'Wishlist',
    label: 'Listesine Ekleyenler',
    desc:  'Mekanı wishlist\'ine eklemiş kullanıcılar',
    icon:  Bookmark,
  },
  {
    value: 'Nearby',
    label: 'Yakın Lokasyon',
    desc:  'Mekana 3 km mesafede mekan favorisi olan kullanıcılar',
    icon:  MapPin,
  },
];

const AUDIENCE_LABELS: Record<string, string> = {
  Favorites: 'Favoriler',
  Wishlist:  'Wishlist',
  Nearby:    'Yakın Konum',
};

interface HistoryItem {
  id: string;
  title: string;
  body: string;
  type: string;
  audience: string;
  recipientCount: number;
  sentAt: string;
}

export default function NotificationsPage() {
  const { user } = useAdminAuthStore();
  const [selectedPlace, setSelectedPlace] = useState(user?.ownedPlaceIds[0] ?? '');

  // Form state
  const [type,     setType]     = useState('announcement');
  const [audience, setAudience] = useState<NotificationAudience>('Favorites');
  const [title,    setTitle]    = useState('');
  const [body,     setBody]     = useState('');

  // UI state
  const [loading,    setLoading]    = useState(false);
  const [sending,    setSending]    = useState(false);
  const [error,      setError]      = useState('');
  const [canSend,    setCanSend]    = useState(true);
  const [remaining,  setRemaining]  = useState(5);
  const [history,    setHistory]    = useState<HistoryItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  // Load history + canSend flag on mount / place change
  useEffect(() => {
    if (!selectedPlace) return;
    setLoading(true);
    getPlaceNotificationHistory(selectedPlace)
      .then((d) => {
        setHistory(d?.items ?? []);
        setTotalCount(d?.totalCount ?? 0);
        setCanSend(d?.canSendToday ?? true);
        setRemaining(d?.remainingToday ?? 5);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedPlace]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !body.trim() || !canSend) return;
    setSending(true);
    setError('');
    try {
      const result = await sendPlaceNotification(selectedPlace, title.trim(), body.trim(), type, audience);
      // Prepend to history
      const newItem: HistoryItem = {
        id:             result?.id ?? crypto.randomUUID(),
        title:          title.trim(),
        body:           body.trim(),
        type,
        audience,
        recipientCount: result?.recipientCount ?? 0,
        sentAt:         new Date().toISOString(),
      };
      setHistory((prev) => [newItem, ...prev]);
      setTotalCount((c) => c + 1);
      setRemaining((r) => r - 1);
      setCanSend((prev) => remaining - 1 > 0);
      setTitle('');
      setBody('');
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? err?.response?.data?.message ?? 'Gönderim başarısız.';
      setError(msg);
    } finally {
      setSending(false);
    }
  }

  if ((user?.ownedPlaceIds.length ?? 0) === 0) {
    return (
      <div className="p-8">
        <div className="flex items-center gap-2 mb-6">
          <Bell size={22} className="text-brand" />
          <h1 className="text-2xl font-bold text-gray-900">Bildirimler</h1>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 text-sm text-yellow-700">
          Size atanmış bir mekan bulunmuyor.
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Bell size={22} className="text-brand" />
          <h1 className="text-2xl font-bold text-gray-900">Bildirimler</h1>
        </div>
        {canSend && (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-green-100 text-green-700">
            Bugün {remaining} hak kaldı
          </span>
        )}
      </div>

      {/* Daily limit banner */}
      {!canSend && (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-5 text-sm text-amber-700">
          <Clock size={16} className="shrink-0" />
          <span>Günlük bildirim limitine ulaşıldı (5/5). Yarın tekrar gönderebilirsiniz.</span>
        </div>
      )}

      {/* Send form */}
      <form onSubmit={handleSend} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">

        {/* Place selector — only when owner has multiple */}
        {(user?.ownedPlaceIds.length ?? 0) > 1 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mekan</label>
            <select
              value={selectedPlace}
              onChange={(e) => setSelectedPlace(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            >
              {user!.ownedPlaceIds.map((id) => (
                <option key={id} value={id}>{id}</option>
              ))}
            </select>
          </div>
        )}

        {/* Audience selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Users size={14} className="inline mr-1.5 text-gray-500" />
            Hedef Kitle
          </label>
          <div className="grid grid-cols-1 gap-2">
            {AUDIENCES.map((a) => {
              const Icon = a.icon;
              const active = audience === a.value;
              return (
                <button
                  key={a.value}
                  type="button"
                  onClick={() => setAudience(a.value)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-colors ${
                    active
                      ? 'border-brand bg-brand/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Icon size={18} className={active ? 'text-brand' : 'text-gray-400'} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${active ? 'text-brand' : 'text-gray-700'}`}>
                      {a.label}
                    </p>
                    <p className="text-xs text-gray-400">{a.desc}</p>
                  </div>
                  {active && <CheckCircle2 size={16} className="text-brand shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Bildirim Türü</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand"
          >
            {NOTIF_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Başlık</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={80}
            required
            placeholder="Bugün özel indirimler var!"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>

        {/* Body */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">İçerik</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={300}
            required
            rows={3}
            placeholder="Detaylı açıklama…"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand resize-none"
          />
          <p className="text-right text-xs text-gray-400 mt-1">{body.length}/300</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
            <AlertCircle size={15} className="shrink-0" />
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={sending || !canSend}
          className="w-full bg-brand hover:bg-brand-dark text-white py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
          {sending ? 'Gönderiliyor…' : 'Bildirimi Gönder'}
        </button>
      </form>

      {/* History */}
      <div className="mt-8">
        <p className="text-sm font-semibold text-gray-700 mb-3">
          Geçmiş Bildirimler
          {totalCount > 0 && <span className="ml-1.5 text-xs text-gray-400 font-normal">({totalCount})</span>}
        </p>

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 size={22} className="animate-spin text-brand" />
          </div>
        ) : history.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">Henüz bildirim gönderilmedi.</p>
        ) : (
          <ul className="space-y-3">
            {history.map((item) => (
              <li key={item.id} className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-brand/10 text-brand">
                        {AUDIENCE_LABELS[item.audience] ?? item.audience}
                      </span>
                      <span className="text-xs text-gray-400 capitalize">{item.type}</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-800">{item.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{item.body}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-bold text-gray-700">{item.recipientCount}</p>
                    <p className="text-[10px] text-gray-400">kişi</p>
                  </div>
                </div>
                <p className="text-[10px] text-gray-300 mt-2">
                  {new Date(item.sentAt).toLocaleString('tr-TR')}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

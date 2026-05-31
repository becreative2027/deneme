'use client';

import { useEffect, useRef, useState } from 'react';
import { useAdminAuthStore } from '@/store/adminAuthStore';
import {
  getPlaceEvents, createPlaceEvent, deletePlaceEvent,
  type PlaceEventItem,
} from '@/api/admin';
import {
  CalendarDays, Plus, Trash2, Loader2, Upload, X,
  Clock, ChevronDown, ChevronUp,
} from 'lucide-react';
import clsx from 'clsx';

// ── Cloudinary upload (same as my-place) ─────────────────────────────────

const CLOUDINARY_CLOUD  = 'dnwylcwex';
const CLOUDINARY_PRESET = 'spotfinder_posts';

async function uploadToCloudinary(file: File): Promise<string> {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('upload_preset', CLOUDINARY_PRESET);
  fd.append('folder', 'spotfinder/events');
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`,
    { method: 'POST', body: fd },
  );
  if (!res.ok) throw new Error('Yükleme başarısız');
  return (await res.json()).secure_url as string;
}

// ── Helpers ───────────────────────────────────────────────────────────────

function fmtDatetime(iso: string) {
  return new Date(iso).toLocaleString('tr-TR', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function isUpcoming(ev: PlaceEventItem) {
  const end = ev.endsAt ?? ev.startsAt;
  return new Date(end) >= new Date();
}

// ── Main page ─────────────────────────────────────────────────────────────

export default function PlaceEventsPage() {
  const { user }  = useAdminAuthStore();
  const placeId   = user?.ownedPlaceIds[0];

  const [events,      setEvents]      = useState<PlaceEventItem[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [showPast,    setShowPast]    = useState(false);
  const [formOpen,    setFormOpen]    = useState(false);

  // Form state
  const [title,        setTitle]        = useState('');
  const [description,  setDescription]  = useState('');
  const [startsAt,     setStartsAt]     = useState('');
  const [endsAt,       setEndsAt]       = useState('');
  const [imageUrl,     setImageUrl]     = useState('');
  const [imgUploading, setImgUploading] = useState(false);
  const [saving,       setSaving]       = useState(false);
  const [saveErr,      setSaveErr]      = useState('');

  const imgInput = useRef<HTMLInputElement>(null);

  // Load events
  useEffect(() => {
    if (!placeId) { setLoading(false); return; }
    setLoading(true);
    getPlaceEvents(placeId, showPast)
      .then(setEvents)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [placeId, showPast]);

  async function handleImageFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImgUploading(true);
    try {
      setImageUrl(await uploadToCloudinary(file));
    } catch {
      alert('Fotoğraf yüklenemedi.');
    } finally {
      setImgUploading(false);
      e.target.value = '';
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!placeId || !title.trim() || !startsAt) return;
    setSaving(true);
    setSaveErr('');
    try {
      const id = await createPlaceEvent(placeId, {
        title: title.trim(),
        description: description.trim() || undefined,
        startsAt: new Date(startsAt).toISOString(),
        endsAt:   endsAt ? new Date(endsAt).toISOString() : undefined,
        imageUrl: imageUrl || undefined,
      });
      const newEv: PlaceEventItem = {
        id,
        title: title.trim(),
        description: description.trim() || undefined,
        startsAt: new Date(startsAt).toISOString(),
        endsAt:   endsAt ? new Date(endsAt).toISOString() : undefined,
        imageUrl: imageUrl || undefined,
        createdAt: new Date().toISOString(),
      };
      setEvents((prev) => [newEv, ...prev].sort(
        (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()
      ));
      // Reset form
      setTitle(''); setDescription(''); setStartsAt('');
      setEndsAt(''); setImageUrl(''); setFormOpen(false);
    } catch (err: any) {
      setSaveErr(err?.response?.data?.error ?? 'Kaydetme başarısız.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(eventId: string) {
    if (!placeId || !confirm('Etkinliği silmek istediğinizden emin misiniz?')) return;
    try {
      await deletePlaceEvent(placeId, eventId);
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
    } catch {}
  }

  if (!placeId) return <div className="p-8 text-sm text-gray-400">Mekan atanmamış.</div>;

  const upcoming = events.filter(isUpcoming);
  const past     = events.filter((e) => !isUpcoming(e));

  return (
    <div className="p-8 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Etkinlikler</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {upcoming.length} yaklaşan etkinlik
          </p>
        </div>
        <button
          onClick={() => setFormOpen((v) => !v)}
          className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-xl text-sm font-semibold hover:bg-brand-dark transition-colors"
        >
          {formOpen ? <X size={16} /> : <Plus size={16} />}
          {formOpen ? 'İptal' : 'Etkinlik Ekle'}
        </button>
      </div>

      {/* Create form */}
      {formOpen && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6 space-y-4"
        >
          <h2 className="text-sm font-semibold text-gray-700">Yeni Etkinlik</h2>

          {/* Image */}
          <div>
            {imageUrl ? (
              <div className="relative w-full h-36 rounded-xl overflow-hidden border border-gray-200 mb-2">
                <img src={imageUrl} alt="Etkinlik" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="absolute top-2 right-2 bg-white/90 rounded-full p-1 hover:bg-white shadow"
                >
                  <X size={13} className="text-gray-600" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => !imgUploading && imgInput.current?.click()}
                className="w-full h-28 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:border-brand hover:bg-brand/5 transition-colors mb-2"
              >
                {imgUploading
                  ? <Loader2 size={20} className="animate-spin text-brand" />
                  : <><Upload size={18} className="text-gray-400" /><p className="text-xs text-gray-400">Etkinlik fotoğrafı ekle (isteğe bağlı)</p></>}
              </div>
            )}
            <input ref={imgInput} type="file" accept="image/*" className="hidden" onChange={handleImageFile} />
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Etkinlik Adı *</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={200}
              placeholder="Cuma Gecesi Jazz"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Açıklama</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={2000}
              rows={2}
              placeholder="Etkinlik hakkında kısa bir açıklama…"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand resize-none"
            />
          </div>

          {/* Date/time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Başlangıç *</label>
              <input
                type="datetime-local"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Bitiş (isteğe bağlı)</label>
              <input
                type="datetime-local"
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
                min={startsAt}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>
          </div>

          {saveErr && <p className="text-xs text-red-500">{saveErr}</p>}

          <button
            type="submit"
            disabled={saving || !title.trim() || !startsAt}
            className="w-full bg-brand text-white py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:bg-brand-dark transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            {saving ? 'Kaydediliyor…' : 'Etkinlik Oluştur'}
          </button>
        </form>
      )}

      {/* Event list */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={26} className="animate-spin text-brand" />
        </div>
      ) : (
        <>
          {upcoming.length === 0 && !showPast ? (
            <div className="text-center py-16 text-sm text-gray-400">
              <CalendarDays size={36} className="mx-auto mb-3 text-gray-300" />
              Henüz yaklaşan etkinlik yok.
            </div>
          ) : (
            <div className="space-y-3">
              {upcoming.map((ev) => (
                <EventCard key={ev.id} ev={ev} onDelete={handleDelete} />
              ))}
            </div>
          )}

          {/* Past events toggle */}
          {(past.length > 0 || showPast) && (
            <div className="mt-6">
              <button
                onClick={() => setShowPast((v) => !v)}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 font-medium mb-3"
              >
                {showPast ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                Geçmiş etkinlikler {past.length > 0 ? `(${past.length})` : ''}
              </button>
              {showPast && past.length > 0 && (
                <div className="space-y-3 opacity-60">
                  {past.map((ev) => (
                    <EventCard key={ev.id} ev={ev} onDelete={handleDelete} isPast />
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Event card ────────────────────────────────────────────────────────────

function EventCard({
  ev, onDelete, isPast = false,
}: {
  ev: PlaceEventItem;
  onDelete: (id: string) => void;
  isPast?: boolean;
}) {
  return (
    <div className={clsx(
      'bg-white rounded-2xl border shadow-sm overflow-hidden flex gap-0',
      isPast ? 'border-gray-100' : 'border-gray-200',
    )}>
      {ev.imageUrl && (
        <img
          src={ev.imageUrl}
          alt={ev.title}
          className="w-24 object-cover shrink-0"
        />
      )}
      <div className="flex-1 p-4 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{ev.title}</p>
            {ev.description && (
              <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{ev.description}</p>
            )}
          </div>
          <button
            onClick={() => onDelete(ev.id)}
            className="text-gray-300 hover:text-red-400 transition-colors shrink-0 p-1"
          >
            <Trash2 size={15} />
          </button>
        </div>
        <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
          <Clock size={11} />
          <span>{fmtDatetime(ev.startsAt)}</span>
          {ev.endsAt && <span>– {fmtDatetime(ev.endsAt)}</span>}
        </div>
      </div>
    </div>
  );
}

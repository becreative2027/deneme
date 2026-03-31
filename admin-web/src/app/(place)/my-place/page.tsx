'use client';

import { useEffect, useRef, useState } from 'react';
import { useAdminAuthStore } from '@/store/adminAuthStore';
import {
  getPlaceDetail, getFilters,
  updatePlaceMedia, ownerAssignLabel, ownerRemoveLabel,
} from '@/api/admin';
import {
  Loader2, MapPin, Star, Heart, Bookmark, ImagePlus,
  Link2, Plus, X, Tag, Check, Save, Store, DollarSign,
} from 'lucide-react';

export default function MyPlacePage() {
  const { user } = useAdminAuthStore();
  const placeId = user?.ownedPlaceIds[0];

  const [place,       setPlace]       = useState<any>(null);
  const [allLabels,   setAllLabels]   = useState<any[]>([]);  // flat list
  const [loading,     setLoading]     = useState(true);
  const [saving,      setSaving]      = useState(false);
  const [saveMsg,     setSaveMsg]     = useState('');

  // Editable fields
  const [coverUrl,     setCoverUrl]     = useState('');
  const [menuUrl,      setMenuUrl]      = useState('');
  const [menuImages,   setMenuImages]   = useState<string[]>([]);
  const [newMenuImg,   setNewMenuImg]   = useState('');
  const [priceLevel,   setPriceLevel]   = useState<number | null>(null);
  const [venueType,    setVenueType]    = useState<string>('');
  const [labelSearch,  setLabelSearch]  = useState('');
  const [labelOpen,    setLabelOpen]    = useState(false);

  const labelRef = useRef<HTMLDivElement>(null);

  // Load place + labels
  useEffect(() => {
    if (!placeId) { setLoading(false); return; }
    Promise.all([
      getPlaceDetail(placeId),
      getFilters(1),
    ]).then(([pd, filters]) => {
      const p = pd?.data ?? pd;
      setPlace(p);
      setCoverUrl(p?.coverImageUrl ?? '');
      setMenuUrl(p?.menuUrl ?? '');
      setMenuImages(p?.menuImageUrls ?? []);
      setPriceLevel(p?.priceLevel ?? null);
      setVenueType(p?.venueType ?? '');
      // Flatten labels from categories
      const cats: any[] = filters?.categories ?? [];
      setAllLabels(cats.flatMap((c: any) =>
        (c.labels ?? []).map((l: any) => ({ ...l, categoryName: c.displayName }))
      ));
    }).finally(() => setLoading(false));
  }, [placeId]);

  // Close label dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (labelRef.current && !labelRef.current.contains(e.target as Node))
        setLabelOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  async function handleSaveMedia() {
    if (!placeId) return;
    setSaving(true); setSaveMsg('');
    // Auto-add any pending URL in the input field
    const finalMenuImages = newMenuImg.trim()
      ? [...menuImages, newMenuImg.trim()]
      : menuImages;
    if (newMenuImg.trim()) { setMenuImages(finalMenuImages); setNewMenuImg(''); }
    try {
      await updatePlaceMedia(placeId, coverUrl || null, menuUrl || null, finalMenuImages, priceLevel, venueType || null);
      setSaveMsg('Kaydedildi ✓');
      // Update local place state
      setPlace((p: any) => ({ ...p, coverImageUrl: coverUrl, menuUrl, menuImageUrls: menuImages }));
      setTimeout(() => setSaveMsg(''), 3000);
    } catch {
      setSaveMsg('Kaydetme başarısız.');
    } finally {
      setSaving(false);
    }
  }

  async function handleAddLabel(labelId: number) {
    if (!placeId) return;
    try {
      await ownerAssignLabel(placeId, labelId);
      const label = allLabels.find((l) => l.id === labelId);
      if (label) setPlace((p: any) => ({
        ...p,
        labels: [...(p.labels ?? []), { labelId, key: label.key, displayName: label.displayName, weight: 1.0 }],
      }));
    } catch {}
    setLabelOpen(false);
    setLabelSearch('');
  }

  async function handleRemoveLabel(labelId: number) {
    if (!placeId) return;
    try {
      await ownerRemoveLabel(placeId, labelId);
      setPlace((p: any) => ({
        ...p,
        labels: (p.labels ?? []).filter((l: any) => l.labelId !== labelId),
      }));
    } catch {}
  }

  function addMenuImage() {
    const url = newMenuImg.trim();
    if (!url || menuImages.includes(url)) return;
    setMenuImages((prev) => [...prev, url]);
    setNewMenuImg('');
  }

  if (!placeId) {
    return (
      <div className="p-8 text-center text-gray-400">
        <MapPin size={40} className="mx-auto mb-3" />
        <p className="text-sm">Henüz bir mekan atanmamış.</p>
      </div>
    );
  }

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 size={28} className="animate-spin text-brand" /></div>;
  }

  const assignedLabelIds = new Set((place?.labels ?? []).map((l: any) => l.labelId));
  const filteredLabels = allLabels.filter(
    (l) => !assignedLabelIds.has(l.id) &&
      (l.displayName.toLowerCase().includes(labelSearch.toLowerCase()) ||
       l.categoryName.toLowerCase().includes(labelSearch.toLowerCase()))
  );

  return (
    <div className="p-8 max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Mekanım</h1>

      {/* ── Info card ──────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-start gap-4">
          {/* Cover preview */}
          {(coverUrl || place?.coverImageUrl) && (
            <img
              src={coverUrl || place.coverImageUrl}
              alt="Kapak"
              className="w-20 h-20 rounded-xl object-cover shrink-0 border border-gray-200"
              onError={(e) => (e.currentTarget.style.display = 'none')}
            />
          )}
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-gray-900">{place?.name}</h2>
            {place?.cityName && (
              <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                <MapPin size={12} /> {[place.districtName, place.cityName].filter(Boolean).join(', ')}
              </p>
            )}
            <div className="flex items-center gap-4 mt-3 text-sm">
              {place?.rating != null && (
                <span className="flex items-center gap-1 text-yellow-600 font-semibold">
                  <Star size={14} fill="currentColor" /> {place.rating.toFixed(1)}
                </span>
              )}
              {place?.favoriteCount != null && (
                <span className="flex items-center gap-1 text-gray-500">
                  <Heart size={14} className="text-red-400" /> {place.favoriteCount}
                </span>
              )}
              {place?.wishlistCount != null && (
                <span className="flex items-center gap-1 text-gray-500">
                  <Bookmark size={14} className="text-violet-400" /> {place.wishlistCount}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Cover image ─────────────────────────────────────────────────── */}
      <Section icon={ImagePlus} title="Kapak Fotoğrafı">
        <div className="space-y-3">
          {coverUrl && (
            <div className="relative w-full h-44 rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
              <img src={coverUrl} alt="Kapak" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
              <button
                onClick={() => setCoverUrl('')}
                className="absolute top-2 right-2 bg-white/90 rounded-full p-1 hover:bg-white shadow"
              >
                <X size={14} className="text-gray-600" />
              </button>
            </div>
          )}
          <div className="flex gap-2">
            <input
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
              placeholder="https://... görsel URL'i yapıştırın"
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>
        </div>
      </Section>

      {/* ── Menu URL ────────────────────────────────────────────────────── */}
      <Section icon={Link2} title="Menü URL">
        <input
          value={menuUrl}
          onChange={(e) => setMenuUrl(e.target.value)}
          placeholder="https://restaurant.com/menu"
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
        />
      </Section>

      {/* ── Menu images ─────────────────────────────────────────────────── */}
      <Section icon={ImagePlus} title="Menü Fotoğrafları">
        <div className="space-y-3">
          {menuImages.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {menuImages.map((url, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                  <img src={url} alt={`Menü ${i + 1}`} className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                  <button
                    onClick={() => setMenuImages((prev) => prev.filter((_, idx) => idx !== i))}
                    className="absolute top-1 right-1 bg-white/90 rounded-full p-0.5 hover:bg-white shadow"
                  >
                    <X size={12} className="text-gray-600" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <input
              value={newMenuImg}
              onChange={(e) => setNewMenuImg(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addMenuImage(); } }}
              placeholder="Fotoğraf URL'i ekle ve Enter'a bas"
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
            />
            <button
              onClick={addMenuImage}
              className="px-3 py-2 bg-brand text-white rounded-lg hover:bg-brand-dark transition-colors"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      </Section>

      {/* ── Fiyat Seviyesi ──────────────────────────────────────────────────── */}
      <Section icon={DollarSign} title="Fiyat Seviyesi">
        <div className="flex gap-2">
          {[
            { val: null, label: 'Belirtilmemiş' },
            { val: 1,    label: '₺ Uygun'      },
            { val: 2,    label: '₺₺ Orta'       },
            { val: 3,    label: '₺₺₺ Üst'       },
          ].map(({ val, label }) => (
            <button
              key={String(val)}
              onClick={() => setPriceLevel(val)}
              className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                priceLevel === val
                  ? 'bg-brand text-white border-brand'
                  : 'border-gray-300 text-gray-600 hover:border-brand hover:text-brand'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </Section>

      {/* ── Mekan Türü ──────────────────────────────────────────────────────── */}
      <Section icon={Store} title="Mekan Türü">
        <select
          value={venueType}
          onChange={(e) => setVenueType(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
        >
          <option value="">Seçiniz…</option>
          <option value="kafe">Kafe</option>
          <option value="restoran">Restoran</option>
          <option value="bar">Bar</option>
          <option value="pastane">Pastane & Tatlı</option>
          <option value="kitabevi_kafe">Kitabevi & Kafe</option>
          <option value="lounge">Lounge & Bar</option>
          <option value="food_court">Food Court</option>
        </select>
      </Section>

      {/* ── Save media button ────────────────────────────────────────────── */}
      <button
        onClick={handleSaveMedia}
        disabled={saving}
        className="w-full bg-brand text-white py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:bg-brand-dark transition-colors disabled:opacity-50"
      >
        {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
        {saving ? 'Kaydediliyor…' : 'Değişiklikleri Kaydet'}
      </button>
      {saveMsg && (
        <p className={`text-center text-sm font-medium ${saveMsg.includes('✓') ? 'text-green-600' : 'text-red-500'}`}>
          {saveMsg}
        </p>
      )}

      {/* ── Labels ──────────────────────────────────────────────────────── */}
      <Section icon={Tag} title="Etiketler">
        {/* Assigned labels */}
        <div className="flex flex-wrap gap-2 mb-3">
          {(place?.labels ?? []).length === 0 ? (
            <p className="text-xs text-gray-400">Henüz etiket atanmamış.</p>
          ) : (
            (place.labels as any[]).map((l: any) => (
              <span
                key={l.labelId}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-brand/10 text-brand text-xs font-semibold rounded-full"
              >
                {l.displayName}
                <button onClick={() => handleRemoveLabel(l.labelId)} className="hover:text-red-500 transition-colors">
                  <X size={11} />
                </button>
              </span>
            ))
          )}
        </div>

        {/* Label picker */}
        <div ref={labelRef} className="relative">
          <button
            onClick={() => setLabelOpen((v) => !v)}
            className="flex items-center gap-2 px-3 py-2 text-sm border border-dashed border-brand text-brand rounded-lg hover:bg-brand/5 transition-colors"
          >
            <Plus size={14} /> Etiket Ekle
          </button>

          {labelOpen && (
            <div className="absolute top-full left-0 mt-1 z-20 bg-white border border-gray-200 rounded-xl shadow-lg w-72">
              <div className="p-2 border-b border-gray-100">
                <input
                  autoFocus
                  value={labelSearch}
                  onChange={(e) => setLabelSearch(e.target.value)}
                  placeholder="Etiket ara…"
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>
              <ul className="max-h-56 overflow-y-auto py-1">
                {filteredLabels.length === 0 ? (
                  <li className="px-3 py-2 text-xs text-gray-400 text-center">Sonuç yok</li>
                ) : (
                  filteredLabels.map((l) => (
                    <li key={l.id}>
                      <button
                        onClick={() => handleAddLabel(l.id)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 text-left"
                      >
                        <Check size={12} className="text-transparent" />
                        <span className="flex-1">{l.displayName}</span>
                        <span className="text-[10px] text-gray-400">{l.categoryName}</span>
                      </button>
                    </li>
                  ))
                )}
              </ul>
            </div>
          )}
        </div>
      </Section>
    </div>
  );
}

function Section({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-4">
        <Icon size={15} className="text-brand" /> {title}
      </h3>
      {children}
    </div>
  );
}

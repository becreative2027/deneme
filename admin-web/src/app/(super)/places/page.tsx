'use client';

import { useEffect, useRef, useState } from 'react';
import { MapPin, Loader2, Trash2, Pencil, Plus, X, Star, Tag, ImagePlus, Link2, Upload } from 'lucide-react';
import {
  getPlaces, deletePlaceAdmin, createPlaceAdmin, updatePlaceAdmin, updatePlaceMedia,
  getFilters, assignLabelToPlace, getCities, getDistricts,
} from '@/api/admin';
import type { GeoCity, GeoDistrict } from '@/api/admin';
import { uploadImage } from '@/lib/upload';
import type { Place, FilterCategory } from '@/lib/types';

// ── Image Upload Input ─────────────────────────────────────────────────────

function ImageUploadField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError('');
    setProgress(0);
    try {
      const result = await uploadImage(file, setProgress);
      onChange(result.url);
    } catch (err: any) {
      setUploadError(err.message ?? 'Yükleme başarısız.');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <div>
      <label className="text-xs font-semibold text-gray-500 mb-1 block">{label}</label>
      {value && (
        <div className="relative mb-2 w-full h-28 rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
          <img src={value} alt="" className="w-full h-full object-cover" onError={e => (e.currentTarget.style.display = 'none')} />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-1.5 right-1.5 bg-white/90 rounded-full p-0.5 shadow hover:bg-white"
          >
            <X size={13} className="text-gray-600" />
          </button>
        </div>
      )}
      <div className="flex gap-2">
        <input
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder ?? 'https://...'}
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          title="Bilgisayardan yükle"
          className="shrink-0 px-3 py-2 border border-dashed border-brand text-brand rounded-lg hover:bg-brand/5 transition-colors disabled:opacity-50 flex items-center gap-1 text-xs font-semibold"
        >
          {uploading ? <><Loader2 size={13} className="animate-spin" />{progress}%</> : <><Upload size={13} />Yükle</>}
        </button>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </div>
      {uploadError && <p className="text-[11px] text-red-500 mt-1">{uploadError}</p>}
    </div>
  );
}

// ── Create / Edit Modal ────────────────────────────────────────────────────

function PlaceModal({
  place,
  onClose,
  onSaved,
}: {
  place?: Place;
  onClose: () => void;
  onSaved: () => void;
}) {
  const editing = !!place;

  // Basic fields
  const [name, setName] = useState('');
  const [cityId, setCityId] = useState<number | ''>('');
  const [districtId, setDistrictId] = useState<number | ''>('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [parking, setParking] = useState('unavailable');

  // Media fields
  const [coverUrl, setCoverUrl] = useState('');
  const [menuUrl, setMenuUrl] = useState('');
  const [menuImages, setMenuImages] = useState<string[]>([]);
  const [newMenuImg, setNewMenuImg] = useState('');
  const menuImgRef = useRef<HTMLInputElement>(null);
  const [menuImgUploading, setMenuImgUploading] = useState(false);
  const [menuImgProgress, setMenuImgProgress] = useState(0);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [cities, setCities] = useState<GeoCity[]>([]);
  const [districts, setDistricts] = useState<GeoDistrict[]>([]);
  const [loadingCities, setLoadingCities] = useState(true);
  const [loadingDistricts, setLoadingDistricts] = useState(false);

  useEffect(() => {
    getCities(1).then(setCities).finally(() => setLoadingCities(false));
  }, []);

  useEffect(() => {
    if (!cityId) { setDistricts([]); setDistrictId(''); return; }
    setLoadingDistricts(true);
    setDistrictId('');
    getDistricts(cityId as number).then(setDistricts).finally(() => setLoadingDistricts(false));
  }, [cityId]);

  useEffect(() => {
    if (place) {
      setCityId(place.cityId ?? '');
      setDistrictId(place.districtId ?? '');
      setLat(String(place.latitude ?? ''));
      setLng(String(place.longitude ?? ''));
      setParking(place.parkingStatus ?? 'unavailable');
    }
  }, [place]);

  async function handleMenuImageFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setMenuImgUploading(true);
    setMenuImgProgress(0);
    try {
      const result = await uploadImage(file, setMenuImgProgress);
      setMenuImages(prev => [...prev, result.url]);
    } catch (err: any) {
      setError(err.message ?? 'Menü görseli yüklenemedi.');
    } finally {
      setMenuImgUploading(false);
      if (menuImgRef.current) menuImgRef.current.value = '';
    }
  }

  function addMenuImageUrl() {
    const url = newMenuImg.trim();
    if (!url || menuImages.includes(url)) return;
    setMenuImages(prev => [...prev, url]);
    setNewMenuImg('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      if (editing && place) {
        await updatePlaceAdmin(place.id, {
          cityId: cityId || undefined,
          districtId: districtId || undefined,
          latitude: lat ? Number(lat) : undefined,
          longitude: lng ? Number(lng) : undefined,
          parkingStatus: parking,
        });
        if (coverUrl || menuUrl || menuImages.length > 0) {
          await updatePlaceMedia(place.id, coverUrl || null, menuUrl || null, menuImages);
        }
      } else {
        if (!name.trim()) { setError('İsim zorunludur.'); setSaving(false); return; }
        const placeId = await createPlaceAdmin({
          name: name.trim(),
          cityId: cityId || undefined,
          districtId: districtId || undefined,
          latitude: lat ? Number(lat) : undefined,
          longitude: lng ? Number(lng) : undefined,
          parkingStatus: parking,
        });
        if (placeId && (coverUrl || menuUrl || menuImages.length > 0)) {
          await updatePlaceMedia(String(placeId), coverUrl || null, menuUrl || null, menuImages);
        }
      }
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.errors?.join(', ') ?? err?.response?.data?.message ?? 'Bir hata oluştu.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <h2 className="font-bold text-gray-900">{editing ? 'Mekan Düzenle' : 'Yeni Mekan Ekle'}</h2>
          <button onClick={onClose}><X size={18} className="text-gray-400 hover:text-gray-700" /></button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto px-6 py-5 space-y-5 flex-1">

          {/* ── Temel Bilgiler ── */}
          <fieldset className="space-y-3">
            <legend className="text-xs font-bold text-gray-400 uppercase tracking-wide">Temel Bilgiler</legend>
            {!editing && (
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Mekan Adı *</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Örn: Cafe Nero"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30" />
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Şehir</label>
                <select value={cityId} onChange={e => setCityId(e.target.value ? Number(e.target.value) : '')}
                  disabled={loadingCities}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 disabled:opacity-50">
                  <option value="">{loadingCities ? 'Yükleniyor…' : 'Şehir seçin'}</option>
                  {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">İlçe</label>
                <select value={districtId} onChange={e => setDistrictId(e.target.value ? Number(e.target.value) : '')}
                  disabled={!cityId || loadingDistricts}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 disabled:opacity-50">
                  <option value="">{loadingDistricts ? 'Yükleniyor…' : !cityId ? 'Önce şehir seçin' : 'İlçe seçin'}</option>
                  {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Enlem</label>
                <input type="number" step="any" value={lat} onChange={e => setLat(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Boylam</label>
                <input type="number" step="any" value={lng} onChange={e => setLng(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Otopark</label>
              <select value={parking} onChange={e => setParking(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30">
                <option value="unavailable">Yok</option>
                <option value="free">Ücretsiz</option>
                <option value="paid">Ücretli</option>
                <option value="valet">Vale</option>
              </select>
            </div>
          </fieldset>

          {/* ── Medya ── */}
          <fieldset className="space-y-4 border-t border-gray-100 pt-4">
            <legend className="text-xs font-bold text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
              <ImagePlus size={13} /> Medya
            </legend>

            <ImageUploadField
              label="Kapak Fotoğrafı"
              value={coverUrl}
              onChange={setCoverUrl}
              placeholder="https://... veya bilgisayardan yükle"
            />

            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block flex items-center gap-1"><Link2 size={11} /> Menü URL</label>
              <input value={menuUrl} onChange={e => setMenuUrl(e.target.value)}
                placeholder="https://restaurant.com/menu"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30" />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 mb-2 block">Menü Fotoğrafları</label>
              {menuImages.length > 0 && (
                <div className="grid grid-cols-4 gap-1.5 mb-2">
                  {menuImages.map((url, i) => (
                    <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                      <img src={url} alt="" className="w-full h-full object-cover" onError={e => (e.currentTarget.style.display = 'none')} />
                      <button type="button" onClick={() => setMenuImages(prev => prev.filter((_, idx) => idx !== i))}
                        className="absolute top-0.5 right-0.5 bg-white/90 rounded-full p-0.5 shadow">
                        <X size={10} className="text-gray-600" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <input value={newMenuImg} onChange={e => setNewMenuImg(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addMenuImageUrl(); } }}
                  placeholder="URL ekle ve Enter'a bas"
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30" />
                <button type="button" onClick={() => menuImgRef.current?.click()} disabled={menuImgUploading}
                  title="Bilgisayardan yükle"
                  className="shrink-0 px-3 py-2 border border-dashed border-brand text-brand rounded-lg hover:bg-brand/5 text-xs font-semibold flex items-center gap-1 disabled:opacity-50">
                  {menuImgUploading ? <><Loader2 size={12} className="animate-spin" />{menuImgProgress}%</> : <><Upload size={12} />Yükle</>}
                </button>
                <input ref={menuImgRef} type="file" accept="image/*" className="hidden" onChange={handleMenuImageFile} />
              </div>
            </div>
          </fieldset>

          {error && <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">İptal</button>
            <button type="submit" disabled={saving}
              className="px-5 py-2 text-sm font-semibold bg-brand text-white rounded-lg hover:bg-brand/90 disabled:opacity-50 flex items-center gap-2">
              {saving && <Loader2 size={14} className="animate-spin" />}
              {editing ? 'Kaydet' : 'Oluştur'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Label Assign Drawer ────────────────────────────────────────────────────

function LabelAssignDrawer({ place, onClose }: { place: Place; onClose: () => void }) {
  const [categories, setCategories] = useState<FilterCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState<number | null>(null);
  const [done, setDone] = useState<Set<number>>(new Set());

  useEffect(() => {
    getFilters(1).then(d => setCategories(d.categories ?? [])).finally(() => setLoading(false));
  }, []);

  async function handleAssign(labelId: number) {
    setAssigning(labelId);
    try {
      await assignLabelToPlace(labelId, place.id);
      setDone(prev => new Set(prev).add(labelId));
    } finally {
      setAssigning(null);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40">
      <div className="bg-white h-full w-80 shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <p className="font-semibold text-gray-900 text-sm">Etiket Ata</p>
            <p className="text-xs text-gray-500 truncate max-w-[180px]">{place.name}</p>
          </div>
          <button onClick={onClose}><X size={18} className="text-gray-400 hover:text-gray-700" /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-3">
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 size={22} className="animate-spin text-brand" /></div>
          ) : categories.map(cat => (
            <div key={cat.id} className="mb-4">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">{cat.displayName}</p>
              <div className="space-y-1">
                {cat.labels.map(label => (
                  <div key={label.id} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-gray-50">
                    <span className="text-sm text-gray-700">{label.displayName}</span>
                    <button
                      onClick={() => handleAssign(label.id)}
                      disabled={assigning === label.id || done.has(label.id)}
                      className={`text-xs font-semibold px-3 py-1 rounded-full transition-colors ${
                        done.has(label.id)
                          ? 'bg-green-100 text-green-600'
                          : 'bg-brand/10 text-brand hover:bg-brand hover:text-white'
                      }`}
                    >
                      {assigning === label.id ? '...' : done.has(label.id) ? '✓' : 'Ata'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────

export default function PlacesPage() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');

  // Geo lookup maps
  const [cityMap, setCityMap] = useState<Record<number, string>>({});
  const [districtMap, setDistrictMap] = useState<Record<number, string>>({});

  const [showCreate, setShowCreate] = useState(false);
  const [editPlace, setEditPlace] = useState<Place | undefined>();
  const [labelPlace, setLabelPlace] = useState<Place | undefined>();

  // Load cities once
  useEffect(() => {
    getCities(1).then((cs) => {
      setCityMap(Object.fromEntries(cs.map((c) => [c.id, c.name])));
    });
  }, []);

  async function load(p: number) {
    setLoading(true);
    try {
      const data = await getPlaces(p, 20);
      setPlaces(data.items);
      setTotal(data.totalCount);

      // Load districts for all distinct cityIds on this page
      const cityIds = [...new Set(data.items.map((pl) => pl.cityId).filter(Boolean))] as number[];
      const results = await Promise.all(cityIds.map((cid) => getDistricts(cid)));
      const dMap: Record<number, string> = {};
      results.flat().forEach((d) => { dMap[d.id] = d.name; });
      setDistrictMap((prev) => ({ ...prev, ...dMap }));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(page); }, [page]);

  async function handleDelete(id: string, name: string) {
    if (!confirm(`"${name}" mekanını silmek istediğinize emin misiniz?`)) return;
    await deletePlaceAdmin(id);
    setPlaces(prev => prev.filter(p => p.id !== id));
    setTotal(prev => prev - 1);
  }

  const filtered = search
    ? places.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()) || p.cityName?.toLowerCase().includes(search.toLowerCase()))
    : places;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mekanlar</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} mekan</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-brand text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-brand/90 transition-colors"
        >
          <Plus size={16} />
          Yeni Mekan
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Mekan veya şehir ara..."
          className="w-full max-w-sm border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={28} className="animate-spin text-brand" />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Mekan</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Şehir / İlçe</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Etiketler</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Puan</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Durum</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-brand shrink-0" />
                      <span className="font-medium text-gray-900">{p.name || '—'}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5 ml-5 font-mono">{p.id}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-gray-800 text-sm">{p.cityId ? (cityMap[p.cityId] ?? `Şehir #${p.cityId}`) : '—'}</span>
                    {p.districtId && (
                      <span className="block text-xs text-gray-400">
                        {districtMap[p.districtId] ?? `İlçe #${p.districtId}`}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {(p.labels ?? []).map((lbl) => (
                        <span
                          key={lbl.id}
                          title={lbl.name}
                          className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-brand/10 text-brand text-[10px] font-semibold cursor-default whitespace-nowrap"
                        >
                          {lbl.name.length > 12 ? lbl.name.slice(0, 11) + '…' : lbl.name}
                        </span>
                      ))}
                      {(!p.labels || p.labels.length === 0) && (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {p.rating != null ? (
                      <span className="flex items-center gap-1 text-yellow-500 font-medium">
                        <Star size={12} fill="currentColor" />
                        {p.rating.toFixed(1)}
                      </span>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      p.isDeleted ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                    }`}>
                      {p.isDeleted ? 'Silindi' : 'Aktif'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => setLabelPlace(p)}
                        title="Etiket ata"
                        className="text-gray-400 hover:text-brand transition-colors"
                      >
                        <Tag size={15} />
                      </button>
                      <button
                        onClick={() => setEditPlace(p)}
                        title="Düzenle"
                        className="text-gray-400 hover:text-blue-500 transition-colors"
                      >
                        <Pencil size={15} />
                      </button>
                      {!p.isDeleted && (
                        <button
                          onClick={() => handleDelete(p.id, p.name)}
                          title="Sil"
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p className="text-center text-sm text-gray-400 py-12">Mekan bulunamadı.</p>
          )}
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
          className="text-sm text-gray-500 hover:text-gray-800 disabled:opacity-30">← Önceki</button>
        <span className="text-sm text-gray-500">Sayfa {page} · {total} mekan</span>
        <button onClick={() => setPage(p => p + 1)} disabled={places.length < 20}
          className="text-sm text-gray-500 hover:text-gray-800 disabled:opacity-30">Sonraki →</button>
      </div>

      {/* Modals */}
      {showCreate && (
        <PlaceModal onClose={() => setShowCreate(false)} onSaved={() => load(page)} />
      )}
      {editPlace && (
        <PlaceModal place={editPlace} onClose={() => setEditPlace(undefined)} onSaved={() => load(page)} />
      )}
      {labelPlace && (
        <LabelAssignDrawer place={labelPlace} onClose={() => setLabelPlace(undefined)} />
      )}
    </div>
  );
}

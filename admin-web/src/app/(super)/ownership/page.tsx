'use client';

import { useEffect, useState } from 'react';
import { Loader2, Plus, Trash2, KeyRound, UserPlus, Search, ChevronDown, Eye, EyeOff } from 'lucide-react';
import { grantOwnership, revokeOwnership, getOwnedPlaces, createPlaceOwnerUser, getAllOwnedPlaceIds, getPlaces } from '@/api/admin';
import type { Place } from '@/lib/types';

// ── Create Place Owner Section ────────────────────────────────────────────────
function CreatePlaceOwner() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [ownedPlaceIds, setOwnedPlaceIds] = useState<Set<string>>(new Set());
  const [loadingPlaces, setLoadingPlaces] = useState(true);
  const [placeSearch, setPlaceSearch] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  useEffect(() => {
    Promise.all([getPlaces(1, 100), getAllOwnedPlaceIds()])
      .then(([r, ownedIds]) => {
        setPlaces(r.items);
        setOwnedPlaceIds(new Set(ownedIds.map((id) => id.toLowerCase())));
      })
      .finally(() => setLoadingPlaces(false));
  }, []);

  const filtered = places
    .filter((p) => !ownedPlaceIds.has(p.id.toLowerCase()))
    .filter(
      (p) =>
        p.name.toLowerCase().includes(placeSearch.toLowerCase()) ||
        (p.cityName ?? '').toLowerCase().includes(placeSearch.toLowerCase()),
    );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedPlace || !email.trim() || !username.trim() || !password) return;
    setSubmitting(true);
    setResult(null);
    try {
      const res = await createPlaceOwnerUser(email.trim(), username.trim(), password, selectedPlace.id);
      setResult({ type: 'ok', text: `Hesap oluşturuldu. Kullanıcı ID: ${res.userId}` });
      setOwnedPlaceIds((prev) => new Set([...prev, selectedPlace.id.toLowerCase()]));
      setEmail(''); setUsername(''); setPassword(''); setSelectedPlace(null); setPlaceSearch('');
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'İşlem başarısız.';
      setResult({ type: 'err', text: msg });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-5">
        <UserPlus size={17} className="text-brand" />
        <h2 className="text-base font-semibold text-gray-800">Yeni Mekan Admini Oluştur</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Place Picker */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mekan Seç</label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setDropdownOpen((v) => !v)}
              className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand"
            >
              {selectedPlace ? (
                <span className="text-gray-800 truncate">{selectedPlace.name}{selectedPlace.cityName ? ` — ${selectedPlace.cityName}` : ''}</span>
              ) : (
                <span className="text-gray-400">{loadingPlaces ? 'Yükleniyor…' : 'Mekan seçin'}</span>
              )}
              <ChevronDown size={14} className="text-gray-400 shrink-0 ml-2" />
            </button>

            {dropdownOpen && (
              <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg">
                <div className="p-2 border-b border-gray-100">
                  <div className="flex items-center gap-2 px-2">
                    <Search size={13} className="text-gray-400" />
                    <input
                      autoFocus
                      value={placeSearch}
                      onChange={(e) => setPlaceSearch(e.target.value)}
                      placeholder="Mekan ara…"
                      className="flex-1 text-sm py-1 focus:outline-none"
                    />
                  </div>
                </div>
                <ul className="max-h-52 overflow-y-auto py-1">
                  {filtered.length === 0 ? (
                    <li className="px-3 py-2 text-xs text-gray-400 text-center">Sonuç yok</li>
                  ) : (
                    filtered.map((p) => (
                      <li key={p.id}>
                        <button
                          type="button"
                          onClick={() => { setSelectedPlace(p); setDropdownOpen(false); setPlaceSearch(''); }}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                        >
                          <span className="font-medium text-gray-800">{p.name}</span>
                          {p.cityName && <span className="text-gray-400 text-xs ml-2">{p.cityName}</span>}
                        </button>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="owner@example.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>

        {/* Username */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Kullanıcı Adı</label>
          <input
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="place_owner_user"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Şifre</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="En az 8 karakter"
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting || !selectedPlace || !email || !username || !password}
          className="w-full bg-brand text-white py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:bg-brand-dark transition-colors disabled:opacity-50"
        >
          {submitting ? <Loader2 size={15} className="animate-spin" /> : <UserPlus size={15} />}
          {submitting ? 'Oluşturuluyor…' : 'Mekan Admini Oluştur'}
        </button>

        {result && (
          <p className={`text-sm px-3 py-2 rounded-lg ${result.type === 'ok' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {result.text}
          </p>
        )}
      </form>
    </div>
  );
}

// ── Ownership Lookup / Manage Section ────────────────────────────────────────
function ManageOwnership() {
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
    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <KeyRound size={17} className="text-gray-500" />
        <h2 className="text-base font-semibold text-gray-800">Mevcut Sahipliği Yönet</h2>
      </div>

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
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function OwnershipPage() {
  return (
    <div className="p-8 max-w-2xl space-y-6">
      <div className="flex items-center gap-2">
        <KeyRound size={22} className="text-brand" />
        <h1 className="text-2xl font-bold text-gray-900">Mekan Sahipleri</h1>
      </div>

      <CreatePlaceOwner />
      <ManageOwnership />
    </div>
  );
}

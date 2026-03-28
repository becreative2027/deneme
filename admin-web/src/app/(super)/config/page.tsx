'use client';

import { useEffect, useState } from 'react';
import { Loader2, Plus, Save, X, Settings, ToggleLeft, ToggleRight, RefreshCw } from 'lucide-react';
import { getRuntimeConfigs, upsertRuntimeConfig, upsertFeatureFlag } from '@/api/admin';
import { useAdminAuthStore } from '@/store/adminAuthStore';

interface ConfigEntry {
  key: string;
  value: string;
  changedBy?: string;
  updatedAt?: string;
}

interface FlagEntry {
  key: string;
  isEnabled: boolean;
  rolloutPercentage: number;
  target?: string;
  changedBy?: string;
  updatedAt?: string;
}

function UpsertConfigModal({
  initial,
  userEmail,
  onClose,
  onSaved,
}: {
  initial?: ConfigEntry;
  userEmail: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [key, setKey] = useState(initial?.key ?? '');
  const [value, setValue] = useState(initial?.value ?? '');
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const editing = !!initial;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!key.trim() || !value.trim()) { setError('Key ve değer zorunludur.'); return; }
    if (!reason.trim()) { setError('Değişiklik sebebi zorunludur.'); return; }
    setSaving(true);
    setError('');
    try {
      await upsertRuntimeConfig(key.trim(), value.trim(), userEmail, reason.trim());
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.errors?.join(', ') ?? 'Bir hata oluştu.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">{editing ? 'Config Düzenle' : 'Yeni Config'}</h2>
          <button onClick={onClose}><X size={18} className="text-gray-400 hover:text-gray-700" /></button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">Anahtar (key) *</label>
            <input value={key} onChange={e => setKey(e.target.value)}
              disabled={editing}
              placeholder="Örn: max_upload_size"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand/30 disabled:bg-gray-50" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">Değer *</label>
            <input value={value} onChange={e => setValue(e.target.value)}
              placeholder="Değer..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">Değişiklik Sebebi *</label>
            <input value={reason} onChange={e => setReason(e.target.value)}
              placeholder="Neden değiştiriyorsunuz?"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30" />
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">İptal</button>
            <button type="submit" disabled={saving}
              className="px-5 py-2 text-sm font-semibold bg-brand text-white rounded-lg hover:bg-brand/90 disabled:opacity-50 flex items-center gap-2">
              {saving && <Loader2 size={14} className="animate-spin" />}
              {editing ? 'Güncelle' : 'Oluştur'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function UpsertFlagModal({
  initial,
  userEmail,
  onClose,
  onSaved,
}: {
  initial?: FlagEntry;
  userEmail: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [key, setKey] = useState(initial?.key ?? '');
  const [isEnabled, setIsEnabled] = useState(initial?.isEnabled ?? false);
  const [rollout, setRollout] = useState(String(initial?.rolloutPercentage ?? 100));
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const editing = !!initial;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!key.trim()) { setError('Key zorunludur.'); return; }
    if (!reason.trim()) { setError('Değişiklik sebebi zorunludur.'); return; }
    setSaving(true);
    setError('');
    try {
      await upsertFeatureFlag(key.trim(), isEnabled, Number(rollout), userEmail, reason.trim());
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.errors?.join(', ') ?? 'Bir hata oluştu.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">{editing ? 'Flag Düzenle' : 'Yeni Feature Flag'}</h2>
          <button onClick={onClose}><X size={18} className="text-gray-400 hover:text-gray-700" /></button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">Anahtar (key) *</label>
            <input value={key} onChange={e => setKey(e.target.value)}
              disabled={editing}
              placeholder="Örn: enable_new_feed"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand/30 disabled:bg-gray-50" />
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Aktif</label>
            <button type="button" onClick={() => setIsEnabled(v => !v)} className="text-brand">
              {isEnabled ? <ToggleRight size={28} /> : <ToggleLeft size={28} className="text-gray-400" />}
            </button>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">
              Rollout % ({rollout}%)
            </label>
            <input type="range" min={0} max={100} value={rollout}
              onChange={e => setRollout(e.target.value)}
              className="w-full accent-brand" />
            <div className="flex justify-between text-xs text-gray-400 mt-0.5">
              <span>0%</span><span>100%</span>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">Değişiklik Sebebi *</label>
            <input value={reason} onChange={e => setReason(e.target.value)}
              placeholder="Neden değiştiriyorsunuz?"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30" />
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">İptal</button>
            <button type="submit" disabled={saving}
              className="px-5 py-2 text-sm font-semibold bg-brand text-white rounded-lg hover:bg-brand/90 disabled:opacity-50 flex items-center gap-2">
              {saving && <Loader2 size={14} className="animate-spin" />}
              {editing ? 'Güncelle' : 'Oluştur'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ConfigPage() {
  const { user } = useAdminAuthStore();
  const [configs, setConfigs] = useState<ConfigEntry[]>([]);
  const [flags, setFlags] = useState<FlagEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'config' | 'flags'>('config');
  const [configModal, setConfigModal] = useState<{ entry?: ConfigEntry } | null>(null);
  const [flagModal, setFlagModal] = useState<{ entry?: FlagEntry } | null>(null);

  async function load() {
    setLoading(true);
    try {
      const data = await getRuntimeConfigs();
      // Shape: { configs: [...], flags: [...] } or array
      if (Array.isArray(data)) {
        setConfigs(data);
        setFlags([]);
      } else {
        setConfigs(data?.configs ?? data?.runtimeConfigs ?? []);
        setFlags(data?.flags ?? data?.featureFlags ?? []);
      }
    } catch {
      setConfigs([]);
      setFlags([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Konfigürasyon</h1>
          <p className="text-sm text-gray-500 mt-0.5">Runtime config ve feature flag yönetimi</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="p-2 text-gray-400 hover:text-gray-700 transition-colors" title="Yenile">
            <RefreshCw size={16} />
          </button>
          {tab === 'config' ? (
            <button
              onClick={() => setConfigModal({})}
              className="flex items-center gap-2 bg-brand text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-brand/90"
            >
              <Plus size={16} /> Yeni Config
            </button>
          ) : (
            <button
              onClick={() => setFlagModal({})}
              className="flex items-center gap-2 bg-brand text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-brand/90"
            >
              <Plus size={16} /> Yeni Flag
            </button>
          )}
        </div>
      </div>

      {/* Tab switch */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
        {(['config', 'flags'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-colors ${
              tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>
            {t === 'config' ? 'Runtime Config' : 'Feature Flags'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 size={28} className="animate-spin text-brand" /></div>
      ) : tab === 'config' ? (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Anahtar</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Değer</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Değiştiren</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Tarih</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {configs.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-gray-400 text-sm">Config bulunamadı.</td></tr>
              ) : configs.map(c => (
                <tr key={c.key} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-800 font-semibold">{c.key}</td>
                  <td className="px-4 py-3 text-gray-700 max-w-xs truncate">{c.value}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{c.changedBy ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {c.updatedAt ? new Date(c.updatedAt).toLocaleDateString('tr-TR') : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => setConfigModal({ entry: c })}
                      className="text-gray-400 hover:text-brand transition-colors">
                      <Save size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="space-y-3">
          {flags.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm bg-white rounded-xl border border-gray-200">
              Feature flag bulunamadı.
            </div>
          ) : flags.map(f => (
            <div key={f.key} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-semibold text-gray-800">{f.key}</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    f.isEnabled ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {f.isEnabled ? 'Aktif' : 'Pasif'}
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-1.5">
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 bg-gray-100 rounded-full w-24 overflow-hidden">
                      <div className="h-full bg-brand rounded-full" style={{ width: `${f.rolloutPercentage}%` }} />
                    </div>
                    <span className="text-xs text-gray-500">{f.rolloutPercentage}%</span>
                  </div>
                  {f.changedBy && <span className="text-xs text-gray-400">— {f.changedBy}</span>}
                  {f.updatedAt && (
                    <span className="text-xs text-gray-400">{new Date(f.updatedAt).toLocaleDateString('tr-TR')}</span>
                  )}
                </div>
              </div>
              <button onClick={() => setFlagModal({ entry: f })}
                className="text-gray-400 hover:text-brand transition-colors">
                <Settings size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {configModal && (
        <UpsertConfigModal
          initial={configModal.entry}
          userEmail={user?.email ?? 'admin'}
          onClose={() => setConfigModal(null)}
          onSaved={load}
        />
      )}
      {flagModal && (
        <UpsertFlagModal
          initial={flagModal.entry}
          userEmail={user?.email ?? 'admin'}
          onClose={() => setFlagModal(null)}
          onSaved={load}
        />
      )}
    </div>
  );
}

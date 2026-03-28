'use client';

import { useEffect, useState } from 'react';
import { Loader2, Plus, X, Tag, ToggleLeft, ToggleRight } from 'lucide-react';
import { getFilters, createLabelAdmin, updateLabelAdmin } from '@/api/admin';
import type { FilterCategory } from '@/lib/types';

function CreateLabelModal({
  categories,
  onClose,
  onCreated,
}: {
  categories: FilterCategory[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? 0);
  const [key, setKey] = useState('');
  const [nameTr, setNameTr] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!key.trim() || !nameTr.trim()) { setError('Anahtar ve Türkçe isim zorunludur.'); return; }
    setSaving(true);
    setError('');
    try {
      await createLabelAdmin({
        categoryId: Number(categoryId),
        key: key.trim(),
        displayNameTr: nameTr.trim(),
        displayNameEn: nameEn.trim() || nameTr.trim(),
      });
      onCreated();
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
          <h2 className="font-bold text-gray-900">Yeni Etiket</h2>
          <button onClick={onClose}><X size={18} className="text-gray-400 hover:text-gray-700" /></button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">Kategori *</label>
            <select value={categoryId} onChange={e => setCategoryId(Number(e.target.value))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30">
              {categories.map(c => <option key={c.id} value={c.id}>{c.displayName}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">Anahtar (key) *</label>
            <input value={key} onChange={e => setKey(e.target.value)} placeholder="Örn: coffee_shop"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Türkçe İsim *</label>
              <input value={nameTr} onChange={e => setNameTr(e.target.value)} placeholder="Örn: Kahve Dükkanı"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">İngilizce İsim</label>
              <input value={nameEn} onChange={e => setNameEn(e.target.value)} placeholder="Örn: Coffee Shop"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30" />
            </div>
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">İptal</button>
            <button type="submit" disabled={saving}
              className="px-5 py-2 text-sm font-semibold bg-brand text-white rounded-lg hover:bg-brand/90 disabled:opacity-50 flex items-center gap-2">
              {saving && <Loader2 size={14} className="animate-spin" />}
              Oluştur
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function LabelsPage() {
  const [categories, setCategories] = useState<FilterCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [toggling, setToggling] = useState<number | null>(null);

  async function load() {
    setLoading(true);
    try {
      const data = await getFilters(1);
      setCategories(data.categories ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleToggle(labelId: number, currentlyActive: boolean) {
    setToggling(labelId);
    try {
      await updateLabelAdmin(labelId, undefined, !currentlyActive);
      // Optimistic update
      setCategories(prev => prev.map(cat => ({
        ...cat,
        labels: cat.labels.map(l => l.id === labelId ? { ...l, isActive: !currentlyActive } : l),
      })));
    } finally {
      setToggling(null);
    }
  }

  const totalLabels = categories.reduce((s, c) => s + c.labels.length, 0);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Etiketler</h1>
          <p className="text-sm text-gray-500 mt-0.5">{categories.length} kategori · {totalLabels} etiket</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-brand text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-brand/90 transition-colors"
        >
          <Plus size={16} />
          Yeni Etiket
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 size={28} className="animate-spin text-brand" /></div>
      ) : (
        <div className="space-y-6">
          {categories.map(cat => (
            <div key={cat.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Tag size={14} className="text-brand" />
                  <span className="font-semibold text-gray-800 text-sm">{cat.displayName}</span>
                  <span className="text-xs text-gray-400 font-mono ml-1">({cat.key})</span>
                  <span className="ml-auto text-xs text-gray-400">{cat.labels.length} etiket</span>
                </div>
              </div>
              <div className="divide-y divide-gray-50">
                {cat.labels.length === 0 ? (
                  <p className="text-sm text-gray-400 px-5 py-4">Bu kategoride etiket yok.</p>
                ) : cat.labels.map(label => (
                  <div key={label.id} className="flex items-center px-5 py-3 hover:bg-gray-50">
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-800">{label.displayName}</span>
                      <span className="text-xs text-gray-400 font-mono ml-2">({label.key})</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        (label as any).isActive !== false
                          ? 'bg-green-100 text-green-600'
                          : 'bg-gray-100 text-gray-400'
                      }`}>
                        {(label as any).isActive !== false ? 'Aktif' : 'Pasif'}
                      </span>
                      <button
                        onClick={() => handleToggle(label.id, (label as any).isActive !== false)}
                        disabled={toggling === label.id}
                        className="text-gray-400 hover:text-brand transition-colors disabled:opacity-50"
                        title={(label as any).isActive !== false ? 'Pasif yap' : 'Aktif yap'}
                      >
                        {toggling === label.id ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (label as any).isActive !== false ? (
                          <ToggleRight size={20} className="text-brand" />
                        ) : (
                          <ToggleLeft size={20} />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <CreateLabelModal
          categories={categories}
          onClose={() => setShowCreate(false)}
          onCreated={load}
        />
      )}
    </div>
  );
}

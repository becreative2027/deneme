'use client';

import React, { useState } from 'react';
import { X, MessageSquarePlus, CheckCircle } from 'lucide-react';
import { submitFeedback, FeedbackCategory } from '@/api/feedback';

interface Props {
  onClose: () => void;
}

const CATEGORIES: { value: FeedbackCategory; label: string; emoji: string; desc: string }[] = [
  { value: 'PlaceRequest',   label: 'Mekan Ekleme Talebi',   emoji: '📍', desc: 'Haritada olmayan bir mekan ekletelim' },
  { value: 'LabelRequest',   label: 'Etiket Ekleme Talebi',  emoji: '🏷️', desc: 'Yeni bir kategori veya etiket öner' },
  { value: 'BugReport',      label: 'Hata Bildirimi',         emoji: '🐛', desc: 'Karşılaştığın bir hatayı bildir' },
  { value: 'FeatureRequest', label: 'Özellik Talebi',         emoji: '✨', desc: 'Uygulamaya eklenmesini istediğin bir özellik' },
  { value: 'Other',          label: 'Diğer',                  emoji: '💬', desc: 'Başka bir konu hakkında geri bildirim' },
];

export function FeedbackSheet({ onClose }: Props) {
  const [selected, setSelected] = useState<FeedbackCategory | null>(null);
  const [message, setMessage]   = useState('');
  const [status, setStatus]     = useState<'idle' | 'loading' | 'done' | 'error'>('idle');

  async function handleSubmit() {
    if (!selected || !message.trim()) return;
    setStatus('loading');
    try {
      await submitFeedback(selected, message.trim());
      setStatus('done');
    } catch {
      setStatus('error');
    }
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-surface-dark rounded-t-2xl flex flex-col max-h-[90dvh]">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pb-3 pt-1 border-b border-border-light dark:border-border-dark shrink-0">
          <div className="flex items-center gap-2">
            <MessageSquarePlus size={18} className="text-[#6c63ff]" />
            <h3 className="text-base font-bold text-text-light dark:text-text-dark">Geri Bildirim</h3>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full">
            <X size={20} />
          </button>
        </div>

        {status === 'done' ? (
          <div className="flex flex-col items-center gap-3 px-5 py-10">
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle size={28} className="text-green-500" />
            </div>
            <p className="text-sm font-bold text-gray-800 dark:text-gray-100">Teşekkürler!</p>
            <p className="text-xs text-gray-500 text-center">Geri bildiriminiz alındı, ekibimiz inceleyecek.</p>
            <button
              onClick={onClose}
              className="mt-2 w-full py-3 rounded-xl bg-[#6c63ff] text-white text-sm font-semibold"
            >
              Tamam
            </button>
          </div>
        ) : (
          <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
            {/* Category */}
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                Konu seçin
              </p>
              <div className="space-y-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setSelected(cat.value)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl border-2 text-left transition-colors ${
                      selected === cat.value
                        ? 'border-[#6c63ff] bg-violet-50 dark:bg-violet-900/20'
                        : 'border-border-light dark:border-border-dark hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <span className="text-xl w-7 text-center">{cat.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold ${selected === cat.value ? 'text-[#6c63ff]' : 'text-text-light dark:text-text-dark'}`}>
                        {cat.label}
                      </p>
                      <p className="text-xs text-gray-400 truncate">{cat.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5 block">
                Mesajınız
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Detaylı açıklamanızı buraya yazın..."
                rows={4}
                maxLength={1000}
                className="w-full px-3 py-2.5 text-sm rounded-xl border border-border-light dark:border-border-dark bg-bg-light dark:bg-bg-dark text-text-light dark:text-text-dark placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6c63ff]/40 resize-none"
              />
              <p className="text-xs text-gray-400 text-right mt-1">{message.length}/1000</p>
            </div>

            {status === 'error' && (
              <p className="text-xs text-red-500 text-center">Bir hata oluştu, tekrar deneyin.</p>
            )}

            <button
              onClick={handleSubmit}
              disabled={!selected || !message.trim() || status === 'loading'}
              className="w-full py-3 rounded-xl bg-[#6c63ff] text-white text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2 transition-opacity"
            >
              {status === 'loading' ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <MessageSquarePlus size={16} />
                  Gönder
                </>
              )}
            </button>

            {/* Bottom safe area */}
            <div className="h-2" />
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { reportContent, ReportTargetType } from '@/api/moderation';

interface Props {
  targetType: ReportTargetType;
  targetId: string;
  onClose: () => void;
}

export function ReportModal({ targetType, targetId, onClose }: Props) {
  const [reason, setReason]       = useState('');
  const [status, setStatus]       = useState<'idle' | 'loading' | 'done' | 'error' | 'duplicate'>('idle');

  async function handleConfirm() {
    setStatus('loading');
    try {
      await reportContent(targetType, targetId, reason);
      setStatus('done');
    } catch (err: any) {
      if (err?.response?.status === 409) {
        setStatus('duplicate');
      } else {
        setStatus('error');
      }
    }
  }

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          <X size={18} />
        </button>

        {status === 'done' ? (
          <div className="flex flex-col items-center gap-3 py-2">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <AlertTriangle size={22} className="text-green-600" />
            </div>
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 text-center">
              Şikayetiniz alındı
            </p>
            <p className="text-xs text-gray-500 text-center">
              İnceleme ekibimiz en kısa sürede değerlendirecek.
            </p>
            <button
              onClick={onClose}
              className="mt-2 w-full py-2.5 rounded-xl bg-[#6c63ff] text-white text-sm font-semibold"
            >
              Tamam
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <AlertTriangle size={20} className="text-red-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-gray-100">İçeriği Şikayet Et</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Bu içerik uygunsuz, yanıltıcı veya zararlı mı?
                </p>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 block">
                Şikayet sebebi <span className="text-gray-400 font-normal">(isteğe bağlı)</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Bu içeriği neden şikayet ediyorsunuz?"
                rows={3}
                maxLength={500}
                className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400/40 resize-none"
              />
              <p className="text-xs text-gray-400 text-right mt-1">{reason.length}/500</p>
            </div>

            {status === 'error' && (
              <p className="text-xs text-red-500 text-center">Bir hata oluştu, tekrar deneyin.</p>
            )}
            {status === 'duplicate' && (
              <p className="text-xs text-orange-500 text-center">Bu içeriği daha önce şikayet ettiniz.</p>
            )}

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Vazgeç
              </button>
              <button
                onClick={handleConfirm}
                disabled={status === 'loading'}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold disabled:opacity-60 hover:bg-red-600 transition-colors flex items-center justify-center"
              >
                {status === 'loading' ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Şikayet Et'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';
import { MessageSquarePlus, Loader2, CheckCircle, Inbox, Send, X, Bell } from 'lucide-react';
import { getFeedback, markFeedbackReviewed, respondToFeedback } from '@/api/admin';

const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  PlaceRequest:   { label: 'Mekan Talebi',   color: 'bg-blue-100 text-blue-700' },
  LabelRequest:   { label: 'Etiket Talebi',  color: 'bg-purple-100 text-purple-700' },
  BugReport:      { label: 'Hata Bildirimi', color: 'bg-red-100 text-red-600' },
  FeatureRequest: { label: 'Özellik Talebi', color: 'bg-amber-100 text-amber-700' },
  Other:          { label: 'Diğer',          color: 'bg-gray-100 text-gray-600' },
};

const QUICK_REPLIES = [
  'Talebiniz incelendi, mekan eklendi! 🎉',
  'Talebiniz alındı, en kısa sürede değerlendireceğiz.',
  'Bildirdiğiniz hata düzeltildi, teşekkürler!',
  'Öneriniz değerlendirmeye alındı.',
];

export default function FeedbackPage() {
  const [items, setItems]         = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState<'pending' | 'reviewed'>('pending');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [message, setMessage]     = useState('');
  const [sending, setSending]     = useState(false);
  const [sent, setSent]           = useState<string | null>(null);
  const textareaRef               = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setLoading(true);
    getFeedback(filter === 'reviewed')
      .then((d) => setItems(d.items ?? []))
      .finally(() => setLoading(false));
  }, [filter]);

  useEffect(() => {
    if (replyingTo && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [replyingTo]);

  async function handleReview(id: string) {
    await markFeedbackReviewed(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  async function handleRespond(id: string) {
    if (!message.trim()) return;
    setSending(true);
    try {
      await respondToFeedback(id, message.trim());
      setSent(id);
      setReplyingTo(null);
      setMessage('');
      setItems((prev) => prev.filter((i) => i.id !== id));
    } finally {
      setSending(false);
    }
  }

  function openReply(id: string) {
    setReplyingTo(id);
    setMessage('');
  }

  function closeReply() {
    setReplyingTo(null);
    setMessage('');
  }

  return (
    <div className="p-8 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <MessageSquarePlus size={22} className="text-brand" />
        <h1 className="text-2xl font-bold text-gray-900">Geri Bildirimler</h1>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5">
        {(['pending', 'reviewed'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
              filter === tab ? 'bg-brand text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {tab === 'pending' ? 'Bekleyenler' : 'İncelenenler'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={28} className="animate-spin text-brand" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Inbox size={40} className="mx-auto mb-3 text-gray-300" />
          <p className="text-sm">
            {filter === 'pending' ? 'Bekleyen geri bildirim yok.' : 'İncelenmiş geri bildirim yok.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const cat = CATEGORY_LABELS[item.category] ?? { label: item.category, color: 'bg-gray-100 text-gray-600' };
            const isReplying = replyingTo === item.id;
            const wasSent = sent === item.id;

            return (
              <div key={item.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Main card */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cat.color}`}>
                          {cat.label}
                        </span>
                        {item.userEmail && (
                          <span className="text-xs text-gray-400 font-mono">{item.userEmail}</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-800 leading-relaxed">{item.message}</p>
                      <p className="text-xs text-gray-300 mt-2">
                        {new Date(item.createdAt).toLocaleString('tr-TR')}
                      </p>
                    </div>

                    {filter === 'pending' && (
                      <div className="flex items-center gap-2 shrink-0">
                        {/* Yanıtla button */}
                        {item.userId && (
                          <button
                            onClick={() => isReplying ? closeReply() : openReply(item.id)}
                            title="Bildirim gönder"
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                              isReplying
                                ? 'bg-gray-100 text-gray-500'
                                : 'bg-brand/10 text-brand hover:bg-brand/20'
                            }`}
                          >
                            {isReplying ? <X size={13} /> : <Bell size={13} />}
                            {isReplying ? 'İptal' : 'Yanıtla'}
                          </button>
                        )}
                        {/* Mark reviewed */}
                        <button
                          onClick={() => handleReview(item.id)}
                          title="Yanıtsız incelendi"
                          className="text-green-500 hover:text-green-700 transition-colors"
                        >
                          <CheckCircle size={22} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Reply panel */}
                {isReplying && (
                  <div className="border-t border-gray-100 bg-gray-50 p-4">
                    {/* Quick replies */}
                    <p className="text-xs font-semibold text-gray-400 mb-2">Hızlı yanıtlar</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {QUICK_REPLIES.map((qr) => (
                        <button
                          key={qr}
                          onClick={() => setMessage(qr)}
                          className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                            message === qr
                              ? 'bg-brand text-white border-brand'
                              : 'bg-white text-gray-600 border-gray-200 hover:border-brand hover:text-brand'
                          }`}
                        >
                          {qr}
                        </button>
                      ))}
                    </div>

                    {/* Custom message */}
                    <textarea
                      ref={textareaRef}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Kullanıcıya bildirim olarak gönderilecek mesaj..."
                      rows={3}
                      className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
                    />

                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-gray-400">
                        <Bell size={11} className="inline mr-1" />
                        Kullanıcının telefonuna push bildirim olarak gönderilecek
                      </p>
                      <button
                        onClick={() => handleRespond(item.id)}
                        disabled={!message.trim() || sending}
                        className="flex items-center gap-1.5 px-4 py-2 bg-brand text-white rounded-xl text-sm font-semibold hover:bg-brand/90 transition-colors disabled:opacity-40"
                      >
                        {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                        Gönder
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

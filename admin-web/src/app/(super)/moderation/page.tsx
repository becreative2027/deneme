'use client';

import { useEffect, useState } from 'react';
import { Shield, Loader2, CheckCircle, XCircle, MessageSquare, Heart, User, AlertTriangle, ImageIcon } from 'lucide-react';
import { getPendingModeration, reviewModerationItem } from '@/api/admin';
import { useAdminAuthStore } from '@/store/adminAuthStore';

interface PostSummary {
  id: string;
  caption?: string;
  imageUrl?: string;
  authorId: string;
  authorUsername?: string;
  authorAvatarUrl?: string;
  likeCount: number;
  commentCount: number;
}

interface UserSummary {
  id: string;
  username?: string;
  displayName?: string;
  avatarUrl?: string;
}

interface ModerationItem {
  id: string;
  targetType: string;
  targetId: string;
  status: string;
  reporterId?: string;
  reporterNote?: string;
  createdAt: string;
  post?: PostSummary;
  reporter?: UserSummary;
}

function Avatar({ user, size = 28 }: { user?: UserSummary; size?: number }) {
  const initials = (user?.displayName || user?.username || '?')[0].toUpperCase();
  if (user?.avatarUrl) {
    return (
      <img
        src={user.avatarUrl}
        alt={user.username ?? ''}
        style={{ width: size, height: size }}
        className="rounded-full object-cover shrink-0"
      />
    );
  }
  return (
    <div
      style={{ width: size, height: size, fontSize: size * 0.4 }}
      className="rounded-full bg-gray-200 text-gray-600 font-bold flex items-center justify-center shrink-0"
    >
      {initials}
    </div>
  );
}

function UserChip({ label, user }: { label: string; user?: UserSummary }) {
  const name = user?.displayName || user?.username || user?.id?.slice(0, 8) || '—';
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-gray-400 shrink-0">{label}</span>
      <Avatar user={user} size={20} />
      <span className="text-xs font-semibold text-gray-700 truncate max-w-[120px]">@{name}</span>
    </div>
  );
}

function TypeBadge({ type }: { type: string }) {
  const map: Record<string, string> = {
    Post:   'bg-blue-100 text-blue-700',
    Review: 'bg-amber-100 text-amber-700',
    Place:  'bg-green-100 text-green-700',
    User:   'bg-purple-100 text-purple-700',
    Label:  'bg-gray-100 text-gray-600',
  };
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${map[type] ?? 'bg-gray-100 text-gray-600'}`}>
      {type}
    </span>
  );
}

function ModerationCard({
  item,
  onApprove,
  onReject,
  loading,
}: {
  item: ModerationItem;
  onApprove: () => void;
  onReject: () => void;
  loading: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex gap-0">
        {/* Post thumbnail */}
        {item.post?.imageUrl ? (
          <div className="w-28 shrink-0 self-stretch relative">
            <img
              src={item.post.imageUrl}
              alt="post"
              className="w-full h-full object-cover"
              style={{ minHeight: 112 }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10" />
          </div>
        ) : item.targetType === 'Post' ? (
          <div className="w-28 shrink-0 bg-gray-100 flex items-center justify-center" style={{ minHeight: 112 }}>
            <ImageIcon size={28} className="text-gray-300" />
          </div>
        ) : null}

        {/* Main content */}
        <div className="flex-1 min-w-0 p-4">
          {/* Top row: type + date */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <TypeBadge type={item.targetType} />
              <span className="text-xs text-gray-300 font-mono">{item.targetId.slice(0, 8)}…</span>
            </div>
            <span className="text-xs text-gray-400 shrink-0">
              {new Date(item.createdAt).toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' })}
            </span>
          </div>

          {/* Post caption */}
          {item.post?.caption && (
            <p className="text-sm text-gray-800 font-medium mb-2 line-clamp-2 leading-snug">
              "{item.post.caption}"
            </p>
          )}

          {/* Post stats */}
          {item.post && (
            <div className="flex items-center gap-4 mb-3">
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <Heart size={12} className="text-rose-400" />
                {item.post.likeCount}
              </span>
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <MessageSquare size={12} className="text-blue-400" />
                {item.post.commentCount}
              </span>
              {item.post.authorUsername && (
                <UserChip
                  label="Sahibi:"
                  user={{ id: item.post.authorId, username: item.post.authorUsername, avatarUrl: item.post.authorAvatarUrl }}
                />
              )}
            </div>
          )}

          {/* Divider */}
          <div className="border-t border-gray-50 pt-3 mt-1">
            {/* Reporter */}
            <div className="flex items-start gap-2">
              <AlertTriangle size={13} className="text-amber-500 mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <UserChip label="Şikayet eden:" user={item.reporter} />
                </div>
                <p className="text-xs text-gray-500 mt-1 italic">
                  {item.reporterNote
                    ? `"${item.reporterNote}"`
                    : <span className="text-gray-300">Sebep belirtilmemiş</span>}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions sidebar */}
        <div className="flex flex-col items-center justify-center gap-3 px-4 border-l border-gray-100 shrink-0">
          <button
            onClick={onApprove}
            disabled={loading}
            title="Onayla (içeriği sil)"
            className="flex flex-col items-center gap-1 text-green-500 hover:text-green-700 hover:bg-green-50 rounded-xl p-2.5 transition-colors disabled:opacity-40"
          >
            <CheckCircle size={22} />
            <span className="text-[10px] font-semibold">Sil</span>
          </button>
          <button
            onClick={onReject}
            disabled={loading}
            title="Reddet (içeriği koru)"
            className="flex flex-col items-center gap-1 text-gray-400 hover:text-red-400 hover:bg-red-50 rounded-xl p-2.5 transition-colors disabled:opacity-40"
          >
            <XCircle size={22} />
            <span className="text-[10px] font-semibold">Koru</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ModerationPage() {
  const { user } = useAdminAuthStore();
  const [items, setItems] = useState<ModerationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    getPendingModeration()
      .then((d) => setItems(d.items ?? d))
      .finally(() => setLoading(false));
  }, []);

  async function handle(id: string, approve: boolean) {
    setActionLoading(id);
    try {
      await reviewModerationItem(id, approve, user?.id ?? '');
      setItems((prev) => prev.filter((i) => i.id !== id));
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div className="p-8 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Shield size={22} className="text-brand" />
          <h1 className="text-2xl font-bold text-gray-900">Moderasyon</h1>
        </div>
        {items.length > 0 && (
          <span className="bg-amber-100 text-amber-700 text-sm font-bold px-3 py-1 rounded-full">
            {items.length} bekleyen
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={28} className="animate-spin text-brand" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <CheckCircle size={40} className="mx-auto mb-3 text-green-400" />
          <p className="text-sm font-medium">Bekleyen moderasyon öğesi yok.</p>
          <p className="text-xs text-gray-300 mt-1">Tüm şikayetler işlendi.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <ModerationCard
              key={item.id}
              item={item}
              onApprove={() => handle(item.id, true)}
              onReject={() => handle(item.id, false)}
              loading={actionLoading === item.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

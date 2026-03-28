'use client';

import React, { Suspense, useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Bookmark,
  Share2,
  Trash2,
  MapPin,
  Star,
  Store,
  X,
  Link2,
  MessageCircle,
  Phone,
  CheckCircle2,
} from 'lucide-react';
import { useWishlistStore } from '@/store/wishlistStore';
import { useT } from '@/lib/i18n';
import { getPlaceById } from '@/api/places';
import { Place } from '@/lib/types';

/* ─── helpers ─── */
function formatRating(n: number) {
  return n ? n.toFixed(1) : '–';
}

const gradients = [
  'from-violet-400 to-indigo-500',
  'from-blue-400 to-cyan-500',
  'from-green-400 to-teal-500',
  'from-orange-400 to-amber-500',
  'from-pink-400 to-rose-500',
];
function placeGradient(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = id.charCodeAt(i) + ((h << 5) - h);
  return gradients[Math.abs(h) % gradients.length];
}

/* ─── share sheet ─── */
function ShareSheet({
  url,
  count,
  onClose,
}: {
  url: string;
  count: number;
  onClose: () => void;
}) {
  const t = useT();
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* fallback: select text */
    }
  };

  const shareText = `${t('wishlist.shareText', count)} ${url}`;

  const nativeShare = () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({ title: t('wishlist.shareTitle'), text: shareText, url }).catch(() => {});
    }
  };

  const waUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
  const smsUrl = `sms:?body=${encodeURIComponent(shareText)}`;

  const hasNativeShare =
    typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-mobile bg-white dark:bg-surface-dark rounded-t-2xl p-5 pb-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-text-light dark:text-text-dark">
            {t('wishlist.share')}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* URL preview */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl px-3 py-2.5 mb-4 flex items-center gap-2">
          <Link2 size={14} className="text-[#6c63ff] shrink-0" />
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate flex-1">{url}</p>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          {/* Copy link */}
          <button
            onClick={copyLink}
            className="flex flex-col items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-xl py-4 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {copied ? (
              <CheckCircle2 size={24} className="text-green-500" />
            ) : (
              <Link2 size={24} className="text-[#6c63ff]" />
            )}
            <span className="text-xs font-medium text-text-light dark:text-text-dark">
              {copied ? t('wishlist.copied') : t('wishlist.copyLink')}
            </span>
          </button>

          {/* WhatsApp */}
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-xl py-4 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <MessageCircle size={24} className="text-green-500" />
            <span className="text-xs font-medium text-text-light dark:text-text-dark">WhatsApp</span>
          </a>

          {/* SMS */}
          <a
            href={smsUrl}
            className="flex flex-col items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-xl py-4 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <Phone size={24} className="text-blue-500" />
            <span className="text-xs font-medium text-text-light dark:text-text-dark">SMS</span>
          </a>

          {/* Native share (mobile) */}
          {hasNativeShare && (
            <button
              onClick={nativeShare}
              className="flex flex-col items-center gap-2 bg-[#6c63ff]/10 rounded-xl py-4 hover:bg-[#6c63ff]/20 transition-colors"
            >
              <Share2 size={24} className="text-[#6c63ff]" />
              <span className="text-xs font-medium text-[#6c63ff]">
                {t('wishlist.share')}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── place row card ─── */
function WishlistCard({
  place,
  onRemove,
  onPress,
}: {
  place: Place;
  onRemove?: () => void;
  onPress: () => void;
}) {
  const [imgError, setImgError] = useState(false);
  const gradient = placeGradient(place.id);

  return (
    <div className="flex items-center gap-3 bg-white dark:bg-surface-dark rounded-xl p-3 shadow-sm mb-2.5">
      {/* Thumbnail */}
      <button onClick={onPress} className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0">
        {place.imageUrl && !imgError ? (
          <Image
            src={place.imageUrl}
            alt={place.name}
            fill
            className="object-cover"
            sizes="64px"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
            <Store size={20} className="text-white/80" />
          </div>
        )}
      </button>

      {/* Info */}
      <button onClick={onPress} className="flex-1 text-left min-w-0">
        <p className="text-sm font-bold text-text-light dark:text-text-dark truncate">
          {place.name}
        </p>
        <p className="text-xs text-[#6c63ff] font-medium">{place.categoryName}</p>
        <div className="flex items-center gap-1 mt-1">
          <MapPin size={10} className="text-gray-400 shrink-0" />
          <span className="text-xs text-gray-500 truncate">{place.city}</span>
          {place.averageRating > 0 && (
            <>
              <Star size={10} className="text-amber-400 fill-amber-400 shrink-0 ml-1" />
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                {formatRating(place.averageRating)}
              </span>
            </>
          )}
        </div>
      </button>

      {/* Remove */}
      {onRemove && (
        <button
          onClick={onRemove}
          className="p-2 text-gray-300 hover:text-red-400 transition-colors shrink-0"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
}

/* ─── main page ─── */
export default function WishlistPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-bg-light dark:bg-bg-dark" />}>
      <WishlistContent />
    </Suspense>
  );
}

function WishlistContent() {
  const t = useT();
  const router = useRouter();
  const searchParams = useSearchParams();

  const { placeIds, removePlace, addPlace, clearAll } = useWishlistStore();

  // shared mode: URL contains ?places=id1,id2,...
  const sharedParam = searchParams.get('places');
  const isSharedView = !!sharedParam;
  const sharedIds = sharedParam ? sharedParam.split(',').filter(Boolean) : [];

  const activeIds = isSharedView ? sharedIds : placeIds;

  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [clearConfirm, setClearConfirm] = useState(false);
  const [savedAll, setSavedAll] = useState(false);

  /* fetch places whenever IDs change */
  const fetchPlaces = useCallback(async (ids: string[]) => {
    if (ids.length === 0) { setPlaces([]); return; }
    setLoading(true);
    setError(false);
    try {
      const results = await Promise.allSettled(ids.map((id) => getPlaceById(id)));
      setPlaces(
        results
          .filter((r): r is PromiseFulfilledResult<Place> => r.status === 'fulfilled')
          .map((r) => r.value),
      );
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlaces(activeIds);
  }, [activeIds.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps

  /* share URL */
  const shareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/wishlist?places=${placeIds.join(',')}`
      : '';

  const handleSaveAll = () => {
    sharedIds.forEach((id) => addPlace(id));
    setSavedAll(true);
  };

  return (
    <div className="min-h-dvh bg-bg-light dark:bg-bg-dark pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-surface-dark border-b border-border-light dark:border-border-dark px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bookmark size={20} className="text-[#6c63ff] fill-[#6c63ff]" />
            <h1 className="text-lg font-extrabold text-text-light dark:text-text-dark">
              {isSharedView ? t('wishlist.sharedView') : t('wishlist.title')}
            </h1>
            {places.length > 0 && (
              <span className="text-xs text-gray-400 font-medium">
                {t('wishlist.count', places.length)}
              </span>
            )}
          </div>

          {/* Header actions */}
          <div className="flex items-center gap-1">
            {/* Save all (shared view) */}
            {isSharedView && places.length > 0 && (
              <button
                onClick={handleSaveAll}
                disabled={savedAll}
                className="text-xs font-semibold text-[#6c63ff] px-3 py-1.5 rounded-lg bg-[#6c63ff]/10 hover:bg-[#6c63ff]/20 transition-colors disabled:opacity-50"
              >
                {savedAll ? t('wishlist.savedAll') : t('wishlist.saveAll')}
              </button>
            )}

            {/* Share (personal view) */}
            {!isSharedView && placeIds.length > 0 && (
              <button
                onClick={() => setShareOpen(true)}
                className="p-2 text-gray-500 hover:text-[#6c63ff] transition-colors"
              >
                <Share2 size={20} />
              </button>
            )}

            {/* Clear all (personal view) */}
            {!isSharedView && placeIds.length > 0 && (
              <button
                onClick={() => setClearConfirm(true)}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="px-4 pt-4">
        {loading && (
          <div className="space-y-2.5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-[88px] bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="text-center py-16">
            <p className="text-gray-500">{t('wishlist.loadError')}</p>
            <button
              onClick={() => fetchPlaces(activeIds)}
              className="mt-3 text-sm text-[#6c63ff] font-semibold"
            >
              {t('common.tryAgain')}
            </button>
          </div>
        )}

        {!loading && !error && places.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center px-8">
            <div className="w-16 h-16 rounded-full bg-[#6c63ff]/10 flex items-center justify-center mb-4">
              <Bookmark size={28} className="text-[#6c63ff]" />
            </div>
            <p className="text-base font-bold text-text-light dark:text-text-dark mb-1">
              {t('wishlist.empty.title')}
            </p>
            <p className="text-sm text-gray-500 leading-5">{t('wishlist.empty.hint')}</p>
          </div>
        )}

        {!loading && !error && places.length > 0 && (
          <div>
            {places.map((place) => (
              <WishlistCard
                key={place.id}
                place={place}
                onRemove={
                  isSharedView
                    ? undefined
                    : () => removePlace(place.id)
                }
                onPress={() => router.push(`/places/${place.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Share sheet */}
      {shareOpen && (
        <ShareSheet
          url={shareUrl}
          count={placeIds.length}
          onClose={() => setShareOpen(false)}
        />
      )}

      {/* Clear confirm dialog */}
      {clearConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-6"
          onClick={() => setClearConfirm(false)}
        >
          <div
            className="w-full max-w-xs bg-white dark:bg-surface-dark rounded-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-sm text-text-light dark:text-text-dark text-center mb-5">
              {t('wishlist.clearConfirm')}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setClearConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-border-light dark:border-border-dark text-sm font-semibold text-gray-600 dark:text-gray-300"
              >
                İptal
              </button>
              <button
                onClick={() => { clearAll(); setClearConfirm(false); }}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-sm font-semibold text-white"
              >
                {t('wishlist.clearAll')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

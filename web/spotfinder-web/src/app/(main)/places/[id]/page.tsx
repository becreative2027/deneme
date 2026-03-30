'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  MapPin,
  Star,
  Image as ImageIcon,
  TrendingUp,
  ArrowLeft,
  Tag,
  Grid3X3,
  Car,
  UtensilsCrossed,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Navigation,
  Heart,
  Bookmark,
} from 'lucide-react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { usePlaceDetail } from '@/hooks/usePlaces';
import { useIsFavorited, useToggleFavorite } from '@/hooks/useFavorites';
import { useWishlistStore } from '@/store/wishlistStore';
import { useT } from '@/lib/i18n';
import { getPlacePosts } from '@/api/places';
import { ErrorState } from '@/components/ErrorState';
import { PhotoLightbox } from '@/components/PhotoLightbox';
import { ReviewsSheet } from '@/components/ReviewsSheet';

function formatRating(n: number): string {
  return n ? n.toFixed(1) : '–';
}

function formatCount(n: number): string {
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function formatSocialCount(n: number): string {
  const thresholds = [100_000, 50_000, 10_000, 5_000, 1_000, 500, 100, 50, 10];
  for (const t of thresholds) {
    if (n >= t) {
      const formatted = t >= 1_000 ? `${t / 1_000}K` : String(t);
      return `${formatted}+`;
    }
  }
  return String(n);
}

function parkingLabel(status: string): { text: string; color: string } {
  switch (status.toLowerCase()) {
    case 'available':
    case 'free':
      return { text: 'Parking available', color: 'text-green-600 dark:text-green-400' };
    case 'paid':
      return { text: 'Paid parking nearby', color: 'text-amber-600 dark:text-amber-400' };
    case 'unavailable':
    case 'none':
      return { text: 'No parking', color: 'text-red-500' };
    default:
      return { text: status, color: 'text-gray-500' };
  }
}

function isImageUrl(url: string) {
  const lower = url.toLowerCase();
  return /\.(jpg|jpeg|png|webp|gif|avif|svg)(\?.*)?$/.test(lower);
}

function MenuGallery({ urls }: { urls: string[] }) {
  const [idx, setIdx] = useState(0);
  if (urls.length === 0) return null;
  const imageUrls = urls.filter(isImageUrl);
  const linkUrls  = urls.filter(u => !isImageUrl(u));
  return (
    <div className="space-y-2">
      {linkUrls.map((url, i) => (
        <a
          key={i}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-[#6c63ff] font-semibold"
        >
          <ExternalLink size={14} />
          Menüyü görüntüle
        </a>
      ))}
      {imageUrls.length > 0 && (
    <div className="relative w-full aspect-[4/3] bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden">
      <Image
        src={imageUrls[idx]}
        alt={`Menu page ${idx + 1}`}
        fill
        className="object-contain"
        sizes="480px"
      />
      {imageUrls.length > 1 && (
        <>
          <button
            onClick={() => setIdx((i) => Math.max(0, i - 1))}
            disabled={idx === 0}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white disabled:opacity-30"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => setIdx((i) => Math.min(imageUrls.length - 1, i + 1))}
            disabled={idx === imageUrls.length - 1}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white disabled:opacity-30"
          >
            <ChevronRight size={18} />
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {imageUrls.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  i === idx ? 'bg-white' : 'bg-white/40'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
      )}
    </div>
  );
}

export default function PlaceDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const t = useT();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [reviewsOpen, setReviewsOpen] = useState(false);
  const { data: place, isLoading, isError, refetch } = usePlaceDetail(params.id);
  const isFavorited = useIsFavorited(params.id);
  const toggleFavorite = useToggleFavorite(params.id);
  const { hasPlace, togglePlace } = useWishlistStore();
  const isWishlisted = hasPlace(params.id);

  const postsQuery = useInfiniteQuery({
    queryKey: ['placePosts', params.id],
    queryFn: ({ pageParam }) => getPlacePosts(params.id, pageParam as string | undefined),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => (last.hasMore ? last.nextCursor : undefined),
    enabled: !!params.id,
  });

  const allPosts = postsQuery.data?.pages.flatMap((p) => p.items) ?? [];
  const postsWithImage = allPosts.filter((p) => p.imageUrl);

  const hasParking =
    place?.parkingStatus && place.parkingStatus.toLowerCase() !== 'unavailable';
  const hasMenu = place?.menuUrl || (place?.menuImageUrls && place.menuImageUrls.length > 0);

  if (isLoading) {
    return (
      <div className="min-h-dvh bg-white dark:bg-surface-dark">
        <div className="w-full h-72 bg-gray-200 dark:bg-gray-700 animate-pulse" />
        <div className="p-5 space-y-3">
          <div className="h-7 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-4 w-1/3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-20 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-4" />
        </div>
      </div>
    );
  }

  if (isError || !place) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <ErrorState message="Could not load place details." onRetry={refetch} />
      </div>
    );
  }

  const parking = place.parkingStatus ? parkingLabel(place.parkingStatus) : null;

  return (
    <div className="bg-white dark:bg-surface-dark min-h-dvh">
      {/* Hero Image */}
      <div className="relative w-full h-72 bg-gray-100 dark:bg-gray-800">
        {place.imageUrl ? (
          <Image
            src={place.imageUrl}
            alt={place.name}
            fill
            className="object-cover"
            sizes="480px"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center">
            <ImageIcon size={48} className="text-white/70" />
          </div>
        )}
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 w-9 h-9 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="absolute top-4 right-4 flex items-center gap-2">
          {/* Wishlist bookmark */}
          <button
            onClick={() => togglePlace(params.id)}
            title={isWishlisted ? t('wishlist.inWishlist') : t('wishlist.addToWishlist')}
            className="w-9 h-9 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-colors"
          >
            <Bookmark
              size={20}
              className={isWishlisted ? 'fill-[#6c63ff] text-[#6c63ff]' : 'text-white'}
            />
          </button>

          {/* Favorite heart */}
          <button
            onClick={() => toggleFavorite.mutate()}
            disabled={toggleFavorite.isPending}
            className="w-9 h-9 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-colors disabled:opacity-60"
          >
            <Heart
              size={20}
              className={isFavorited ? 'fill-red-500 text-red-500' : 'text-white'}
            />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="p-5">
        {/* Name & Category */}
        <h1 className="text-2xl font-extrabold text-text-light dark:text-text-dark">{place.name}</h1>
        <p className="text-sm text-[#6c63ff] font-semibold mt-1">{place.categoryName}</p>

        {/* Stats row: rating + post count */}
        <div className="flex items-center gap-4 mt-3">
          <button
            type="button"
            onClick={() => setReviewsOpen(true)}
            className="flex items-center gap-1.5 active:opacity-70 transition-opacity"
          >
            <Star size={16} className="text-amber-400 fill-amber-400" />
            <span className="text-[15px] font-bold text-gray-800 dark:text-gray-200">
              {formatRating(place.averageRating)}
            </span>
            <span className="text-sm text-[#6c63ff] font-medium underline underline-offset-2">
              ({formatCount(place.reviewCount)} {t('reviews.rating')})
            </span>
          </button>
          {allPosts.length > 0 && (
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Grid3X3 size={14} />
              <span>{formatCount(allPosts.length)} {t('place.posts')}</span>
            </div>
          )}
        </div>

        {/* Social counts: favorites + wishlist */}
        {((place.favoriteCount ?? 0) > 0 || (place.wishlistCount ?? 0) > 0) && (
          <div className="flex items-center gap-4 mt-2.5">
            {(place.favoriteCount ?? 0) > 0 && (
              <div className="flex items-center gap-1.5">
                <Heart size={13} className="text-red-400 fill-red-400 shrink-0" />
                <span className="text-xs text-gray-500">
                  {t('place.peopleFavorited', formatSocialCount(place.favoriteCount!))}
                </span>
              </div>
            )}
            {(place.wishlistCount ?? 0) > 0 && (
              <div className="flex items-center gap-1.5">
                <Bookmark size={13} className="text-[#6c63ff] fill-[#6c63ff] shrink-0" />
                <span className="text-xs text-gray-500">
                  {t('place.peopleWishlisted', formatSocialCount(place.wishlistCount!))}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Location */}
        <div className="flex items-start gap-1.5 mt-3">
          <MapPin size={15} className="text-gray-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-5">
            {[place.districtName, place.city, place.country].filter(Boolean).join(', ')}
          </p>
        </div>

        {/* Mini Map */}
        {place.latitude && place.longitude && (
          <div className="relative mt-4 rounded-xl overflow-hidden border border-border-light dark:border-border-dark" style={{ height: 160 }}>
            <iframe
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${place.longitude - 0.006},${place.latitude - 0.004},${place.longitude + 0.006},${place.latitude + 0.004}&layer=mapnik&marker=${place.latitude},${place.longitude}`}
              className="w-full h-full border-0 pointer-events-none"
              loading="lazy"
              title="Map"
            />
            {/* Transparent tap target — opens native maps */}
            <a
              href={`https://maps.google.com/?q=${place.latitude},${place.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute inset-0 flex items-end justify-end p-2"
              aria-label="Open in maps"
            >
              <span className="flex items-center gap-1 bg-white dark:bg-surface-dark text-[#6c63ff] text-xs font-semibold px-2.5 py-1.5 rounded-full shadow-sm">
                <Navigation size={11} />
                Open in Maps
              </span>
            </a>
          </div>
        )}

        {/* Description */}
        {place.description ? (
          <p className="text-[15px] text-gray-600 dark:text-gray-300 leading-6 mt-5">
            {place.description}
          </p>
        ) : null}

        {/* Labels */}
        {place.labels.length > 0 && (
          <div className="mt-5">
            <div className="flex items-center gap-1.5 mb-2.5">
              <Tag size={14} className="text-gray-400" />
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tags</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {place.labels.map((label) => (
                <span
                  key={label}
                  className="bg-violet-50 dark:bg-violet-900/30 text-[#6c63ff] text-xs font-semibold px-3 py-1.5 rounded-full"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── Parking + Menu ── */}
        {(parking || hasMenu) && (
          <div className="mt-5 pt-5 border-t border-border-light dark:border-border-dark space-y-5">

            {/* Parking */}
            {parking && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                  <Car size={16} className="text-gray-500" />
                </div>
                <span className={`text-sm font-medium ${parking.color}`}>{parking.text}</span>
              </div>
            )}

            {/* Menu */}
            {hasMenu && (
              <div>
                <div className="flex items-center gap-1.5 mb-3">
                  <UtensilsCrossed size={14} className="text-gray-400" />
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Menu</span>
                </div>

                {/* Menu link */}
                {place.menuUrl && (
                  <a
                    href={place.menuUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-[#6c63ff] font-semibold mb-3"
                  >
                    <ExternalLink size={14} />
                    View online menu
                  </a>
                )}

                {/* Menu photo gallery */}
                {place.menuImageUrls && place.menuImageUrls.length > 0 && (
                  <MenuGallery urls={place.menuImageUrls} />
                )}
              </div>
            )}
          </div>
        )}

        {/* Trend score */}
        {typeof place.trendScore === 'number' && (
          <div className="flex items-center gap-1.5 mt-5 pt-5 border-t border-border-light dark:border-border-dark">
            <TrendingUp size={15} className="text-[#6c63ff]" />
            <span className="text-sm text-[#6c63ff]">
              Trending score: {place.trendScore.toFixed(2)}
            </span>
          </div>
        )}
      </div>

      {/* Photo Grid */}
      {postsWithImage.length > 0 && (
        <div className="mt-2">
          <div className="px-5 pb-2 flex items-center gap-1.5">
            <Grid3X3 size={14} className="text-gray-400" />
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Photos</span>
          </div>
          <div className="grid grid-cols-3 gap-0.5">
            {postsWithImage.map((post, i) => (
              <button
                key={post.id}
                onClick={() => setLightboxIndex(i)}
                className="relative aspect-square bg-gray-100 dark:bg-gray-800 block w-full"
              >
                <Image
                  src={post.imageUrl!}
                  alt={post.caption ?? place.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 480px) 33vw, 160px"
                />
              </button>
            ))}
          </div>
          {postsQuery.hasNextPage && (
            <button
              onClick={() => postsQuery.fetchNextPage()}
              className="w-full py-3 text-sm text-[#6c63ff] font-semibold"
            >
              Load more
            </button>
          )}
        </div>
      )}

      {lightboxIndex !== null && (
        <PhotoLightbox
          posts={postsWithImage}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}

      {reviewsOpen && (
        <ReviewsSheet placeId={params.id} onClose={() => setReviewsOpen(false)} />
      )}
    </div>
  );
}

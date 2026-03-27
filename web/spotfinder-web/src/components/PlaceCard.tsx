'use client';

import React, { memo, useState } from 'react';
import Image from 'next/image';
import { MapPin, Star, Store } from 'lucide-react';
import { Place } from '@/lib/types';

interface Props {
  place: Place;
  onPress: (placeId: string) => void;
}

function formatRating(n: number): string {
  return n ? n.toFixed(1) : '–';
}

function formatCount(n: number): string {
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

const placeholderColors = [
  'from-violet-400 to-indigo-500',
  'from-blue-400 to-cyan-500',
  'from-green-400 to-teal-500',
  'from-orange-400 to-amber-500',
  'from-pink-400 to-rose-500',
];

function getPlaceholderColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return placeholderColors[Math.abs(hash) % placeholderColors.length];
}

export const PlaceCard = memo(function PlaceCard({ place, onPress }: Props) {
  const [imgError, setImgError] = useState(false);
  const gradientClass = getPlaceholderColor(place.id);

  return (
    <button
      className="w-full text-left bg-white dark:bg-surface-dark rounded-xl overflow-hidden mb-3 shadow-sm hover:shadow-md active:scale-[0.99] transition-all"
      onClick={() => onPress(place.id)}
    >
      {/* Image */}
      <div className="relative w-full h-40 bg-gray-100 dark:bg-gray-800">
        {place.imageUrl && !imgError ? (
          <Image
            src={place.imageUrl}
            alt={place.name}
            fill
            className="object-cover"
            sizes="480px"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${gradientClass} flex items-center justify-center`}>
            <Store size={36} className="text-white/80" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-[15px] font-bold text-text-light dark:text-text-dark truncate">
          {place.name}
        </p>
        <p className="text-xs text-[#6c63ff] font-medium mt-0.5">{place.categoryName}</p>

        <div className="flex items-center gap-1 mt-1.5">
          <MapPin size={12} className="text-gray-400 flex-shrink-0" />
          <span className="text-xs text-gray-500 mr-2">{place.city}</span>
          <Star size={12} className="text-amber-400 flex-shrink-0 fill-amber-400" />
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 ml-0.5">
            {formatRating(place.averageRating)}
          </span>
          <span className="text-[11px] text-gray-400 ml-0.5">
            ({formatCount(place.reviewCount)})
          </span>
        </div>
      </div>
    </button>
  );
});

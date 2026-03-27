'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { X, Heart, MapPin } from 'lucide-react';
import { Post } from '@/lib/types';
import { Avatar } from './Avatar';
import { useLikePost } from '@/hooks/useFeed';

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 3600) {
    const h = Math.max(1, Math.floor(diff / 60));
    return `${h} ${h === 1 ? 'minute' : 'minutes'} ago`;
  }
  if (diff < 86400) {
    const h = Math.floor(diff / 3600);
    return `${h} ${h === 1 ? 'hour' : 'hours'} ago`;
  }
  if (diff < 604800) {
    const d = Math.floor(diff / 86400);
    return `${d} ${d === 1 ? 'day' : 'days'} ago`;
  }
  const w = Math.floor(diff / 604800);
  return `${w} ${w === 1 ? 'week' : 'weeks'} ago`;
}

interface PhotoLightboxProps {
  posts: Post[];
  initialIndex: number;
  onClose: () => void;
}

export function PhotoLightbox({ posts, initialIndex, onClose }: PhotoLightboxProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const likeMutation = useLikePost();

  // Local like state for instant feedback
  const [likeState, setLikeState] = useState<
    Record<string, { isLiked: boolean; likeCount: number }>
  >({});

  useEffect(() => {
    const el = itemRefs.current[initialIndex];
    if (el) {
      el.scrollIntoView({ behavior: 'instant', block: 'start' });
    }
  }, [initialIndex]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', handleKey);
    };
  }, [onClose]);

  const handleLike = (post: Post) => {
    const current = likeState[post.id] ?? { isLiked: post.isLiked, likeCount: post.likeCount };
    const newIsLiked = !current.isLiked;
    setLikeState((prev) => ({
      ...prev,
      [post.id]: {
        isLiked: newIsLiked,
        likeCount: newIsLiked ? current.likeCount + 1 : current.likeCount - 1,
      },
    }));
    likeMutation.mutate({ postId: post.id, liked: current.isLiked });
  };

  const goToPlace = (placeId: string) => {
    onClose();
    router.push(`/places/${placeId}`);
  };

  return (
    <div
      className="fixed left-0 right-0 top-0 bg-black flex flex-col"
      style={{ bottom: 64, zIndex: 48 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-black shrink-0 border-b border-white/10">
        <span className="text-white text-sm font-semibold">
          {posts.length} {posts.length === 1 ? 'photo' : 'photos'}
        </span>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center text-white rounded-full hover:bg-white/10 transition-colors"
          aria-label="Close"
        >
          <X size={20} />
        </button>
      </div>

      {/* Scrollable post list */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto overscroll-contain"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}
      >
        {posts.map((post, i) => {
          const ls = likeState[post.id];
          const isLiked = ls?.isLiked ?? post.isLiked;
          const likeCount = ls?.likeCount ?? post.likeCount;

          return (
            <div
              key={post.id}
              ref={(el) => { itemRefs.current[i] = el; }}
              className="border-b border-white/10"
            >
              {/* User info */}
              <div className="flex items-center gap-2.5 px-4 py-3">
                <Avatar uri={post.avatarUrl} name={post.displayName} size={34} />
                <div>
                  <p className="text-white text-sm font-semibold leading-tight">{post.displayName}</p>
                  <p className="text-gray-400 text-xs">@{post.username} · {timeAgo(post.createdAt)}</p>
                </div>
              </div>

              {/* Square image */}
              {post.imageUrl && (
                <div className="relative w-full" style={{ aspectRatio: '1 / 1' }}>
                  <Image
                    src={post.imageUrl}
                    alt={post.caption ?? ''}
                    fill
                    className="object-cover"
                    sizes="100vw"
                  />
                </div>
              )}

              {/* Footer */}
              <div className="px-4 py-3 space-y-2">
                {/* Like button */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleLike(post)}
                    className="flex items-center gap-1.5 group"
                    aria-label={isLiked ? 'Unlike' : 'Like'}
                  >
                    <Heart
                      size={22}
                      className={`transition-all ${
                        isLiked
                          ? 'text-red-500 fill-red-500 scale-110'
                          : 'text-gray-400 group-hover:text-red-400'
                      }`}
                    />
                    <span className="text-sm text-gray-300">{likeCount}</span>
                  </button>
                </div>

                {/* Caption */}
                {post.caption && (
                  <p className="text-white text-sm leading-5">
                    <span className="font-semibold mr-1.5">{post.username}</span>
                    {post.caption}
                  </p>
                )}

                {/* Place — tappable */}
                {post.placeName && post.placeId && (
                  <button
                    onClick={() => goToPlace(post.placeId)}
                    className="flex items-center gap-1.5 text-[#a8a4ff] text-xs font-medium active:opacity-70"
                  >
                    <MapPin size={12} />
                    <span>
                      {post.placeName}
                      {post.placeCity ? `, ${post.placeCity}` : ''}
                    </span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

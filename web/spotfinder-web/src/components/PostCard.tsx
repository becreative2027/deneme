'use client';

import React, { memo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, MessageCircle, MapPin } from 'lucide-react';
import { Post } from '@/lib/types';
import { Avatar } from './Avatar';
import clsx from 'clsx';

interface Props {
  post: Post;
  onLike: (postId: string, currentlyLiked: boolean) => void;
  onPressPlace?: (placeId: string) => void;
  onPressUser?: (userId: string) => void;
}

function formatRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return 'just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d`;
  const diffWk = Math.floor(diffDay / 7);
  if (diffWk < 4) return `${diffWk}w`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export const PostCard = memo(function PostCard({ post, onLike, onPressPlace, onPressUser }: Props) {
  const [imgError, setImgError] = useState(false);

  return (
    <article className="bg-white dark:bg-surface-dark mb-2 border-b border-border-light dark:border-border-dark">
      {/* Header */}
      <div
        className="flex items-center gap-2.5 p-3 cursor-pointer"
        onClick={() => onPressUser?.(post.userId)}
      >
        <Avatar uri={post.avatarUrl} name={post.displayName} size={36} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-text-light dark:text-text-dark leading-tight truncate">
            {post.displayName}
          </p>
          <p className="text-xs text-gray-400 leading-tight">@{post.username}</p>
        </div>
        <span className="text-[11px] text-gray-400 flex-shrink-0">
          {formatRelativeTime(post.createdAt)}
        </span>
      </div>

      {/* Image */}
      {post.imageUrl && !imgError ? (
        <div className="relative w-full aspect-square bg-gray-100 dark:bg-gray-800">
          <Image
            src={post.imageUrl}
            alt={post.caption ?? 'Post image'}
            fill
            className="object-cover"
            sizes="480px"
            onError={() => setImgError(true)}
          />
        </div>
      ) : null}

      {/* Caption */}
      {post.caption ? (
        <p className="px-3.5 pt-2.5 text-sm text-gray-600 dark:text-gray-300 leading-5">
          {post.caption}
        </p>
      ) : null}

      {/* Place tag */}
      <button
        className="flex items-center gap-1 px-3.5 py-1.5 hover:opacity-70 transition-opacity"
        onClick={() => onPressPlace?.(post.placeId)}
      >
        <MapPin size={13} className="text-[#6c63ff] flex-shrink-0" />
        <span className="text-xs text-[#6c63ff] font-medium">
          {post.placeName} · {post.placeCity}
        </span>
      </button>

      {/* Actions */}
      <div className="flex items-center gap-4 px-2.5 py-2">
        <button
          className="flex items-center gap-1.5 hover:opacity-70 transition-opacity"
          onClick={() => onLike(post.id, post.isLiked)}
        >
          <Heart
            size={22}
            className={clsx(
              'transition-colors',
              post.isLiked ? 'fill-red-500 text-red-500' : 'text-gray-400',
            )}
          />
          <span className="text-[13px] text-gray-500 dark:text-gray-400">
            {formatCount(post.likeCount)}
          </span>
        </button>

        <button className="flex items-center gap-1.5 hover:opacity-70 transition-opacity">
          <MessageCircle size={20} className="text-gray-400" />
          <span className="text-[13px] text-gray-500 dark:text-gray-400">
            {formatCount(post.commentCount)}
          </span>
        </button>
      </div>
    </article>
  );
});

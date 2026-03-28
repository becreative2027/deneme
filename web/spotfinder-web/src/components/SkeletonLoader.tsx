'use client';

import React from 'react';

function Skeleton({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`bg-gray-200 dark:bg-gray-700 rounded animate-pulse ${className}`}
      style={style}
    />
  );
}

export function PostSkeleton() {
  return (
    <div className="bg-white dark:bg-surface-dark mb-2 border-b border-border-light dark:border-border-dark">
      {/* Header */}
      <div className="flex items-center gap-3 p-3">
        <Skeleton className="w-9 h-9 rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-3.5 w-28 mb-1.5" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="h-3 w-14" />
      </div>
      {/* Image */}
      <Skeleton className="w-full aspect-square" />
      {/* Caption */}
      <div className="px-3.5 pt-2.5 pb-1">
        <Skeleton className="h-3.5 w-3/4 mb-2" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      {/* Actions */}
      <div className="flex gap-4 px-2.5 py-2">
        <Skeleton className="h-5 w-14" />
        <Skeleton className="h-5 w-14" />
      </div>
    </div>
  );
}

export function PlaceSkeleton() {
  return (
    <div className="bg-white dark:bg-surface-dark rounded-xl overflow-hidden mb-3 shadow-sm">
      <Skeleton className="w-full h-40" />
      <div className="p-3">
        <Skeleton className="h-4 w-3/4 mb-2" />
        <Skeleton className="h-3 w-1/3 mb-2" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="w-18 h-18 rounded-full" style={{ width: 72, height: 72 }} />
        <Skeleton className="h-9 w-24 rounded-full" />
      </div>
      <Skeleton className="h-5 w-40 mb-2" />
      <Skeleton className="h-4 w-28 mb-3" />
      <Skeleton className="h-4 w-3/4 mb-1" />
      <Skeleton className="h-4 w-1/2 mb-4" />
      <div className="flex gap-6">
        <Skeleton className="h-10 w-16" />
        <Skeleton className="h-10 w-16" />
        <Skeleton className="h-10 w-16" />
      </div>
    </div>
  );
}

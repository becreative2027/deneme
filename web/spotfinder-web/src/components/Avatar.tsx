'use client';

import React from 'react';
import Image from 'next/image';

interface Props {
  uri?: string;
  name?: string;
  size?: number;
  className?: string;
}

function getInitials(name?: string): string {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return (parts[0][0] ?? '?').toUpperCase();
}

function getColorForName(name?: string): string {
  const colors = [
    'bg-violet-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-orange-500',
    'bg-pink-500',
    'bg-teal-500',
    'bg-red-500',
    'bg-indigo-500',
  ];
  if (!name) return colors[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function Avatar({ uri, name, size = 36, className = '' }: Props) {
  const initials = getInitials(name);
  const colorClass = getColorForName(name);

  const style = {
    width: size,
    height: size,
    borderRadius: size / 2,
    flexShrink: 0,
  };

  if (uri) {
    return (
      <div
        className={`relative overflow-hidden rounded-full flex-shrink-0 ${className}`}
        style={style}
      >
        <Image
          src={uri}
          alt={name ?? 'avatar'}
          fill
          className="object-cover"
          sizes={`${size}px`}
          onError={(e) => {
            // hide broken image
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      </div>
    );
  }

  return (
    <div
      className={`${colorClass} rounded-full flex items-center justify-center flex-shrink-0 ${className}`}
      style={style}
    >
      <span
        className="text-white font-bold select-none"
        style={{ fontSize: size * 0.38 }}
      >
        {initials}
      </span>
    </div>
  );
}

'use client';

import React from 'react';
import { X, UserCheck, UserPlus } from 'lucide-react';
import { UserProfile } from '@/lib/types';
import { Avatar } from '@/components/Avatar';
import { useFollowList, useFollowUser } from '@/hooks/useProfile';
import { useAuthStore } from '@/store/authStore';

interface Props {
  userId: string;
  type: 'followers' | 'following';
  onClose: () => void;
  onUserPress?: (userId: string) => void;
}

function UserRow({
  user,
  currentUserId,
  myFollowingIds,
  onPress,
}: {
  user: UserProfile;
  currentUserId: string;
  myFollowingIds: string[];
  onPress?: (id: string) => void;
}) {
  const isMe = user.id === currentUserId;
  const isFollowing = myFollowingIds.includes(user.id);
  const followMutation = useFollowUser();

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <button
        type="button"
        onClick={() => onPress?.(user.id)}
        className="flex items-center gap-3 flex-1 min-w-0"
      >
        <Avatar uri={user.avatarUrl} name={user.displayName} size={44} />
        <div className="flex-1 min-w-0 text-left">
          <p className="text-sm font-semibold text-text-light dark:text-text-dark truncate">
            {user.displayName}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">@{user.username}</p>
        </div>
      </button>

      {!isMe && (
        <button
          type="button"
          disabled={followMutation.isPending}
          onClick={() => followMutation.mutate({ userId: user.id, isFollowing })}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors flex-shrink-0 ${
            isFollowing
              ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
              : 'bg-primary text-white'
          }`}
        >
          {isFollowing ? (
            <>
              <UserCheck size={13} />
              Takip ediliyor
            </>
          ) : (
            <>
              <UserPlus size={13} />
              Takip et
            </>
          )}
        </button>
      )}
    </div>
  );
}

export function FollowListSheet({ userId, type, onClose, onUserPress }: Props) {
  const currentUserId = useAuthStore((s) => s.user?.id ?? '');
  const listQuery = useFollowList(userId, type);
  const myFollowingQuery = useFollowList(currentUserId, 'following');
  const myFollowingIds = myFollowingQuery.data?.map((u) => u.id) ?? [];

  const title = type === 'followers' ? 'Takipçiler' : 'Takip Edilenler';
  const users = listQuery.data ?? [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Sheet */}
      <div className="relative w-full max-w-md bg-white dark:bg-surface-dark rounded-t-2xl flex flex-col max-h-[75dvh]">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 pb-3 border-b border-border-light dark:border-border-dark">
          <h3 className="text-base font-bold text-text-light dark:text-text-dark">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        {/* List */}
        <div className="overflow-y-auto flex-1">
          {listQuery.isLoading ? (
            <div className="flex justify-center py-10">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 px-4">
              <p className="text-sm text-gray-500">
                {type === 'followers' ? 'Henüz takipçi yok' : 'Henüz kimse takip edilmiyor'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border-light dark:divide-border-dark pb-6">
              {users.map((user) => (
                <UserRow
                  key={user.id}
                  user={user}
                  currentUserId={currentUserId}
                  myFollowingIds={myFollowingIds}
                  onPress={onUserPress}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

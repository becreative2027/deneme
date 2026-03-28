'use client';

import React, { useCallback, useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { LogOut, Images, Pencil, Grid3X3, List, X, Check, Camera, Heart, MapPin, Settings, Globe } from 'lucide-react';
import { Post } from '@/lib/types';
import { useMe, useUserPosts } from '@/hooks/useProfile';
import { useLikePost } from '@/hooks/useFeed';
import { useMyFavoritePlaces } from '@/hooks/useFavorites';
import { useAuthStore } from '@/store/authStore';
import { logout as apiLogout } from '@/api/auth';
import { updateProfile } from '@/api/users';
import { uploadImage } from '@/lib/cloudinary';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Avatar } from '@/components/Avatar';
import { PostCard } from '@/components/PostCard';
import { PlaceCard } from '@/components/PlaceCard';
import { PostSkeleton, ProfileSkeleton } from '@/components/SkeletonLoader';
import { ErrorState } from '@/components/ErrorState';
import { EmptyState } from '@/components/EmptyState';
import { useToast } from '@/components/Toast';
import { PhotoLightbox } from '@/components/PhotoLightbox';
import { FollowListSheet } from '@/components/FollowListSheet';
import { useT } from '@/lib/i18n';
import { useLocaleStore, Locale } from '@/store/localeStore';

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function StatItem({
  label,
  value,
  onClick,
}: {
  label: string;
  value: number;
  onClick?: () => void;
}) {
  const inner = (
    <>
      <span className="text-lg font-extrabold text-text-light dark:text-text-dark">
        {formatCount(value)}
      </span>
      <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</span>
    </>
  );
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className="flex flex-col items-center active:opacity-70 transition-opacity">
        {inner}
      </button>
    );
  }
  return <div className="flex flex-col items-center">{inner}</div>;
}

// ─── Settings Sheet ────────────────────────────────────────────────────────────
function SettingsSheet({ onClose }: { onClose: () => void }) {
  const t = useT();
  const { locale, setLocale } = useLocaleStore();

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-surface-dark rounded-t-2xl flex flex-col">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 pb-3 border-b border-border-light dark:border-border-dark">
          <h3 className="text-base font-bold text-text-light dark:text-text-dark">{t('settings.title')}</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        {/* Language section */}
        <div className="px-4 py-4 pb-8">
          <div className="flex items-center gap-2 mb-3">
            <Globe size={16} className="text-gray-400" />
            <span className="text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide text-xs">
              {t('settings.language')}
            </span>
          </div>
          <div className="flex gap-3">
            {(['tr', 'en'] as Locale[]).map((loc) => {
              const label = loc === 'tr' ? t('settings.languageTR') : t('settings.languageEN');
              const isActive = locale === loc;
              return (
                <button
                  key={loc}
                  type="button"
                  onClick={() => setLocale(loc)}
                  className={`flex-1 py-3 rounded-xl text-sm font-semibold border-2 transition-colors ${
                    isActive
                      ? 'border-[#6c63ff] bg-violet-50 dark:bg-violet-900/20 text-[#6c63ff]'
                      : 'border-border-light dark:border-border-dark text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const t = useT();
  const meQuery = useMe();
  const profile = meQuery.data;
  const doLogout = useAuthStore((s) => s.logout);
  const { showToast } = useToast();
  const router = useRouter();
  const queryClient = useQueryClient();
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'favorites'>('grid');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [followSheet, setFollowSheet] = useState<'followers' | 'following' | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editAvatarFile, setEditAvatarFile] = useState<File | null>(null);
  const [editAvatarPreview, setEditAvatarPreview] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const userId = profile?.id ?? '';
  const postsQuery = useUserPosts(userId);
  const allPosts: Post[] = postsQuery.data?.pages.flatMap((p) => p.items) ?? [];
  const postsWithImage = allPosts.filter((p) => p.imageUrl);
  const likeMutation = useLikePost();
  const favoritesQuery = useMyFavoritePlaces();

  const updateMutation = useMutation({
    mutationFn: async (payload: { displayName: string; bio: string }) => {
      let avatarUrl: string | undefined;
      if (editAvatarFile) {
        setAvatarUploading(true);
        try {
          const result = await uploadImage(editAvatarFile, undefined, 'spotfinder/avatars');
          avatarUrl = result.secureUrl;
        } finally {
          setAvatarUploading(false);
        }
      }
      await updateProfile({ displayName: payload.displayName, bio: payload.bio, avatarUrl });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
      setEditOpen(false);
      setEditAvatarFile(null);
      setEditAvatarPreview(null);
      showToast(t('profile.updated'), 'success');
    },
    onError: () => {
      showToast(t('profile.updateError'), 'error');
    },
  });

  const openEdit = useCallback(() => {
    if (!profile) return;
    setEditName(profile.displayName);
    setEditBio(profile.bio ?? '');
    setEditAvatarFile(null);
    setEditAvatarPreview(null);
    setEditOpen(true);
  }, [profile]);

  const handleAvatarPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setEditAvatarFile(file);
    setEditAvatarPreview(URL.createObjectURL(file));
  };

  const handleLogout = useCallback(async () => {
    if (!confirm(t('profile.signOutConfirm'))) return;
    try {
      await apiLogout();
    } catch {}
    doLogout();
    router.replace('/login');
  }, [doLogout, router, t]);

  const handleLike = useCallback(
    (postId: string, currentlyLiked: boolean) => {
      likeMutation.mutate({ postId, liked: currentlyLiked });
    },
    [likeMutation],
  );

  // Infinite scroll for list mode
  useEffect(() => {
    if (viewMode !== 'list' && viewMode !== 'favorites') return;
    const el = loadMoreRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && postsQuery.hasNextPage && !postsQuery.isFetchingNextPage) {
          postsQuery.fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [postsQuery, viewMode]);

  if (meQuery.isLoading) {
    return (
      <div className="bg-white dark:bg-surface-dark">
        <ProfileSkeleton />
        <PostSkeleton />
        <PostSkeleton />
      </div>
    );
  }

  if (meQuery.isError || !profile) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <ErrorState message={t('profile.loadError')} onRetry={() => meQuery.refetch()} />
      </div>
    );
  }

  return (
    <div className="bg-bg-light dark:bg-bg-dark">
      {/* Profile header */}
      <div className="bg-white dark:bg-surface-dark px-5 pt-5 pb-0 mb-2">
        <div className="flex items-start justify-between mb-4">
          <Avatar uri={profile.avatarUrl} name={profile.displayName} size={72} />
          <div className="flex items-center gap-1">
            <button
              onClick={() => setSettingsOpen(true)}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              title={t('settings.title')}
            >
              <Settings size={18} />
            </button>
            <button
              onClick={openEdit}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              title={t('profile.editProfile')}
            >
              <Pencil size={18} />
            </button>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              title={t('profile.signOut')}
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>

        <h2 className="text-xl font-extrabold text-text-light dark:text-text-dark">
          {profile.displayName}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">@{profile.username}</p>

        {profile.bio ? (
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2.5 leading-5">{profile.bio}</p>
        ) : null}

        <div className="flex gap-6 mt-4 pb-4 border-b border-border-light dark:border-border-dark">
          <StatItem label={t('profile.posts')} value={profile.postsCount} />
          <StatItem label={t('profile.followers')} value={profile.followersCount} onClick={() => setFollowSheet('followers')} />
          <StatItem label={t('profile.following')} value={profile.followingCount} onClick={() => setFollowSheet('following')} />
        </div>

        {/* View mode tabs */}
        <div className="flex -mx-5">
          <button
            onClick={() => setViewMode('grid')}
            className={`flex-1 flex items-center justify-center py-3 border-b-2 transition-colors ${
              viewMode === 'grid'
                ? 'border-[#6c63ff] text-[#6c63ff]'
                : 'border-transparent text-gray-400'
            }`}
          >
            <Grid3X3 size={20} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex-1 flex items-center justify-center py-3 border-b-2 transition-colors ${
              viewMode === 'list'
                ? 'border-[#6c63ff] text-[#6c63ff]'
                : 'border-transparent text-gray-400'
            }`}
          >
            <List size={20} />
          </button>
          <button
            onClick={() => setViewMode('favorites')}
            className={`flex-1 flex items-center justify-center py-3 border-b-2 transition-colors ${
              viewMode === 'favorites'
                ? 'border-[#6c63ff] text-[#6c63ff]'
                : 'border-transparent text-gray-400'
            }`}
          >
            <Heart size={20} className={viewMode === 'favorites' ? 'fill-[#6c63ff]' : ''} />
          </button>
        </div>
      </div>

      {/* Favorites content */}
      {viewMode === 'favorites' && (
        <div className="px-4 pt-2 pb-4">
          {favoritesQuery.isLoading ? (
            <div className="flex justify-center py-10">
              <div className="w-6 h-6 border-2 border-[#6c63ff] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : favoritesQuery.isError ? (
            <ErrorState message={t('profile.favoritesError')} onRetry={() => favoritesQuery.refetch()} />
          ) : !favoritesQuery.data || favoritesQuery.data.length === 0 ? (
            <EmptyState
              icon={Heart}
              title={t('profile.noFavorites')}
              subtitle={t('profile.noFavoritesHint')}
            />
          ) : (
            favoritesQuery.data.map((place) => (
              <PlaceCard
                key={place.id}
                place={place}
                onPress={(id) => router.push(`/places/${id}`)}
              />
            ))
          )}
        </div>
      )}

      {/* Posts content */}
      {viewMode !== 'favorites' && (postsQuery.isLoading ? (
        <div>
          <PostSkeleton />
          <PostSkeleton />
        </div>
      ) : postsQuery.isError ? (
        <ErrorState message={t('profile.postsError')} onRetry={() => postsQuery.refetch()} />
      ) : allPosts.length === 0 ? (
        <EmptyState icon={Images} title={t('profile.noPosts')} subtitle={t('profile.noPostsHint')} />
      ) : viewMode === 'grid' ? (
        postsWithImage.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="text-sm text-gray-400">{t('profile.noPhotos')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-0.5">
            {postsWithImage.map((post, i) => (
              <button
                key={post.id}
                onClick={() => setLightboxIndex(i)}
                className="relative aspect-square bg-gray-100 dark:bg-gray-800 block w-full"
              >
                <Image
                  src={post.imageUrl!}
                  alt={post.caption ?? ''}
                  fill
                  className="object-cover"
                  sizes="(max-width: 480px) 33vw, 160px"
                />
              </button>
            ))}
          </div>
        )
      ) : (
        <>
          {allPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onLike={handleLike}
              onPressPlace={(placeId) => router.push(`/places/${placeId}`)}
            />
          ))}
          <div ref={loadMoreRef} className="h-4" />
          {postsQuery.isFetchingNextPage && (
            <div className="flex justify-center py-4">
              <div className="w-6 h-6 border-2 border-[#6c63ff] border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          {!postsQuery.hasNextPage && allPosts.length > 0 && (
            <p className="text-center text-xs text-gray-400 py-6">{t('profile.allLoaded')}</p>
          )}
        </>
      ))}

      {/* Edit profile modal */}
      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50" style={{ paddingBottom: 64 }}>
          <div className="w-full max-w-md bg-white dark:bg-surface-dark rounded-t-2xl sm:rounded-2xl flex flex-col" style={{ maxHeight: 'calc(90dvh - 64px)' }}>
            {/* Fixed header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-border-light dark:border-border-dark shrink-0">
              <h3 className="text-base font-bold text-text-light dark:text-text-dark">{t('profile.editProfile')}</h3>
              <button
                onClick={() => setEditOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="overflow-y-auto flex-1 px-5 py-4">

            {/* Avatar picker */}
            <div className="flex justify-center mb-5">
              <button
                onClick={() => avatarInputRef.current?.click()}
                className="relative group"
              >
                <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800">
                  {editAvatarPreview || profile?.avatarUrl ? (
                    <img
                      src={editAvatarPreview ?? profile!.avatarUrl!}
                      alt="avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Avatar uri={undefined} name={profile?.displayName ?? ''} size={80} />
                  )}
                </div>
                <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera size={18} className="text-white" />
                </div>
                <div className="absolute bottom-0 right-0 w-6 h-6 bg-[#6c63ff] rounded-full flex items-center justify-center">
                  <Camera size={12} className="text-white" />
                </div>
              </button>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarPick}
              />
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                  {t('profile.displayName')}
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  maxLength={50}
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-border-light dark:border-border-dark bg-bg-light dark:bg-bg-dark text-text-light dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-[#6c63ff]/40"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                  {t('profile.bio')}
                </label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  maxLength={160}
                  rows={3}
                  placeholder={t('profile.bioPlaceholder')}
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-border-light dark:border-border-dark bg-bg-light dark:bg-bg-dark text-text-light dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-[#6c63ff]/40 resize-none"
                />
                <p className="text-xs text-gray-400 text-right mt-1">{editBio.length}/160</p>
              </div>
            </div>

            </div>{/* end scrollable body */}

            {/* Fixed footer — always visible */}
            <div className="px-5 py-4 border-t border-border-light dark:border-border-dark shrink-0">
              <button
                onClick={() => updateMutation.mutate({ displayName: editName.trim(), bio: editBio.trim() })}
                disabled={updateMutation.isPending || avatarUploading || !editName.trim()}
                className="w-full py-3 rounded-xl bg-[#6c63ff] text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition-opacity"
              >
                {updateMutation.isPending || avatarUploading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Check size={16} />
                    {t('profile.saveChanges')}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings sheet */}
      {settingsOpen && <SettingsSheet onClose={() => setSettingsOpen(false)} />}

      {/* Follow list sheet */}
      {followSheet && profile && (
        <FollowListSheet
          userId={profile.id}
          type={followSheet}
          onClose={() => setFollowSheet(null)}
          onUserPress={(id) => { setFollowSheet(null); router.push(`/profile/${id}`); }}
        />
      )}

      {/* Photo lightbox */}
      {lightboxIndex !== null && (
        <PhotoLightbox
          posts={postsWithImage}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </div>
  );
}

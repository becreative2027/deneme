'use client';

import React, { useCallback, useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Images, Loader2, MapPin, ChevronRight } from 'lucide-react';
import { Post } from '@/lib/types';
import { useUserProfile, useUserPosts, useFollowUser } from '@/hooks/useProfile';
import { useLikePost } from '@/hooks/useFeed';
import { useAuthStore } from '@/store/authStore';
import { Avatar } from '@/components/Avatar';
import { PostCard } from '@/components/PostCard';
import { PostSkeleton, ProfileSkeleton } from '@/components/SkeletonLoader';
import { ErrorState } from '@/components/ErrorState';
import { EmptyState } from '@/components/EmptyState';
import { useToast } from '@/components/Toast';
import { PhotoLightbox } from '@/components/PhotoLightbox';
import clsx from 'clsx';

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function StatItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-lg font-extrabold text-text-light dark:text-text-dark">
        {formatCount(value)}
      </span>
      <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</span>
    </div>
  );
}

interface PlaceGroup {
  placeId: string;
  placeName: string;
  placeCity: string;
  posts: Post[];
  latestAt: string;
}

function groupByPlace(posts: Post[]): PlaceGroup[] {
  const map = new Map<string, PlaceGroup>();
  for (const post of posts) {
    if (!post.placeId) continue;
    let group = map.get(post.placeId);
    if (!group) {
      group = { placeId: post.placeId, placeName: post.placeName, placeCity: post.placeCity, posts: [], latestAt: post.createdAt };
      map.set(post.placeId, group);
    }
    group.posts.push(post);
    if (post.createdAt > group.latestAt) group.latestAt = post.createdAt;
  }
  return Array.from(map.values()).sort((a, b) => b.latestAt.localeCompare(a.latestAt));
}

function PlaceGroupCard({
  group,
  onPressPlace,
  onPressPhoto,
}: {
  group: PlaceGroup;
  onPressPlace: (placeId: string) => void;
  onPressPhoto: (posts: Post[], index: number) => void;
}) {
  const photoPosts = group.posts.filter((p) => p.imageUrl);
  const allPosts = group.posts;

  return (
    <div className="bg-white dark:bg-surface-dark mb-2 rounded-2xl overflow-hidden mx-3 shadow-sm">
      {/* Place header */}
      <button
        type="button"
        onClick={() => onPressPlace(group.placeId)}
        className="w-full flex items-center gap-2.5 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-left"
      >
        <div className="w-8 h-8 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center flex-shrink-0">
          <MapPin size={15} className="text-[#6c63ff]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-text-light dark:text-text-dark truncate">{group.placeName}</p>
          <p className="text-xs text-gray-400 truncate">{group.placeCity}</p>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <span className="text-xs text-gray-400">{allPosts.length} gönderi</span>
          <ChevronRight size={14} className="text-gray-400" />
        </div>
      </button>

      {/* Photo grid */}
      {photoPosts.length > 0 && (
        <div className="grid grid-cols-3 gap-0.5 px-0.5 pb-0.5">
          {photoPosts.slice(0, 6).map((post, i) => (
            <button
              key={post.id}
              type="button"
              onClick={() => onPressPhoto(photoPosts, i)}
              className="relative aspect-square bg-gray-100 dark:bg-gray-800 overflow-hidden"
            >
              <Image
                src={post.imageUrl!}
                alt={post.caption ?? group.placeName}
                fill
                className="object-cover"
                sizes="(max-width: 480px) 33vw, 140px"
              />
              {/* +N overlay on last cell if more photos exist */}
              {i === 5 && photoPosts.length > 6 && (
                <div className="absolute inset-0 bg-black/55 flex items-center justify-center">
                  <span className="text-white text-base font-bold">+{photoPosts.length - 6}</span>
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Text-only posts indicator (no photo) */}
      {photoPosts.length === 0 && (
        <div className="px-4 pb-3">
          <p className="text-xs text-gray-400 italic">Fotoğraf yok · {allPosts.length} metin gönderi</p>
        </div>
      )}
    </div>
  );
}

export default function UserProfilePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const me = useAuthStore((s) => s.user);
  const { showToast } = useToast();
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const [viewMode, setViewMode] = useState<'places' | 'list'>('places');
  const [lightboxState, setLightboxState] = useState<{ posts: Post[]; index: number } | null>(null);

  const isOwnProfile = me?.id === params.id;

  const profileQuery = useUserProfile(params.id);
  const profile = profileQuery.data;

  const postsQuery = useUserPosts(params.id);
  const allPosts: Post[] = postsQuery.data?.pages.flatMap((p) => p.items) ?? [];
  const placeGroups = groupByPlace(allPosts);

  const followMutation = useFollowUser();
  const likeMutation = useLikePost();

  const handleFollowToggle = useCallback(() => {
    if (!profile) return;
    const isFollowing = !!profile.isFollowing;
    followMutation.mutate(
      { userId: profile.id, isFollowing },
      {
        onSuccess: () => {
          showToast(
            isFollowing ? 'Takipten çıkıldı' : `${profile.displayName} takip edildi`,
            'success',
          );
        },
        onError: () => showToast('İşlem başarısız.', 'error'),
      },
    );
  }, [profile, followMutation, showToast]);

  const handleLike = useCallback(
    (postId: string, currentlyLiked: boolean) => {
      likeMutation.mutate({ postId, liked: currentlyLiked });
    },
    [likeMutation],
  );

  // Infinite scroll
  useEffect(() => {
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
  }, [postsQuery]);

  if (profileQuery.isLoading) {
    return (
      <div className="bg-white dark:bg-surface-dark">
        <div className="p-4">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-200"
          >
            <ArrowLeft size={22} />
          </button>
        </div>
        <ProfileSkeleton />
        <PostSkeleton />
      </div>
    );
  }

  if (profileQuery.isError || !profile) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <ErrorState message="Could not load profile." onRetry={() => profileQuery.refetch()} />
      </div>
    );
  }

  if (isOwnProfile) {
    router.replace('/profile');
    return null;
  }

  return (
    <div className="bg-bg-light dark:bg-bg-dark">
      {/* Profile header */}
      <div className="bg-white dark:bg-surface-dark px-5 pt-4 pb-0 mb-2">
        <button
          onClick={() => router.back()}
          className="p-2 -ml-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 mb-2"
        >
          <ArrowLeft size={22} />
        </button>

        <div className="flex items-start justify-between mb-4">
          <Avatar uri={profile.avatarUrl} name={profile.displayName} size={72} />
          <button
            onClick={handleFollowToggle}
            disabled={followMutation.isPending}
            className={clsx(
              'flex items-center gap-1.5 px-5 py-2 rounded-full text-sm font-bold transition-all border-2',
              profile.isFollowing
                ? 'bg-[#6c63ff] border-[#6c63ff] text-white hover:bg-[#5a52e0]'
                : 'bg-transparent border-[#6c63ff] text-[#6c63ff] hover:bg-violet-50 dark:hover:bg-violet-900/20',
              followMutation.isPending && 'opacity-60',
            )}
          >
            {followMutation.isPending ? <Loader2 size={15} className="animate-spin" /> : null}
            {profile.isFollowing ? 'Takip ediliyor' : 'Takip et'}
          </button>
        </div>

        <h2 className="text-xl font-extrabold text-text-light dark:text-text-dark">{profile.displayName}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">@{profile.username}</p>

        {profile.bio ? (
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2.5 leading-5">{profile.bio}</p>
        ) : null}

        <div className="flex gap-6 mt-4 pb-0 border-b border-border-light dark:border-border-dark">
          <div className="pb-4">
            <StatItem label="Gönderi" value={profile.postsCount} />
          </div>
          <div className="pb-4">
            <StatItem label="Takipçi" value={profile.followersCount} />
          </div>
          <div className="pb-4">
            <StatItem label="Takip" value={profile.followingCount} />
          </div>
        </div>

        {/* View mode tabs */}
        <div className="flex -mx-5">
          <button
            onClick={() => setViewMode('places')}
            className={clsx(
              'flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold border-b-2 transition-colors',
              viewMode === 'places'
                ? 'border-[#6c63ff] text-[#6c63ff]'
                : 'border-transparent text-gray-400',
            )}
          >
            <MapPin size={15} />
            Mekanlar
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={clsx(
              'flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold border-b-2 transition-colors',
              viewMode === 'list'
                ? 'border-[#6c63ff] text-[#6c63ff]'
                : 'border-transparent text-gray-400',
            )}
          >
            <Images size={15} />
            Tüm Gönderiler
          </button>
        </div>
      </div>

      {/* Content */}
      {postsQuery.isLoading ? (
        <div>
          <PostSkeleton />
          <PostSkeleton />
        </div>
      ) : postsQuery.isError ? (
        <ErrorState message="Gönderiler yüklenemedi." onRetry={() => postsQuery.refetch()} />
      ) : allPosts.length === 0 ? (
        <EmptyState icon={Images} title="Henüz gönderi yok" subtitle="Bu kullanıcı henüz bir şey paylaşmadı." />
      ) : viewMode === 'places' ? (
        <div className="pt-2 pb-6">
          {placeGroups.map((group) => (
            <PlaceGroupCard
              key={group.placeId}
              group={group}
              onPressPlace={(id) => router.push(`/places/${id}`)}
              onPressPhoto={(posts, index) => setLightboxState({ posts, index })}
            />
          ))}
          <div ref={loadMoreRef} className="h-4" />
          {postsQuery.isFetchingNextPage && (
            <div className="flex justify-center py-4">
              <div className="w-6 h-6 border-2 border-[#6c63ff] border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
      ) : (
        <>
          {allPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onLike={handleLike}
              onPressPlace={(placeId) => router.push(`/places/${placeId}`)}
              onPressUser={(userId) => router.push(`/profile/${userId}`)}
            />
          ))}
          <div ref={loadMoreRef} className="h-4" />
          {postsQuery.isFetchingNextPage && (
            <div className="flex justify-center py-4">
              <div className="w-6 h-6 border-2 border-[#6c63ff] border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          {!postsQuery.hasNextPage && allPosts.length > 0 && (
            <p className="text-center text-xs text-gray-400 py-6">Tüm gönderiler yüklendi</p>
          )}
        </>
      )}

      {/* Photo lightbox */}
      {lightboxState && (
        <PhotoLightbox
          posts={lightboxState.posts}
          initialIndex={lightboxState.index}
          onClose={() => setLightboxState(null)}
        />
      )}
    </div>
  );
}

'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Newspaper } from 'lucide-react';
import { Post } from '@/lib/types';
import { useFollowingFeed, useExploreFeed, usePersonalizedFeed, useLikePost } from '@/hooks/useFeed';
import { PostCard } from '@/components/PostCard';
import { PostSkeleton } from '@/components/SkeletonLoader';
import { ErrorState } from '@/components/ErrorState';
import { EmptyState } from '@/components/EmptyState';
import { useT } from '@/lib/i18n';
import clsx from 'clsx';

type FeedTab = 'following' | 'explore' | 'personalized';

export default function FeedPage() {
  const t = useT();
  const [activeTab, setActiveTab] = useState<FeedTab>('following');
  const router = useRouter();
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const following = useFollowingFeed();
  const explore = useExploreFeed();
  const personalized = usePersonalizedFeed();
  const likeMutation = useLikePost();

  const TABS: { key: FeedTab; label: string }[] = [
    { key: 'following', label: t('feed.following') },
    { key: 'explore', label: t('feed.explore') },
    { key: 'personalized', label: t('feed.forYou') },
  ];

  const activeQuery =
    activeTab === 'following' ? following
    : activeTab === 'explore' ? explore
    : personalized;

  const allPosts: Post[] = activeQuery.data?.pages.flatMap((p) => p.items) ?? [];

  const handleLike = useCallback(
    (postId: string, currentlyLiked: boolean) => {
      likeMutation.mutate({ postId, liked: currentlyLiked });
    },
    [likeMutation],
  );

  const handlePressPlace = useCallback(
    (placeId: string) => {
      router.push(`/places/${placeId}`);
    },
    [router],
  );

  const handlePressUser = useCallback(
    (userId: string) => {
      router.push(`/profile/${userId}`);
    },
    [router],
  );

  // Intersection observer for infinite scroll
  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && activeQuery.hasNextPage && !activeQuery.isFetchingNextPage) {
          activeQuery.fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [activeQuery]);

  return (
    <div className="bg-bg-light dark:bg-bg-dark">
      {/* Tab bar */}
      <div className="flex bg-white dark:bg-surface-dark border-b border-border-light dark:border-border-dark sticky top-14 z-30">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={clsx(
              'flex-1 py-3 text-sm font-medium transition-colors relative',
              activeTab === tab.key
                ? 'text-[#6c63ff] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#6c63ff]'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeQuery.isLoading ? (
        <div>
          {[0, 1, 2].map((i) => (
            <PostSkeleton key={i} />
          ))}
        </div>
      ) : activeQuery.isError ? (
        <ErrorState
          message={t('feed.error')}
          onRetry={() => activeQuery.refetch()}
        />
      ) : (
        <div>
          {allPosts.length === 0 ? (
            <EmptyState
              icon={Newspaper}
              title={t('feed.empty.title')}
              subtitle={t('feed.empty.subtitle')}
            />
          ) : (
            <>
              {allPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onLike={handleLike}
                  onPressPlace={handlePressPlace}
                  onPressUser={handlePressUser}
                />
              ))}

              {/* Infinite scroll sentinel */}
              <div ref={loadMoreRef} className="h-4" />

              {activeQuery.isFetchingNextPage && (
                <div className="flex justify-center py-4">
                  <div className="w-6 h-6 border-2 border-[#6c63ff] border-t-transparent rounded-full animate-spin" />
                </div>
              )}

              {!activeQuery.hasNextPage && allPosts.length > 0 && (
                <p className="text-center text-xs text-gray-400 py-6">{t('feed.allCaughtUp')}</p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

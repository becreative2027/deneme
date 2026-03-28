'use client';

import React, { useState } from 'react';
import { X, Star, PenLine, Flag } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPlaceReviews, addOrUpdateReview, ReviewDto } from '@/api/reviews';
import { useAuthStore } from '@/store/authStore';
import { Avatar } from './Avatar';
import { ReportModal } from './ReportModal';
import { useT } from '@/lib/i18n';

function timeAgo(iso: string, t: (key: string, ...args: any[]) => string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 3600) return t('time.minutesAgo', Math.max(1, Math.floor(diff / 60)));
  if (diff < 86400) return t('time.hoursAgo', Math.floor(diff / 3600));
  if (diff < 2592000) return t('time.daysAgo', Math.floor(diff / 86400));
  return new Date(iso).toLocaleDateString(t('time.dateLocale'), { day: 'numeric', month: 'short', year: 'numeric' });
}

function StarRow({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={size}
          className={s <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300 dark:text-gray-600'}
        />
      ))}
    </div>
  );
}

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button key={s} type="button" onClick={() => onChange(s)} className="p-0.5 active:scale-110 transition-transform">
          <Star
            size={32}
            className={s <= value ? 'text-amber-400 fill-amber-400' : 'text-gray-300 dark:text-gray-600'}
          />
        </button>
      ))}
    </div>
  );
}

function ReviewCard({ review, isMe }: { review: ReviewDto; isMe: boolean }) {
  const t = useT();
  const [reporting, setReporting] = useState(false);
  return (
    <div className={`px-4 py-3 border-b border-border-light dark:border-border-dark ${isMe ? 'bg-violet-50 dark:bg-violet-900/10' : ''}`}>
      <div className="flex items-start gap-3">
        <Avatar uri={review.avatarUrl} name={review.displayName} size={36} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-text-light dark:text-text-dark">
              {review.displayName}
              {isMe && <span className="ml-1.5 text-[10px] font-bold text-[#6c63ff] bg-violet-100 dark:bg-violet-900/30 px-1.5 py-0.5 rounded-full">{t('reviews.me')}</span>}
            </span>
            <span className="text-xs text-gray-400">@{review.username}</span>
            {!isMe && (
              <button
                onClick={() => setReporting(true)}
                className="ml-auto p-1 text-gray-300 hover:text-red-400 transition-colors"
                title="Şikayet Et"
              >
                <Flag size={14} />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <StarRow rating={review.rating} size={13} />
            <span className="text-xs text-gray-400">{timeAgo(review.createdAt, t)}</span>
          </div>
          {review.comment && (
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1.5 leading-5">{review.comment}</p>
          )}
        </div>
      </div>
      {reporting && (
        <ReportModal
          targetType="Review"
          targetId={review.id}
          onClose={() => setReporting(false)}
        />
      )}
    </div>
  );
}

interface WriteFormProps {
  placeId: string;
  existing?: ReviewDto;
  onDone: () => void;
}

function WriteForm({ placeId, existing, onDone }: WriteFormProps) {
  const t = useT();
  const user = useAuthStore((s) => s.user);
  const qc = useQueryClient();
  const [rating, setRating] = useState(existing?.rating ?? 0);
  const [comment, setComment] = useState(existing?.comment ?? '');

  const mutation = useMutation({
    mutationFn: () =>
      addOrUpdateReview(placeId, {
        userId: user!.id,
        username: user!.username,
        displayName: user!.displayName,
        avatarUrl: user?.avatarUrl,
        rating,
        comment: comment.trim() || undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['placeReviews', placeId] });
      qc.invalidateQueries({ queryKey: ['place', placeId] });
      onDone();
    },
  });

  return (
    <div className="p-4 border-t border-border-light dark:border-border-dark">
      <p className="text-sm font-bold text-text-light dark:text-text-dark mb-3">
        {existing ? t('reviews.updateRate') : t('reviews.rate')}
      </p>
      <div className="flex justify-center mb-4">
        <StarPicker value={rating} onChange={setRating} />
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder={t('reviews.commentPlaceholder')}
        rows={3}
        maxLength={500}
        className="w-full px-3 py-2.5 text-sm rounded-xl border border-border-light dark:border-border-dark bg-bg-light dark:bg-bg-dark text-text-light dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-[#6c63ff]/40 resize-none"
      />
      <p className="text-xs text-gray-400 text-right mb-3">{comment.length}/500</p>
      <button
        onClick={() => mutation.mutate()}
        disabled={rating === 0 || mutation.isPending}
        className="w-full py-3 rounded-xl bg-[#6c63ff] text-white text-sm font-semibold disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
      >
        {mutation.isPending ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          existing ? t('reviews.update') : t('reviews.submit')
        )}
      </button>
      {mutation.isError && (
        <p className="text-xs text-red-500 text-center mt-2">{t('reviews.error')}</p>
      )}
    </div>
  );
}

interface Props {
  placeId: string;
  onClose: () => void;
}

export function ReviewsSheet({ placeId, onClose }: Props) {
  const t = useT();
  const user = useAuthStore((s) => s.user);
  const [writeOpen, setWriteOpen] = useState(false);

  const query = useQuery({
    queryKey: ['placeReviews', placeId],
    queryFn: () => getPlaceReviews(placeId, 1, 50),
    staleTime: 30_000,
  });

  const reviews = query.data?.items ?? [];
  const myReview = reviews.find((r) => r.userId === user?.id);
  const others = reviews.filter((r) => r.userId !== user?.id);
  const displayList = myReview ? [myReview, ...others] : others;

  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-surface-dark rounded-t-2xl flex flex-col max-h-[85dvh]">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 pb-3 border-b border-border-light dark:border-border-dark shrink-0">
          <div>
            <h3 className="text-base font-bold text-text-light dark:text-text-dark">{t('reviews.title')}</h3>
            {reviews.length > 0 && (
              <div className="flex items-center gap-1.5 mt-0.5">
                <Star size={13} className="text-amber-400 fill-amber-400" />
                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                  {avgRating.toFixed(1)}
                </span>
                <span className="text-xs text-gray-400">· {reviews.length} {t('reviews.rating')}</span>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        {/* Review list */}
        <div className="overflow-y-auto flex-1">
          {query.isLoading ? (
            <div className="flex justify-center py-10">
              <div className="w-6 h-6 border-2 border-[#6c63ff] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : displayList.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 px-4">
              <Star size={32} className="text-gray-300" />
              <p className="text-sm text-gray-500 text-center">{t('reviews.empty')}</p>
            </div>
          ) : (
            displayList.map((r) => (
              <ReviewCard key={r.id} review={r} isMe={r.userId === user?.id} />
            ))
          )}
        </div>

        {/* Write review toggle */}
        {user && (
          <>
            {!writeOpen ? (
              <div className="px-4 py-3 border-t border-border-light dark:border-border-dark shrink-0">
                <button
                  type="button"
                  onClick={() => setWriteOpen(true)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-[#6c63ff] text-[#6c63ff] text-sm font-semibold hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors"
                >
                  <PenLine size={16} />
                  {myReview ? t('reviews.editRate') : t('reviews.rate')}
                </button>
              </div>
            ) : (
              <WriteForm
                placeId={placeId}
                existing={myReview}
                onDone={() => setWriteOpen(false)}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

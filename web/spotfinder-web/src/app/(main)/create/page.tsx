'use client';

import React, { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, MapPin, X, ChevronDown, ChevronUp, Loader2, Images } from 'lucide-react';
import Image from 'next/image';
import { createPost, createPostWithImage } from '@/api/posts';

import { usePlaceSearch } from '@/hooks/usePlaces';
import { useToast } from '@/components/Toast';
import { useQueryClient } from '@tanstack/react-query';
import { Place } from '@/lib/types';
import clsx from 'clsx';

export default function CreatePage() {
  const [caption, setCaption] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [placeSearch, setPlaceSearch] = useState('');
  const [showPlacePicker, setShowPlacePicker] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isSubmittingRef = useRef(false);
  const { showToast } = useToast();
  const router = useRouter();
  const queryClient = useQueryClient();

  const searchQuery = usePlaceSearch(
    { query: placeSearch, pageSize: 10 },
    placeSearch.length > 1,
  );

  const resetForm = useCallback(() => {
    setCaption('');
    setImageFile(null);
    setImagePreview(null);
    setSelectedPlace(null);
    setPlaceSearch('');
    setShowPlacePicker(false);
    setUploadProgress(0);
    isSubmittingRef.current = false;
  }, []);

  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const url = URL.createObjectURL(file);
    setImagePreview(url);
  }, []);

  const handlePost = useCallback(async () => {
    if (isSubmittingRef.current) return;
    if (!selectedPlace) {
      showToast('Select a place before posting.', 'warning');
      return;
    }

    isSubmittingRef.current = true;
    setIsSubmitting(true);

    try {
      if (imageFile) {
        await createPostWithImage(
          selectedPlace.id,
          caption.trim() || undefined,
          imageFile,
          (fraction) => setUploadProgress(fraction),
        );
      } else {
        await createPost({
          placeId: selectedPlace.id,
          caption: caption.trim() || undefined,
        });
      }

      // Invalidate feed queries
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: ['userPosts'] });

      showToast('Post shared!', 'success');
      resetForm();
      router.push('/feed');
    } catch (err: any) {
      showToast(err.message ?? 'Post failed. Please try again.', 'error');
      isSubmittingRef.current = false;
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  }, [selectedPlace, caption, imageFile, createPost, createPostWithImage, showToast, resetForm, router, queryClient]);

  const isDirty = !!(caption.trim() || imageFile || selectedPlace);
  const captionNearLimit = caption.length > 450;
  const submitLabel = isSubmitting
    ? imageFile
      ? `Uploading… ${Math.round(uploadProgress * 100)}%`
      : 'Sharing…'
    : 'Share Post';

  return (
    <div className="bg-bg-light dark:bg-bg-dark min-h-full">
      <div className="px-5 pt-4 pb-10 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-[22px] font-extrabold text-text-light dark:text-text-dark">
            New Post
          </h1>
          {isDirty && (
            <button
              onClick={resetForm}
              className="text-sm text-red-500 font-semibold hover:text-red-600 transition-colors"
            >
              Discard
            </button>
          )}
        </div>

        {/* Photo picker */}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isSubmitting}
            className="w-full aspect-square rounded-xl overflow-hidden bg-white dark:bg-surface-dark border border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center hover:border-[#6c63ff] transition-colors disabled:opacity-60 relative"
          >
            {imagePreview ? (
              <>
                <Image
                  src={imagePreview}
                  alt="Preview"
                  fill
                  className="object-cover rounded-xl"
                />
                <div className="absolute inset-0 bg-black/30 rounded-xl flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <div className="flex flex-col items-center gap-1">
                    <Camera size={24} className="text-white" />
                    <span className="text-white text-sm font-semibold">Change</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2 text-gray-400">
                <Images size={40} />
                <span className="text-sm">Tap to add a photo</span>
              </div>
            )}
          </button>

          {/* Upload progress bar */}
          {isSubmitting && imageFile && (
            <div className="mt-2 w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#6c63ff] rounded-full transition-all duration-300"
                style={{ width: `${Math.round(uploadProgress * 100)}%` }}
              />
            </div>
          )}
        </div>

        {/* Caption */}
        <div>
          <textarea
            placeholder="Write a caption…"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            maxLength={500}
            disabled={isSubmitting}
            rows={3}
            className="w-full border border-border-light dark:border-border-dark rounded-xl px-4 py-3 text-[15px] text-gray-800 dark:text-gray-100 bg-white dark:bg-surface-dark placeholder-gray-400 focus:outline-none focus:border-[#6c63ff] focus:ring-1 focus:ring-[#6c63ff] transition resize-none disabled:opacity-60"
          />
          <p
            className={clsx(
              'text-right text-[11px] mt-1',
              captionNearLimit ? 'text-red-500' : 'text-gray-400',
            )}
          >
            {caption.length}/500
          </p>
        </div>

        {/* Place selector */}
        <div>
          <button
            onClick={() => {
              if (!isSubmitting) setShowPlacePicker((v) => !v);
            }}
            disabled={isSubmitting}
            className={clsx(
              'w-full flex items-center gap-2 border rounded-xl px-4 py-3.5 transition disabled:opacity-60',
              selectedPlace
                ? 'border-[#6c63ff] bg-violet-50 dark:bg-violet-900/20'
                : 'border-dashed border-gray-300 dark:border-gray-600 bg-white dark:bg-surface-dark hover:border-[#6c63ff]',
            )}
          >
            <MapPin size={18} className={selectedPlace ? 'text-[#6c63ff]' : 'text-gray-400'} />
            <span
              className={clsx(
                'flex-1 text-left text-[15px]',
                selectedPlace
                  ? 'text-[#6c63ff] font-semibold'
                  : 'text-gray-400',
              )}
            >
              {selectedPlace ? selectedPlace.name : 'Select a place *'}
            </span>
            {selectedPlace && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPlace(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
            {showPlacePicker ? (
              <ChevronUp size={16} className="text-gray-400" />
            ) : (
              <ChevronDown size={16} className="text-gray-400" />
            )}
          </button>

          {/* Place dropdown */}
          {showPlacePicker && (
            <div className="mt-1 border border-border-light dark:border-border-dark rounded-xl bg-white dark:bg-surface-dark overflow-hidden shadow-lg">
              <div className="border-b border-border-light dark:border-border-dark">
                <input
                  type="text"
                  placeholder="Search places…"
                  value={placeSearch}
                  onChange={(e) => setPlaceSearch(e.target.value)}
                  autoFocus
                  className="w-full px-4 py-3 text-[14px] text-gray-800 dark:text-gray-100 bg-transparent placeholder-gray-400 outline-none"
                />
              </div>

              <div className="max-h-60 overflow-y-auto">
                {searchQuery.isLoading && placeSearch.length > 1 ? (
                  <div className="flex justify-center py-4">
                    <Loader2 size={20} className="animate-spin text-[#6c63ff]" />
                  </div>
                ) : (searchQuery.data?.items ?? []).length === 0 && placeSearch.length > 1 ? (
                  <p className="text-center text-sm text-gray-400 py-4">No places found</p>
                ) : placeSearch.length <= 1 ? (
                  <p className="text-center text-sm text-gray-400 py-4">Type to search places</p>
                ) : (
                  (searchQuery.data?.items ?? []).map((place) => (
                    <button
                      key={place.id}
                      onClick={() => {
                        setSelectedPlace(place);
                        setShowPlacePicker(false);
                        setPlaceSearch('');
                      }}
                      className="w-full text-left px-4 py-3.5 border-b border-border-light dark:border-border-dark last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                        {place.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{place.city}</p>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          onClick={handlePost}
          disabled={isSubmitting || !selectedPlace}
          className="w-full bg-[#6c63ff] text-white rounded-xl py-4 text-[16px] font-bold hover:bg-[#5a52e0] active:scale-[0.98] transition-all disabled:opacity-45 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              {submitLabel}
            </>
          ) : (
            'Share Post'
          )}
        </button>
      </div>
    </div>
  );
}

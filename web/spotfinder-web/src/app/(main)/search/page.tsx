'use client';

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search, X, SearchX, Sparkles, SlidersHorizontal,
  ChevronDown, ChevronUp, Heart, Flame, Star,
} from 'lucide-react';
import { Place } from '@/lib/types';
import { usePlaceSearch, useRecommendations, useFilters, usePopularPlaces } from '@/hooks/usePlaces';
import { useMyFavoritePlaces } from '@/hooks/useFavorites';
import { PlaceCard } from '@/components/PlaceCard';
import { PlaceSkeleton } from '@/components/SkeletonLoader';

// ─── Taste insight ────────────────────────────────────────────────────────────
function TasteInsightCard({ labels }: { labels: string[] }) {
  if (labels.length === 0) return null;
  const top = labels.slice(0, 3);
  const sentence = top.length === 1
    ? `"${top[0]}" tarzı mekanları seviyorsun`
    : top.length === 2
      ? `"${top[0]}" ve "${top[1]}" tarzı mekanları seviyorsun`
      : `"${top[0]}", "${top[1]}" ve "${top[2]}" tarzı mekanları seviyorsun`;

  return (
    <div className="mx-4 mb-3 p-3 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 flex items-start gap-2.5">
      <Sparkles size={16} className="text-primary mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-xs font-semibold text-primary">Tarzına göre keşfet</p>
        <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5">{sentence}</p>
      </div>
    </div>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────
function SectionHeader({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-1.5 px-4 py-2">
      <Icon size={14} className="text-primary" />
      <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
        {title}
      </span>
    </div>
  );
}

// ─── Place list ───────────────────────────────────────────────────────────────
function PlaceList({
  places,
  loading,
  onPress,
}: {
  places: Place[];
  loading?: boolean;
  onPress: (id: string) => void;
}) {
  if (loading) {
    return (
      <div className="px-4">
        {[0, 1, 2].map((i) => (
          <PlaceSkeleton key={i} />
        ))}
      </div>
    );
  }
  return (
    <div className="px-4">
      {places.map((p) => (
        <PlaceCard key={p.id} place={p} onPress={onPress} />
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedLabels, setSelectedLabels] = useState<Set<number>>(new Set());
  const [matchMode, setMatchMode] = useState<'ANY' | 'ALL'>('ANY');
  const [showFilters, setShowFilters] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());
  const router = useRouter();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── data ──────────────────────────────────────────────────────────────────
  const filtersQuery = useFilters(1);
  const recsQuery = useRecommendations(15);
  const popularQuery = usePopularPlaces(20);
  const favPlacesQuery = useMyFavoritePlaces();

  // ── debounce ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  const hasQuery = debouncedQuery.length >= 3;
  const hasLabels = selectedLabels.size > 0;
  const isSearchActive = hasQuery || hasLabels;

  const searchParams = {
    query: hasQuery ? debouncedQuery : undefined,
    labelIds: hasLabels ? Array.from(selectedLabels) : undefined,
    matchMode,
    pageSize: 20,
  };
  const searchQuery = usePlaceSearch(searchParams, isSearchActive);

  // ── taste profile from favorites ─────────────────────────────────────────
  const topLabels = useMemo(() => {
    const places = favPlacesQuery.data ?? [];
    const freq = new Map<string, number>();
    for (const place of places) {
      for (const lbl of place.labels ?? []) {
        freq.set(lbl, (freq.get(lbl) ?? 0) + 1);
      }
    }
    return [...freq.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([label]) => label);
  }, [favPlacesQuery.data]);

  // ── label lookup ─────────────────────────────────────────────────────────
  const categories = filtersQuery.data ?? [];
  const labelById = useMemo(() => {
    const m = new Map<number, string>();
    for (const cat of categories) for (const lbl of cat.labels) m.set(lbl.id, lbl.displayName);
    return m;
  }, [categories]);

  // ── all labels flat list for quick chips (top 12) ────────────────────────
  const allLabels = useMemo(
    () => categories.flatMap((c) => c.labels).slice(0, 12),
    [categories],
  );

  // ── handlers ─────────────────────────────────────────────────────────────
  const handleClear = useCallback(() => { setQuery(''); setDebouncedQuery(''); }, []);
  const handleClearAll = useCallback(() => {
    setQuery(''); setDebouncedQuery(''); setSelectedLabels(new Set()); setShowFilters(false);
  }, []);
  const toggleLabel = useCallback((id: number) => {
    setSelectedLabels((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);
  const toggleCategory = useCallback((id: number) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);
  const navigateToDetail = useCallback((placeId: string) => router.push(`/places/${placeId}`), [router]);

  // ── derived result lists ──────────────────────────────────────────────────
  const searchResults: Place[] = searchQuery.data?.items ?? [];
  const recPlaces: Place[] = recsQuery.data?.recommendations.map((r) => r.place) ?? [];
  const popularPlaces: Place[] = popularQuery.data?.items ?? [];
  const totalSearchResults = searchQuery.data?.totalCount ?? 0;

  // Popular places deduped from recommendations
  const popularDeduped = useMemo(() => {
    const recIds = new Set(recPlaces.map((p) => p.id));
    return popularPlaces.filter((p) => !recIds.has(p.id));
  }, [recPlaces, popularPlaces]);

  return (
    <div className="bg-bg-light dark:bg-bg-dark min-h-full">

      {/* ── Sticky search bar ───────────────────────────────────────────── */}
      <div className="sticky top-14 z-30 bg-bg-light dark:bg-bg-dark px-4 pt-3 pb-2 space-y-2">
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center bg-white dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark px-3 h-11 gap-2">
            <Search size={18} className="text-gray-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Mekan ara…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 text-[15px] text-gray-800 dark:text-gray-100 bg-transparent placeholder-gray-400 outline-none"
              autoComplete="off"
              autoCorrect="off"
            />
            {query.length > 0 && (
              <button type="button" onClick={handleClear} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={18} />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowFilters((v) => !v)}
            className={`relative flex items-center justify-center w-11 h-11 rounded-xl border transition-colors flex-shrink-0 ${
              hasLabels
                ? 'bg-primary border-primary text-white'
                : 'bg-white dark:bg-surface-dark border-border-light dark:border-border-dark text-gray-500 dark:text-gray-400'
            }`}
          >
            <SlidersHorizontal size={18} />
            {hasLabels && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-1">
                {selectedLabels.size}
              </span>
            )}
          </button>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="bg-white dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark p-3 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Eşleşme modu</span>
              <div className="flex rounded-lg overflow-hidden border border-border-light dark:border-border-dark">
                {(['ANY', 'ALL'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setMatchMode(mode)}
                    className={`px-3 py-1 text-xs font-semibold transition-colors ${
                      matchMode === mode
                        ? 'bg-primary text-white'
                        : 'bg-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {mode === 'ANY' ? 'Herhangi biri' : 'Tümü'}
                  </button>
                ))}
              </div>
            </div>

            {categories.map((cat) => (
              <div key={cat.id}>
                <button
                  type="button"
                  onClick={() => toggleCategory(cat.id)}
                  className="flex items-center justify-between w-full py-1"
                >
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">{cat.displayName}</span>
                  {expandedCategories.has(cat.id) ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
                </button>
                {expandedCategories.has(cat.id) && (
                  <div className="flex flex-wrap gap-2 mt-1.5">
                    {cat.labels.map((lbl) => {
                      const active = selectedLabels.has(lbl.id);
                      return (
                        <button
                          key={lbl.id}
                          type="button"
                          onClick={() => toggleLabel(lbl.id)}
                          className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                            active
                              ? 'bg-primary border-primary text-white'
                              : 'bg-gray-100 dark:bg-gray-700 border-transparent text-gray-600 dark:text-gray-300 hover:border-primary hover:text-primary'
                          }`}
                        >
                          {lbl.displayName}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}

            {hasLabels && (
              <button type="button" onClick={() => setSelectedLabels(new Set())} className="w-full text-xs text-red-500 font-semibold py-1 hover:underline">
                Filtreleri temizle
              </button>
            )}
          </div>
        )}

        {/* Active label chips */}
        {hasLabels && !showFilters && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {Array.from(selectedLabels).map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => toggleLabel(id)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium flex-shrink-0"
              >
                {labelById.get(id) ?? `#${id}`}
                <X size={11} />
              </button>
            ))}
            <button type="button" onClick={() => setSelectedLabels(new Set())} className="text-xs text-gray-400 flex-shrink-0 hover:text-red-500">
              Temizle
            </button>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* SEARCH ACTIVE MODE                                                  */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {isSearchActive ? (
        <div className="pb-6">
          <div className="px-4 py-2">
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              {searchQuery.isLoading ? 'Aranıyor…' : `${totalSearchResults} sonuç`}
            </p>
          </div>

          {searchQuery.isLoading ? (
            <div className="px-4">{[0, 1, 2].map((i) => <PlaceSkeleton key={i} />)}</div>
          ) : searchResults.length > 0 ? (
            <>
              <PlaceList places={searchResults} onPress={navigateToDetail} />
              <div className="px-4 pt-4 text-center">
                <button type="button" onClick={handleClearAll} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                  Aramayı sıfırla
                </button>
              </div>
            </>
          ) : (
            /* 0 results — show fallback suggestions */
            <div>
              <div className="flex flex-col items-center gap-2 py-8 px-4">
                <SearchX size={40} className="text-gray-300" />
                <p className="text-sm font-semibold text-gray-500">Mekan bulunamadı</p>
                <p className="text-xs text-gray-400 text-center">Farklı bir kelime veya etiket dene.</p>
                <button type="button" onClick={handleClearAll} className="mt-1 text-xs text-primary font-semibold hover:underline">
                  Aramayı sıfırla
                </button>
              </div>

              {/* Always-filled suggestions below no-results */}
              <SectionHeader icon={Sparkles} title="Belki bunları beğenirsin" />
              <PlaceList
                places={recPlaces.length > 0 ? recPlaces : popularPlaces}
                loading={recsQuery.isLoading && popularQuery.isLoading}
                onPress={navigateToDetail}
              />
            </div>
          )}
        </div>
      ) : (
        /* ═══════════════════════════════════════════════════════════════════ */
        /* DISCOVERY MODE (no active search)                                   */
        /* ═══════════════════════════════════════════════════════════════════ */
        <div className="pb-6">

          {/* Taste insight card */}
          <div className="pt-2">
            <TasteInsightCard labels={topLabels} />
          </div>

          {/* Quick label chips */}
          {allLabels.length > 0 && (
            <div className="px-4 mb-1">
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Hızlı filtreler</p>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {allLabels.map((lbl) => {
                  const active = selectedLabels.has(lbl.id);
                  return (
                    <button
                      key={lbl.id}
                      type="button"
                      onClick={() => toggleLabel(lbl.id)}
                      className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                        active
                          ? 'bg-primary border-primary text-white'
                          : 'bg-white dark:bg-surface-dark border-border-light dark:border-border-dark text-gray-600 dark:text-gray-300 hover:border-primary hover:text-primary'
                      }`}
                    >
                      {lbl.displayName}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recommendations section */}
          {(recsQuery.isLoading || recPlaces.length > 0) && (
            <>
              <SectionHeader icon={Sparkles} title="Sana özel" />
              <PlaceList places={recPlaces} loading={recsQuery.isLoading} onPress={navigateToDetail} />
            </>
          )}

          {/* Favorites section — if user has favorites, show them */}
          {(favPlacesQuery.data ?? []).length > 0 && (
            <>
              <SectionHeader icon={Heart} title="Favorilerin" />
              <PlaceList places={favPlacesQuery.data!} onPress={navigateToDetail} />
            </>
          )}

          {/* Popular places — always filled fallback */}
          <SectionHeader icon={Flame} title="Popüler mekanlar" />
          <PlaceList
            places={popularDeduped.length > 0 ? popularDeduped : popularPlaces}
            loading={popularQuery.isLoading}
            onPress={navigateToDetail}
          />
        </div>
      )}
    </div>
  );
}

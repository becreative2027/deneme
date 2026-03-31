'use client';

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search, X, SearchX, Sparkles, SlidersHorizontal,
  ChevronDown, ChevronUp, Heart, Flame, UserRound, UserPlus, UserCheck,
} from 'lucide-react';
import { Place } from '@/lib/types';
import { usePlaceSearch, useRecommendations, useFilters, usePopularPlaces } from '@/hooks/usePlaces';
import { useMyFavoritePlaces } from '@/hooks/useFavorites';
import { useUserSearch, useFollowUser } from '@/hooks/useProfile';
import { useAuthStore } from '@/store/authStore';
import { PlaceCard } from '@/components/PlaceCard';
import { PlaceSkeleton } from '@/components/SkeletonLoader';
import { UserSearchResult } from '@/api/users';
import { useT } from '@/lib/i18n';
import { useLocaleStore } from '@/store/localeStore';
import { useSearchStore } from '@/store/searchStore';

// ─── Taste insight ────────────────────────────────────────────────────────────
function TasteInsightCard({ labels }: { labels: string[] }) {
  const t = useT();
  if (labels.length === 0) return null;
  const top = labels.slice(0, 3);
  const sentence = top.length === 1
    ? t('search.taste1', top[0])
    : top.length === 2
      ? t('search.taste2', top[0], top[1])
      : t('search.taste3', top[0], top[1], top[2]);

  return (
    <div className="mx-4 mb-3 p-3 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 flex items-start gap-2.5">
      <Sparkles size={16} className="text-primary mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-xs font-semibold text-primary">{t('search.tasteTitle')}</p>
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

// ─── User card ────────────────────────────────────────────────────────────────
function UserCard({ user, currentUserId }: { user: UserSearchResult; currentUserId?: string }) {
  const t = useT();
  const router = useRouter();
  const followMutation = useFollowUser();
  const [isFollowing, setIsFollowing] = useState(false);

  const isSelf = currentUserId === user.id;

  const handleFollow = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    followMutation.mutate(
      { userId: user.id, isFollowing },
      { onSuccess: () => setIsFollowing((v) => !v) },
    );
  }, [followMutation, user.id, isFollowing]);

  return (
    <button
      type="button"
      onClick={() => router.push(`/profile/${user.id}`)}
      className="w-full flex items-center gap-3 py-3 px-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-left"
    >
      {/* Avatar */}
      <div className="w-11 h-11 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0 overflow-hidden flex items-center justify-center">
        {user.avatarUrl ? (
          <img src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover" />
        ) : (
          <UserRound size={22} className="text-gray-400" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">
          {user.displayName || user.username}
        </p>
        <p className="text-xs text-gray-400 truncate">@{user.username}</p>
      </div>

      {/* Follow button */}
      {!isSelf && (
        <button
          type="button"
          onClick={handleFollow}
          disabled={followMutation.isPending}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors flex-shrink-0 ${
            isFollowing
              ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600'
              : 'bg-primary text-white'
          }`}
        >
          {isFollowing ? (
            <><UserCheck size={13} />{t('follow.following_btn')}</>
          ) : (
            <><UserPlus size={13} />{t('follow.follow')}</>
          )}
        </button>
      )}
    </button>
  );
}

// ─── User skeleton ────────────────────────────────────────────────────────────
function UserSkeleton() {
  return (
    <div className="flex items-center gap-3 py-3 px-4">
      <div className="w-11 h-11 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-32" />
        <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-20" />
      </div>
      <div className="h-7 w-24 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
    </div>
  );
}

// ─── Tab bar (only shown when hasQuery) ──────────────────────────────────────
function SearchTabs({
  active,
  placesCount,
  usersCount,
  onChange,
}: {
  active: 'places' | 'users';
  placesCount: number;
  usersCount: number;
  onChange: (tab: 'places' | 'users') => void;
}) {
  const t = useT();
  return (
    <div className="flex border-b border-border-light dark:border-border-dark">
      {(['places', 'users'] as const).map((tab) => {
        const label = tab === 'places' ? t('search.tabPlaces') : t('search.tabUsers');
        const count = tab === 'places' ? placesCount : usersCount;
        const isActive = active === tab;
        return (
          <button
            key={tab}
            type="button"
            onClick={() => onChange(tab)}
            className={`flex-1 py-2.5 text-xs font-semibold transition-colors relative ${
              isActive
                ? 'text-primary'
                : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
          >
            {label}
            {count > 0 && (
              <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] ${
                isActive ? 'bg-primary/10 text-primary' : 'bg-gray-100 dark:bg-gray-700 text-gray-400'
              }`}>
                {count}
              </span>
            )}
            {isActive && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
            )}
          </button>
        );
      })}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function SearchPage() {
  const t = useT();
  const locale = useLocaleStore((s) => s.locale);
  const langId = locale === 'en' ? 2 : 1;

  // Persistent search state (survives navigation)
  const {
    query, setQuery,
    selectedLabels: selectedLabelsArr, setSelectedLabels,
    matchMode, setMatchMode,
    showFilters, setShowFilters,
    selectedPriceLevels, setSelectedPriceLevels,
    selectedVenueTypes, setSelectedVenueTypes,
  } = useSearchStore();

  const selectedLabels = new Set(selectedLabelsArr);
  const selectedPriceLevelsSet = new Set(selectedPriceLevels);
  const selectedVenueTypesSet = new Set(selectedVenueTypes);

  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());
  const [searchTab, setSearchTab] = useState<'places' | 'users'>('places');
  const router = useRouter();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentUserId = useAuthStore((s) => s.user?.id);

  // ── data ──────────────────────────────────────────────────────────────────
  const filtersQuery = useFilters(langId);
  const recsQuery = useRecommendations(15);
  const popularQuery = usePopularPlaces(20);
  const favPlacesQuery = useMyFavoritePlaces();

  // ── debounce ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  const hasQuery = debouncedQuery.length >= 2;
  const hasLabels = selectedLabels.size > 0;
  const hasPriceLevels = selectedPriceLevelsSet.size > 0;
  const hasVenueTypes = selectedVenueTypesSet.size > 0;
  const isSearchActive = hasQuery || hasLabels || hasPriceLevels || hasVenueTypes;

  const showTabs = hasQuery;

  useEffect(() => {
    if (!hasQuery) setSearchTab('places');
  }, [hasQuery]);

  const searchParams = {
    query: hasQuery ? debouncedQuery : undefined,
    labelIds: hasLabels ? Array.from(selectedLabels) : undefined,
    matchMode,
    pageSize: 20,
    langId,
    priceLevels: hasPriceLevels ? Array.from(selectedPriceLevelsSet) : undefined,
    venueTypes: hasVenueTypes ? Array.from(selectedVenueTypesSet) : undefined,
  };
  const searchQuery = usePlaceSearch(searchParams, isSearchActive);
  const userSearchQuery = useUserSearch(debouncedQuery, hasQuery);

  // ── taste profile from favorites ─────────────────────────────────────────
  const topLabels = useMemo(() => {
    const places = favPlacesQuery.data ?? [];
    const freq = new Map<string, number>();
    for (const place of places) {
      for (const lbl of place.labels ?? []) {
        freq.set(lbl, (freq.get(lbl) ?? 0) + 1);
      }
    }
    return Array.from(freq.entries())
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

  const allLabels = useMemo(
    () => categories.flatMap((c) => c.labels).slice(0, 12),
    [categories],
  );

  // ── handlers ─────────────────────────────────────────────────────────────
  const handleClear = useCallback(() => { setQuery(''); setDebouncedQuery(''); }, [setQuery]);
  const handleClearAll = useCallback(() => {
    setQuery(''); setDebouncedQuery(''); setSelectedLabels([]); setShowFilters(false);
    setSelectedPriceLevels([]); setSelectedVenueTypes([]);
  }, [setQuery, setSelectedLabels, setShowFilters, setSelectedPriceLevels, setSelectedVenueTypes]);
  const toggleLabel = useCallback((id: number) => {
    setSelectedLabels(
      selectedLabelsArr.includes(id)
        ? selectedLabelsArr.filter((x) => x !== id)
        : [...selectedLabelsArr, id],
    );
  }, [selectedLabelsArr, setSelectedLabels]);
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
  const userResults = userSearchQuery.data?.users ?? [];
  const totalUserResults = userSearchQuery.data?.totalCount ?? 0;

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
              placeholder={t('search.placeholder')}
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
            onClick={() => setShowFilters(!showFilters)}
            className={`relative flex items-center justify-center w-11 h-11 rounded-xl border transition-colors flex-shrink-0 ${
              hasLabels || hasPriceLevels || hasVenueTypes
                ? 'bg-primary border-primary text-white'
                : 'bg-white dark:bg-surface-dark border-border-light dark:border-border-dark text-gray-500 dark:text-gray-400'
            }`}
          >
            <SlidersHorizontal size={18} />
            {(hasLabels || hasPriceLevels || hasVenueTypes) && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-1">
                {selectedLabels.size + selectedPriceLevelsSet.size + selectedVenueTypesSet.size}
              </span>
            )}
          </button>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="bg-white dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark p-3 space-y-3">

            {/* ── Price level ── */}
            <div>
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1.5">Fiyat</span>
              <div className="flex gap-2 flex-wrap">
                {([1, 2, 3] as const).map((level) => {
                  const active = selectedPriceLevelsSet.has(level);
                  const sym = ['', '₺', '₺₺', '₺₺₺'][level];
                  return (
                    <button
                      key={level}
                      type="button"
                      onClick={() =>
                        setSelectedPriceLevels(
                          active
                            ? selectedPriceLevels.filter((l) => l !== level)
                            : [...selectedPriceLevels, level],
                        )
                      }
                      className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
                        active
                          ? 'bg-primary border-primary text-white'
                          : 'bg-gray-100 dark:bg-gray-700 border-transparent text-gray-600 dark:text-gray-300 hover:border-primary hover:text-primary'
                      }`}
                    >
                      {sym}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Venue type ── */}
            <div>
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1.5">Mekan Türü</span>
              <div className="flex gap-2 flex-wrap">
                {[
                  { key: 'kafe', label: 'Kafe' },
                  { key: 'restoran', label: 'Restoran' },
                  { key: 'bar', label: 'Bar' },
                  { key: 'pastane', label: 'Pastane' },
                  { key: 'kitabevi_kafe', label: 'Kitabevi' },
                  { key: 'lounge', label: 'Lounge' },
                  { key: 'food_court', label: 'Food Court' },
                ].map(({ key, label }) => {
                  const active = selectedVenueTypesSet.has(key);
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() =>
                        setSelectedVenueTypes(
                          active
                            ? selectedVenueTypes.filter((v) => v !== key)
                            : [...selectedVenueTypes, key],
                        )
                      }
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                        active
                          ? 'bg-primary border-primary text-white'
                          : 'bg-gray-100 dark:bg-gray-700 border-transparent text-gray-600 dark:text-gray-300 hover:border-primary hover:text-primary'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('search.matchMode')}</span>
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
                    {mode === 'ANY' ? t('search.matchAny') : t('search.matchAll')}
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

            {(hasLabels || hasPriceLevels || hasVenueTypes) && (
              <button
                type="button"
                onClick={() => { setSelectedLabels([]); setSelectedPriceLevels([]); setSelectedVenueTypes([]); }}
                className="w-full text-xs text-red-500 font-semibold py-1 hover:underline"
              >
                {t('search.clearFilters')}
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
            <button type="button" onClick={() => setSelectedLabels([])} className="text-xs text-gray-400 flex-shrink-0 hover:text-red-500">
              {t('search.clear')}
            </button>
          </div>
        )}

        {/* Tab bar — only when text query is active */}
        {showTabs && (
          <SearchTabs
            active={searchTab}
            placesCount={totalSearchResults}
            usersCount={totalUserResults}
            onChange={setSearchTab}
          />
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* SEARCH ACTIVE MODE                                                  */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {isSearchActive ? (
        <div className="pb-6">

          {/* ── PLACES TAB ─────────────────────────────────────────────── */}
          {searchTab === 'places' && (
            <>
              {!showTabs && (
                <div className="px-4 py-2">
                  <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                    {searchQuery.isLoading ? t('search.searching') : t('search.results', totalSearchResults)}
                  </p>
                </div>
              )}

              {searchQuery.isLoading ? (
                <div className="px-4">{[0, 1, 2].map((i) => <PlaceSkeleton key={i} />)}</div>
              ) : searchResults.length > 0 ? (
                <>
                  <PlaceList places={searchResults} onPress={navigateToDetail} />
                  <div className="px-4 pt-4 text-center">
                    <button type="button" onClick={handleClearAll} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                      {t('search.resetSearch')}
                    </button>
                  </div>
                </>
              ) : (
                <div>
                  <div className="flex flex-col items-center gap-2 py-8 px-4">
                    <SearchX size={40} className="text-gray-300" />
                    <p className="text-sm font-semibold text-gray-500">{t('search.noPlaces')}</p>
                    <p className="text-xs text-gray-400 text-center">{t('search.noPlacesHint')}</p>
                    <button type="button" onClick={handleClearAll} className="mt-1 text-xs text-primary font-semibold hover:underline">
                      {t('search.resetSearch')}
                    </button>
                  </div>
                  <SectionHeader icon={Sparkles} title={t('search.suggestions')} />
                  <PlaceList
                    places={recPlaces.length > 0 ? recPlaces : popularPlaces}
                    loading={recsQuery.isLoading && popularQuery.isLoading}
                    onPress={navigateToDetail}
                  />
                </div>
              )}
            </>
          )}

          {/* ── USERS TAB ──────────────────────────────────────────────── */}
          {searchTab === 'users' && (
            <div>
              {userSearchQuery.isLoading ? (
                [0, 1, 2].map((i) => <UserSkeleton key={i} />)
              ) : userResults.length > 0 ? (
                <div className="divide-y divide-border-light dark:divide-border-dark">
                  {userResults.map((u) => (
                    <UserCard key={u.id} user={u} currentUserId={currentUserId} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 py-10 px-4">
                  <UserRound size={40} className="text-gray-300" />
                  <p className="text-sm font-semibold text-gray-500">{t('search.noUsers')}</p>
                  <p className="text-xs text-gray-400 text-center">{t('search.noUsersHint')}</p>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* ═══════════════════════════════════════════════════════════════════ */
        /* DISCOVERY MODE (no active search)                                   */
        /* ═══════════════════════════════════════════════════════════════════ */
        <div className="pb-6">

          <div className="pt-2">
            <TasteInsightCard labels={topLabels} />
          </div>

          {allLabels.length > 0 && (
            <div className="px-4 mb-1">
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">{t('search.quickFilters')}</p>
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

          {(recsQuery.isLoading || recPlaces.length > 0) && (
            <>
              <SectionHeader icon={Sparkles} title={t('search.forYou')} />
              <PlaceList places={recPlaces} loading={recsQuery.isLoading} onPress={navigateToDetail} />
            </>
          )}

          {(favPlacesQuery.data ?? []).length > 0 && (
            <>
              <SectionHeader icon={Heart} title={t('search.favorites')} />
              <PlaceList places={favPlacesQuery.data!} onPress={navigateToDetail} />
            </>
          )}

          <SectionHeader icon={Flame} title={t('search.popular')} />
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

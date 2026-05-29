import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { SearchStackParamList, Place, FilterLabel } from '../../types';
import { usePlaceSearch, useRecommendations, useFilters, usePopularPlaces, useLangId } from '../../hooks/usePlaces';
import { PlaceCard } from '../../components/PlaceCard';
import { PlaceSkeleton } from '../../components/SkeletonLoader';
import { ErrorState } from '../../components/ErrorState';
import { EmptyState } from '../../components/EmptyState';
import { useAnalytics } from '../../hooks/useAnalytics';
import { useTheme } from '../../theme';

type Props = { navigation: NativeStackNavigationProp<SearchStackParamList, 'Search'> };

export function SearchScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const langId = useLangId();
  const [query, setQuery]                   = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedLabelIds, setSelectedLabelIds] = useState<number[]>([]);
  const [showFilters, setShowFilters]       = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { trackScreen, trackEvent } = useAnalytics();

  useEffect(() => { trackScreen('SearchScreen'); }, []);

  // Debounce query by 300 ms
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  const hasQuery  = debouncedQuery.length >= 2;
  const hasLabels = selectedLabelIds.length > 0;
  const isSearchActive = hasQuery || hasLabels;

  const searchReq = {
    query:    hasQuery  ? debouncedQuery : undefined,
    labelIds: hasLabels ? selectedLabelIds : undefined,
    pageSize: 20,
    langId,
  };

  const searchQuery   = usePlaceSearch(searchReq, isSearchActive);
  const recsQuery     = useRecommendations(15);
  const popularQuery  = usePopularPlaces(20);
  const filtersQuery  = useFilters();

  const categories = filtersQuery.data ?? [];
  const allLabels: FilterLabel[] = useMemo(
    () => categories.flatMap((c) => c.labels),
    [categories],
  );

  const toggleCategory = useCallback((id: number) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const handleClear = useCallback(() => { setQuery(''); setDebouncedQuery(''); }, []);
  const handleClearFilters = useCallback(() => setSelectedLabelIds([]), []);

  const toggleLabel = useCallback((id: number) => {
    setSelectedLabelIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }, []);

  const navigateToDetail = useCallback(
    (placeId: string) => {
      navigation.push('PlaceDetail', { placeId });
      trackEvent('place_open', { placeId, source: 'search' });
    },
    [navigation, trackEvent],
  );

  const searchResults: Place[] = searchQuery.data?.items ?? [];
  const recPlaces:    Place[] = recsQuery.data?.recommendations.map((r) => r.place) ?? [];
  const popularPlaces: Place[] = popularQuery.data?.items ?? [];
  const recWithImages = recPlaces.filter((p) => !!p.imageUrl);
  const useRecs = recWithImages.length > 0;
  const discoveryPlaces = useRecs ? recPlaces : popularPlaces;
  const isDiscoveryLoading = recsQuery.isLoading && popularQuery.isLoading;
  const discoveryLabel = useRecs ? t('feed.explore.forYouRecommendations') : t('feed.explore.popularPlaces');
  const discoveryIcon  = useRecs ? 'sparkles-outline' : 'flame-outline';

  return (
    <SafeAreaView style={[s.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* ── Search bar ──────────────────────────────────────────────────── */}
      <View style={[s.topBar, { backgroundColor: colors.background }]}>
        <View style={s.searchRow}>
          <View style={[s.searchBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="search" size={18} color={colors.textTertiary} />
            <TextInput
              style={[s.searchInput, { color: colors.text }]}
              placeholder={t('places.search.placeholder')}
              value={query}
              onChangeText={setQuery}
              returnKeyType="search"
              placeholderTextColor={colors.textMuted}
              autoCorrect={false}
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={handleClear} hitSlop={8}>
                <Ionicons name="close-circle" size={18} color={colors.textTertiary} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={[
              s.filterBtn,
              { backgroundColor: colors.surface, borderColor: colors.border },
              hasLabels && { backgroundColor: colors.accent, borderColor: colors.accent },
            ]}
            onPress={() => setShowFilters((v) => !v)}
            activeOpacity={0.8}
          >
            <Ionicons
              name="options-outline"
              size={20}
              color={hasLabels ? colors.accentOnAccent : colors.textSecondary}
            />
            {hasLabels && (
              <View style={s.filterBadge}>
                <Text style={s.filterBadgeText}>{selectedLabelIds.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* ── Filter panel ─────────────────────────────────────────────── */}
        {showFilters && categories.length > 0 && (
          <ScrollView
            style={[s.filterPanel, { backgroundColor: colors.surface, borderColor: colors.border }]}
            contentContainerStyle={{ paddingBottom: 4 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
          >
            {categories.map((cat) => {
              const isExpanded = expandedCategories.has(cat.id);
              const visibleLabels = isExpanded ? cat.labels : cat.labels.slice(0, 6);
              const hasMore = cat.labels.length > 6;
              return (
                <View key={cat.id} style={s.categorySection}>
                  <Text style={[s.categoryTitle, { color: colors.textMuted }]}>{cat.displayName.toUpperCase()}</Text>
                  <View style={s.filterLabels}>
                    {visibleLabels.map((lbl) => {
                      const active = selectedLabelIds.includes(lbl.id);
                      return (
                        <TouchableOpacity
                          key={lbl.id}
                          style={[
                            s.filterChip,
                            { backgroundColor: colors.glassBg, borderColor: colors.glassBorder },
                            active && { backgroundColor: colors.accentSoft, borderColor: colors.accentBorder },
                          ]}
                          onPress={() => toggleLabel(lbl.id)}
                          activeOpacity={0.75}
                        >
                          <Text style={[
                            s.filterChipText,
                            { color: colors.textSecondary },
                            active && { color: colors.accent, fontWeight: '700' },
                          ]}>
                            {lbl.displayName}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                  {hasMore && (
                    <TouchableOpacity onPress={() => toggleCategory(cat.id)} style={s.showMoreBtn}>
                      <Text style={[s.showMoreText, { color: colors.accent }]}>
                        {isExpanded ? t('places.search.showLess') : t('places.search.showMore', { count: cat.labels.length - 6 })}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
            {hasLabels && (
              <TouchableOpacity onPress={handleClearFilters} style={s.clearFiltersBtn}>
                <Text style={[s.clearFiltersText, { color: colors.danger }]}>{t('places.search.clearFilters')}</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        )}

        {/* ── Active label chips (when filter panel closed) ──────────── */}
        {hasLabels && !showFilters && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.activeLabelScroll}>
            {selectedLabelIds.map((id) => {
              const lbl = allLabels.find((l) => l.id === id);
              return (
                <TouchableOpacity
                  key={id}
                  style={[s.activeLabelChip, { backgroundColor: colors.accentSoft, borderColor: colors.accentBorder }]}
                  onPress={() => toggleLabel(id)}
                >
                  <Text style={[s.activeLabelChipText, { color: colors.accent }]}>{lbl?.displayName ?? `#${id}`}</Text>
                  <Ionicons name="close" size={11} color={colors.accent} />
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </View>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* SEARCH ACTIVE                                                        */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {isSearchActive ? (
        <>
          {searchQuery.isLoading ? (
            <View style={s.list}>
              {[0, 1, 2].map((i) => <PlaceSkeleton key={i} />)}
            </View>
          ) : searchQuery.isError ? (
            <ErrorState onRetry={() => searchQuery.refetch()} />
          ) : searchResults.length === 0 ? (
            <EmptyState
              icon="search-outline"
              title={t('places.search.notFound')}
              subtitle={t('places.search.notFoundSubtitle')}
            />
          ) : (
            <FlatList
              data={searchResults}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <PlaceCard place={item} onPress={navigateToDetail} />}
              contentContainerStyle={s.list}
              showsVerticalScrollIndicator={false}
              ListHeaderComponent={
                <Text style={[s.sectionLabel, { color: colors.textMuted }]}>{t('common.results', { count: searchResults.length })}</Text>
              }
            />
          )}
        </>
      ) : (
        /* ═══════════════════════════════════════════════════════════════════ */
        /* DISCOVERY MODE                                                       */
        /* ═══════════════════════════════════════════════════════════════════ */
        <FlatList
          data={discoveryPlaces}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <PlaceCard place={item} onPress={navigateToDetail} />}
          contentContainerStyle={[s.list, discoveryPlaces.length === 0 && { flex: 1 }]}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={s.sectionHeaderRow}>
              <Ionicons name={discoveryIcon} size={14} color={colors.accent} />
              <Text style={[s.sectionLabel, { color: colors.textMuted }]}>{discoveryLabel}</Text>
            </View>
          }
          ListEmptyComponent={
            isDiscoveryLoading ? (
              <View style={s.list}>
                {[0, 1, 2].map((i) => <PlaceSkeleton key={i} />)}
              </View>
            ) : (
              <EmptyState
                icon="storefront-outline"
                title={t('places.search.notFound')}
                subtitle={t('places.search.notFoundDiscovery')}
              />
            )
          }
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },

  // Top bar
  topBar:     { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 },
  searchRow:  { flexDirection: 'row', alignItems: 'center', gap: 10 },
  searchBox:  {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 15 },
  filterBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  filterBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },

  // Filter panel
  filterPanel:      { borderRadius: 12, padding: 14, marginTop: 8, borderWidth: 1, maxHeight: 340 },
  categorySection:  { marginBottom: 12 },
  categoryTitle:    { fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 8 },
  showMoreBtn:      { marginTop: 6, alignSelf: 'flex-start' },
  showMoreText:     { fontSize: 12, fontWeight: '600' },
  filterLabels:     { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterChipText:   { fontSize: 12, fontWeight: '500' },
  clearFiltersBtn:  { marginTop: 10, alignSelf: 'flex-start' },
  clearFiltersText: { fontSize: 12, fontWeight: '600' },

  // Active chips bar
  activeLabelScroll: { marginTop: 8, marginBottom: 2 },
  activeLabelChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 6,
  },
  activeLabelChipText: { fontSize: 12, fontWeight: '600' },

  // Content
  list:             { paddingHorizontal: 16, paddingBottom: 20, paddingTop: 4 },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 10 },
  sectionLabel:     { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, paddingVertical: 10 },
});

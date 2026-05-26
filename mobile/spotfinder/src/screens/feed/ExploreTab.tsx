import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useTheme, ThemeColors } from '../../theme';
import { searchPlaces, getFilters } from '../../api/places';
import { useLocationStore, distanceKm } from '../../store/locationStore';
import { Place, FilterLabel } from '../../types';
import { ExploreCard } from '../../components/ExploreCard';

interface Props {
  onPressPlace: (placeId: string) => void;
  bottomPadding?: number;
}

// ── Section ───────────────────────────────────────────────────────────────────

interface SectionProps {
  title: string;
  places: Place[];
  loading: boolean;
  onPressPlace: (id: string) => void;
  colors: ThemeColors;
}

function Section({ title, places, loading, onPressPlace, colors }: SectionProps) {
  const s = useMemo(() => sectionStyles(colors), [colors]);

  if (loading) {
    return (
      <View style={s.section}>
        <View style={s.skeletonTitle} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.row}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={[s.skeletonCard, { backgroundColor: colors.skeleton }]} />
          ))}
        </ScrollView>
      </View>
    );
  }

  if (!places.length) return null;

  return (
    <View style={s.section}>
      <Text style={s.sectionTitle}>{title}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.row}
      >
        {places.map((p) => (
          <ExploreCard key={p.id} place={p} onPress={() => onPressPlace(p.id)} />
        ))}
      </ScrollView>
    </View>
  );
}

const sectionStyles = (c: ThemeColors) =>
  StyleSheet.create({
    section: {
      marginTop: 28,
    },
    sectionTitle: {
      fontSize: 17,
      fontWeight: '700',
      color: c.text,
      paddingHorizontal: 16,
      marginBottom: 12,
    },
    row: {
      paddingHorizontal: 16,
    },
    skeletonTitle: {
      width: 140,
      height: 18,
      borderRadius: 6,
      backgroundColor: c.skeleton,
      marginHorizontal: 16,
      marginBottom: 12,
    },
    skeletonCard: {
      width: 158,
      height: 78,
      borderRadius: 14,
      marginRight: 10,
    },
  });

// ── ExploreTab ────────────────────────────────────────────────────────────────

export function ExploreTab({ onPressPlace, bottomPadding = 0 }: Props) {
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  const { lat, lon } = useLocationStore();
  const [selectedLabel, setSelectedLabel] = useState<FilterLabel | null>(null);

  // ── Labels ──────────────────────────────────────────────────────────────────
  const filtersQuery = useQuery({
    queryKey: ['filters'],
    queryFn: () => getFilters(1),
    staleTime: 10 * 60_000,
  });

  const allLabels = useMemo(
    () => (filtersQuery.data ?? []).flatMap((c) => c.labels),
    [filtersQuery.data],
  );

  // ── Trend places ────────────────────────────────────────────────────────────
  const trendQuery = useQuery({
    queryKey: ['explore-trend'],
    queryFn: () => searchPlaces({ pageSize: 20 }),
    staleTime: 2 * 60_000,
  });
  const trendPlaces = trendQuery.data?.items ?? [];

  // ── Nearby: client-side distance sort ──────────────────────────────────────
  const nearbyPlaces = useMemo(() => {
    if (!lat || !lon || !trendPlaces.length) return [];
    return [...trendPlaces]
      .filter((p) => p.latitude != null && p.longitude != null)
      .sort((a, b) => {
        const da = distanceKm(lat, lon, a.latitude!, a.longitude!);
        const db = distanceKm(lat, lon, b.latitude!, b.longitude!);
        return da - db;
      })
      .slice(0, 15);
  }, [trendPlaces, lat, lon]);

  // ── Dynamic sections: top 2 labels from trending places ────────────────────
  const topLabels = useMemo<FilterLabel[]>(() => {
    if (!allLabels.length || !trendPlaces.length) return [];
    const freq: Record<number, { label: FilterLabel; count: number }> = {};
    trendPlaces.forEach((p) => {
      p.labels.forEach((labelName) => {
        const match = allLabels.find(
          (l) =>
            l.displayName.toLowerCase() === labelName.toLowerCase() ||
            l.key.toLowerCase() === labelName.toLowerCase(),
        );
        if (match) {
          if (!freq[match.id]) freq[match.id] = { label: match, count: 0 };
          freq[match.id].count++;
        }
      });
    });
    return Object.values(freq)
      .sort((a, b) => b.count - a.count)
      .slice(0, 2)
      .map((x) => x.label);
  }, [trendPlaces, allLabels]);

  const label1Query = useQuery({
    queryKey: ['explore-label', topLabels[0]?.id],
    queryFn: () => searchPlaces({ labelIds: [topLabels[0].id], pageSize: 15 }),
    enabled: !!topLabels[0],
    staleTime: 2 * 60_000,
  });

  const label2Query = useQuery({
    queryKey: ['explore-label', topLabels[1]?.id],
    queryFn: () => searchPlaces({ labelIds: [topLabels[1].id], pageSize: 15 }),
    enabled: !!topLabels[1],
    staleTime: 2 * 60_000,
  });

  // ── Filtered (when a pill is active) ───────────────────────────────────────
  const filteredQuery = useQuery({
    queryKey: ['explore-filtered', selectedLabel?.id],
    queryFn: () => searchPlaces({ labelIds: [selectedLabel!.id], pageSize: 20 }),
    enabled: !!selectedLabel,
    staleTime: 2 * 60_000,
  });

  const handleRefresh = () => {
    trendQuery.refetch();
    filtersQuery.refetch();
    if (selectedLabel) filteredQuery.refetch();
  };

  // ── Loading state ───────────────────────────────────────────────────────────
  if (trendQuery.isLoading && !trendPlaces.length) {
    return (
      <View style={s.centered}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={s.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={trendQuery.isRefetching}
          onRefresh={handleRefresh}
          tintColor={colors.primary}
        />
      }
    >
      {/* ── Pill filters ──────────────────────────────────────────────────── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.pillsContainer}
        style={s.pillsScroll}
      >
        <TouchableOpacity
          style={[s.pill, !selectedLabel && s.pillActive]}
          onPress={() => setSelectedLabel(null)}
          activeOpacity={0.75}
        >
          <Text style={[s.pillText, !selectedLabel && s.pillTextActive]}>Tümü</Text>
        </TouchableOpacity>
        {allLabels.map((label) => (
          <TouchableOpacity
            key={label.id}
            style={[s.pill, selectedLabel?.id === label.id && s.pillActive]}
            onPress={() =>
              setSelectedLabel(selectedLabel?.id === label.id ? null : label)
            }
            activeOpacity={0.75}
          >
            <Text
              style={[
                s.pillText,
                selectedLabel?.id === label.id && s.pillTextActive,
              ]}
            >
              {label.displayName}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ── Content ───────────────────────────────────────────────────────── */}
      {selectedLabel ? (
        <Section
          title={selectedLabel.displayName}
          places={filteredQuery.data?.items ?? []}
          loading={filteredQuery.isLoading}
          onPressPlace={onPressPlace}
          colors={colors}
        />
      ) : (
        <>
          <Section
            title="Trend Mekanlar"
            places={trendPlaces.slice(0, 15)}
            loading={trendQuery.isLoading}
            onPressPlace={onPressPlace}
            colors={colors}
          />
          {nearbyPlaces.length > 0 && (
            <Section
              title="Yakınındakiler"
              places={nearbyPlaces}
              loading={false}
              onPressPlace={onPressPlace}
              colors={colors}
            />
          )}
          {topLabels[0] && (
            <Section
              title={`${topLabels[0].displayName} Mekanları`}
              places={label1Query.data?.items ?? []}
              loading={label1Query.isLoading}
              onPressPlace={onPressPlace}
              colors={colors}
            />
          )}
          {topLabels[1] && (
            <Section
              title={`${topLabels[1].displayName} Mekanları`}
              places={label2Query.data?.items ?? []}
              loading={label2Query.isLoading}
              onPressPlace={onPressPlace}
              colors={colors}
            />
          )}
        </>
      )}

      <View style={{ height: bottomPadding + 24 }} />
    </ScrollView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: c.background,
    },
    centered: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: 80,
    },
    pillsScroll: {
      marginTop: 14,
    },
    pillsContainer: {
      paddingHorizontal: 16,
      gap: 8,
    },
    pill: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: c.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
    },
    pillActive: {
      backgroundColor: c.primary,
      borderColor: c.primary,
    },
    pillText: {
      fontSize: 13,
      fontWeight: '500',
      color: c.textSecondary,
    },
    pillTextActive: {
      color: '#fff',
      fontWeight: '600',
    },
  });

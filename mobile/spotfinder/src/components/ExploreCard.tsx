import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Place } from '../types';
import { useTheme } from '../theme';

interface Props {
  place: Place;
  onPress: () => void;
}

export function ExploreCard({ place, onPress }: Props) {
  const { colors } = useTheme();
  const locationLabel = [place.districtName, place.city].filter(Boolean).join(', ');

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.72}
    >
      {/* Cover image */}
      {place.imageUrl ? (
        <Image source={{ uri: place.imageUrl }} style={styles.cover} resizeMode="cover" />
      ) : (
        <View style={[styles.coverPlaceholder, { backgroundColor: colors.surfaceSecondary }]}>
          <Ionicons name="storefront-outline" size={22} color={colors.textMuted} />
        </View>
      )}

      {/* Info */}
      <View style={styles.info}>
        <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
          {place.name}
        </Text>
        <View style={styles.meta}>
          {place.averageRating > 0 && (
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={11} color="#f59e0b" />
              <Text style={[styles.ratingText, { color: colors.textSecondary }]}>
                {place.averageRating.toFixed(1)}
              </Text>
            </View>
          )}
          {locationLabel ? (
            <Text style={[styles.location, { color: colors.textTertiary }]} numberOfLines={1}>
              {place.averageRating > 0 ? ' · ' : ''}{locationLabel}
            </Text>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const CARD_W = 152;
const COVER_H = 100;

const styles = StyleSheet.create({
  card: {
    width: CARD_W,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    marginRight: 10,
    overflow: 'hidden',
  },
  cover: {
    width: CARD_W,
    height: COVER_H,
  },
  coverPlaceholder: {
    width: CARD_W,
    height: COVER_H,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  name: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '500',
  },
  location: {
    fontSize: 11,
    flexShrink: 1,
  },
});

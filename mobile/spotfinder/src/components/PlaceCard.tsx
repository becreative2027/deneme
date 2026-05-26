import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Place } from '../types';
import { formatRating, formatCount } from '../utils/formatters';
import { OptimizedImage } from './OptimizedImage';
import { useLocationStore, distanceKm, formatDistance } from '../store/locationStore';

interface Props {
  place: Place;
  onPress: (placeId: string) => void;
}

export const PlaceCard = memo(function PlaceCard({ place, onPress }: Props) {
  const { lat, lon } = useLocationStore();

  const distance =
    lat != null && lon != null && place.latitude != null && place.longitude != null
      ? formatDistance(distanceKm(lat, lon, place.latitude, place.longitude))
      : null;

  const locationLabel = [place.districtName, place.city].filter(Boolean).join(', ');

  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(place.id)} activeOpacity={0.85}>
      <OptimizedImage
        uri={place.imageUrl}
        style={styles.image}
        resizeMode="cover"
        errorIcon="storefront-outline"
      />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {place.name}
        </Text>
        {place.categoryName ? (
          <Text style={styles.category}>{place.categoryName}</Text>
        ) : null}

        {/* Rating + distance row */}
        <View style={styles.meta}>
          <View style={styles.metaLeft}>
            {place.averageRating > 0 ? (
              <>
                <Ionicons name="star" size={12} color="#f39c12" />
                <Text style={styles.rating}>{formatRating(place.averageRating)}</Text>
                <Text style={styles.reviews}>({formatCount(place.reviewCount)})</Text>
              </>
            ) : (
              <Text style={styles.noRating}>Henüz değerlendirme yok</Text>
            )}
            {locationLabel ? (
              <>
                <Text style={styles.dot}>·</Text>
                <Ionicons name="location-outline" size={11} color="#aaa" />
                <Text style={styles.location}>{locationLabel}</Text>
              </>
            ) : null}
          </View>
          {distance && (
            <View style={styles.distanceBadge}>
              <Ionicons name="navigate-outline" size={11} color="#6c63ff" />
              <Text style={styles.distanceText}>{distance}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  image:    { width: '100%', height: 160 },
  info:     { padding: 12 },
  name:     { fontSize: 15, fontWeight: '700', color: '#1a1a1a' },
  category: { fontSize: 12, color: '#6c63ff', marginTop: 2, fontWeight: '500' },

  meta:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 },
  metaLeft: { flexDirection: 'row', alignItems: 'center', gap: 3, flex: 1, flexWrap: 'wrap' },

  rating:   { fontSize: 12, fontWeight: '600', color: '#333' },
  reviews:  { fontSize: 11, color: '#aaa' },
  noRating: { fontSize: 11, color: '#bbb' },

  dot:      { fontSize: 11, color: '#ccc', marginHorizontal: 1 },
  location: { fontSize: 11, color: '#aaa' },

  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#f0eeff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    marginLeft: 8,
  },
  distanceText: { fontSize: 11, color: '#6c63ff', fontWeight: '600' },
});

import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Place } from '../types';
import { formatRating, formatCount } from '../utils/formatters';
import { OptimizedImage } from './OptimizedImage';

interface Props {
  place: Place;
  onPress: (placeId: string) => void;
}

export const PlaceCard = memo(function PlaceCard({ place, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(place.id)} activeOpacity={0.85}>
      {/* Phase 8.1: OptimizedImage replaces plain Image */}
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
        <Text style={styles.category}>{place.categoryName}</Text>
        <View style={styles.meta}>
          <Ionicons name="location-outline" size={12} color="#888" />
          <Text style={styles.city}>{place.city}</Text>
          <Ionicons name="star" size={12} color="#f39c12" style={styles.starIcon} />
          <Text style={styles.rating}>{formatRating(place.averageRating)}</Text>
          <Text style={styles.reviews}>({formatCount(place.reviewCount)})</Text>
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
  image: { width: '100%', height: 160 },
  info: { padding: 12 },
  name: { fontSize: 15, fontWeight: '700', color: '#1a1a1a' },
  category: { fontSize: 12, color: '#6c63ff', marginTop: 2, fontWeight: '500' },
  meta: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 3 },
  city: { fontSize: 12, color: '#888', marginRight: 8 },
  starIcon: { marginLeft: 4 },
  rating: { fontSize: 12, fontWeight: '600', color: '#333' },
  reviews: { fontSize: 11, color: '#aaa', marginLeft: 2 },
});

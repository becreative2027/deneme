import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { FeedStackParamList, SearchStackParamList } from '../../types';
import { usePlaceDetail } from '../../hooks/usePlaces';
import { ErrorState } from '../../components/ErrorState';
import { formatRating, formatCount } from '../../utils/formatters';

type Props = NativeStackScreenProps<FeedStackParamList | SearchStackParamList, 'PlaceDetail'>;

export function PlaceDetailScreen({ route }: Props) {
  const { placeId } = route.params;
  const { data: place, isLoading, isError, refetch } = usePlaceDetail(placeId);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#6c63ff" size="large" />
      </View>
    );
  }

  if (isError || !place) {
    return <ErrorState message="Could not load place details." onRetry={refetch} />;
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {place.imageUrl ? (
        <Image source={{ uri: place.imageUrl }} style={styles.heroImage} resizeMode="cover" />
      ) : (
        <View style={[styles.heroImage, styles.heroPlaceholder]}>
          <Ionicons name="image-outline" size={48} color="#ccc" />
        </View>
      )}

      <View style={styles.body}>
        {/* Header */}
        <Text style={styles.name}>{place.name}</Text>
        <Text style={styles.category}>{place.categoryName}</Text>

        {/* Rating row */}
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={16} color="#f39c12" />
          <Text style={styles.rating}>{formatRating(place.averageRating)}</Text>
          <Text style={styles.reviewCount}>({formatCount(place.reviewCount)} reviews)</Text>
        </View>

        {/* Location */}
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={15} color="#888" />
          <Text style={styles.location}>
            {place.address}, {place.city}, {place.country}
          </Text>
        </View>

        {/* Description */}
        {place.description ? (
          <Text style={styles.description}>{place.description}</Text>
        ) : null}

        {/* Labels */}
        {place.labels.length > 0 && (
          <View style={styles.labelsRow}>
            {place.labels.map((label) => (
              <View key={label} style={styles.label}>
                <Text style={styles.labelText}>{label}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Trend score */}
        {place.trendScore !== undefined && (
          <View style={styles.trendRow}>
            <Ionicons name="trending-up-outline" size={15} color="#6c63ff" />
            <Text style={styles.trendText}>Trending score: {place.trendScore.toFixed(2)}</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  heroImage: { width: '100%', height: 280, backgroundColor: '#f0f0f0' },
  heroPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  body: { padding: 20 },
  name: { fontSize: 24, fontWeight: '800', color: '#1a1a1a' },
  category: { fontSize: 14, color: '#6c63ff', fontWeight: '600', marginTop: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 5 },
  rating: { fontSize: 15, fontWeight: '700', color: '#333' },
  reviewCount: { fontSize: 13, color: '#888' },
  locationRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 10, gap: 5 },
  location: { flex: 1, fontSize: 14, color: '#555', lineHeight: 20 },
  description: { fontSize: 15, color: '#444', lineHeight: 22, marginTop: 16 },
  labelsRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 16, gap: 8 },
  label: {
    backgroundColor: '#f0eeff',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  labelText: { fontSize: 12, color: '#6c63ff', fontWeight: '600' },
  trendRow: { flexDirection: 'row', alignItems: 'center', marginTop: 14, gap: 5 },
  trendText: { fontSize: 13, color: '#6c63ff' },
});

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { SearchStackParamList, Place } from '../../types';
import { usePlaceSearch, useRecommendations } from '../../hooks/usePlaces';
import { PlaceCard } from '../../components/PlaceCard';
import { PlaceSkeleton } from '../../components/SkeletonLoader';
import { ErrorState } from '../../components/ErrorState';
import { EmptyState } from '../../components/EmptyState';
import { useAnalytics } from '../../hooks/useAnalytics';

type Props = { navigation: NativeStackNavigationProp<SearchStackParamList, 'Search'> };

export function SearchScreen({ navigation }: Props) {
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState('');
  const { trackScreen, trackEvent } = useAnalytics();

  useEffect(() => { trackScreen('SearchScreen'); }, []);

  const searchQuery = usePlaceSearch({ query: submitted, pageSize: 20 }, !!submitted);
  const recsQuery = useRecommendations(10);

  const handleSubmit = useCallback(() => {
    const trimmed = query.trim();
    if (trimmed) trackEvent('search_query', { query: trimmed });
    setSubmitted(trimmed);
  }, [query, trackEvent]);

  const handleClear = useCallback(() => {
    setQuery('');
    setSubmitted('');
  }, []);

  const navigateToDetail = useCallback(
    (placeId: string) => {
      navigation.push('PlaceDetail', { placeId });
      trackEvent('place_open', { placeId, source: 'search' });
    },
    [navigation, trackEvent],
  );

  const isSearching = !!submitted;
  const activeQuery = isSearching ? searchQuery : recsQuery;
  const places: Place[] = isSearching
    ? (searchQuery.data?.items ?? [])
    : (recsQuery.data?.recommendations.map((r) => r.place) ?? []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Search bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color="#aaa" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search places…"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSubmit}
          returnKeyType="search"
          placeholderTextColor="#aaa"
          autoCorrect={false}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={handleClear}>
            <Ionicons name="close-circle" size={18} color="#aaa" />
          </TouchableOpacity>
        )}
      </View>

      {/* Section label */}
      <Text style={styles.sectionLabel}>
        {isSearching ? `Results for "${submitted}"` : 'Recommended for you'}
      </Text>

      {activeQuery.isLoading ? (
        <View style={styles.list}>
          {[0, 1, 2].map((i) => <PlaceSkeleton key={i} />)}
        </View>
      ) : activeQuery.isError ? (
        <ErrorState onRetry={() => activeQuery.refetch()} />
      ) : (
        <FlatList
          data={places}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <PlaceCard place={item} onPress={navigateToDetail} />}
          contentContainerStyle={[styles.list, places.length === 0 && { flex: 1 }]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              icon="search-outline"
              title="No places found"
              subtitle={isSearching ? 'Try a different search term.' : 'No recommendations available.'}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#e8e8e8',
    height: 44,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 15, color: '#333' },
  sectionLabel: {
    fontSize: 13,
    color: '#aaa',
    fontWeight: '600',
    paddingHorizontal: 18,
    paddingVertical: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  list: { paddingHorizontal: 16, paddingBottom: 20 },
});

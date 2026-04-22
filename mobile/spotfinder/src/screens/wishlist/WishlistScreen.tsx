import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Share,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useWishlistStore } from '../../store/wishlistStore';
import { getPlaceById } from '../../api/places';
import { Place, WishlistStackParamList } from '../../types';

type Props = NativeStackScreenProps<WishlistStackParamList, 'Wishlist'>;

const PRIMARY = '#6c63ff';

const GRADIENTS = [
  ['#a78bfa', '#818cf8'],
  ['#60a5fa', '#22d3ee'],
  ['#4ade80', '#2dd4bf'],
  ['#fb923c', '#fbbf24'],
  ['#f472b6', '#fb7185'],
];

function placeGradientIndex(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = id.charCodeAt(i) + ((h << 5) - h);
  return Math.abs(h) % GRADIENTS.length;
}

function formatRating(n: number): string {
  return n ? n.toFixed(1) : '–';
}

function WishlistCard({
  place,
  onRemove,
  onPress,
}: {
  place: Place;
  onRemove?: () => void;
  onPress: () => void;
}) {
  const [imgError, setImgError] = useState(false);
  const gi = placeGradientIndex(place.id);
  const [c1, c2] = GRADIENTS[gi];

  return (
    <View style={s.card}>
      {/* Thumbnail */}
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        {place.imageUrl && !imgError ? (
          <Image
            source={{ uri: place.imageUrl }}
            style={s.thumb}
            onError={() => setImgError(true)}
          />
        ) : (
          <View style={[s.thumb, s.thumbFallback, { backgroundColor: c1 }]}>
            <Ionicons name="storefront-outline" size={20} color="rgba(255,255,255,0.8)" />
          </View>
        )}
      </TouchableOpacity>

      {/* Info */}
      <TouchableOpacity style={s.cardInfo} onPress={onPress} activeOpacity={0.7}>
        <Text style={s.cardName} numberOfLines={1}>{place.name}</Text>
        <Text style={s.cardCategory}>{place.categoryName}</Text>
        <View style={s.cardMeta}>
          <Ionicons name="location-outline" size={11} color="#aaa" />
          <Text style={s.cardCity} numberOfLines={1}>{place.city}</Text>
          {place.averageRating > 0 && (
            <>
              <Ionicons name="star" size={11} color="#f59e0b" style={{ marginLeft: 4 }} />
              <Text style={s.cardRating}>{formatRating(place.averageRating)}</Text>
            </>
          )}
        </View>
      </TouchableOpacity>

      {/* Remove */}
      {onRemove && (
        <TouchableOpacity onPress={onRemove} style={s.removeBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="close" size={18} color="#ccc" />
        </TouchableOpacity>
      )}
    </View>
  );
}

export function WishlistScreen({ navigation }: Props) {
  const { placeIds, removePlace, clearAll, hydrated, hydrate } = useWishlistStore();
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!hydrated) hydrate();
  }, []);

  const fetchPlaces = useCallback(async (ids: string[]) => {
    if (ids.length === 0) { setPlaces([]); return; }
    setLoading(true);
    try {
      const results = await Promise.allSettled(ids.map((id) => getPlaceById(id)));
      setPlaces(
        results
          .filter((r): r is PromiseFulfilledResult<Place> => r.status === 'fulfilled')
          .map((r) => r.value),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (hydrated) fetchPlaces(placeIds);
  }, [hydrated, placeIds.join(',')]);

  const handleShare = async () => {
    try {
      const placeList = places.map((p) => `• ${p.name} (${p.city})`).join('\n');
      await Share.share({
        message: `SpotFinder Listemi:\n\n${placeList}`,
        title: 'SpotFinder Listesi',
      });
    } catch {}
  };

  const handleClearAll = () => {
    Alert.alert(
      'Listeyi Temizle',
      'Tüm mekanları listeden kaldırmak istediğine emin misin?',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Temizle', style: 'destructive', onPress: clearAll },
      ],
    );
  };

  const isEmpty = !loading && places.length === 0;

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <Ionicons name="bookmark" size={20} color={PRIMARY} />
          <Text style={s.headerTitle}>Liste</Text>
          {places.length > 0 && (
            <Text style={s.headerCount}>{places.length} mekan</Text>
          )}
        </View>
        {placeIds.length > 0 && (
          <View style={s.headerActions}>
            <TouchableOpacity onPress={handleShare} style={s.headerBtn}>
              <Ionicons name="share-outline" size={22} color="#555" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleClearAll} style={s.headerBtn}>
              <Ionicons name="trash-outline" size={20} color="#aaa" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Body */}
      {loading ? (
        <View style={s.centered}>
          <ActivityIndicator color={PRIMARY} size="large" />
        </View>
      ) : isEmpty ? (
        <View style={s.emptyWrap}>
          <View style={s.emptyIcon}>
            <Ionicons name="bookmark-outline" size={28} color={PRIMARY} />
          </View>
          <Text style={s.emptyTitle}>Henüz liste boş</Text>
          <Text style={s.emptyHint}>
            Mekan detayında yer işareti butonuna basarak listeye ekle
          </Text>
        </View>
      ) : (
        <FlatList
          data={places}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <WishlistCard
              place={item}
              onRemove={() => removePlace(item.id)}
              onPress={() => navigation.push('PlaceDetail', { placeId: item.id })}
            />
          )}
          contentContainerStyle={s.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#f8f8f8' },
  centered:     { flex: 1, alignItems: 'center', justifyContent: 'center' },

  // Header
  header:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#e5e5e5' },
  headerLeft:   { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle:  { fontSize: 18, fontWeight: '800', color: '#111' },
  headerCount:  { fontSize: 13, color: '#aaa', fontWeight: '500' },
  headerActions:{ flexDirection: 'row', alignItems: 'center', gap: 4 },
  headerBtn:    { padding: 6 },

  // List
  listContent:  { padding: 16, gap: 0 },

  // Card
  card:         { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.07, shadowRadius: 4, elevation: 2 },
  thumb:        { width: 64, height: 64, borderRadius: 10 },
  thumbFallback:{ alignItems: 'center', justifyContent: 'center' },
  cardInfo:     { flex: 1, marginLeft: 12 },
  cardName:     { fontSize: 14, fontWeight: '700', color: '#111' },
  cardCategory: { fontSize: 12, color: PRIMARY, fontWeight: '500', marginTop: 2 },
  cardMeta:     { flexDirection: 'row', alignItems: 'center', marginTop: 5, gap: 3 },
  cardCity:     { fontSize: 12, color: '#888', flex: 1 },
  cardRating:   { fontSize: 12, fontWeight: '600', color: '#333' },
  removeBtn:    { padding: 4 },

  // Empty
  emptyWrap:    { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  emptyIcon:    { width: 64, height: 64, borderRadius: 32, backgroundColor: `${PRIMARY}1a`, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  emptyTitle:   { fontSize: 16, fontWeight: '800', color: '#111', marginBottom: 8 },
  emptyHint:    { fontSize: 14, color: '#888', textAlign: 'center', lineHeight: 20 },
});

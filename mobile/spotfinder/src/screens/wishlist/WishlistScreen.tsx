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
import { useTheme } from '../../theme';

type Props = NativeStackScreenProps<WishlistStackParamList, 'Wishlist'>;

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
  const { colors } = useTheme();
  const [imgError, setImgError] = useState(false);
  const gi = placeGradientIndex(place.id);
  const [c1] = GRADIENTS[gi];

  return (
    <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
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
        <Text style={[s.cardName, { color: colors.text }]} numberOfLines={1}>{place.name}</Text>
        <Text style={[s.cardCategory, { color: colors.accent }]}>{place.categoryName}</Text>
        <View style={s.cardMeta}>
          <Ionicons name="location-outline" size={11} color={colors.textTertiary} />
          <Text style={[s.cardCity, { color: colors.textTertiary }]} numberOfLines={1}>{place.city}</Text>
          {place.averageRating > 0 && (
            <>
              <Ionicons name="star" size={11} color={colors.accent} style={{ marginLeft: 4 }} />
              <Text style={[s.cardRating, { color: colors.textSecondary }]}>{formatRating(place.averageRating)}</Text>
            </>
          )}
        </View>
      </TouchableOpacity>

      {/* Remove */}
      {onRemove && (
        <TouchableOpacity onPress={onRemove} style={[s.removeBtn, { backgroundColor: colors.glassBg, borderColor: colors.glassBorder }]} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="close" size={16} color={colors.textTertiary} />
        </TouchableOpacity>
      )}
    </View>
  );
}

export function WishlistScreen({ navigation }: Props) {
  const { colors } = useTheme();
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
      const placeLines = places.map((p) => {
        const rating = p.averageRating ? `⭐ ${p.averageRating.toFixed(1)}` : '';
        const location = [p.districtName, p.city].filter(Boolean).join(', ');
        const tags = (p.labels ?? []).slice(0, 2).map((l) => `#${l}`).join(' ');
        return [`📍 ${p.name}`, location, rating, tags].filter(Boolean).join('  ·  ');
      }).join('\n');

      const count = places.length;
      const intro = count === 1
        ? `Sana harika bir mekan önerdim 👀`
        : `Sana ${count} harika mekan önerdim 👀`;

      const message = [
        intro,
        '',
        placeLines,
        '',
        '— SpotFinder ile keşfedildi 🔍',
        'sptfinder.com',
      ].join('\n');

      await Share.share({ message, title: 'SpotFinder Mekan Listesi' });
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
    <SafeAreaView style={[s.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[s.header, { backgroundColor: colors.background, borderBottomColor: colors.borderLight }]}>
        <View style={s.headerLeft}>
          <View style={[s.headerIconWrap, { backgroundColor: colors.accentSoft }]}>
            <Ionicons name="bookmark" size={16} color={colors.accent} />
          </View>
          <Text style={[s.headerTitle, { color: colors.text }]}>Liste</Text>
          {places.length > 0 && (
            <View style={[s.countBadge, { backgroundColor: colors.accentSoft }]}>
              <Text style={[s.countBadgeText, { color: colors.accent }]}>{places.length}</Text>
            </View>
          )}
        </View>
        {placeIds.length > 0 && (
          <View style={s.headerActions}>
            <TouchableOpacity
              onPress={handleShare}
              style={[s.headerBtn, { backgroundColor: colors.glassBg, borderColor: colors.glassBorder }]}
            >
              <Ionicons name="share-outline" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleClearAll}
              style={[s.headerBtn, { backgroundColor: colors.glassBg, borderColor: colors.glassBorder }]}
            >
              <Ionicons name="trash-outline" size={17} color={colors.textTertiary} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Body */}
      {loading ? (
        <View style={s.centered}>
          <ActivityIndicator color={colors.accent} size="large" />
        </View>
      ) : isEmpty ? (
        <View style={s.emptyWrap}>
          <View style={[s.emptyIcon, { backgroundColor: colors.accentSoft }]}>
            <Ionicons name="bookmark-outline" size={28} color={colors.accent} />
          </View>
          <Text style={[s.emptyTitle, { color: colors.text }]}>Henüz liste boş</Text>
          <Text style={[s.emptyHint, { color: colors.textTertiary }]}>
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
  container:      { flex: 1 },
  centered:       { flex: 1, alignItems: 'center', justifyContent: 'center' },

  // Header
  header:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  headerLeft:     { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerIconWrap: { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  headerTitle:    { fontSize: 18, fontWeight: '800' },
  countBadge:     { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  countBadgeText: { fontSize: 12, fontWeight: '700' },
  headerActions:  { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerBtn:      { width: 36, height: 36, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },

  // List
  listContent:    { padding: 16, gap: 0 },

  // Card
  card:           { flexDirection: 'row', alignItems: 'center', borderRadius: 14, padding: 12, marginBottom: 10, borderWidth: StyleSheet.hairlineWidth },
  thumb:          { width: 64, height: 64, borderRadius: 10 },
  thumbFallback:  { alignItems: 'center', justifyContent: 'center' },
  cardInfo:       { flex: 1, marginLeft: 12 },
  cardName:       { fontSize: 14, fontWeight: '700' },
  cardCategory:   { fontSize: 12, fontWeight: '600', marginTop: 2 },
  cardMeta:       { flexDirection: 'row', alignItems: 'center', marginTop: 5, gap: 3 },
  cardCity:       { fontSize: 12, flex: 1 },
  cardRating:     { fontSize: 12, fontWeight: '600' },
  removeBtn:      { width: 30, height: 30, borderRadius: 8, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },

  // Empty
  emptyWrap:      { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  emptyIcon:      { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  emptyTitle:     { fontSize: 16, fontWeight: '800', marginBottom: 8 },
  emptyHint:      { fontSize: 14, textAlign: 'center', lineHeight: 20 },
});

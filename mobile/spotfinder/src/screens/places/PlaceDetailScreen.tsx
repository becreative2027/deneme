import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FeedStackParamList, SearchStackParamList, ProfileStackParamList } from '../../types';
import { usePlaceDetail, usePlacePosts } from '../../hooks/usePlaces';
import { OptimizedImage } from '../../components/OptimizedImage';
import { ErrorState } from '../../components/ErrorState';
import { PhotoLightboxModal } from '../../components/PhotoLightboxModal';
import { ReviewsModal } from '../../components/ReviewsModal';
import { formatRating, formatCount } from '../../utils/formatters';
import { Post } from '../../types';
import { getFavoritePlaceIds, addFavorite, removeFavorite } from '../../api/favorites';
import { trackPlaceView } from '../../api/places';
import { useAuthStore } from '../../store/authStore';
import { useWishlistStore } from '../../store/wishlistStore';
import { WishlistStackParamList } from '../../types';

type Props =
  | NativeStackScreenProps<FeedStackParamList, 'PlaceDetail'>
  | NativeStackScreenProps<SearchStackParamList, 'PlaceDetail'>
  | NativeStackScreenProps<ProfileStackParamList, 'PlaceDetail'>
  | NativeStackScreenProps<WishlistStackParamList, 'PlaceDetail'>;

const { width } = Dimensions.get('window');
const PHOTO_SIZE = (width - 2) / 3;

const PRIMARY = '#6c63ff';

function parkingLabel(status: string): { text: string; color: string } {
  switch (status.toLowerCase()) {
    case 'available':
    case 'free':      return { text: 'Otopark mevcut',   color: '#16a34a' };
    case 'valet':     return { text: 'Vale park',        color: '#2563eb' };
    case 'paid':      return { text: 'Ücretli otopark',  color: '#d97706' };
    case 'limited':   return { text: 'Sınırlı otopark',  color: '#f59e0b' };
    case 'unavailable':
    case 'none':      return { text: 'Otopark yok',      color: '#ef4444' };
    default:          return { text: status,             color: '#888'    };
  }
}

export function PlaceDetailScreen({ route, navigation }: Props) {
  const { placeId } = route.params;
  const { data: place, isLoading, isError, refetch } = usePlaceDetail(placeId);
  const postsQuery = usePlacePosts(placeId);
  const qc = useQueryClient();
  const currentUser = useAuthStore(s => s.user);

  // Track place view for personalization — fire-and-forget
  React.useEffect(() => {
    if (currentUser?.id) {
      trackPlaceView(placeId, currentUser.id);
    }
  }, [placeId, currentUser?.id]);

  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxVisible, setLightboxVisible] = useState(false);
  const [reviewsVisible, setReviewsVisible] = useState(false);

  // ── Wishlist ───────────────────────────────────────────────────────────────
  const { togglePlace, hasPlace, hydrated, hydrate } = useWishlistStore();
  const isWishlisted = hasPlace(placeId);
  React.useEffect(() => { if (!hydrated) hydrate(); }, [hydrated]);

  const allPosts: Post[] = postsQuery.data?.pages.flatMap((p) => p.items) ?? [];
  const photoPosts = allPosts.filter((p) => p.imageUrl);

  // ── Favorites ──────────────────────────────────────────────────────────────
  const favQuery = useQuery({
    queryKey: ['favorites'],
    queryFn: getFavoritePlaceIds,
    staleTime: 1000 * 60 * 5,
  });
  const isFavorited = favQuery.data?.includes(placeId) ?? false;

  const favMutation = useMutation({
    mutationFn: () => isFavorited ? removeFavorite(placeId) : addFavorite(placeId),
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: ['favorites'] });
      const prev = qc.getQueryData<string[]>(['favorites']) ?? [];
      const next = isFavorited
        ? prev.filter((id) => id !== placeId)
        : [...prev, placeId];
      qc.setQueryData(['favorites'], next);
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(['favorites'], ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  // ── Navigation helpers ─────────────────────────────────────────────────────
  const openMaps = useCallback(() => {
    if (!place?.latitude || !place?.longitude) return;
    const url = `https://maps.google.com/?q=${place.latitude},${place.longitude}`;
    Linking.openURL(url).catch(() => {});
  }, [place]);

  const openMenu = useCallback(() => {
    if (!place?.menuUrl) return;
    Linking.openURL(place.menuUrl).catch(() => {});
  }, [place]);

  const openPhoto = useCallback((index: number) => {
    setLightboxIndex(index);
    setLightboxVisible(true);
  }, []);

  const goToUser = useCallback((userId: string) => {
    (navigation as any).navigate('UserProfile', { userId });
  }, [navigation]);

  if (isLoading) {
    return (
      <View style={s.centered}>
        <ActivityIndicator color={PRIMARY} size="large" />
      </View>
    );
  }

  if (isError || !place) {
    return <ErrorState message="Mekan yüklenemedi." onRetry={refetch} />;
  }

  const parking = place.parkingStatus ? parkingLabel(place.parkingStatus) : null;
  const hasMenu = !!(place.menuUrl || (place.menuImageUrls && place.menuImageUrls.length > 0));
  const locationParts = [place.districtName, place.city, place.country].filter(Boolean);

  return (
    <>
      <ScrollView style={s.container} showsVerticalScrollIndicator={false}>
        {/* ── Hero image ────────────────────────────────────────────────────── */}
        <View style={s.hero}>
          {place.imageUrl ? (
            <OptimizedImage uri={place.imageUrl} style={s.heroImage} resizeMode="cover" />
          ) : (
            <View style={[s.heroImage, s.heroPlaceholder]}>
              <Ionicons name="storefront-outline" size={56} color="#fff" />
            </View>
          )}
          {/* Back button */}
          <TouchableOpacity
            style={s.backBtn}
            onPress={() => (navigation as any).goBack()}
            activeOpacity={0.8}
          >
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </TouchableOpacity>
          {/* Favorite button */}
          <TouchableOpacity
            style={s.favBtn}
            onPress={() => favMutation.mutate()}
            activeOpacity={0.8}
            disabled={favMutation.isPending}
          >
            <Ionicons
              name={isFavorited ? 'heart' : 'heart-outline'}
              size={20}
              color={isFavorited ? '#ef4444' : '#fff'}
            />
          </TouchableOpacity>
          {/* Wishlist (bookmark) button */}
          <TouchableOpacity
            style={s.bookmarkBtn}
            onPress={() => togglePlace(placeId)}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isWishlisted ? 'bookmark' : 'bookmark-outline'}
              size={20}
              color={isWishlisted ? '#6c63ff' : '#fff'}
            />
          </TouchableOpacity>
        </View>

        {/* ── Body ──────────────────────────────────────────────────────────── */}
        <View style={s.body}>

          {/* Name & category */}
          <Text style={s.name}>{place.name}</Text>
          {place.categoryName ? (
            <Text style={s.category}>{place.categoryName}</Text>
          ) : null}

          {/* Rating row — tappable to open reviews */}
          <TouchableOpacity
            style={s.ratingRow}
            onPress={() => setReviewsVisible(true)}
            activeOpacity={0.7}
          >
            {place.averageRating > 0 ? (
              <>
                <Ionicons name="star" size={16} color="#f59e0b" />
                <Text style={s.ratingValue}>{formatRating(place.averageRating)}</Text>
                <Text style={s.ratingCount}>({formatCount(place.reviewCount)} değerlendirme)</Text>
              </>
            ) : (
              <Text style={s.ratingCount}>Henüz değerlendirme yok</Text>
            )}
            {photoPosts.length > 0 && (
              <View style={s.photoCountBadge}>
                <Ionicons name="images-outline" size={13} color="#888" />
                <Text style={s.photoCountText}>{photoPosts.length} fotoğraf</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Location + Maps link */}
          {locationParts.length > 0 && (
            <TouchableOpacity style={s.locationRow} onPress={openMaps} activeOpacity={0.7}>
              <Ionicons name="location-outline" size={15} color="#888" />
              <Text style={s.locationText}>{locationParts.join(', ')}</Text>
              {place.latitude && (
                <View style={s.mapsBtn}>
                  <Ionicons name="navigate-outline" size={11} color={PRIMARY} />
                  <Text style={s.mapsBtnText}>Haritada Aç</Text>
                </View>
              )}
            </TouchableOpacity>
          )}

          {/* Description */}
          {place.description ? (
            <Text style={s.description}>{place.description}</Text>
          ) : null}

          {/* Labels */}
          {place.labels.length > 0 && (
            <View style={s.section}>
              <View style={s.sectionHeader}>
                <Ionicons name="pricetag-outline" size={14} color="#888" />
                <Text style={s.sectionTitle}>ETİKETLER</Text>
              </View>
              <View style={s.labelsWrap}>
                {place.labels.map((label) => (
                  <View key={label} style={s.labelChip}>
                    <Text style={s.labelChipText}>{label}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Parking + Menu */}
          {(parking || hasMenu) && (
            <View style={s.section}>
              {parking && (
                <View style={s.infoRow}>
                  <View style={s.infoIcon}>
                    <Ionicons name="car-outline" size={16} color="#888" />
                  </View>
                  <Text style={[s.infoText, { color: parking.color }]}>{parking.text}</Text>
                </View>
              )}
              {place.menuUrl && (
                <TouchableOpacity style={s.infoRow} onPress={openMenu} activeOpacity={0.7}>
                  <View style={s.infoIcon}>
                    <Ionicons name="restaurant-outline" size={16} color="#888" />
                  </View>
                  <Text style={[s.infoText, { color: PRIMARY }]}>Menüyü görüntüle</Text>
                  <Ionicons name="open-outline" size={13} color={PRIMARY} style={{ marginLeft: 4 }} />
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Trend score */}
          {typeof place.trendScore === 'number' && (
            <View style={s.trendRow}>
              <Ionicons name="trending-up-outline" size={14} color={PRIMARY} />
              <Text style={s.trendText}>Trend skoru: {place.trendScore.toFixed(2)}</Text>
            </View>
          )}
        </View>

        {/* ── Photo grid ────────────────────────────────────────────────────── */}
        {photoPosts.length > 0 && (
          <View style={s.photosSection}>
            <View style={[s.sectionHeader, { paddingHorizontal: 16, marginBottom: 8 }]}>
              <Ionicons name="images-outline" size={14} color="#888" />
              <Text style={s.sectionTitle}>FOTOĞRAFLAR</Text>
            </View>
            <View style={s.photoGrid}>
              {photoPosts.map((post, index) => (
                <TouchableOpacity
                  key={post.id}
                  onPress={() => openPhoto(index)}
                  activeOpacity={0.85}
                >
                  <OptimizedImage
                    uri={post.imageUrl}
                    style={s.photoThumb}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              ))}
            </View>
            {postsQuery.hasNextPage && (
              <TouchableOpacity
                style={s.loadMoreBtn}
                onPress={() => postsQuery.fetchNextPage()}
                disabled={postsQuery.isFetchingNextPage}
              >
                {postsQuery.isFetchingNextPage
                  ? <ActivityIndicator size="small" color={PRIMARY} />
                  : <Text style={s.loadMoreText}>Daha fazla yükle</Text>
                }
              </TouchableOpacity>
            )}
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* ── Reviews modal ─────────────────────────────────────────────────────── */}
      <ReviewsModal
        placeId={placeId}
        visible={reviewsVisible}
        onClose={() => setReviewsVisible(false)}
      />

      {/* ── Photo lightbox ────────────────────────────────────────────────────── */}
      <PhotoLightboxModal
        posts={photoPosts}
        initialIndex={lightboxIndex}
        visible={lightboxVisible}
        onClose={() => setLightboxVisible(false)}
        onGoToUser={goToUser}
        onGoToPlace={(pid) => {
          // Navigate to same place — just close the modal
          if (pid !== placeId) {
            (navigation as any).push('PlaceDetail', { placeId: pid });
          }
        }}
      />
    </>
  );
}

const s = StyleSheet.create({
  container:     { flex: 1, backgroundColor: '#fff' },
  centered:      { flex: 1, alignItems: 'center', justifyContent: 'center' },

  // Hero
  hero:          { position: 'relative', width: '100%', height: 280, backgroundColor: '#ddd' },
  heroImage:     { width: '100%', height: 280 },
  heroPlaceholder: {
    backgroundColor: '#6c63ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtn: {
    position: 'absolute',
    top: 52,
    left: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  favBtn: {
    position: 'absolute',
    top: 52,
    right: 60,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookmarkBtn: {
    position: 'absolute',
    top: 52,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Body
  body:          { padding: 20 },
  name:          { fontSize: 24, fontWeight: '800', color: '#111', lineHeight: 30 },
  category:      { fontSize: 14, color: PRIMARY, fontWeight: '600', marginTop: 4 },

  ratingRow:     { flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 5, flexWrap: 'wrap' },
  ratingValue:   { fontSize: 15, fontWeight: '700', color: '#333' },
  ratingCount:   { fontSize: 13, color: '#888' },
  photoCountBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, marginLeft: 8 },
  photoCountText: { fontSize: 12, color: '#888' },

  locationRow:   { flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 5, flexWrap: 'wrap' },
  locationText:  { flex: 1, fontSize: 14, color: '#555', lineHeight: 20 },
  mapsBtn:       { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#f0eeff', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  mapsBtnText:   { fontSize: 11, color: PRIMARY, fontWeight: '600' },

  description:   { fontSize: 15, color: '#444', lineHeight: 22, marginTop: 14 },

  section:       { marginTop: 20, paddingTop: 20, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#eee' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 10 },
  sectionTitle:  { fontSize: 11, fontWeight: '700', color: '#aaa', letterSpacing: 0.8 },

  labelsWrap:    { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  labelChip:     { backgroundColor: '#f0eeff', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 },
  labelChipText: { fontSize: 12, color: PRIMARY, fontWeight: '600' },

  infoRow:       { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 10 },
  infoIcon:      { width: 32, height: 32, borderRadius: 16, backgroundColor: '#f5f5f5', alignItems: 'center', justifyContent: 'center' },
  infoText:      { fontSize: 14, fontWeight: '500' },

  trendRow:      { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 16, paddingTop: 16, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#eee' },
  trendText:     { fontSize: 13, color: PRIMARY },

  // Photos
  photosSection: { marginTop: 8 },
  photoGrid:     { flexDirection: 'row', flexWrap: 'wrap' },
  photoThumb:    { width: PHOTO_SIZE, height: PHOTO_SIZE, margin: 0.5 },

  loadMoreBtn:   { alignItems: 'center', paddingVertical: 12 },
  loadMoreText:  { fontSize: 13, color: PRIMARY, fontWeight: '600' },
});

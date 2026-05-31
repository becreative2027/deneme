import React, { useCallback, useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  Dimensions,
  AppState,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FeedStackParamList, SearchStackParamList, ProfileStackParamList } from '../../types';
import { usePlaceDetail, usePlacePosts } from '../../hooks/usePlaces';
import { OptimizedImage } from '../../components/OptimizedImage';
import { ErrorState } from '../../components/ErrorState';
import { PhotoLightboxModal } from '../../components/PhotoLightboxModal';
import { ReviewsModal } from '../../components/ReviewsModal';
import { NearbyParkingModal } from '../../components/NearbyParkingModal';
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
const PHOTO_SIZE = (width - 3) / 3;

const PRIMARY = '#6c63ff';

// parkingLabel is now a hook-based function defined inside the component

const TAB_BAR_HEIGHT = 56;

export function PlaceDetailScreen({ route, navigation }: Props) {
  const { t } = useTranslation();

  function parkingLabel(status: string): { text: string; color: string } {
    switch (status.toLowerCase()) {
      case 'available':
      case 'free':      return { text: t('places.detail.parking.available'), color: '#16a34a' };
      case 'valet':     return { text: t('places.detail.parking.valet'),     color: '#2563eb' };
      case 'paid':      return { text: t('places.detail.parking.paid'),      color: '#d97706' };
      case 'limited':   return { text: t('places.detail.parking.limited'),   color: '#f59e0b' };
      case 'unavailable':
      case 'none':      return { text: t('places.detail.parking.unavailable'), color: '#ef4444' };
      default:          return { text: status,                               color: '#888'    };
    }
  }

  const { placeId } = route.params;
  const insets = useSafeAreaInsets();
  const { data: place, isLoading, isError, refetch } = usePlaceDetail(placeId);
  const postsQuery = usePlacePosts(placeId);
  const qc = useQueryClient();
  const currentUser = useAuthStore(s => s.user);

  // Track place view + duration for analytics.
  // Uses AppState to pause the timer while the app is backgrounded,
  // so only actual foreground time is counted.
  useEffect(() => {
    if (!currentUser?.id) return;

    let activeMs = 0;
    let lastForegroundAt: number | null = Date.now();

    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        // Came back to foreground — resume timer
        lastForegroundAt = Date.now();
      } else if (lastForegroundAt !== null) {
        // Going to background — accumulate elapsed time
        activeMs += Date.now() - lastForegroundAt;
        lastForegroundAt = null;
      }
    });

    return () => {
      sub.remove();
      // Flush remaining foreground time
      if (lastForegroundAt !== null) {
        activeMs += Date.now() - lastForegroundAt;
      }
      const durationSeconds = Math.min(Math.round(activeMs / 1000), 1800);
      trackPlaceView(placeId, currentUser.id, durationSeconds);
    };
  }, [placeId, currentUser?.id]);

  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxVisible, setLightboxVisible] = useState(false);
  const [reviewsVisible, setReviewsVisible] = useState(false);
  const [parkingModalVisible, setParkingModalVisible] = useState(false);

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

  const openNearbyParking = useCallback(() => {
    if (!place?.latitude || !place?.longitude) return;
    setParkingModalVisible(true);
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
    return <ErrorState message={t('places.detail.loadError')} onRetry={refetch} />;
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
            style={[s.backBtn, { top: insets.top + 10 }]}
            onPress={() => (navigation as any).goBack()}
            activeOpacity={0.8}
          >
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </TouchableOpacity>
          {/* Favorite button */}
          <TouchableOpacity
            style={[s.favBtn, { top: insets.top + 10 }]}
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
            style={[s.bookmarkBtn, { top: insets.top + 10 }]}
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
                <Text style={s.ratingCount}>{t('places.detail.ratingCount', { count: formatCount(place.reviewCount) })}</Text>
              </>
            ) : (
              <Text style={s.ratingCount}>{t('places.detail.noRating')}</Text>
            )}
            {photoPosts.length > 0 && (
              <View style={s.photoCountBadge}>
                <Ionicons name="images-outline" size={13} color="#888" />
                <Text style={s.photoCountText}>{t('places.detail.photoCount', { count: photoPosts.length })}</Text>
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
                  <Text style={s.mapsBtnText}>{t('places.detail.openMaps')}</Text>
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
                <Text style={s.sectionTitle}>{t('places.detail.labelsTitle')}</Text>
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
          {(parking || hasMenu || !!(place.latitude && place.longitude)) && (
            <View style={s.section}>
              {parking && (
                <View style={s.infoRow}>
                  <View style={s.infoIcon}>
                    <Ionicons name="car-outline" size={16} color="#888" />
                  </View>
                  <Text style={[s.infoText, { color: parking.color }]}>{parking.text}</Text>
                </View>
              )}
              {!!(place.latitude && place.longitude) && (
                <TouchableOpacity style={s.parkingBtn} onPress={openNearbyParking} activeOpacity={0.8}>
                  <Ionicons name="map-outline" size={15} color="#fff" />
                  <Text style={s.parkingBtnText}>{t('places.detail.nearbyParking')}</Text>
                </TouchableOpacity>
              )}
              {place.menuUrl && (
                <TouchableOpacity style={s.infoRow} onPress={openMenu} activeOpacity={0.7}>
                  <View style={s.infoIcon}>
                    <Ionicons name="restaurant-outline" size={16} color="#888" />
                  </View>
                  <Text style={[s.infoText, { color: PRIMARY }]}>{t('places.detail.viewMenu')}</Text>
                  <Ionicons name="open-outline" size={13} color={PRIMARY} style={{ marginLeft: 4 }} />
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Trend score */}
          {typeof place.trendScore === 'number' && (
            <View style={s.trendRow}>
              <Ionicons name="trending-up-outline" size={14} color={PRIMARY} />
              <Text style={s.trendText}>{t('places.detail.trendScore', { score: place.trendScore.toFixed(2) })}</Text>
            </View>
          )}
        </View>

        {/* ── Photo grid ────────────────────────────────────────────────────── */}
        {photoPosts.length > 0 && (
          <View style={s.photosSection}>
            <View style={[s.sectionHeader, { paddingHorizontal: 16, marginBottom: 8 }]}>
              <Ionicons name="images-outline" size={14} color="#888" />
              <Text style={s.sectionTitle}>{t('places.detail.photosTitle')}</Text>
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
                  : <Text style={s.loadMoreText}>{t('places.detail.loadMore')}</Text>
                }
              </TouchableOpacity>
            )}
          </View>
        )}


        <View style={{ height: TAB_BAR_HEIGHT + insets.bottom + 16 }} />
      </ScrollView>

      {/* ── Reviews modal ─────────────────────────────────────────────────────── */}
      <ReviewsModal
        placeId={placeId}
        visible={reviewsVisible}
        onClose={() => setReviewsVisible(false)}
        onPressUser={(userId) => {
          setReviewsVisible(false);
          (navigation as any).navigate('UserProfile', { userId });
        }}
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

      {/* ── Nearby parking modal ──────────────────────────────────────────────── */}
      {place && (
        <NearbyParkingModal
          visible={parkingModalVisible}
          onClose={() => setParkingModalVisible(false)}
          placeLat={place.latitude!}
          placeLon={place.longitude!}
          placeName={place.name}
        />
      )}
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
  parkingBtn:    { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', backgroundColor: '#6c63ff', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, marginBottom: 12 },
  parkingBtnText: { fontSize: 13, color: '#fff', fontWeight: '600' },

  trendRow:      { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 16, paddingTop: 16, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#eee' },
  trendText:     { fontSize: 13, color: PRIMARY },

  // Photos
  photosSection: { marginTop: 8 },
  photoGrid:     { flexDirection: 'row', flexWrap: 'wrap' },
  photoThumb:    { width: PHOTO_SIZE, height: PHOTO_SIZE, margin: 0.5 },

  loadMoreBtn:   { alignItems: 'center', paddingVertical: 12 },
  loadMoreText:  { fontSize: 13, color: PRIMARY, fontWeight: '600' },

});

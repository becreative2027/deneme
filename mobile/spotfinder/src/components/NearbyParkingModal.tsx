import React, { useEffect, useState, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Linking,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Constants from 'expo-constants';

const PRIMARY = '#6c63ff';

// ── Types ─────────────────────────────────────────────────────────────────────

interface ParkingSpot {
  id: string;
  name: string;
  lat: number;
  lon: number;
  distanceMeters: number;
  drivingMinutes: number;
  vicinity?: string;
  openNow?: boolean;
  rating?: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function haversineMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistance(m: number): string {
  return m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(1)} km`;
}

// Estimate city driving time: avg 25 km/h in urban areas
function estimateDrivingMinutes(meters: number): number {
  return Math.max(1, Math.round((meters / 1000 / 25) * 60));
}

const GOOGLE_MAPS_API_KEY =
  (Constants.expoConfig?.extra?.googleMapsApiKey as string | undefined) ||
  'AIzaSyBXJTEBXIpAADNzMk1AdxI1eErMTic1klQ';

async function fetchNearbyParking(lat: number, lon: number): Promise<ParkingSpot[]> {
  const apiKey = GOOGLE_MAPS_API_KEY;

  const url =
    `https://maps.googleapis.com/maps/api/place/nearbysearch/json` +
    `?location=${lat},${lon}` +
    `&radius=1500` +
    `&type=parking` +
    `&key=${apiKey}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  let resp: Response;
  try {
    resp = await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
  const json = await resp.json();

  if (json.status !== 'OK' && json.status !== 'ZERO_RESULTS') {
    throw new Error(`Places API error: ${json.status}`);
  }

  const spots: ParkingSpot[] = (json.results ?? []).map((place: any) => {
    const plLat = place.geometry.location.lat as number;
    const plLon = place.geometry.location.lng as number;
    const dist  = haversineMeters(lat, lon, plLat, plLon);
    return {
      id:             place.place_id,
      name:           place.name,
      lat:            plLat,
      lon:            plLon,
      distanceMeters: dist,
      drivingMinutes: estimateDrivingMinutes(dist),
      vicinity:       place.vicinity,
      openNow:        place.opening_hours?.open_now,
      rating:         place.rating,
    } satisfies ParkingSpot;
  });

  return spots.sort((a, b) => a.distanceMeters - b.distanceMeters).slice(0, 8);
}

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  visible: boolean;
  onClose: () => void;
  placeLat: number;
  placeLon: number;
  placeName: string;
}

export function NearbyParkingModal({ visible, onClose, placeLat, placeLon, placeName }: Props) {
  const insets = useSafeAreaInsets();
  const [spots, setSpots]   = useState<ParkingSpot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState(false);

  useEffect(() => {
    if (!visible) return;
    let cancelled = false;

    setLoading(true);
    setError(false);
    setSpots([]);

    fetchNearbyParking(placeLat, placeLon)
      .then((data) => {
        if (!cancelled) { setSpots(data); setLoading(false); }
      })
      .catch(() => {
        if (!cancelled) { setError(true); setLoading(false); }
      });

    return () => { cancelled = true; };
  }, [visible, placeLat, placeLon]);

  // Opens turn-by-turn navigation to a specific parking spot.
  // iOS: Apple Maps (maps://) — works without Google Maps installed.
  // Android: Google Maps app, falls back to web.
  const navigateTo = useCallback((spot: ParkingSpot) => {
    if (Platform.OS === 'ios') {
      // Apple Maps — always available on iOS
      Linking.openURL(`maps://?daddr=${spot.lat},${spot.lon}&dirflg=d`).catch(() => {
        // Fallback to web Google Maps in Safari
        Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${spot.lat},${spot.lon}&travelmode=driving`).catch(() => {});
      });
    } else {
      const gmNative = `google.navigation:q=${spot.lat},${spot.lon}`;
      const gmWeb    = `https://www.google.com/maps/dir/?api=1&destination=${spot.lat},${spot.lon}&travelmode=driving`;
      Linking.canOpenURL(gmNative)
        .then((can) => Linking.openURL(can ? gmNative : gmWeb))
        .catch(() => Linking.openURL(gmWeb).catch(() => {}));
    }
  }, []);

  // Opens parking search on the appropriate maps app.
  const openAllInMaps = useCallback(() => {
    if (Platform.OS === 'ios') {
      // Apple Maps nearby parking search
      Linking.openURL(`maps://?q=otopark&near=${placeLat},${placeLon}`).catch(() => {
        Linking.openURL(`https://www.google.com/maps/search/parking/@${placeLat},${placeLon},16z`).catch(() => {});
      });
    } else {
      Linking.openURL(`https://www.google.com/maps/search/parking/@${placeLat},${placeLon},16z`).catch(() => {});
    }
  }, [placeLat, placeLon]);

  const renderSpot = useCallback(
    ({ item, index }: { item: ParkingSpot; index: number }) => (
      <View style={s.spotCard}>
        {/* Rank bubble */}
        <View style={s.spotRank}>
          <Text style={s.spotRankText}>{index + 1}</Text>
        </View>

        {/* Info */}
        <View style={s.spotInfo}>
          <Text style={s.spotName} numberOfLines={1}>{item.name}</Text>
          {!!item.vicinity && (
            <Text style={s.spotVicinity} numberOfLines={1}>{item.vicinity}</Text>
          )}
          <View style={s.spotMeta}>
            {/* Distance */}
            <Ionicons name="navigate-outline" size={11} color="#999" />
            <Text style={s.spotDist}>{formatDistance(item.distanceMeters)}</Text>

            {/* Separator */}
            <Text style={s.metaSep}>·</Text>

            {/* Driving time */}
            <Ionicons name="car-outline" size={11} color="#999" />
            <Text style={s.spotDist}>~{item.drivingMinutes} dk</Text>

            {/* Open/closed badge */}
            {item.openNow === true && (
              <View style={s.badge}>
                <Text style={[s.badgeText, { color: '#16a34a' }]}>Açık</Text>
              </View>
            )}
            {item.openNow === false && (
              <View style={[s.badge, s.badgeClosed]}>
                <Text style={[s.badgeText, { color: '#ef4444' }]}>Kapalı</Text>
              </View>
            )}

            {/* Rating */}
            {!!item.rating && (
              <>
                <Ionicons name="star" size={10} color="#f59e0b" />
                <Text style={s.spotDist}>{item.rating.toFixed(1)}</Text>
              </>
            )}
          </View>
        </View>

        {/* Navigate button */}
        <TouchableOpacity style={s.dirBtn} onPress={() => navigateTo(item)} activeOpacity={0.8}>
          <Ionicons name="navigate" size={13} color="#fff" />
          <Text style={s.dirBtnText}>Git</Text>
        </TouchableOpacity>
      </View>
    ),
    [navigateTo],
  );

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={s.overlay}>
        {/* Dimmed backdrop */}
        <TouchableOpacity style={s.backdrop} onPress={onClose} activeOpacity={1} />

        {/* Bottom sheet */}
        <View style={[s.sheet, { paddingBottom: insets.bottom + 12 }]}>
          {/* Drag handle */}
          <View style={s.handle} />

          {/* Header */}
          <View style={s.header}>
            <View style={s.headerLeft}>
              <View style={s.headerIcon}>
                <Ionicons name="car" size={16} color={PRIMARY} />
              </View>
              <View>
                <Text style={s.headerTitle}>Yakındaki Otoparklar</Text>
                <Text style={s.headerSub} numberOfLines={1}>
                  {placeName}·a en yakın seçenekler
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Ionicons name="close-circle" size={24} color="#ccc" />
            </TouchableOpacity>
          </View>

          {/* ── Loading ── */}
          {loading && (
            <View style={s.centerBox}>
              <ActivityIndicator color={PRIMARY} size="large" />
              <Text style={s.centerText}>Otoparklar aranıyor…</Text>
            </View>
          )}

          {/* ── Error / Empty ── */}
          {!loading && (error || spots.length === 0) && (
            <View style={s.centerBox}>
              <View style={s.emptyIcon}>
                <Ionicons name="car-outline" size={32} color="#bbb" />
              </View>
              <Text style={s.centerText}>
                Bu çevrede otopark bulunamadı.
              </Text>
              <Text style={s.centerSub}>Haritalar uygulaması üzerinden arayabilirsiniz.</Text>
              <TouchableOpacity style={[s.mapsBtn, { marginTop: 20 }]} onPress={openAllInMaps}>
                <Ionicons name="map-outline" size={15} color="#fff" />
                <Text style={s.mapsBtnText}>
                  {Platform.OS === 'ios' ? 'Apple Haritalar\'da Ara' : 'Google Maps\'te Ara'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ── Results ── */}
          {!loading && spots.length > 0 && (
            <>
              <Text style={s.resultCount}>{spots.length} otopark bulundu</Text>
              <FlatList
                data={spots}
                keyExtractor={(item) => item.id}
                renderItem={renderSpot}
                contentContainerStyle={s.listContent}
                showsVerticalScrollIndicator={false}
                style={{ maxHeight: 400 }}
              />
              <View style={s.footer}>
                <TouchableOpacity style={s.mapsBtn} onPress={openAllInMaps} activeOpacity={0.8}>
                  <Ionicons name="map-outline" size={15} color="#fff" />
                  <Text style={s.mapsBtnText}>Tüm Otoparkları Haritada Göster</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  overlay:  { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },

  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 20,
  },

  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: '#e0e0e0', alignSelf: 'center', marginBottom: 14,
  },

  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 20, marginBottom: 4,
  },
  headerLeft:  { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, marginRight: 12 },
  headerIcon:  { width: 36, height: 36, borderRadius: 18, backgroundColor: '#f0eeff', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#111' },
  headerSub:   { fontSize: 12, color: '#999', marginTop: 1 },

  resultCount: { fontSize: 12, color: '#aaa', fontWeight: '600', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 4 },
  listContent: { paddingHorizontal: 16, paddingBottom: 8 },

  spotCard: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 13, gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#f2f2f2',
  },
  spotRank:     { width: 30, height: 30, borderRadius: 15, backgroundColor: '#f0eeff', alignItems: 'center', justifyContent: 'center' },
  spotRankText: { fontSize: 13, fontWeight: '700', color: PRIMARY },
  spotInfo:     { flex: 1 },
  spotName:     { fontSize: 14, fontWeight: '600', color: '#1a1a1a' },
  spotVicinity: { fontSize: 11, color: '#aaa', marginTop: 1 },
  spotMeta:     { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4, flexWrap: 'wrap' },
  spotDist:     { fontSize: 12, color: '#777' },
  metaSep:      { fontSize: 12, color: '#ccc' },

  badge:       { backgroundColor: '#f0fdf4', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  badgePaid:   { backgroundColor: '#fffbeb' },
  badgeClosed: { backgroundColor: '#fef2f2' },
  badgeText:   { fontSize: 10, fontWeight: '700' },

  dirBtn:     { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: PRIMARY, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16 },
  dirBtnText: { fontSize: 12, color: '#fff', fontWeight: '700' },

  centerBox:  { alignItems: 'center', paddingVertical: 36, paddingHorizontal: 24 },
  centerText: { fontSize: 14, color: '#777', marginTop: 12, fontWeight: '500', textAlign: 'center' },
  centerSub:  { fontSize: 12, color: '#bbb', marginTop: 4, textAlign: 'center' },
  emptyIcon:  { width: 64, height: 64, borderRadius: 32, backgroundColor: '#f5f5f5', alignItems: 'center', justifyContent: 'center' },

  footer:     { paddingHorizontal: 16, paddingTop: 10 },
  mapsBtn:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, backgroundColor: PRIMARY, paddingVertical: 13, borderRadius: 14 },
  mapsBtnText: { fontSize: 14, color: '#fff', fontWeight: '700' },
});

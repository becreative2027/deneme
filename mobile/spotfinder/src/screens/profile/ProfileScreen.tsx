import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { ProfileStackParamList, Post, Place } from '../../types';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { useMe, useUserProfile, useUserPosts, useFollowUser } from '../../hooks/useProfile';
import { FollowListModal } from '../../components/FollowListModal';
import { useAuthStore } from '../../store/authStore';
import { PostCard } from '../../components/PostCard';
import { PlaceCard } from '../../components/PlaceCard';
import { PostSkeleton } from '../../components/SkeletonLoader';
import { ErrorState } from '../../components/ErrorState';
import { EmptyState } from '../../components/EmptyState';
import { useLikePost } from '../../hooks/usePosts';
import { useToast } from '../../components/Toast';
import { useAnalytics } from '../../hooks/useAnalytics';
import { formatCount } from '../../utils/formatters';
import { logout as apiLogout } from '../../api/auth';
import { deleteAccount as apiDeleteAccount } from '../../api/users';
import { getFavoritePlaceIds } from '../../api/favorites';
import { getPlaceById } from '../../api/places';
import { useTheme, radius, spacing, typography, shadow } from '../../theme';
import { AvatarRing, AmberButton, CategoryBadge, Eyebrow } from '../../components/ui';

const { width } = Dimensions.get('window');

type Props = NativeStackScreenProps<ProfileStackParamList, 'OwnProfile' | 'UserProfile'>;
type Tab = 'places' | 'all' | 'favorites';
type PlaceGroup = { placeId: string; placeName: string; posts: Post[] };
type FlatItem =
  | { kind: 'header'; group: PlaceGroup }
  | { kind: 'post'; post: Post; placeId: string };

export function ProfileScreen({ route, navigation }: Props) {
  const { colors, isDark } = useTheme();
  const me = useAuthStore((s) => s.user);
  const doLogout = useAuthStore((s) => s.logout);

  const viewingUserId: string | undefined = (route?.params as any)?.userId;
  const isOwnProfile = !viewingUserId || viewingUserId === me?.id;

  const handlePressPlace = useCallback(
    (placeId: string) => navigation.push('PlaceDetail', { placeId }),
    [navigation],
  );
  const handlePressUser = useCallback(
    (userId: string) => { if (userId !== me?.id) navigation.push('UserProfile', { userId }); },
    [navigation, me?.id],
  );

  const meQuery      = useMe();
  const otherQuery   = useUserProfile(viewingUserId ?? '');
  const profileQuery = isOwnProfile ? meQuery : otherQuery;
  const profile      = profileQuery.data;

  const userId     = profile?.id ?? viewingUserId ?? me?.id ?? '';
  const postsQuery = useUserPosts(userId);
  const allPosts: Post[] = postsQuery.data?.pages.flatMap((p) => p.items) ?? [];

  const followMutation = useFollowUser();
  const likeMutation   = useLikePost();
  const { showToast }  = useToast();
  const { trackScreen, trackEvent } = useAnalytics();

  const [activeTab, setActiveTab] = useState<Tab>('places');
  const [expandedPlaces, setExpandedPlaces] = useState<Set<string>>(new Set());
  const [followSheet, setFollowSheet] = useState<'followers' | 'following' | null>(null);

  // Favorites
  const favIdsQuery = useQuery({
    queryKey: ['favorites'],
    queryFn: getFavoritePlaceIds,
    enabled: isOwnProfile,
    staleTime: 1000 * 60 * 5,
  });
  const favPlacesQuery = useQuery({
    queryKey: ['favoritePlaces', favIdsQuery.data],
    queryFn: async () => {
      const ids = favIdsQuery.data ?? [];
      if (ids.length === 0) return [] as Place[];
      const results = await Promise.allSettled(ids.map((id) => getPlaceById(id)));
      return results
        .filter((r): r is PromiseFulfilledResult<Place> => r.status === 'fulfilled')
        .map((r) => r.value);
    },
    enabled: isOwnProfile && !!favIdsQuery.data,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => { trackScreen('ProfileScreen'); }, []);

  // Group posts by place
  const placeGroups: PlaceGroup[] = useMemo(() => {
    const map = new Map<string, PlaceGroup>();
    for (const post of allPosts) {
      if (!map.has(post.placeId)) {
        map.set(post.placeId, { placeId: post.placeId, placeName: post.placeName, posts: [] });
      }
      map.get(post.placeId)!.posts.push(post);
    }
    return Array.from(map.values());
  }, [allPosts]);

  const togglePlace = useCallback((placeId: string) => {
    setExpandedPlaces((prev) => {
      const next = new Set(prev);
      next.has(placeId) ? next.delete(placeId) : next.add(placeId);
      return next;
    });
  }, []);

  const placesItems: FlatItem[] = useMemo(() => {
    const items: FlatItem[] = [];
    for (const group of placeGroups) {
      items.push({ kind: 'header', group });
      if (expandedPlaces.has(group.placeId)) {
        for (const post of group.posts) {
          items.push({ kind: 'post', post, placeId: group.placeId });
        }
      }
    }
    return items;
  }, [placeGroups, expandedPlaces]);

  const handleFollowToggle = useCallback(() => {
    if (!profile) return;
    const isFollowing = !!profile.isFollowing;
    followMutation.mutate(
      { userId: profile.id, isFollowing },
      {
        onSuccess: () => {
          showToast(isFollowing ? 'Takip bırakıldı' : `${profile.displayName} takip ediliyor`, 'success');
          trackEvent('follow_user', { userId: profile.id, action: isFollowing ? 'unfollow' : 'follow' });
        },
        onError: () => showToast('İşlem başarısız.', 'error'),
      },
    );
  }, [profile, followMutation, showToast, trackEvent]);

  const handleLogout = useCallback(async () => {
    Alert.alert('Çıkış yap', 'Çıkış yapmak istediğine emin misin?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Çıkış yap',
        style: 'destructive',
        onPress: async () => { await apiLogout(); await doLogout(); },
      },
    ]);
  }, [doLogout]);

  const handleDeleteAccount = useCallback(() => {
    Alert.alert(
      'Hesabı Sil',
      'Hesabını kalıcı olarak silmek istediğine emin misin? Bu işlem geri alınamaz.',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Hesabımı Sil',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Son Onay',
              'Tüm verilerinden vazgeçiyorsun. Devam etmek istiyor musun?',
              [
                { text: 'İptal', style: 'cancel' },
                {
                  text: 'Evet, Sil',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      await apiDeleteAccount();
                      await apiLogout();
                      await doLogout();
                    } catch {
                      showToast('Hesap silinirken hata oluştu.', 'error');
                    }
                  },
                },
              ],
            );
          },
        },
      ],
    );
  }, [doLogout, showToast]);

  if (profileQuery.isLoading) {
    return (
      <SafeAreaView style={[s.container, { backgroundColor: colors.background }]} edges={['top']}>
        {[0, 1].map((i) => <PostSkeleton key={i} />)}
      </SafeAreaView>
    );
  }

  if (profileQuery.isError || !profile) {
    return <ErrorState message="Profil yüklenemedi." onRetry={() => profileQuery.refetch()} />;
  }

  // Cover mosaic — user's post images (up to 9)
  const coverImages = allPosts.filter((p) => p.imageUrl).slice(0, 9).map((p) => p.imageUrl!);

  const Header = (
    <View>
      {/* ── Cover mosaic ── */}
      <View style={s.coverContainer}>
        {coverImages.length > 0 ? (
          <View style={s.mosaicGrid}>
            {coverImages.slice(0, 9).map((uri, i) => (
              <Image key={i} source={{ uri }} style={s.mosaicTile} />
            ))}
          </View>
        ) : (
          <LinearGradient
            colors={[colors.surfaceElevated, colors.surface]}
            style={StyleSheet.absoluteFill}
          />
        )}
        <BlurView
          intensity={60}
          tint={isDark ? 'dark' : 'light'}
          style={StyleSheet.absoluteFill}
        />
        <LinearGradient
          colors={['transparent', colors.background]}
          start={{ x: 0, y: 0.3 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        {/* Nav row */}
        <SafeAreaView edges={['top']} style={s.navRow}>
          {!isOwnProfile && (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={[s.glassBtn, { backgroundColor: colors.glassBg, borderColor: colors.glassBorder }]}
              accessibilityRole="button"
              accessibilityLabel="Geri"
            >
              <Ionicons name="arrow-back" size={18} color={colors.text} />
            </TouchableOpacity>
          )}
          <View style={{ flex: 1 }} />
          {isOwnProfile && (
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity
                onPress={() => navigation.push('UserSearch')}
                style={[s.glassBtn, { backgroundColor: colors.glassBg, borderColor: colors.glassBorder }]}
                accessibilityRole="button"
                accessibilityLabel="Kişi ara"
              >
                <Ionicons name="search-outline" size={18} color={colors.text} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleLogout}
                style={[s.glassBtn, { backgroundColor: colors.glassBg, borderColor: colors.glassBorder }]}
                accessibilityRole="button"
                accessibilityLabel="Çıkış yap"
              >
                <Ionicons name="log-out-outline" size={18} color={colors.text} />
              </TouchableOpacity>
            </View>
          )}
        </SafeAreaView>
      </View>

      {/* ── Profile info ── */}
      <View style={[s.profileInfo, { backgroundColor: colors.background }]}>
        <View style={s.avatarRow}>
          <AvatarRing uri={profile.avatarUrl} size={80} />
          <View style={s.identityBlock}>
            <Text style={[typography.titleL, { color: colors.text }]} numberOfLines={1}>
              {profile.displayName}
            </Text>
            <Text style={[typography.caption, { color: colors.textTertiary, marginTop: 2 }]}>
              @{profile.username}
            </Text>
            <CategoryBadge label="Kaşif" variant="solid" style={{ marginTop: 6 }} />
          </View>
        </View>

        {profile.bio ? (
          <Text style={[typography.bodyDim, { color: colors.textSecondary, marginTop: spacing.md, lineHeight: 20 }]}>
            {profile.bio}
          </Text>
        ) : null}

        {/* Stats */}
        <View style={[s.statsRow, { borderColor: colors.borderLight }]}>
          <StatItem label="Gönderi" value={profile.postsCount} colors={colors} />
          <View style={[s.statDivider, { backgroundColor: colors.border }]} />
          <StatItem
            label="Takipçi"
            value={profile.followersCount}
            onPress={() => setFollowSheet('followers')}
            colors={colors}
            highlight
          />
          <View style={[s.statDivider, { backgroundColor: colors.border }]} />
          <StatItem
            label="Takip"
            value={profile.followingCount}
            onPress={() => setFollowSheet('following')}
            colors={colors}
          />
        </View>

        {/* Actions */}
        <View style={s.actionsRow}>
          {isOwnProfile ? (
            <>
              <AmberButton
                label="Profili düzenle"
                variant="ghost"
                style={{ flex: 1 }}
                onPress={() => navigation.push('EditProfile')}
              />
              <TouchableOpacity
                onPress={handleDeleteAccount}
                style={[s.iconBtn, { backgroundColor: colors.glassBg, borderColor: colors.glassBorder }]}
                accessibilityRole="button"
                accessibilityLabel="Hesabı sil"
              >
                <Ionicons name="trash-outline" size={18} color="#ef4444" />
              </TouchableOpacity>
            </>
          ) : (
            <>
              <AmberButton
                label={followMutation.isPending ? '…' : profile.isFollowing ? 'Takip ediliyor' : 'Takip et'}
                variant={profile.isFollowing ? 'ghost' : 'primary'}
                onPress={handleFollowToggle}
                loading={followMutation.isPending}
                style={{ flex: 1 }}
              />
              <TouchableOpacity
                style={[s.iconBtn, { backgroundColor: colors.glassBg, borderColor: colors.glassBorder }]}
                accessibilityRole="button"
                accessibilityLabel="Paylaş"
              >
                <Ionicons name="share-outline" size={18} color={colors.text} />
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Tab bar */}
        <View style={[s.tabBar, { borderBottomColor: colors.border }]}>
          {([
            { key: 'places', label: 'Mekanlar', icon: 'location-outline' },
            { key: 'all', label: 'Gönderiler', icon: 'images-outline' },
            ...(isOwnProfile ? [{ key: 'favorites', label: 'Favoriler', icon: 'heart-outline' }] : []),
          ] as { key: Tab; label: string; icon: string }[]).map((tab) => {
            const active = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[s.tabItem, active && { borderBottomColor: colors.accent }]}
                onPress={() => setActiveTab(tab.key)}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
              >
                <Ionicons
                  name={tab.icon as any}
                  size={16}
                  color={active ? colors.accent : colors.icon}
                />
                <Text style={[typography.caption, { color: active ? colors.accent : colors.icon, fontWeight: '700', marginLeft: 4 }]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );

  // ── "Tüm Gönderiler" tab ────────────────────────────────────────────────────
  if (activeTab === 'all') {
    return (
      <View style={[s.container, { backgroundColor: colors.background }]}>
        <FlatList
          data={allPosts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PostCard
              post={item}
              onLike={(postId, liked) => likeMutation.mutate({ postId, liked })}
              onPressPlace={handlePressPlace}
              onPressUser={handlePressUser}
            />
          )}
          ListHeaderComponent={Header}
          onEndReached={() => {
            if (postsQuery.hasNextPage && !postsQuery.isFetchingNextPage) postsQuery.fetchNextPage();
          }}
          onEndReachedThreshold={0.4}
          refreshControl={
            <RefreshControl
              refreshing={profileQuery.isRefetching}
              onRefresh={() => profileQuery.refetch()}
              tintColor={colors.accent}
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon="images-outline"
              title="Henüz gönderi yok"
              subtitle={isOwnProfile ? 'İlk mekanını paylaş!' : 'Kullanıcının gönderisi yok.'}
            />
          }
          ListFooterComponent={
            postsQuery.isFetchingNextPage
              ? <ActivityIndicator color={colors.accent} style={{ padding: 16 }} />
              : null
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={allPosts.length === 0 ? { flex: 1 } : { paddingBottom: 120 }}
        />
        <FollowListModal
          userId={userId}
          type={followSheet ?? 'followers'}
          visible={!!followSheet}
          onClose={() => setFollowSheet(null)}
          onUserPress={(id) => { setFollowSheet(null); handlePressUser(id); }}
        />
      </View>
    );
  }

  // ── "Favoriler" tab ─────────────────────────────────────────────────────────
  if (activeTab === 'favorites') {
    const favPlaces = favPlacesQuery.data ?? [];
    return (
      <View style={[s.container, { backgroundColor: colors.background }]}>
        <FlatList
          data={favPlaces}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PlaceCard place={item} onPress={handlePressPlace} />
          )}
          ListHeaderComponent={Header}
          refreshControl={
            <RefreshControl
              refreshing={favPlacesQuery.isFetching}
              onRefresh={() => { favIdsQuery.refetch(); favPlacesQuery.refetch(); }}
              tintColor={colors.accent}
            />
          }
          ListEmptyComponent={
            favPlacesQuery.isLoading ? (
              <ActivityIndicator color={colors.accent} style={{ padding: 24 }} />
            ) : (
              <EmptyState
                icon="heart-outline"
                title="Henüz favori yok"
                subtitle="Beğendiğin mekanlara kalp basarak favori listene ekle"
              />
            )
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: 120 }}
        />
        <FollowListModal
          userId={userId}
          type={followSheet ?? 'followers'}
          visible={!!followSheet}
          onClose={() => setFollowSheet(null)}
          onUserPress={(id) => { setFollowSheet(null); handlePressUser(id); }}
        />
      </View>
    );
  }

  // ── "Mekanlar" tab ──────────────────────────────────────────────────────────
  return (
    <View style={[s.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={placesItems}
        keyExtractor={(item) =>
          item.kind === 'header' ? `h-${item.group.placeId}` : `p-${item.post.id}`
        }
        renderItem={({ item }) => {
          if (item.kind === 'header') {
            const expanded = expandedPlaces.has(item.group.placeId);
            return (
              <TouchableOpacity
                style={[s.placeHeader, { backgroundColor: colors.surfaceSecondary, borderBottomColor: colors.borderLight }]}
                onPress={() => togglePlace(item.group.placeId)}
                activeOpacity={0.7}
                accessibilityRole="button"
              >
                <View style={s.placeHeaderLeft}>
                  <View style={[s.placeIconWrap, { backgroundColor: colors.accentSoft }]}>
                    <Ionicons name="location" size={15} color={colors.accent} />
                  </View>
                  <Text style={[typography.body, { color: colors.text, flex: 1 }]} numberOfLines={1}>
                    {item.group.placeName}
                  </Text>
                </View>
                <View style={s.placeHeaderRight}>
                  <Text style={[typography.caption, { color: colors.textTertiary }]}>
                    {item.group.posts.length} gönderi
                  </Text>
                  <Ionicons
                    name={expanded ? 'chevron-up' : 'chevron-down'}
                    size={16}
                    color={colors.icon}
                  />
                </View>
              </TouchableOpacity>
            );
          }
          return (
            <PostCard
              post={item.post}
              onLike={(postId, liked) => likeMutation.mutate({ postId, liked })}
              onPressPlace={handlePressPlace}
              onPressUser={handlePressUser}
            />
          );
        }}
        ListHeaderComponent={Header}
        onEndReached={() => {
          if (postsQuery.hasNextPage && !postsQuery.isFetchingNextPage) postsQuery.fetchNextPage();
        }}
        onEndReachedThreshold={0.4}
        refreshControl={
          <RefreshControl
            refreshing={profileQuery.isRefetching}
            onRefresh={() => profileQuery.refetch()}
            tintColor={colors.accent}
          />
        }
        ListEmptyComponent={
          postsQuery.isLoading ? null : (
            <EmptyState
              icon="location-outline"
              title="Henüz mekan yok"
              subtitle={isOwnProfile ? 'İlk mekanını paylaş!' : 'Kullanıcının gönderisi yok.'}
            />
          )
        }
        ListFooterComponent={
          postsQuery.isFetchingNextPage
            ? <ActivityIndicator color={colors.accent} style={{ padding: 16 }} />
            : null
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      />
      <FollowListModal
        userId={userId}
        type={followSheet ?? 'followers'}
        visible={!!followSheet}
        onClose={() => setFollowSheet(null)}
        onUserPress={(id) => { setFollowSheet(null); handlePressUser(id); }}
      />
    </View>
  );
}

function StatItem({
  label,
  value,
  onPress,
  colors,
  highlight,
}: {
  label: string;
  value: number;
  onPress?: () => void;
  colors: any;
  highlight?: boolean;
}) {
  const content = (
    <View style={s.stat}>
      <Text style={[typography.titleM, { color: highlight ? colors.accent : colors.text }]}>
        {formatCount(value)}
      </Text>
      <Text style={[typography.caption, { color: colors.textTertiary, marginTop: 2 }]}>
        {label}
      </Text>
    </View>
  );
  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7} accessibilityRole="button">
        {content}
      </TouchableOpacity>
    );
  }
  return content;
}

const COVER_H = 220;

const s = StyleSheet.create({
  container: { flex: 1 },

  // Cover
  coverContainer: { height: COVER_H, overflow: 'hidden' },
  mosaicGrid: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  mosaicTile: {
    width: width / 3,
    height: COVER_H / 3,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  glassBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Profile info
  profileInfo: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    marginTop: -44,
  },
  identityBlock: {
    flex: 1,
    paddingTop: spacing.xl,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xl,
    paddingVertical: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    justifyContent: 'space-around',
  },
  stat: { alignItems: 'center', flex: 1 },
  statDivider: { width: 1, height: 28 },

  // Actions
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  iconBtn: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Tab bar
  tabBar: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },

  // Place header
  placeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  placeHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.md,
  },
  placeIconWrap: {
    width: 30,
    height: 30,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
});

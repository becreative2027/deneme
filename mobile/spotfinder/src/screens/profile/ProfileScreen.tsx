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
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ProfileStackParamList, Post, Place } from '../../types';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { useMe, useUserProfile, useUserPosts, useFollowUser } from '../../hooks/useProfile';
import { FollowListModal } from '../../components/FollowListModal';
import { useAuthStore } from '../../store/authStore';
import { Avatar } from '../../components/Avatar';
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
import { getFavoritePlaceIds } from '../../api/favorites';
import { getPlaceById } from '../../api/places';

type Props = NativeStackScreenProps<ProfileStackParamList, 'OwnProfile' | 'UserProfile'>;

type Tab = 'places' | 'all' | 'favorites';

type PlaceGroup = { placeId: string; placeName: string; posts: Post[] };

type FlatItem =
  | { kind: 'header'; group: PlaceGroup }
  | { kind: 'post';   post: Post; placeId: string };

export function ProfileScreen({ route, navigation }: Props) {
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

  const meQuery    = useMe();
  const otherQuery = useUserProfile(viewingUserId ?? '');
  const profileQuery = isOwnProfile ? meQuery : otherQuery;
  const profile      = profileQuery.data;

  const userId   = profile?.id ?? viewingUserId ?? me?.id ?? '';
  const postsQuery = useUserPosts(userId);
  const allPosts: Post[] = postsQuery.data?.pages.flatMap((p) => p.items) ?? [];

  const followMutation = useFollowUser();
  const likeMutation   = useLikePost();
  const { showToast }  = useToast();
  const { trackScreen, trackEvent } = useAnalytics();

  const [activeTab, setActiveTab] = useState<Tab>('places');
  const [expandedPlaces, setExpandedPlaces] = useState<Set<string>>(new Set());
  const [followSheet, setFollowSheet] = useState<'followers' | 'following' | null>(null);

  // ── Favorites (own profile only) ─────────────────────────────────────────
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

  // ── Group posts by place ─────────────────────────────────────────────────
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

  // ── Flat list items for "Mekanlar" tab ──────────────────────────────────
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

  if (profileQuery.isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        {[0, 1].map((i) => <PostSkeleton key={i} />)}
      </SafeAreaView>
    );
  }

  if (profileQuery.isError || !profile) {
    return <ErrorState message="Profil yüklenemedi." onRetry={() => profileQuery.refetch()} />;
  }

  const Header = (
    <View style={styles.profileHeader}>
      <View style={styles.avatarRow}>
        <Avatar uri={profile.avatarUrl} name={profile.displayName} size={72} />
        {isOwnProfile ? (
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#888" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.followBtn, profile.isFollowing && styles.followingBtn]}
            onPress={handleFollowToggle}
            disabled={followMutation.isPending}
          >
            <Text style={[styles.followText, profile.isFollowing && styles.followingText]}>
              {followMutation.isPending ? '…' : profile.isFollowing ? 'Takip ediliyor' : 'Takip et'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.displayName}>{profile.displayName}</Text>
      <Text style={styles.username}>@{profile.username}</Text>
      {profile.bio ? <Text style={styles.bio}>{profile.bio}</Text> : null}

      <View style={styles.statsRow}>
        <StatItem label="Gönderi" value={profile.postsCount} />
        <StatItem
          label="Takipçi"
          value={profile.followersCount}
          onPress={() => setFollowSheet('followers')}
        />
        <StatItem
          label="Takip"
          value={profile.followingCount}
          onPress={() => setFollowSheet('following')}
        />
      </View>

      {/* ── Tab bar ────────────────────────────────────────────────────── */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'places' && styles.tabItemActive]}
          onPress={() => setActiveTab('places')}
        >
          <Ionicons
            name="location-outline"
            size={16}
            color={activeTab === 'places' ? '#6c63ff' : '#888'}
          />
          <Text style={[styles.tabLabel, activeTab === 'places' && styles.tabLabelActive]}>
            Mekanlar
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'all' && styles.tabItemActive]}
          onPress={() => setActiveTab('all')}
        >
          <Ionicons
            name="images-outline"
            size={16}
            color={activeTab === 'all' ? '#6c63ff' : '#888'}
          />
          <Text style={[styles.tabLabel, activeTab === 'all' && styles.tabLabelActive]}>
            Gönderiler
          </Text>
        </TouchableOpacity>

        {isOwnProfile && (
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'favorites' && styles.tabItemActive]}
            onPress={() => setActiveTab('favorites')}
          >
            <Ionicons
              name="heart-outline"
              size={16}
              color={activeTab === 'favorites' ? '#6c63ff' : '#888'}
            />
            <Text style={[styles.tabLabel, activeTab === 'favorites' && styles.tabLabelActive]}>
              Favoriler
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  // ── "Tüm Gönderiler" tab ──────────────────────────────────────────────────
  if (activeTab === 'all') {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
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
              tintColor="#6c63ff"
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
              ? <ActivityIndicator color="#6c63ff" style={{ padding: 16 }} />
              : null
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={allPosts.length === 0 ? { flex: 1 } : undefined}
        />
        <FollowListModal
          userId={userId}
          type={followSheet ?? 'followers'}
          visible={!!followSheet}
          onClose={() => setFollowSheet(null)}
          onUserPress={(id) => { setFollowSheet(null); handlePressUser(id); }}
        />
      </SafeAreaView>
    );
  }

  // ── "Favoriler" tab ───────────────────────────────────────────────────────
  if (activeTab === 'favorites') {
    const favPlaces = favPlacesQuery.data ?? [];
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
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
              tintColor="#6c63ff"
            />
          }
          ListEmptyComponent={
            favPlacesQuery.isLoading ? (
              <ActivityIndicator color="#6c63ff" style={{ padding: 24 }} />
            ) : (
              <EmptyState
                icon="heart-outline"
                title="Henüz favori yok"
                subtitle="Beğendiğin mekanlara kalp basarak favori listene ekle"
              />
            )
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8 }}
        />
        <FollowListModal
          userId={userId}
          type={followSheet ?? 'followers'}
          visible={!!followSheet}
          onClose={() => setFollowSheet(null)}
          onUserPress={(id) => { setFollowSheet(null); handlePressUser(id); }}
        />
      </SafeAreaView>
    );
  }

  // ── "Mekanlar" tab ────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
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
                style={styles.placeHeader}
                onPress={() => togglePlace(item.group.placeId)}
                activeOpacity={0.7}
              >
                <View style={styles.placeHeaderLeft}>
                  <View style={styles.placeIconWrap}>
                    <Ionicons name="location" size={16} color="#6c63ff" />
                  </View>
                  <Text style={styles.placeName} numberOfLines={1}>
                    {item.group.placeName}
                  </Text>
                </View>
                <View style={styles.placeHeaderRight}>
                  <Text style={styles.placeCount}>
                    {item.group.posts.length} gönderi
                  </Text>
                  <Ionicons
                    name={expanded ? 'chevron-up' : 'chevron-down'}
                    size={16}
                    color="#888"
                  />
                </View>
              </TouchableOpacity>
            );
          }
          // kind === 'post'
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
            tintColor="#6c63ff"
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
            ? <ActivityIndicator color="#6c63ff" style={{ padding: 16 }} />
            : null
        }
        showsVerticalScrollIndicator={false}
      />

      <FollowListModal
        userId={userId}
        type={followSheet ?? 'followers'}
        visible={!!followSheet}
        onClose={() => setFollowSheet(null)}
        onUserPress={(id) => {
          setFollowSheet(null);
          handlePressUser(id);
        }}
      />
    </SafeAreaView>
  );
}

function StatItem({ label, value, onPress }: { label: string; value: number; onPress?: () => void }) {
  if (onPress) {
    return (
      <TouchableOpacity style={styles.stat} onPress={onPress} activeOpacity={0.7}>
        <Text style={styles.statValue}>{formatCount(value)}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </TouchableOpacity>
    );
  }
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{formatCount(value)}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f0f' },

  // ── Profile header ────────────────────────────────────────────────────────
  profileHeader:  { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 0 },
  avatarRow:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  logoutBtn:      { padding: 8 },
  followBtn:      { borderWidth: 1.5, borderColor: '#6c63ff', borderRadius: 20, paddingHorizontal: 20, paddingVertical: 7 },
  followingBtn:   { backgroundColor: '#6c63ff' },
  followText:     { fontSize: 14, fontWeight: '700', color: '#6c63ff' },
  followingText:  { color: '#fff' },
  displayName:    { fontSize: 20, fontWeight: '800', color: '#fff' },
  username:       { fontSize: 14, color: '#888', marginTop: 2 },
  bio:            { fontSize: 14, color: '#aaa', marginTop: 8, lineHeight: 20 },
  statsRow:       { flexDirection: 'row', marginTop: 16, gap: 24 },
  stat:           { alignItems: 'center' },
  statValue:      { fontSize: 18, fontWeight: '800', color: '#fff' },
  statLabel:      { fontSize: 12, color: '#888', marginTop: 2 },

  // ── Tab bar ───────────────────────────────────────────────────────────────
  tabBar: {
    flexDirection: 'row',
    marginTop: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#2a2a2a',
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive:  { borderBottomColor: '#6c63ff' },
  tabLabel:       { fontSize: 13, fontWeight: '600', color: '#888' },
  tabLabelActive: { color: '#6c63ff' },

  // ── Place header row ──────────────────────────────────────────────────────
  placeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#2a2a2a',
  },
  placeHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  placeIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#6c63ff22',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
    flex: 1,
  },
  placeHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  placeCount: {
    fontSize: 12,
    color: '#888',
  },
});

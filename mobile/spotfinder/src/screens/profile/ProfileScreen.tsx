import React, { useCallback, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { FeedStackParamList, MainTabParamList, Post } from '../../types';
import { useMe, useUserProfile, useUserPosts, useFollowUser } from '../../hooks/useProfile';
import { useAuthStore } from '../../store/authStore';
import { Avatar } from '../../components/Avatar';
import { PostCard } from '../../components/PostCard';
import { PostSkeleton } from '../../components/SkeletonLoader';
import { ErrorState } from '../../components/ErrorState';
import { EmptyState } from '../../components/EmptyState';
import { useLikePost } from '../../hooks/usePosts';
import { useToast } from '../../components/Toast';
import { useAnalytics } from '../../hooks/useAnalytics';
import { formatCount } from '../../utils/formatters';
import { logout as apiLogout } from '../../api/auth';

// ProfileScreen is used both as a tab (own profile) and as a stack screen (other users)
type OwnTabProps = NativeStackScreenProps<MainTabParamList, 'ProfileTab'>;
type OtherStackProps = NativeStackScreenProps<FeedStackParamList, 'UserProfile'>;
type Props = OwnTabProps | OtherStackProps;

export function ProfileScreen({ route, navigation }: any) {
  const me = useAuthStore((s) => s.user);
  const doLogout = useAuthStore((s) => s.logout);

  // If userId param present → viewing someone else's profile
  const viewingUserId: string | undefined = (route?.params as any)?.userId;
  const isOwnProfile = !viewingUserId || viewingUserId === me?.id;

  const meQuery = useMe();
  const otherQuery = useUserProfile(viewingUserId ?? '');
  const profileQuery = isOwnProfile ? meQuery : otherQuery;
  const profile = profileQuery.data;

  const userId = profile?.id ?? viewingUserId ?? me?.id ?? '';
  const postsQuery = useUserPosts(userId);
  const allPosts: Post[] = postsQuery.data?.pages.flatMap((p) => p.items) ?? [];

  const followMutation = useFollowUser();
  const likeMutation = useLikePost();
  const { showToast } = useToast();
  const { trackScreen, trackEvent } = useAnalytics();

  useEffect(() => { trackScreen('ProfileScreen'); }, []);

  const handleFollowToggle = useCallback(() => {
    if (!profile) return;
    const isFollowing = !!profile.isFollowing;
    followMutation.mutate(
      { userId: profile.id, isFollowing },
      {
        onSuccess: () => {
          showToast(isFollowing ? 'Unfollowed' : `Following ${profile.displayName}`, 'success');
          trackEvent('follow_user', { userId: profile.id, action: isFollowing ? 'unfollow' : 'follow' });
        },
        onError: () => showToast('Could not update follow status.', 'error'),
      },
    );
  }, [profile, followMutation, showToast, trackEvent]);

  const handleLogout = useCallback(async () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          await apiLogout();
          await doLogout();
        },
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
    return <ErrorState message="Could not load profile." onRetry={() => profileQuery.refetch()} />;
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
            style={[
              styles.followBtn,
              profile.isFollowing && styles.followingBtn,
            ]}
            onPress={handleFollowToggle}
            disabled={followMutation.isPending}
          >
            <Text style={[styles.followText, profile.isFollowing && styles.followingText]}>
              {followMutation.isPending ? '…' : profile.isFollowing ? 'Following' : 'Follow'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.displayName}>{profile.displayName}</Text>
      <Text style={styles.username}>@{profile.username}</Text>
      {profile.bio ? <Text style={styles.bio}>{profile.bio}</Text> : null}

      <View style={styles.statsRow}>
        <StatItem label="Posts" value={profile.postsCount} />
        <StatItem label="Followers" value={profile.followersCount} />
        <StatItem label="Following" value={profile.followingCount} />
      </View>

      <View style={styles.divider} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={allPosts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onLike={(postId, liked) => likeMutation.mutate({ postId, liked })}
            onPressPlace={() => {}}
          />
        )}
        ListHeaderComponent={Header}
        onEndReached={() => {
          if (postsQuery.hasNextPage && !postsQuery.isFetchingNextPage) {
            postsQuery.fetchNextPage();
          }
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
            title="No posts yet"
            subtitle={isOwnProfile ? 'Share your first spot!' : 'This user has no posts.'}
          />
        }
        ListFooterComponent={
          postsQuery.isFetchingNextPage ? (
            <ActivityIndicator color="#6c63ff" style={{ padding: 16 }} />
          ) : null
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={allPosts.length === 0 ? { flex: 1 } : undefined}
      />
    </SafeAreaView>
  );
}

function StatItem({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{formatCount(value)}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  profileHeader: { padding: 20 },
  avatarRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  logoutBtn: { padding: 8 },
  followBtn: {
    borderWidth: 1.5,
    borderColor: '#6c63ff',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 7,
  },
  followingBtn: { backgroundColor: '#6c63ff' },
  followText: { fontSize: 14, fontWeight: '700', color: '#6c63ff' },
  followingText: { color: '#fff' },
  displayName: { fontSize: 20, fontWeight: '800', color: '#1a1a1a' },
  username: { fontSize: 14, color: '#888', marginTop: 2 },
  bio: { fontSize: 14, color: '#555', marginTop: 8, lineHeight: 20 },
  statsRow: { flexDirection: 'row', marginTop: 16, gap: 24 },
  stat: { alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: '800', color: '#1a1a1a' },
  statLabel: { fontSize: 12, color: '#888', marginTop: 2 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: '#e8e8e8', marginTop: 20 },
});

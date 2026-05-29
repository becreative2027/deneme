import React from 'react';
import {
  Modal,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useFollowList, useFollowUser } from '../hooks/useProfile';
import { useAuthStore } from '../store/authStore';
import { Avatar } from './Avatar';
import { UserProfile } from '../types';

const PRIMARY = '#6c63ff';

interface Props {
  userId: string;
  type: 'followers' | 'following';
  visible: boolean;
  onClose: () => void;
  onUserPress?: (userId: string) => void;
}

function UserRow({
  user,
  currentUserId,
  myFollowingIds,
  onPress,
}: {
  user: UserProfile;
  currentUserId: string;
  myFollowingIds: string[];
  onPress?: (id: string) => void;
}) {
  const { t } = useTranslation();
  const isMe = user.id === currentUserId;
  const isFollowing = myFollowingIds.includes(user.id);
  const followMutation = useFollowUser();

  return (
    <View style={s.row}>
      <TouchableOpacity
        style={s.rowInfo}
        activeOpacity={0.7}
        onPress={() => onPress?.(user.id)}
      >
        <Avatar uri={user.avatarUrl} name={user.displayName} size={44} />
        <View style={s.rowText}>
          <Text style={s.displayName} numberOfLines={1}>{user.displayName}</Text>
          <Text style={s.username} numberOfLines={1}>@{user.username}</Text>
        </View>
      </TouchableOpacity>

      {!isMe && (
        <TouchableOpacity
          style={[s.followBtn, isFollowing && s.followingBtn]}
          activeOpacity={0.7}
          disabled={followMutation.isPending}
          onPress={() => followMutation.mutate({ userId: user.id, isFollowing })}
        >
          <Ionicons
            name={isFollowing ? 'person-remove-outline' : 'person-add-outline'}
            size={13}
            color={isFollowing ? '#555' : '#fff'}
          />
          <Text style={[s.followBtnText, isFollowing && s.followingBtnText]}>
            {followMutation.isPending ? '…' : isFollowing ? t('followList.followingBtn') : t('followList.follow')}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export function FollowListModal({ userId, type, visible, onClose, onUserPress }: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const currentUserId = useAuthStore((s) => s.user?.id ?? '');
  const listQuery = useFollowList(userId, type);
  const myFollowingQuery = useFollowList(currentUserId, 'following');
  const myFollowingIds = myFollowingQuery.data?.map((u) => u.id) ?? [];

  const title = type === 'followers' ? t('followList.followers') : t('followList.following');
  const users = listQuery.data ?? [];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[s.container, { paddingBottom: insets.bottom }]}>
        {/* Handle */}
        <View style={s.handleWrap}>
          <View style={s.handle} />
        </View>

        {/* Header */}
        <View style={s.header}>
          <Text style={s.title}>{title}</Text>
          <TouchableOpacity onPress={onClose} style={s.closeBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close" size={20} color="#888" />
          </TouchableOpacity>
        </View>

        {/* List */}
        {listQuery.isLoading ? (
          <View style={s.centered}>
            <ActivityIndicator color={PRIMARY} size="large" />
          </View>
        ) : users.length === 0 ? (
          <View style={s.centered}>
            <Ionicons name="people-outline" size={40} color="#ddd" />
            <Text style={s.emptyText}>
              {type === 'followers' ? t('followList.noFollowers') : t('followList.noFollowing')}
            </Text>
          </View>
        ) : (
          <FlatList
            data={users}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <UserRow
                user={item}
                currentUserId={currentUserId}
                myFollowingIds={myFollowingIds}
                onPress={(id) => { onClose(); onUserPress?.(id); }}
              />
            )}
            ItemSeparatorComponent={() => <View style={s.separator} />}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#fff' },
  centered:     { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },

  handleWrap:   { alignItems: 'center', paddingTop: 12, paddingBottom: 4 },
  handle:       { width: 40, height: 4, borderRadius: 2, backgroundColor: '#ddd' },

  header:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#eee' },
  title:        { fontSize: 16, fontWeight: '700', color: '#111' },
  closeBtn:     { padding: 4 },

  row:          { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  rowInfo:      { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowText:      { flex: 1 },
  displayName:  { fontSize: 14, fontWeight: '600', color: '#111' },
  username:     { fontSize: 13, color: '#888', marginTop: 1 },

  followBtn:    { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: PRIMARY, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20 },
  followingBtn: { backgroundColor: '#f0f0f0' },
  followBtnText:     { fontSize: 12, fontWeight: '700', color: '#fff' },
  followingBtnText:  { color: '#555' },

  separator:    { height: StyleSheet.hairlineWidth, backgroundColor: '#f0f0f0', marginLeft: 72 },

  emptyText:    { fontSize: 14, color: '#aaa', textAlign: 'center' },
});

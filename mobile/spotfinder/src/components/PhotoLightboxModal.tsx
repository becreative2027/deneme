import React, { useRef, useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Post } from '../types';
import { Avatar } from './Avatar';
import { OptimizedImage } from './OptimizedImage';
import { useLikePost } from '../hooks/usePosts';

const { width } = Dimensions.get('window');

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 3600) {
    const m = Math.max(1, Math.floor(diff / 60));
    return `${m} dk önce`;
  }
  if (diff < 86400) {
    const h = Math.floor(diff / 3600);
    return `${h} saat önce`;
  }
  if (diff < 604800) {
    const d = Math.floor(diff / 86400);
    return `${d} gün önce`;
  }
  const w = Math.floor(diff / 604800);
  return `${w} hafta önce`;
}

interface Props {
  posts: Post[];
  initialIndex: number;
  visible: boolean;
  onClose: () => void;
  onGoToUser?: (userId: string) => void;
  onGoToPlace?: (placeId: string) => void;
}

export function PhotoLightboxModal({
  posts,
  initialIndex,
  visible,
  onClose,
  onGoToUser,
  onGoToPlace,
}: Props) {
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList>(null);
  const likeMutation = useLikePost();

  const [likeState, setLikeState] = useState<
    Record<string, { isLiked: boolean; likeCount: number }>
  >({});

  // Reset like state when modal opens
  useEffect(() => {
    if (visible) setLikeState({});
  }, [visible]);

  // Scroll to initial index when modal becomes visible
  useEffect(() => {
    if (visible && posts.length > 0) {
      // Small delay to ensure list is rendered
      const timeout = setTimeout(() => {
        listRef.current?.scrollToIndex({
          index: initialIndex,
          animated: false,
        });
      }, 50);
      return () => clearTimeout(timeout);
    }
  }, [visible, initialIndex, posts.length]);

  const handleLike = (post: Post) => {
    const current = likeState[post.id] ?? { isLiked: post.isLiked, likeCount: post.likeCount };
    const newIsLiked = !current.isLiked;
    setLikeState((prev) => ({
      ...prev,
      [post.id]: {
        isLiked: newIsLiked,
        likeCount: newIsLiked ? current.likeCount + 1 : current.likeCount - 1,
      },
    }));
    likeMutation.mutate({ postId: post.id, liked: current.isLiked });
  };

  const renderItem = ({ item: post }: { item: Post }) => {
    const ls = likeState[post.id];
    const isLiked = ls?.isLiked ?? post.isLiked;
    const likeCount = ls?.likeCount ?? post.likeCount;

    return (
      <View style={s.postItem}>
        {/* User info row */}
        <TouchableOpacity
          style={s.userRow}
          activeOpacity={0.7}
          onPress={() => {
            if (onGoToUser) {
              onClose();
              onGoToUser(post.userId);
            }
          }}
        >
          <Avatar uri={post.avatarUrl} name={post.displayName} size={36} />
          <View style={s.userInfo}>
            <Text style={s.displayName}>{post.displayName}</Text>
            <Text style={s.meta}>@{post.username} · {timeAgo(post.createdAt)}</Text>
          </View>
        </TouchableOpacity>

        {/* Square image */}
        {post.imageUrl ? (
          <OptimizedImage
            uri={post.imageUrl}
            style={s.squareImage}
            resizeMode="cover"
          />
        ) : null}

        {/* Footer */}
        <View style={s.footer}>
          {/* Like button */}
          <TouchableOpacity
            style={s.likeRow}
            activeOpacity={0.7}
            onPress={() => handleLike(post)}
          >
            <Ionicons
              name={isLiked ? 'heart' : 'heart-outline'}
              size={24}
              color={isLiked ? '#ef4444' : '#aaa'}
            />
            <Text style={[s.likeCount, isLiked && s.likeCountActive]}>{likeCount}</Text>
          </TouchableOpacity>

          {/* Caption */}
          {post.caption ? (
            <Text style={s.caption}>
              <Text style={s.captionUsername}>{post.username} </Text>
              {post.caption}
            </Text>
          ) : null}

          {/* Place link */}
          {post.placeName && post.placeId ? (
            <TouchableOpacity
              style={s.placeRow}
              activeOpacity={0.7}
              onPress={() => {
                if (onGoToPlace) {
                  onClose();
                  onGoToPlace(post.placeId);
                }
              }}
            >
              <Ionicons name="location-outline" size={13} color="#a8a4ff" />
              <Text style={s.placeText}>
                {post.placeName}{post.placeCity ? `, ${post.placeCity}` : ''}
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={s.divider} />
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <View style={[s.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={s.header}>
          <Text style={s.headerTitle}>
            {posts.length} {posts.length === 1 ? 'fotoğraf' : 'fotoğraf'}
          </Text>
          <TouchableOpacity
            style={s.closeBtn}
            onPress={onClose}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Post list */}
        <FlatList
          ref={listRef}
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          onScrollToIndexFailed={(info) => {
            // Fallback: scroll to end if index is out of range initially
            setTimeout(() => {
              listRef.current?.scrollToIndex({
                index: Math.min(info.index, posts.length - 1),
                animated: false,
              });
            }, 200);
          }}
          contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
        />
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.12)',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Post item
  postItem: {
    backgroundColor: '#000',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },

  // User row
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  userInfo: { flex: 1 },
  displayName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
  },
  meta: {
    color: '#888',
    fontSize: 12,
    lineHeight: 16,
    marginTop: 1,
  },

  // Image
  squareImage: {
    width,
    height: width,
  },

  // Footer
  footer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
    gap: 8,
  },
  likeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  likeCount: {
    color: '#aaa',
    fontSize: 14,
    fontWeight: '500',
  },
  likeCountActive: {
    color: '#ef4444',
  },
  caption: {
    color: '#e5e5e5',
    fontSize: 14,
    lineHeight: 20,
  },
  captionUsername: {
    fontWeight: '700',
    color: '#fff',
  },
  placeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  placeText: {
    color: '#a8a4ff',
    fontSize: 13,
    fontWeight: '500',
  },
});

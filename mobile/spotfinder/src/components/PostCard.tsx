import React, { memo, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Post } from '../types';
import { formatRelativeTime, formatCount } from '../utils/formatters';
import { haptic } from '../utils/haptics';
import { useTheme, ThemeColors } from '../theme';
import { Avatar } from './Avatar';
import { OptimizedImage } from './OptimizedImage';

interface Props {
  post: Post;
  onLike: (postId: string, currentlyLiked: boolean) => void;
  onPressPlace?: (placeId: string) => void;
  onPressUser?: (userId: string) => void;
}

export const PostCard = memo(function PostCard({ post, onLike, onPressPlace, onPressUser }: Props) {
  const theme = useTheme();
  const s = useMemo(() => createStyles(theme.colors), [theme.colors]);

  const handleLike = () => {
    haptic.light();
    onLike(post.id, post.isLiked);
  };

  return (
    <View style={s.card}>
      {/* Header */}
      <Pressable style={s.header} onPress={() => onPressUser?.(post.userId)}>
        <Avatar uri={post.avatarUrl} name={post.displayName} size={36} />
        <View style={s.headerText}>
          <Text style={s.displayName}>{post.displayName}</Text>
          <Text style={s.username}>@{post.username}</Text>
        </View>
        <Text style={s.time}>{formatRelativeTime(post.createdAt)}</Text>
      </Pressable>

      {/* Phase 8.1: OptimizedImage with shimmer placeholder + fade-in */}
      {post.imageUrl ? (
        <OptimizedImage
          uri={post.imageUrl}
          style={s.image}
          resizeMode="cover"
        />
      ) : null}

      {/* Caption */}
      {post.caption ? <Text style={s.caption}>{post.caption}</Text> : null}

      {/* Place tag */}
      <TouchableOpacity style={s.placeTag} onPress={() => onPressPlace?.(post.placeId)}>
        <Ionicons name="location-outline" size={13} color={theme.colors.primary} />
        <Text style={s.placeName}>
          {post.placeName} · {post.placeCity}
        </Text>
      </TouchableOpacity>

      {/* Actions */}
      <View style={s.actions}>
        <TouchableOpacity
          style={s.actionBtn}
          onPress={handleLike}
          activeOpacity={0.7}
        >
          <Ionicons
            name={post.isLiked ? 'heart' : 'heart-outline'}
            size={22}
            color={post.isLiked ? theme.colors.danger : theme.colors.icon}
          />
          <Text style={s.actionCount}>{formatCount(post.likeCount)}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.actionBtn} activeOpacity={0.7}>
          <Ionicons name="chatbubble-outline" size={20} color={theme.colors.icon} />
          <Text style={s.actionCount}>{formatCount(post.commentCount)}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

// ── Theme-aware styles ────────────────────────────────────────────────────────

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
    card: {
      backgroundColor: c.surface,
      marginBottom: 8,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
    },
    headerText: { flex: 1, marginLeft: 10 },
    displayName: { fontWeight: '600', fontSize: 14, color: c.text },
    username: { fontSize: 12, color: c.textTertiary, marginTop: 1 },
    time: { fontSize: 11, color: c.textMuted },
    image: { width: '100%', aspectRatio: 1 },
    caption: {
      paddingHorizontal: 14,
      paddingTop: 10,
      fontSize: 14,
      color: c.textSecondary,
      lineHeight: 20,
    },
    placeTag: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 14,
      paddingVertical: 6,
      gap: 4,
    },
    placeName: { fontSize: 12, color: c.primary, fontWeight: '500' },
    actions: {
      flexDirection: 'row',
      paddingHorizontal: 10,
      paddingVertical: 8,
      gap: 16,
    },
    actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    actionCount: { fontSize: 13, color: c.textTertiary },
  });

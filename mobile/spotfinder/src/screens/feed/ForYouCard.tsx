import React, { useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Share,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { Post } from '../../types';
import { useTheme } from '../../theme';

const { width: W, height: H } = Dimensions.get('window');

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  post: Post;
  isActive: boolean;
  onLike: (postId: string, currentlyLiked: boolean) => void;
  onComment: (postId: string) => void;
  onPressPlace: (placeId: string) => void;
  onPressUser: (userId: string) => void;
}

// ── Action button ─────────────────────────────────────────────────────────────

function ActionBtn({
  icon,
  label,
  color = '#fff',
  onPress,
  active,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label?: string | number;
  color?: string;
  onPress?: () => void;
  active?: boolean;
}) {
  return (
    <TouchableOpacity style={s.actionBtn} onPress={onPress} hitSlop={8} activeOpacity={0.7}>
      <Ionicons name={icon} size={28} color={active ? '#ef4444' : color} />
      {label !== undefined && label !== '' && (
        <Text style={[s.actionLabel, { color }]}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

// ── Card ──────────────────────────────────────────────────────────────────────

export function ForYouCard({
  post,
  isActive,
  onLike,
  onComment,
  onPressPlace,
  onPressUser,
}: Props) {
  const { colors } = useTheme();

  // Double-tap to like
  const lastTap = useRef<number>(0);
  const handleImageTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      onLike(post.id, post.isLiked);
    }
    lastTap.current = now;
  }, [post.id, post.isLiked, onLike]);

  const handleShare = useCallback(async () => {
    try {
      await Share.share({
        message: `${post.placeName} — SpotFinder'da gör`,
      });
    } catch {}
  }, [post.placeName]);

  const likeCount = post.likeCount > 999
    ? `${(post.likeCount / 1000).toFixed(1)}k`
    : post.likeCount > 0 ? String(post.likeCount) : '';

  const commentCount = post.commentCount > 0 ? String(post.commentCount) : '';

  return (
    <View style={s.card}>
      {/* ── Blurred background (letterbox fill) ── */}
      {post.imageUrl ? (
        <>
          <Image
            source={{ uri: post.imageUrl }}
            style={[StyleSheet.absoluteFill, s.bgImage]}
            resizeMode="cover"
          />
          <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
        </>
      ) : (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: '#111' }]} />
      )}

      {/* ── Full-screen tap + contained image ── */}
      <TouchableOpacity
        activeOpacity={1}
        onPress={handleImageTap}
        style={StyleSheet.absoluteFill}
      >
        {post.imageUrl && (
          <Image
            source={{ uri: post.imageUrl }}
            style={StyleSheet.absoluteFill}
            resizeMode="contain"
          />
        )}
      </TouchableOpacity>

      {/* ── Top gradient (status bar readability) ── */}
      <LinearGradient
        colors={['rgba(0,0,0,0.35)', 'transparent']}
        style={s.topGradient}
        pointerEvents="none"
      />

      {/* ── Bottom gradient ── */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.75)']}
        style={s.bottomGradient}
        pointerEvents="none"
      />

      {/* ── Right action bar ── */}
      <View style={s.actionBar}>
        {/* Avatar */}
        <TouchableOpacity
          onPress={() => onPressUser(post.userId)}
          style={s.avatarWrap}
          activeOpacity={0.8}
        >
          {post.avatarUrl ? (
            <Image source={{ uri: post.avatarUrl }} style={s.avatar} />
          ) : (
            <View style={[s.avatar, s.avatarFallback]}>
              <Ionicons name="person" size={16} color="#fff" />
            </View>
          )}
          <View style={s.followBadge}>
            <Ionicons name="add" size={10} color="#fff" />
          </View>
        </TouchableOpacity>

        <View style={s.actionSpacer} />

        <ActionBtn
          icon={post.isLiked ? 'heart' : 'heart-outline'}
          label={likeCount}
          active={post.isLiked}
          onPress={() => onLike(post.id, post.isLiked)}
        />
        <ActionBtn
          icon="chatbubble-outline"
          label={commentCount}
          onPress={() => onComment(post.id)}
        />
        <ActionBtn
          icon="bookmark-outline"
          onPress={() => {}}
        />
        <ActionBtn
          icon="arrow-redo-outline"
          onPress={handleShare}
        />

        <View style={s.actionSpacer} />

        {/* "Bu yere git" */}
        <TouchableOpacity
          style={s.goBtn}
          onPress={() => onPressPlace(post.placeId)}
          activeOpacity={0.8}
        >
          <Ionicons name="navigate" size={15} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* ── Bottom left info ── */}
      <View style={s.infoArea}>
        {/* Username */}
        <TouchableOpacity onPress={() => onPressUser(post.userId)} activeOpacity={0.8}>
          <Text style={s.username}>@{post.username}</Text>
        </TouchableOpacity>

        {/* Place chip */}
        <TouchableOpacity
          style={s.placeChip}
          onPress={() => onPressPlace(post.placeId)}
          activeOpacity={0.8}
        >
          <Ionicons name="location" size={12} color="#fff" />
          <Text style={s.placeText} numberOfLines={1}>
            {post.placeName}{post.placeCity ? ` · ${post.placeCity}` : ''}
          </Text>
        </TouchableOpacity>

        {/* Caption */}
        {!!post.caption && (
          <Text style={s.caption} numberOfLines={2}>
            {post.caption}
          </Text>
        )}
      </View>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  card: {
    width: W,
    height: H,
    backgroundColor: '#000',
    overflow: 'hidden',
  },
  bgImage: {
    opacity: 0.6,
  },

  topGradient: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 120,
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    height: H * 0.55,
  },

  // ── Right action bar ──
  actionBar: {
    position: 'absolute',
    right: 12,
    bottom: 100,
    alignItems: 'center',
    gap: 4,
  },
  avatarWrap: {
    marginBottom: 8,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#fff',
  },
  avatarFallback: {
    backgroundColor: '#555',
    alignItems: 'center',
    justifyContent: 'center',
  },
  followBadge: {
    position: 'absolute',
    bottom: -6,
    alignSelf: 'center',
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#6c63ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionSpacer: { height: 12 },
  actionBtn: {
    alignItems: 'center',
    paddingVertical: 6,
    minWidth: 44,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  goBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.7)',
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },

  // ── Bottom left ──
  infoArea: {
    position: 'absolute',
    bottom: 100,
    left: 16,
    right: 72,
    gap: 6,
  },
  username: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  placeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  placeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    maxWidth: W * 0.55,
  },
  caption: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 18,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

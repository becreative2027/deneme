import React, { memo, useMemo, useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  Alert,
  Image,
  Dimensions,
} from 'react-native';

const SW = Dimensions.get('window').width;
import { Ionicons } from '@expo/vector-icons';
import { Post } from '../types';
import { formatRelativeTime, formatCount } from '../utils/formatters';
import { haptic } from '../utils/haptics';
import { useTheme, ThemeColors } from '../theme';
import { Avatar } from './Avatar';
import { OptimizedImage } from './OptimizedImage';
import { reportContent } from '../api/report';

interface Props {
  post: Post;
  onLike: (postId: string, currentlyLiked: boolean) => void;
  onPressPlace?: (placeId: string) => void;
  onPressUser?: (userId: string) => void;
  onPressComment?: (postId: string) => void;
}

export const PostCard = memo(function PostCard({ post, onLike, onPressPlace, onPressUser, onPressComment }: Props) {
  const theme = useTheme();
  const s = useMemo(() => createStyles(theme.colors), [theme.colors]);

  // Natural image height derived from actual image dimensions
  const [imgHeight, setImgHeight] = useState<number>(SW);
  useEffect(() => {
    if (!post.imageUrl) return;
    Image.getSize(
      post.imageUrl,
      (w, h) => {
        const ratio = h / w;
        // Cap at 5:4 portrait so very tall images don't flood the feed
        setImgHeight(Math.round(SW * Math.min(ratio, 1.25)));
      },
      () => setImgHeight(SW),
    );
  }, [post.imageUrl]);

  // Double-tap to like
  const lastTapRef = useRef<number>(0);
  const handleImageTap = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      if (!post.isLiked) {
        haptic.light();
        onLike(post.id, false);
      }
    }
    lastTapRef.current = now;
  };

  const handleLike = () => {
    haptic.light();
    onLike(post.id, post.isLiked);
  };

  const handleReport = () => {
    Alert.alert(
      'Gönderiyi Şikayet Et',
      'Bu gönderiyi uygunsuz içerik olarak bildirmek istiyor musun?',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Şikayet Et',
          style: 'destructive',
          onPress: () =>
            reportContent('Post', post.id).then(() =>
              Alert.alert('Teşekkürler', 'Bildiriminiz incelemeye alındı.'),
            ).catch((err: any) => {
              if (err?.response?.status === 409)
                Alert.alert('Zaten Şikayet Edildi', 'Bu gönderiyi daha önce zaten bildirdin.');
              else
                Alert.alert('Hata', 'Bir sorun oluştu, lütfen tekrar dene.');
            }),
        },
      ],
    );
  };

  return (
    <View style={s.card}>
      {/* Header */}
      <View style={s.header}>
        <Pressable style={s.headerLeft} onPress={() => onPressUser?.(post.userId)}>
          <Avatar uri={post.avatarUrl} name={post.displayName} size={36} onPress={() => onPressUser?.(post.userId)} />
          <View style={s.headerText}>
            <Text style={s.displayName}>{post.displayName || post.username || 'Kullanıcı'}</Text>
            <Text style={s.username}>@{post.username || 'kullanici'}</Text>
          </View>
        </Pressable>
        <Text style={s.time}>{formatRelativeTime(post.createdAt)}</Text>
        <TouchableOpacity onPress={handleReport} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} style={s.moreBtn}>
          <Ionicons name="ellipsis-horizontal" size={18} color={theme.colors.icon} />
        </TouchableOpacity>
      </View>

      {post.imageUrl ? (
        <TouchableOpacity activeOpacity={1} onPress={handleImageTap}>
          <OptimizedImage
            uri={post.imageUrl}
            style={[s.image, { height: imgHeight }]}
            resizeMode="cover"
          />
        </TouchableOpacity>
      ) : null}

      {/* Caption */}
      {post.caption ? <Text style={s.caption}>{post.caption}</Text> : null}

      {/* Place tag */}
      {post.placeId ? (
        <TouchableOpacity style={s.placeTag} onPress={() => onPressPlace?.(post.placeId)}>
          <Ionicons name="location-outline" size={13} color={theme.colors.primary} />
          <Text style={s.placeName}>
            {post.placeName
              ? `${post.placeName}${post.placeCity ? ` · ${post.placeCity}` : ''}`
              : 'Mekan'}
          </Text>
        </TouchableOpacity>
      ) : null}

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

        <TouchableOpacity style={s.actionBtn} activeOpacity={0.7} onPress={() => onPressComment?.(post.id)}>
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
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    headerText: { flex: 1, marginLeft: 10 },
    moreBtn: { paddingLeft: 8 },
    displayName: { fontWeight: '600', fontSize: 14, color: c.text },
    username: { fontSize: 12, color: c.textTertiary, marginTop: 1 },
    time: { fontSize: 11, color: c.textMuted },
    image: { width: '100%' },
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

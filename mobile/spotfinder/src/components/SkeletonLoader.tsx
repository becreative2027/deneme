import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '../theme';

interface SkeletonBoxProps {
  style?: StyleProp<ViewStyle>;
}

function SkeletonBox({ style }: SkeletonBoxProps) {
  const { colors } = useTheme();
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[styles.box, style, { backgroundColor: colors.skeleton, opacity }]}
    />
  );
}

// ── Post skeleton ──────────────────────────────────────────────────────────────

export function PostSkeleton() {
  const { colors } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <View style={styles.header}>
        <SkeletonBox style={styles.avatar} />
        <View style={styles.headerText}>
          <SkeletonBox style={styles.line} />
          <SkeletonBox style={[styles.line, styles.lineShort]} />
        </View>
      </View>
      <SkeletonBox style={styles.image} />
      <View style={{ padding: 12 }}>
        <SkeletonBox style={styles.line} />
        <SkeletonBox style={[styles.line, { width: '60%' }]} />
      </View>
    </View>
  );
}

// ── Place skeleton ─────────────────────────────────────────────────────────────

export function PlaceSkeleton() {
  const { colors } = useTheme();
  return (
    <View style={[styles.placeCard, { backgroundColor: colors.surface }]}>
      <SkeletonBox style={styles.placeImage} />
      <View style={{ padding: 12 }}>
        <SkeletonBox style={styles.line} />
        <SkeletonBox style={[styles.line, styles.lineShort]} />
      </View>
    </View>
  );
}

// ── Profile skeleton ───────────────────────────────────────────────────────────

export function ProfileSkeleton() {
  const { colors } = useTheme();
  return (
    <View style={[styles.profileCard, { backgroundColor: colors.surface }]}>
      {/* Avatar + action button row */}
      <View style={styles.profileAvatarRow}>
        <SkeletonBox style={styles.profileAvatar} />
        <SkeletonBox style={styles.profileAction} />
      </View>
      {/* Display name */}
      <SkeletonBox style={[styles.line, { width: '45%', marginBottom: 8 }]} />
      {/* Username */}
      <SkeletonBox style={[styles.line, { width: '30%', height: 10, marginBottom: 12 }]} />
      {/* Bio */}
      <SkeletonBox style={[styles.line, { marginBottom: 6 }]} />
      <SkeletonBox style={[styles.line, { width: '70%', marginBottom: 20 }]} />
      {/* Stats row */}
      <View style={styles.statsRow}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={styles.statItem}>
            <SkeletonBox style={[styles.line, { width: 32, height: 18, marginBottom: 4 }]} />
            <SkeletonBox style={[styles.line, { width: 48, height: 10 }]} />
          </View>
        ))}
      </View>
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  box: { borderRadius: 4 },
  // Post
  card: { marginBottom: 8 },
  header: { flexDirection: 'row', padding: 12, alignItems: 'center' },
  avatar: { width: 36, height: 36, borderRadius: 18 },
  headerText: { flex: 1, marginLeft: 10, gap: 6 },
  line: { height: 12, borderRadius: 6, width: '80%' },
  lineShort: { width: '40%' },
  image: { width: '100%', height: 300 },
  // Place
  placeCard: { borderRadius: 12, overflow: 'hidden', marginBottom: 12 },
  placeImage: { width: '100%', height: 160 },
  // Profile
  profileCard: { padding: 20 },
  profileAvatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  profileAvatar: { width: 72, height: 72, borderRadius: 36 },
  profileAction: { width: 90, height: 34, borderRadius: 17 },
  statsRow: { flexDirection: 'row', gap: 24 },
  statItem: { alignItems: 'center' },
});

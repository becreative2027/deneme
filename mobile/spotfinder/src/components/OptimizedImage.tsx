/**
 * Phase 8.3 — OptimizedImage (expo-image edition)
 *
 * Replaces the manual Animated.Image shimmer with expo-image which provides:
 *   - Memory + disk HTTP caching (cachePolicy="memory-disk")
 *   - Built-in smooth fade-in transition
 *   - Blurhash placeholder while loading
 *   - Automatic CDN cache revalidation via ETag / Last-Modified
 *
 * Public API is identical to the Phase 8.1 version — drop-in replacement.
 */
import React, { useState } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { Image, ImageContentFit } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

// Neutral gray blurhash used as loading placeholder
const PLACEHOLDER_BLURHASH = 'L9AS}j^-RjxG_4?bIUNH-;RiM{Rk';

interface Props {
  uri?: string | null;
  style?: ViewStyle | ViewStyle[];
  resizeMode?: ImageContentFit;
  /** Background shown behind placeholder (used for error fallback) */
  placeholderColor?: string;
  /** Ionicons icon shown when image fails to load */
  errorIcon?: keyof typeof Ionicons.glyphMap;
}

export function OptimizedImage({
  uri,
  style,
  resizeMode = 'cover',
  placeholderColor = '#f0f0f0',
  errorIcon = 'image-outline',
}: Props) {
  const [hasError, setHasError] = useState(false);

  // No URI or load error → show fallback icon
  if (!uri || hasError) {
    return (
      <View style={[styles.fallback, { backgroundColor: placeholderColor }, style]}>
        <Ionicons name={errorIcon} size={28} color="#ccc" />
      </View>
    );
  }

  return (
    <Image
      source={{ uri }}
      style={[styles.base, style] as any}
      contentFit={resizeMode}
      // memory-disk = in-memory LRU + persistent disk cache keyed by URL
      cachePolicy="memory-disk"
      // Smooth 280ms cross-fade from blurhash placeholder → image
      transition={280}
      placeholder={PLACEHOLDER_BLURHASH}
      onError={() => setHasError(true)}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
  },
  fallback: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

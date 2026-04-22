import React, { useState } from 'react';
import { Image, ImageResizeMode, StyleSheet, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  uri?: string | null;
  style?: ViewStyle | ViewStyle[];
  resizeMode?: ImageResizeMode;
  placeholderColor?: string;
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
      resizeMode={resizeMode}
      onError={() => setHasError(true)}
    />
  );
}

const styles = StyleSheet.create({
  base:     { overflow: 'hidden' },
  fallback: { overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
});

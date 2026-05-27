import React from 'react';
import { View, Image, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface Props {
  uri?: string | null;
  name: string;
  size?: number;
  onPress?: () => void;
  /** @deprecated use onPress instead — kept for compatibility */
  expandable?: boolean;
}

export function Avatar({ uri, name, size = 40, onPress }: Props) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const imageStyle = { width: size, height: size, borderRadius: size / 2 };

  if (uri) {
    if (onPress) {
      return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
          <Image source={{ uri }} style={[styles.image, imageStyle]} />
        </TouchableOpacity>
      );
    }
    return <Image source={{ uri }} style={[styles.image, imageStyle]} />;
  }

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
        <View style={[styles.placeholder, imageStyle]}>
          <Text style={[styles.initials, { fontSize: size * 0.38 }]}>{initials}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.placeholder, imageStyle]}>
      <Text style={[styles.initials, { fontSize: size * 0.38 }]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image:       { backgroundColor: '#ddd' },
  placeholder: {
    backgroundColor: '#6c63ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: { color: '#fff', fontWeight: '700' },
});

import React, { useState } from 'react';
import { View, Image, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AvatarViewer } from './AvatarViewer';

interface Props {
  uri?: string | null;
  name: string;
  size?: number;
  /** Set false to disable tap-to-expand (e.g. inside a modal that already blocks input) */
  expandable?: boolean;
}

export function Avatar({ uri, name, size = 40, expandable = true }: Props) {
  const [viewing, setViewing] = useState(false);

  const initials = name
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const imageStyle = { width: size, height: size, borderRadius: size / 2 };

  if (uri) {
    if (!expandable) {
      return <Image source={{ uri }} style={[styles.image, imageStyle]} />;
    }
    return (
      <>
        <TouchableOpacity onPress={() => setViewing(true)} activeOpacity={0.85}>
          <Image source={{ uri }} style={[styles.image, imageStyle]} />
        </TouchableOpacity>
        <AvatarViewer
          uri={uri}
          visible={viewing}
          onClose={() => setViewing(false)}
          originSize={size}
        />
      </>
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

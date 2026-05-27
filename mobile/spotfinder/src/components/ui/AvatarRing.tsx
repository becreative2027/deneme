import React, { useState } from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { shadow } from '../../theme';
import { AvatarViewer } from '../AvatarViewer';

interface Props {
  uri?: string;
  size?: number;
  ringWidth?: number;
}

export function AvatarRing({ uri, size = 88, ringWidth = 3 }: Props) {
  const { colors } = useTheme();
  const outerSize = size + ringWidth * 2 + 4;
  const [viewing, setViewing] = useState(false);

  const inner = (
    <View style={{ width: outerSize, height: outerSize }}>
      <LinearGradient
        colors={[colors.accent, colors.accentDeep]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.ring,
          {
            width: outerSize,
            height: outerSize,
            borderRadius: outerSize / 2,
          },
          shadow.amber,
        ]}
      >
        <View
          style={[
            styles.inner,
            {
              width: size + 4,
              height: size + 4,
              borderRadius: (size + 4) / 2,
              backgroundColor: colors.background,
            },
          ]}
        >
          {uri ? (
            <Image
              source={{ uri }}
              style={{ width: size, height: size, borderRadius: size / 2 }}
              accessibilityLabel="Profil fotoğrafı"
            />
          ) : (
            <View
              style={[
                styles.placeholder,
                {
                  width: size,
                  height: size,
                  borderRadius: size / 2,
                  backgroundColor: colors.surfaceElevated,
                },
              ]}
            >
              <Ionicons name="person" size={size * 0.45} color={colors.textTertiary} />
            </View>
          )}
        </View>
      </LinearGradient>
    </View>
  );

  if (!uri) return inner;

  return (
    <>
      <TouchableOpacity onPress={() => setViewing(true)} activeOpacity={0.85}>
        {inner}
      </TouchableOpacity>
      <AvatarViewer uri={uri} visible={viewing} onClose={() => setViewing(false)} originSize={size} />
    </>
  );
}

const styles = StyleSheet.create({
  ring: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

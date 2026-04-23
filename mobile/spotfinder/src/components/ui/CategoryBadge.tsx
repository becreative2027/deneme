import React from 'react';
import { Platform, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../../theme';
import { radius, typography } from '../../theme';

interface Props {
  label: string;
  variant?: 'solid' | 'glass' | 'rating';
  style?: StyleProp<ViewStyle>;
}

export function CategoryBadge({ label, variant = 'solid', style }: Props) {
  const { colors, isDark } = useTheme();

  if (variant === 'glass' && Platform.OS === 'ios') {
    return (
      <BlurView
        intensity={20}
        tint={isDark ? 'dark' : 'light'}
        style={[styles.base, style]}
      >
        <Text style={[typography.caption, styles.label, { color: '#fff' }]}>
          {label}
        </Text>
      </BlurView>
    );
  }

  if (variant === 'rating') {
    return (
      <View
        style={[
          styles.base,
          { backgroundColor: colors.accentSoft, borderColor: colors.accentBorder, borderWidth: 1 },
          style,
        ]}
      >
        <Text style={[typography.caption, styles.label, { color: colors.accent }]}>
          ★ {label}
        </Text>
      </View>
    );
  }

  // solid (default) + glass fallback
  const isSolid = variant === 'solid';
  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor: isSolid ? colors.accent : colors.glassBg,
          borderColor: isSolid ? 'transparent' : colors.glassBorder,
          borderWidth: isSolid ? 0 : 1,
        },
        style,
      ]}
    >
      <Text
        style={[
          typography.caption,
          styles.label,
          { color: isSolid ? colors.accentOnAccent : colors.text },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
    overflow: 'hidden',
    alignSelf: 'flex-start',
  },
  label: {
    fontWeight: '700',
  },
});

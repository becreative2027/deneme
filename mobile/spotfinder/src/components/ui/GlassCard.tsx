import React from 'react';
import { Platform, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../../theme';
import { radius, shadow } from '../../theme';

interface Props {
  children: React.ReactNode;
  strong?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function GlassCard({ children, strong = false, style }: Props) {
  const { colors, isDark } = useTheme();

  const bg = strong ? colors.glassBgStrong : colors.glassBg;
  const border = strong ? colors.glassBorderStrong : colors.glassBorder;

  if (Platform.OS === 'ios') {
    return (
      <BlurView
        intensity={strong ? 40 : 24}
        tint={isDark ? 'dark' : 'light'}
        style={[
          styles.base,
          { borderRadius: radius['2xl'], borderColor: border },
          shadow.card,
          style,
        ]}
      >
        {children}
      </BlurView>
    );
  }

  // Android fallback
  return (
    <View
      style={[
        styles.base,
        { backgroundColor: bg, borderRadius: radius['2xl'], borderColor: border },
        shadow.card,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
    borderWidth: 1,
  },
});

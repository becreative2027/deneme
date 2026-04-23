import React from 'react';
import { StyleProp, Text, TextStyle } from 'react-native';
import { useTheme } from '../../theme';
import { typography } from '../../theme';

interface Props {
  children: string;
  style?: StyleProp<TextStyle>;
}

export function Eyebrow({ children, style }: Props) {
  const { colors } = useTheme();
  return (
    <Text style={[typography.eyebrow, { color: colors.accent }, style]}>
      {children}
    </Text>
  );
}

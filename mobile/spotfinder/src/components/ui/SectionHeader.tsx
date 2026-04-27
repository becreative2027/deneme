import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../theme';
import { typography, spacing } from '../../theme';
import { Eyebrow } from './Eyebrow';

interface Props {
  eyebrow?: string;
  title: string;
  onSeeAll?: () => void;
  seeAllLabel?: string;
}

export function SectionHeader({ eyebrow, title, onSeeAll, seeAllLabel = 'Tümü →' }: Props) {
  const { colors } = useTheme();

  return (
    <View style={styles.row}>
      <View style={styles.left}>
        {eyebrow ? <Eyebrow style={{ marginBottom: 2 }}>{eyebrow}</Eyebrow> : null}
        <Text style={[typography.titleM, { color: colors.text }]}>{title}</Text>
      </View>
      {onSeeAll && (
        <TouchableOpacity onPress={onSeeAll} hitSlop={8} accessibilityRole="button">
          <Text style={[typography.caption, { color: colors.accent, fontWeight: '600' }]}>
            {seeAllLabel}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  left: {
    flex: 1,
  },
});

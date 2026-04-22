import React from 'react';
import {
  ActivityIndicator,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { radius, shadow, typography } from '../../theme';

interface Props {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'ghost' | 'apple';
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  iconRight?: React.ComponentProps<typeof Ionicons>['name'];
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

export function AmberButton({
  label,
  onPress,
  variant = 'primary',
  icon,
  iconRight,
  loading = false,
  disabled = false,
  style,
  accessibilityLabel,
}: Props) {
  const { colors } = useTheme();
  const isDisabled = disabled || loading;

  const content = (
    <View style={styles.inner}>
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? colors.accentOnAccent : colors.accent}
          size="small"
        />
      ) : (
        <>
          {icon && (
            <Ionicons
              name={icon}
              size={18}
              color={variant === 'primary' ? colors.accentOnAccent : variant === 'apple' ? '#000' : colors.text}
              style={styles.iconLeft}
            />
          )}
          <Text
            style={[
              styles.label,
              typography.body,
              {
                color:
                  variant === 'primary'
                    ? colors.accentOnAccent
                    : variant === 'apple'
                    ? '#000'
                    : colors.text,
                fontWeight: '700',
              },
            ]}
          >
            {label}
          </Text>
          {iconRight && (
            <Ionicons
              name={iconRight}
              size={16}
              color={variant === 'primary' ? colors.accentOnAccent : colors.text}
              style={styles.iconRight}
            />
          )}
        </>
      )}
    </View>
  );

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? label}
        style={[styles.base, isDisabled && styles.disabled, style]}
      >
        <LinearGradient
          colors={[colors.accent, colors.accentDeep]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={[styles.gradient, shadow.amber]}
        >
          {content}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  if (variant === 'apple') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? label}
        style={[
          styles.base,
          styles.apple,
          isDisabled && styles.disabled,
          style,
        ]}
      >
        {content}
      </TouchableOpacity>
    );
  }

  // ghost
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      style={[
        styles.base,
        styles.ghost,
        { borderColor: colors.glassBorderStrong },
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {content}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    minHeight: 52,
    justifyContent: 'center',
  },
  gradient: {
    flex: 1,
    borderRadius: radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 52,
  },
  ghost: {
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  apple: {
    backgroundColor: '#FFFFFF',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 8,
  },
  label: {
    fontSize: 15,
  },
  iconLeft: {
    marginRight: 2,
  },
  iconRight: {
    marginLeft: 2,
  },
  disabled: {
    opacity: 0.45,
  },
});

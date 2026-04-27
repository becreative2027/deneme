import React, { useState } from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { radius, spacing, typography } from '../../theme';

interface Props extends TextInputProps {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  eyebrow?: string;
  trailing?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  isPassword?: boolean;
}

export function AmberInput({
  icon,
  eyebrow,
  trailing,
  containerStyle,
  isPassword = false,
  ...textInputProps
}: Props) {
  const { colors } = useTheme();
  const [secure, setSecure] = useState(isPassword);

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {/* Icon badge */}
      <View
        style={[
          styles.iconBadge,
          {
            backgroundColor: colors.accentSoft,
            borderColor: colors.accentBorder,
          },
        ]}
      >
        <Ionicons name={icon} size={17} color={colors.accent} />
      </View>

      {/* Input area */}
      <View style={styles.inputArea}>
        {eyebrow ? (
          <Text style={[typography.eyebrow, { color: colors.accent, marginBottom: 2 }]}>
            {eyebrow}
          </Text>
        ) : null}
        <TextInput
          {...textInputProps}
          secureTextEntry={secure}
          placeholderTextColor={colors.textMuted}
          style={[
            styles.input,
            typography.body,
            { color: colors.text },
          ]}
          accessibilityLabel={eyebrow ?? textInputProps.placeholder}
        />
      </View>

      {/* Trailing slot */}
      {isPassword ? (
        <TouchableOpacity
          onPress={() => setSecure((v) => !v)}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={secure ? 'Şifreyi göster' : 'Şifreyi gizle'}
        >
          <Text style={[styles.trailingText, { color: colors.accent }]}>
            {secure ? 'Göster' : 'Gizle'}
          </Text>
        </TouchableOpacity>
      ) : trailing ? (
        <View>{trailing}</View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  inputArea: {
    flex: 1,
  },
  input: {
    padding: 0,
    margin: 0,
    fontSize: 15,
  },
  trailingText: {
    fontSize: 13,
    fontWeight: '600',
  },
});

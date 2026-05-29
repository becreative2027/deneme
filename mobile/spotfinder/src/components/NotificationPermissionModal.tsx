import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme, spacing, radius, typography, shadow } from '../theme';
import { useTranslation } from 'react-i18next';
import { AmberButton } from './ui';

interface Props {
  visible: boolean;
  onAllow: () => void;
  onDismiss: () => void;
}

const { height: SCREEN_H } = Dimensions.get('window');

export function NotificationPermissionModal({ visible, onAllow, onDismiss }: Props) {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();
  const slideAnim = useRef(new Animated.Value(SCREEN_H)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          damping: 22,
          stiffness: 200,
        }),
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SCREEN_H,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const features = [
    { icon: 'heart',           text: t('notifications_permission.feature1') },
    { icon: 'chatbubble',      text: t('notifications_permission.feature2') },
    { icon: 'person-add',      text: t('notifications_permission.feature3') },
    { icon: 'location',        text: t('notifications_permission.feature4') },
  ] as const;

  return (
    <Modal transparent visible={visible} animationType="none" statusBarTranslucent>
      {/* Backdrop */}
      <Animated.View
        style={[styles.backdrop, { opacity: backdropAnim }]}
        pointerEvents="none"
      />
      <TouchableOpacity
        style={StyleSheet.absoluteFill}
        activeOpacity={1}
        onPress={onDismiss}
      />

      {/* Sheet */}
      <Animated.View
        style={[styles.sheetWrap, { transform: [{ translateY: slideAnim }] }]}
        pointerEvents="box-none"
      >
        <BlurView
          intensity={isDark ? 80 : 60}
          tint={isDark ? 'dark' : 'light'}
          style={[styles.sheet, { backgroundColor: colors.surfaceElevated }]}
        >
          {/* Handle */}
          <View style={[styles.handle, { backgroundColor: colors.border }]} />

          {/* Icon */}
          <View style={styles.iconWrap}>
            <LinearGradient
              colors={['#6c63ff', '#a855f7']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.iconCircle, shadow.amber]}
            >
              <Ionicons name="notifications" size={32} color="#fff" />
            </LinearGradient>
          </View>

          {/* Title */}
          <Text style={[typography.titleL, { color: colors.text, textAlign: 'center', marginTop: spacing.lg }]}>
            {t('notifications_permission.title')}
          </Text>
          <Text style={[typography.bodyDim, { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.sm, paddingHorizontal: spacing['2xl'] }]}>
            {t('notifications_permission.subtitle')}
          </Text>

          {/* Feature list */}
          <View style={[styles.featureList, { borderColor: colors.borderLight }]}>
            {features.map((f) => (
              <View key={f.icon} style={styles.featureRow}>
                <View style={[styles.featureIcon, { backgroundColor: colors.accentSoft }]}>
                  <Ionicons name={f.icon} size={16} color={colors.accent} />
                </View>
                <Text style={[typography.body, { color: colors.textSecondary, flex: 1 }]}>
                  {f.text}
                </Text>
              </View>
            ))}
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <AmberButton
              label={t('notifications_permission.allow')}
              variant="primary"
              onPress={onAllow}
              icon="notifications-outline"
              style={{ flex: 1 }}
            />
            <TouchableOpacity onPress={onDismiss} style={styles.laterBtn} accessibilityRole="button">
              <Text style={[typography.body, { color: colors.textTertiary }]}>
                {t('notifications_permission.later')}
              </Text>
            </TouchableOpacity>
          </View>
        </BlurView>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheetWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  sheet: {
    borderTopLeftRadius: radius['2xl'],
    borderTopRightRadius: radius['2xl'],
    paddingHorizontal: spacing.lg,
    paddingBottom: 40,
    paddingTop: spacing.md,
    overflow: 'hidden',
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing.xl,
  },
  iconWrap: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureList: {
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  featureIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: {
    gap: spacing.sm,
  },
  laterBtn: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
});

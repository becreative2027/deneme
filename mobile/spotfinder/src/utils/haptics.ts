import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

// Haptics are best-effort: silently no-op on web or if not available.
function safe(fn: () => Promise<void>): void {
  if (Platform.OS === 'web') return;
  fn().catch(() => {});
}

export const haptic = {
  /** Light tap — use for likes, selections */
  light: () =>
    safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),

  /** Medium tap — use for button presses, tab switches */
  medium: () =>
    safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)),

  /** Heavy tap — use for destructive actions */
  heavy: () =>
    safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)),

  /** System success vibration — use after post share, follow */
  success: () =>
    safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),

  /** System warning vibration — use for validation errors */
  warning: () =>
    safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)),

  /** System error vibration — use for network / API errors */
  error: () =>
    safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)),
};

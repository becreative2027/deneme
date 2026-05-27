import { useEffect, useRef, useState } from 'react';
import * as Notifications from 'expo-notifications';
import { Linking, Platform } from 'react-native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { registerDevice } from '../api/notifications';
import { routeNotification, NotificationPayload } from '../navigation/navigationRef';
import { saveNotification } from '../utils/notificationStorage';

// ── Global notification handler (foreground display policy) ──────────────────

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// ── Storage keys ──────────────────────────────────────────────────────────────

const KEY_PERMISSION_ASKED = 'notification_permission_asked';

// ── Helpers ───────────────────────────────────────────────────────────────────

async function registerPushToken(): Promise<void> {
  // Constants.isDevice is unreliable in bare workflow production builds — skip the check
  // and let getExpoPushTokenAsync fail naturally if running on a simulator.

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId ??
    '9b34ffd4-0bd5-49d2-bdb8-beb17673402c';

  const { data: pushToken } = await Notifications.getExpoPushTokenAsync({ projectId });
  await registerDevice(pushToken);

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#6c63ff',
    });
  }
}

export async function requestNotificationPermission(): Promise<'granted' | 'denied' | 'undetermined'> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') {
    await registerPushToken().catch(() => {});
    return 'granted';
  }

  const { status } = await Notifications.requestPermissionsAsync();
  if (status === 'granted') {
    await registerPushToken().catch(() => {});
    return 'granted';
  }

  return 'denied';
}

export function openNotificationSettings(): void {
  if (Platform.OS === 'ios') {
    Linking.openURL('app-settings:').catch(() => {});
  } else {
    Linking.openSettings().catch(() => {});
  }
}

function extractPayload(
  notification: Notifications.Notification,
): NotificationPayload | null {
  const data = notification.request.content.data as Record<string, unknown>;
  if (!data || typeof data.type !== 'string') return null;
  return {
    type: data.type as NotificationPayload['type'],
    postId: typeof data.postId === 'string' ? data.postId : undefined,
    userId: typeof data.userId === 'string' ? data.userId : undefined,
    placeId: typeof data.placeId === 'string' ? data.placeId : undefined,
  };
}

// ── Hook: permission modal controller ────────────────────────────────────────

/**
 * Controls when to show the pre-permission modal.
 * Shows after a short delay on first authenticated session,
 * but only if permission hasn't been asked before.
 */
export function useNotificationPermissionPrompt(onShowToast: (msg: string) => void) {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    (async () => {
      // Already asked before → skip modal, just register if already granted
      const asked = await AsyncStorage.getItem(KEY_PERMISSION_ASKED);
      if (asked === 'true') {
        const { status } = await Notifications.getPermissionsAsync();
        if (status === 'granted') {
          await registerPushToken().catch(() => {});
        }
        return;
      }

      // Wait 3 seconds before showing modal so user can orient themselves
      timer = setTimeout(() => setShowModal(true), 3000);
    })();

    return () => clearTimeout(timer);
  }, []);

  const handleAllow = async () => {
    setShowModal(false);
    await AsyncStorage.setItem(KEY_PERMISSION_ASKED, 'true');
    const result = await requestNotificationPermission();
    if (result === 'denied') {
      onShowToast('Ayarlar\'dan bildirimlere izin verebilirsin.');
    }
  };

  const handleDismiss = async () => {
    setShowModal(false);
    await AsyncStorage.setItem(KEY_PERMISSION_ASKED, 'true');
  };

  return { showModal, handleAllow, handleDismiss };
}

// ── Hook: tap response handler ────────────────────────────────────────────────

/**
 * Subscribes to notification tap events (background / killed-state).
 */
function saveAndRoute(notification: Notifications.Notification): void {
  const { title, body } = notification.request.content;
  const payload = extractPayload(notification);
  saveNotification({
    title: title ?? 'SpotFinder',
    body: body ?? '',
    type: payload?.type,
    postId: payload?.postId,
    userId: payload?.userId,
    placeId: payload?.placeId,
  });
  if (payload) routeNotification(payload);
}

export function useNotificationResponseHandler(): void {
  const listenerRef = useRef<Notifications.Subscription | null>(null);

  useEffect(() => {
    listenerRef.current = Notifications.addNotificationResponseReceivedListener(
      (response) => saveAndRoute(response.notification),
    );

    // Handle tap on notification that launched the app from killed state
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) saveAndRoute(response.notification);
    });

    return () => {
      listenerRef.current?.remove();
    };
  }, []);
}

// ── Hook: foreground receiver ─────────────────────────────────────────────────

export function useNotificationForegroundReceiver(
  onReceive: (title: string, body: string) => void,
): void {
  const callbackRef = useRef(onReceive);
  callbackRef.current = onReceive;

  useEffect(() => {
    const sub = Notifications.addNotificationReceivedListener((notification) => {
      const { title, body } = notification.request.content;
      if (title || body) {
        callbackRef.current(title ?? 'SpotFinder', body ?? '');
      }
    });
    return () => sub.remove();
  }, []);
}

// ── Hook: legacy (kept for backward compat) ───────────────────────────────────
/** @deprecated Use useNotificationPermissionPrompt instead */
export function useNotifications(): void {}

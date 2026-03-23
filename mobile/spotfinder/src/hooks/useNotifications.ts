import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { registerDevice } from '../api/notifications';
import { routeNotification, NotificationPayload } from '../navigation/navigationRef';

// ── Global notification handler (foreground display policy) ──────────────────

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// ── Helpers ───────────────────────────────────────────────────────────────────

async function requestAndRegister(): Promise<void> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;

  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') return;

  const { data: pushToken } = await Notifications.getExpoPushTokenAsync();
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

// ── Hook: token registration ──────────────────────────────────────────────────

/**
 * Registers the device push token with the backend once, on mount.
 * Call inside the authenticated part of the app.
 */
export function useNotifications(): void {
  useEffect(() => {
    requestAndRegister().catch(() => {});
  }, []);
}

// ── Hook: tap response handler ────────────────────────────────────────────────

/**
 * Subscribes to notification tap events (background / killed-state).
 * When the user taps a notification, routes to the relevant screen.
 *
 * Call once at the authenticated root — pairs with `navigationRef`.
 */
export function useNotificationResponseHandler(): void {
  const listenerRef = useRef<Notifications.Subscription | null>(null);

  useEffect(() => {
    // Handle tap on notification received while app was in background/killed
    listenerRef.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const payload = extractPayload(response.notification);
        if (payload) routeNotification(payload);
      },
    );

    // Handle the initial notification that launched the app (killed state)
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) {
        const payload = extractPayload(response.notification);
        if (payload) routeNotification(payload);
      }
    });

    return () => {
      listenerRef.current?.remove();
    };
  }, []);
}

// ── Hook: foreground receiver (in-app banner via callback) ────────────────────

/**
 * Subscribes to notifications received while the app is foregrounded.
 * Calls `onReceive` with a human-readable title/body so the caller
 * can display an in-app banner (e.g., using the Toast system).
 */
export function useNotificationForegroundReceiver(
  onReceive: (title: string, body: string) => void,
): void {
  const callbackRef = useRef(onReceive);
  callbackRef.current = onReceive; // keep fresh without re-subscribing

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

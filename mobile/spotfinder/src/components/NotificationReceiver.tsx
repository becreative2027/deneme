/**
 * NotificationReceiver — null-rendering component.
 *
 * Sits inside ToastProvider so it can call useToast().
 * Handles:
 *   1. Foreground notification → in-app toast banner + AsyncStorage save
 *   2. Notification tap (background/killed) → routeNotification (via useNotificationResponseHandler)
 *
 * Mount once inside the authenticated tree (RootNavigator).
 */
import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { useNotificationResponseHandler } from '../hooks/useNotifications';
import { useToast } from './Toast';
import { saveNotification } from '../utils/notificationStorage';
import { routeNotification, NotificationPayload } from '../navigation/navigationRef';

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

export function NotificationReceiver() {
  const { showToast } = useToast();
  const callbackRef = useRef(showToast);
  callbackRef.current = showToast;

  // Route to correct screen when user taps a notification
  useNotificationResponseHandler();

  // Foreground: show toast + persist to storage
  useEffect(() => {
    const sub = Notifications.addNotificationReceivedListener((notification) => {
      const { title, body } = notification.request.content;
      const payload = extractPayload(notification);

      if (title || body) {
        callbackRef.current(
          `${title ?? 'SpotFinder'}${body ? ` — ${body}` : ''}`,
          'info',
        );
      }

      // Persist so profile screen can show recent notifications
      saveNotification({
        title: title ?? 'SpotFinder',
        body: body ?? '',
        type: payload?.type,
        postId: payload?.postId,
        userId: payload?.userId,
        placeId: payload?.placeId,
      });
    });

    return () => sub.remove();
  }, []);

  return null;
}

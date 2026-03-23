/**
 * NotificationReceiver — null-rendering component.
 *
 * Sits inside ToastProvider so it can call useToast().
 * Handles:
 *   1. Foreground notification → in-app toast banner
 *   2. Notification tap (background/killed) → routeNotification (via useNotificationResponseHandler)
 *
 * Mount once inside the authenticated tree (RootNavigator).
 */
import { useNotificationForegroundReceiver, useNotificationResponseHandler } from '../hooks/useNotifications';
import { useToast } from './Toast';

export function NotificationReceiver() {
  const { showToast } = useToast();

  // Route to correct screen when user taps a notification
  useNotificationResponseHandler();

  // Show in-app toast for notifications received while foregrounded
  useNotificationForegroundReceiver((title, body) => {
    showToast(`${title}${body ? ` — ${body}` : ''}`, 'info');
  });

  return null;
}

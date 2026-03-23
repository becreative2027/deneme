import { createNavigationContainerRef, CommonActions } from '@react-navigation/native';
import { RootStackParamList } from '../types';

/**
 * Global navigation ref — used outside the React component tree
 * (e.g., notification tap handlers, analytics utilities).
 *
 * Pass this ref to <NavigationContainer ref={navigationRef} />.
 */
export const navigationRef = createNavigationContainerRef<RootStackParamList>();

// ── Notification routing helpers ──────────────────────────────────────────────

export type NotificationPayload = {
  /** Identifies the notification category for routing */
  type: 'like' | 'comment' | 'follow' | 'new_post' | 'recommendation';
  /** ID of the referenced post (like, comment, new_post) */
  postId?: string;
  /** ID of the referenced user (follow, like, comment) */
  userId?: string;
  /** ID of the referenced place (recommendation) */
  placeId?: string;
};

/**
 * Routes to the correct screen based on notification payload.
 * Safe to call even if the navigator is not yet mounted — guards with `isReady()`.
 */
export function routeNotification(payload: NotificationPayload): void {
  if (!navigationRef.isReady()) return;

  switch (payload.type) {
    case 'like':
    case 'comment':
    case 'new_post':
      // Navigate into the Feed tab (no PostDetail screen yet — future phase)
      navigationRef.dispatch(
        CommonActions.navigate('Main', {
          screen: 'FeedTab',
          params: { screen: 'Feed' },
        } as any),
      );
      break;

    case 'follow':
      // Open the follower's profile if userId is provided, else own ProfileTab
      if (payload.userId) {
        navigationRef.dispatch(
          CommonActions.navigate('Main', {
            screen: 'FeedTab',
            params: {
              screen: 'UserProfile',
              params: { userId: payload.userId },
            },
          } as any),
        );
      } else {
        navigationRef.dispatch(
          CommonActions.navigate('Main', { screen: 'ProfileTab' } as any),
        );
      }
      break;

    case 'recommendation':
      if (payload.placeId) {
        navigationRef.dispatch(
          CommonActions.navigate('Main', {
            screen: 'SearchTab',
            params: {
              screen: 'PlaceDetail',
              params: { placeId: payload.placeId },
            },
          } as any),
        );
      } else {
        navigationRef.dispatch(
          CommonActions.navigate('Main', { screen: 'SearchTab' } as any),
        );
      }
      break;

    default:
      // Unknown type — navigate home
      navigationRef.dispatch(
        CommonActions.navigate('Main', { screen: 'FeedTab' } as any),
      );
  }
}

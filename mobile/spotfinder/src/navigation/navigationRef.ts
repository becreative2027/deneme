import { createNavigationContainerRef, CommonActions } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { getPost } from '../api/posts';

/**
 * Global navigation ref — used outside the React component tree
 * (e.g., notification tap handlers, analytics utilities).
 */
export const navigationRef = createNavigationContainerRef<RootStackParamList>();

// ── Types ─────────────────────────────────────────────────────────────────────

export type NotificationPayload = {
  type: 'like' | 'comment' | 'follow' | 'new_post' | 'recommendation';
  postId?: string;
  userId?: string;
  placeId?: string;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Wait until the navigator is ready (max ~3 s after app launch). */
function waitReady(maxMs = 3000): Promise<void> {
  return new Promise((resolve) => {
    if (navigationRef.isReady()) { resolve(); return; }
    const start = Date.now();
    const check = setInterval(() => {
      if (navigationRef.isReady() || Date.now() - start > maxMs) {
        clearInterval(check);
        resolve();
      }
    }, 100);
  });
}

function goToPlace(placeId: string) {
  navigationRef.dispatch(
    CommonActions.navigate('Main', {
      screen: 'FeedTab',
      params: { screen: 'PlaceDetail', params: { placeId } },
    } as any),
  );
}

function goToUser(userId: string) {
  navigationRef.dispatch(
    CommonActions.navigate('Main', {
      screen: 'FeedTab',
      params: { screen: 'UserProfile', params: { userId } },
    } as any),
  );
}

function goToFeed() {
  navigationRef.dispatch(
    CommonActions.navigate('Main', { screen: 'FeedTab' } as any),
  );
}

// ── Main router ───────────────────────────────────────────────────────────────

/**
 * Routes to the correct screen based on a push notification payload.
 *
 * Priority logic:
 *   like / comment / new_post → PlaceDetail (via placeId, or fetched from postId)
 *   follow                    → UserProfile (userId)
 *   recommendation            → PlaceDetail (placeId)
 */
export async function routeNotification(payload: NotificationPayload): Promise<void> {
  await waitReady();

  switch (payload.type) {
    case 'like':
    case 'comment':
    case 'new_post': {
      // Best case: placeId already in payload
      if (payload.placeId) {
        goToPlace(payload.placeId);
        return;
      }
      // Fallback: fetch post to get placeId
      if (payload.postId) {
        try {
          const post = await getPost(payload.postId);
          if (post?.placeId) { goToPlace(post.placeId); return; }
        } catch {}
      }
      // Last resort: open feed
      goToFeed();
      return;
    }

    case 'follow':
      if (payload.userId) { goToUser(payload.userId); return; }
      navigationRef.dispatch(
        CommonActions.navigate('Main', { screen: 'ProfileTab' } as any),
      );
      return;

    case 'recommendation':
      if (payload.placeId) { goToPlace(payload.placeId); return; }
      navigationRef.dispatch(
        CommonActions.navigate('Main', { screen: 'SearchTab' } as any),
      );
      return;

    default:
      goToFeed();
  }
}

/**
 * Phase 8.1 — Analytics Hook
 *
 * Provider-agnostic event tracking. In development, events are logged to
 * console. In production, swap the `send` function body to forward events
 * to Firebase Analytics, Amplitude, Segment, or any other SDK.
 *
 * Tracked events (per spec):
 *   screen_view        — { screen: string }
 *   feed_tab_change    — { tab: string }
 *   post_create        — { placeId: string }
 *   place_open         — { placeId: string; source: string }
 *   post_like          — { postId: string; liked: boolean }
 *   follow_user        — { userId: string; action: 'follow' | 'unfollow' }
 *   search_query       — { query: string }
 */

type EventName =
  | 'screen_view'
  | 'feed_tab_change'
  | 'post_create'
  | 'place_open'
  | 'post_like'
  | 'follow_user'
  | 'search_query';

type EventProps = Record<string, string | number | boolean | undefined>;

function send(event: EventName, props?: EventProps): void {
  if (__DEV__) {
    console.log(`[Analytics] ${event}`, props ?? '');
    return;
  }
  // Production: forward to real SDK here.
  // Example (Firebase):
  //   analytics().logEvent(event, props);
  // Example (Amplitude):
  //   Amplitude.logEvent(event, props);
}

export interface AnalyticsHook {
  trackScreen: (screenName: string) => void;
  trackEvent: (event: EventName, props?: EventProps) => void;
}

export function useAnalytics(): AnalyticsHook {
  return {
    trackScreen: (screenName: string) => send('screen_view', { screen: screenName }),
    trackEvent: send,
  };
}

import { useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as StoreReview from 'expo-store-review';

const KEY_COUNT   = 'rating_action_count';
const KEY_SHOWN   = 'rating_prompt_shown';
const THRESHOLD   = 5; // trigger after 5 meaningful actions

async function maybeRequestReview(): Promise<void> {
  const shown = await AsyncStorage.getItem(KEY_SHOWN);
  if (shown === 'true') return;

  const isAvailable = await StoreReview.isAvailableAsync();
  if (!isAvailable) return;

  const raw   = await AsyncStorage.getItem(KEY_COUNT);
  const count = raw ? parseInt(raw, 10) : 0;
  const next  = count + 1;

  await AsyncStorage.setItem(KEY_COUNT, String(next));

  if (next >= THRESHOLD) {
    await AsyncStorage.setItem(KEY_SHOWN, 'true');
    await StoreReview.requestReview();
  }
}

/**
 * Call `trackAction()` after meaningful user interactions.
 * After THRESHOLD actions the iOS/Android native rating dialog appears once.
 *
 * Usage:
 *   const { trackAction } = useRatingPrompt();
 *   // after liking a post, opening a place, creating a post…
 *   trackAction();
 */
export function useRatingPrompt() {
  const trackAction = useCallback(() => {
    maybeRequestReview().catch(() => {});
  }, []);

  return { trackAction };
}

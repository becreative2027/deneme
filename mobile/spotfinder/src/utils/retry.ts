/**
 * Phase 8.1 — Exponential backoff retry utility
 *
 * Used to configure React Query's retry delay globally, and can also be
 * called directly for any imperative async operation.
 *
 *   retryDelay(0) → 500 ms
 *   retryDelay(1) → 1 000 ms
 *   retryDelay(2) → 2 000 ms
 *   retryDelay(3) → 4 000 ms   (capped at MAX_DELAY)
 */

const BASE_DELAY_MS = 500;
const MAX_DELAY_MS = 30_000;

/**
 * Returns the delay in milliseconds for the given attempt index (0-based).
 * Adds ±10 % jitter to avoid thundering herd.
 */
export function retryDelay(attemptIndex: number): number {
  const exponential = BASE_DELAY_MS * 2 ** attemptIndex;
  const capped = Math.min(exponential, MAX_DELAY_MS);
  const jitter = capped * 0.1 * (Math.random() * 2 - 1); // ±10 %
  return Math.round(capped + jitter);
}

/**
 * Determines whether React Query should retry a failed request.
 * Network errors and 5xx responses are retried; 4xx (client errors) are not.
 */
export function shouldRetry(failureCount: number, error: unknown): boolean {
  if (failureCount >= 3) return false;

  // Don't retry client errors (4xx)
  if (
    error &&
    typeof error === 'object' &&
    'response' in error &&
    (error as any).response?.status >= 400 &&
    (error as any).response?.status < 500
  ) {
    return false;
  }

  return true;
}

// Sentry is temporarily disabled — add @sentry/react-native back and configure
// DSN in app.json extra.sentryDsn once a Sentry account is set up.

export function initSentry() {}

export function identifySentryUser(_userId: string, _email?: string) {}

export function clearSentryUser() {}

export function captureError(error: Error, context?: Record<string, unknown>) {
  if (__DEV__) {
    console.error('[Error]', error, context);
  }
}

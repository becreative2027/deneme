import * as Sentry from '@sentry/react-native';
import Constants from 'expo-constants';

const DSN = process.env.EXPO_PUBLIC_SENTRY_DSN ?? Constants.expoConfig?.extra?.sentryDsn as string | undefined;

export function initSentry() {
  if (!DSN || __DEV__) return;

  Sentry.init({
    dsn: DSN,
    // Only send events in production
    enabled: !__DEV__,
    // Performance tracing — traces 20% of transactions
    tracesSampleRate: 0.2,
    // Attach user info to events when available
    attachStacktrace: true,
    // Don't send PII by default
    sendDefaultPii: false,
    environment: 'production',
    release: `${Constants.expoConfig?.slug}@${Constants.expoConfig?.version}`,
  });
}

export function identifySentryUser(userId: string, email?: string) {
  if (__DEV__) return;
  Sentry.setUser({ id: userId, email });
}

export function clearSentryUser() {
  if (__DEV__) return;
  Sentry.setUser(null);
}

export function captureError(error: Error, context?: Record<string, unknown>) {
  if (__DEV__) {
    console.error('[Error]', error, context);
    return;
  }
  Sentry.withScope((scope) => {
    if (context) scope.setExtras(context);
    Sentry.captureException(error);
  });
}

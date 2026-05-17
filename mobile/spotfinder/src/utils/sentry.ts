import * as Sentry from '@sentry/react-native';
import Constants from 'expo-constants';

const DSN = Constants.expoConfig?.extra?.sentryDsn as string;

export function initSentry() {
  Sentry.init({
    dsn: DSN,
    enabled: !__DEV__,
    tracesSampleRate: 0.2,
    environment: __DEV__ ? 'development' : 'production',
  });
}

export function identifySentryUser(userId: string, email?: string) {
  Sentry.setUser({ id: userId, email });
}

export function clearSentryUser() {
  Sentry.setUser(null);
}

export function captureError(error: Error, context?: Record<string, unknown>) {
  if (__DEV__) {
    console.error('[Error]', error, context);
  } else {
    Sentry.captureException(error, context ? { extra: context } : undefined);
  }
}

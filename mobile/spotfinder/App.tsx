import './src/i18n';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import * as Location from 'expo-location';
import React, { useEffect } from 'react';
// if (__DEV__) { require('./src/utils/reactotron'); }
import { LogBox, View } from 'react-native';
import i18n from './src/i18n';
import { useLocaleStore } from './src/store/localeStore';

// Suppress known simulator-only warnings (APNs/keychain unavailable on sim)
LogBox.ignoreLogs([
  'Could not fetch registration information from keychain',
  "Error: Could not fetch registration information from keychain",
]);
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { OfflineBanner } from './src/components/OfflineBanner';
import { ToastProvider } from './src/components/Toast';
import { RootNavigator } from './src/navigation/RootNavigator';
import { ThemeProvider, useTheme } from './src/theme';
import { retryDelay, shouldRetry } from './src/utils/retry';
import { initSentry } from './src/utils/sentry';
import { useLocationStore } from './src/store/locationStore';

// Initialize crash reporting before anything renders
initSentry();

// ── React Query client with exponential backoff ───────────────────────────────
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: shouldRetry,
      retryDelay,
      staleTime: 1000 * 60,       // 1 minute
      gcTime: 1000 * 60 * 5,      // 5 minutes
    },
    mutations: {
      retry: 0,                    // Mutations are not retried automatically
    },
  },
});

// ── Location initializer — requests permission once at app start ─────────────
function LocationInit() {
  const setLocation = useLocationStore((s) => s.setLocation);
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;
        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        setLocation(pos.coords.latitude, pos.coords.longitude);
      } catch {
        // Location unavailable — distance badges simply won't show
      }
    })();
  }, []);
  return null;
}

// ── Language sync — apply stored language on startup ─────────────────────────
function LanguageInit() {
  const { language } = useLocaleStore();
  useEffect(() => {
    i18n.changeLanguage(language);
  }, []);
  return null;
}

// ── Inner root — reads theme after ThemeProvider is mounted ───────────────────
function AppContent() {
  const { colors } = useTheme();
  return (
    <>
      <LanguageInit />
      <LocationInit />
      <StatusBar style={colors.statusBar} />
      {/* Global offline indicator — rendered above all screens */}
      <OfflineBanner />
      <RootNavigator />
    </>
  );
}

// ── App root ──────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <ErrorBoundary>
      <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <QueryClientProvider client={queryClient}>
            <ToastProvider>
              <AppContent />
            </ToastProvider>
          </QueryClientProvider>
        </ThemeProvider>
      </SafeAreaProvider>
      </View>
    </ErrorBoundary>
  );
}

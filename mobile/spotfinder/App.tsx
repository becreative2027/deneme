import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { OfflineBanner } from './src/components/OfflineBanner';
import { ToastProvider } from './src/components/Toast';
import { RootNavigator } from './src/navigation/RootNavigator';
import { ThemeProvider, useTheme } from './src/theme';
import { retryDelay, shouldRetry } from './src/utils/retry';

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

// ── Inner root — reads theme after ThemeProvider is mounted ───────────────────
function AppContent() {
  const { colors } = useTheme();
  return (
    <>
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
      <SafeAreaProvider>
        <ThemeProvider>
          <QueryClientProvider client={queryClient}>
            <ToastProvider>
              <AppContent />
            </ToastProvider>
          </QueryClientProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

/**
 * Phase 8.1 — Global Error Boundary
 *
 * Catches unexpected render/lifecycle errors and shows a recoverable
 * fallback screen instead of a blank white crash.
 *
 * Usage:
 *   <ErrorBoundary>
 *     <App />
 *   </ErrorBoundary>
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  children: React.ReactNode;
  /** Optional custom fallback element. If omitted, uses built-in UI. */
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error.message };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // In production: forward to Sentry / Datadog / etc.
    if (__DEV__) {
      console.error('[ErrorBoundary]', error, info.componentStack);
    }
  }

  reset = () => {
    this.setState({ hasError: false, errorMessage: '' });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return <>{this.props.fallback}</>;

      return (
        <View style={styles.container}>
          <Ionicons name="bug-outline" size={56} color="#e74c3c" />
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.subtitle}>
            An unexpected error occurred. Tap below to try again.
          </Text>
          {__DEV__ && (
            <Text style={styles.devError} numberOfLines={4}>
              {this.state.errorMessage}
            </Text>
          )}
          <TouchableOpacity style={styles.btn} onPress={this.reset} activeOpacity={0.85}>
            <Text style={styles.btnText}>Try again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 36,
    backgroundColor: '#fff',
    gap: 12,
  },
  title: { fontSize: 20, fontWeight: '800', color: '#1a1a1a', textAlign: 'center' },
  subtitle: { fontSize: 15, color: '#888', textAlign: 'center', lineHeight: 22 },
  devError: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#fff5f5',
    borderRadius: 8,
    fontSize: 11,
    color: '#c0392b',
    fontFamily: 'monospace',
    width: '100%',
  },
  btn: {
    marginTop: 8,
    backgroundColor: '#6c63ff',
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 24,
  },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});

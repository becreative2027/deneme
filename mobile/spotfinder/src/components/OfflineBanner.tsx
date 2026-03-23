/**
 * Phase 8.1 — Offline Banner
 *
 * Slides down from the top of the screen when the device loses connectivity.
 * Cached data is still shown; the banner just informs the user.
 * Disappears automatically when connectivity is restored.
 */
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

export function OfflineBanner() {
  const { isConnected, isInternetReachable } = useNetworkStatus();
  const isOffline = !isConnected || !isInternetReachable;
  const insets = useSafeAreaInsets();

  const translateY = useRef(new Animated.Value(-60)).current;
  const wasOfflineRef = useRef(false);

  useEffect(() => {
    if (isOffline) {
      wasOfflineRef.current = true;
      // Slide in
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 9,
      }).start();
    } else if (wasOfflineRef.current) {
      // Slide out after a brief "Back online" moment
      Animated.timing(translateY, {
        toValue: -60,
        duration: 350,
        useNativeDriver: true,
      }).start();
    }
  }, [isOffline, translateY]);

  return (
    <Animated.View
      style={[styles.banner, { top: insets.top, transform: [{ translateY }] }]}
      pointerEvents="none"
    >
      <Ionicons name={isOffline ? 'cloud-offline-outline' : 'cloud-done-outline'} size={16} color="#fff" />
      <Text style={styles.text}>
        {isOffline ? "You're offline \u2014 showing cached data" : 'Back online'}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: '#e74c3c',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 8,
    zIndex: 9998,
  },
  text: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
});

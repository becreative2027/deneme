import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

export function SplashScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>SpotFinder</Text>
      <Text style={styles.tagline}>Discover places that matter</Text>
      <ActivityIndicator color="#fff" style={{ marginTop: 40 }} size="small" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: { fontSize: 36, fontWeight: '800', color: '#fff', letterSpacing: 1 },
  tagline: { fontSize: 14, color: 'rgba(255,255,255,0.6)', marginTop: 8 },
});

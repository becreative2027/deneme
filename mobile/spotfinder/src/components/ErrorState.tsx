import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

interface Props {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: Props) {
  const { t } = useTranslation();
  const resolvedMessage = message ?? t('errors.generic');
  return (
    <View style={styles.container}>
      <Ionicons name="cloud-offline-outline" size={48} color="#ccc" />
      <Text style={styles.message}>{resolvedMessage}</Text>
      {onRetry && (
        <TouchableOpacity style={styles.btn} onPress={onRetry} activeOpacity={0.8}>
          <Text style={styles.btnText}>{t('errors.retry')}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 },
  message: { fontSize: 15, color: '#888', textAlign: 'center' },
  btn: {
    marginTop: 8,
    backgroundColor: '#6c63ff',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
  },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
});

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { updateUsername } from '../../api/users';
import { useAuthStore } from '../../store/authStore';
import { useToast } from '../../components/Toast';
import { AmberButton, AmberInput, GlassCard } from '../../components/ui';
import { useTheme, spacing, typography } from '../../theme';

export function UsernameSetupScreen() {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const { colors } = useTheme();
  const { user, setUser, setNeedsUsernameSetup } = useAuthStore();

  const isValid = /^[a-z0-9_]{3,20}$/.test(username);

  async function handleContinue() {
    if (!isValid) {
      showToast('Kullanıcı adı 3-20 karakter, sadece harf/rakam/_ içerebilir.', 'warning');
      return;
    }
    setLoading(true);
    try {
      await updateUsername(username);
      if (user) setUser({ ...user, username });
      setNeedsUsernameSetup(false);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err.message ?? 'Bir hata oluştu.';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={s.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={s.container}>
          <View style={s.iconWrap}>
            <Ionicons name="at-circle" size={64} color={colors.accent} />
          </View>

          <Text style={[typography.displayM, { color: colors.text, textAlign: 'center' }]}>
            Kullanıcı adını seç
          </Text>
          <Text style={[typography.bodyDim, { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.sm, marginBottom: spacing['2xl'] }]}>
            Diğer kullanıcılar seni bu adla bulacak.{'\n'}Daha sonra değiştiremezsin.
          </Text>

          <GlassCard strong style={s.card}>
            <AmberInput
              icon="at"
              eyebrow="KULLANICI ADI"
              placeholder="ornek_kullanici"
              value={username}
              onChangeText={(t) => setUsername(t.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              autoCapitalize="none"
              autoCorrect={false}
              autoFocus
              maxLength={20}
            />
          </GlassCard>

          <Text style={[s.hint, { color: isValid || username.length === 0 ? colors.textMuted : '#ef4444' }]}>
            {username.length === 0
              ? '3-20 karakter, harf, rakam ve _ kullanabilirsin'
              : isValid
              ? '✓ Kullanılabilir format'
              : 'En az 3 karakter gerekli'}
          </Text>

          <AmberButton
            label={loading ? 'Kaydediliyor…' : 'Devam Et'}
            onPress={handleContinue}
            loading={loading}
            style={[s.btn, !isValid && { opacity: 0.45 }]}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  container: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    justifyContent: 'center',
  },
  iconWrap: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  card: {
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  hint: {
    fontSize: 12,
    marginBottom: spacing.xl,
    marginLeft: spacing.xs,
  },
  btn: {
    marginTop: spacing.sm,
  },
});

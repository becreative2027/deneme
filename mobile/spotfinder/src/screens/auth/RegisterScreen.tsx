import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { AuthStackParamList } from '../../types';
import { register } from '../../api/auth';
import { useAuthStore } from '../../store/authStore';
import { useToast } from '../../components/Toast';
import { useTheme, radius, spacing, typography, shadow } from '../../theme';
import { GlassCard, AmberButton, AmberInput, Eyebrow } from '../../components/ui';

type Props = { navigation: NativeStackNavigationProp<AuthStackParamList, 'Register'> };

export function RegisterScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    username: '',
    email: '',
    displayName: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);
  const { showToast } = useToast();
  const { colors } = useTheme();

  function update(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleRegister() {
    const { username, email, displayName, password, confirmPassword } = form;
    if (!username.trim() || !email.trim() || !displayName.trim() || !password) {
      showToast(t('auth.register.allRequired'), 'warning');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
      showToast(t('auth.register.emailInvalid'), 'warning');
      return;
    }
    if (password !== confirmPassword) {
      showToast(t('auth.register.passwordMismatch'), 'warning');
      return;
    }
    if (password.length < 8) {
      showToast(t('auth.register.passwordTooShort'), 'warning');
      return;
    }
    if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      showToast(t('auth.register.passwordWeak'), 'warning');
      return;
    }
    setLoading(true);
    try {
      const response = await register({
        username: username.trim().toLowerCase(),
        email: email.trim().toLowerCase(),
        displayName: displayName.trim(),
        password,
      });
      await setAuth(response.token, response.refreshToken, response.user);
    } catch (err: any) {
      showToast(err.message ?? t('auth.register.registerError'), 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.inner}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Eyebrow style={{ marginBottom: spacing.sm }}>{t('auth.register.joinUs')}</Eyebrow>

          <Text style={[typography.displayL, { color: colors.text, marginBottom: spacing.sm }]}>
            {t('auth.register.tagline')}{'\n'}
            <Text style={{ color: colors.accent }}>{t('auth.register.taglineAccent')}</Text>
          </Text>

          <Text style={[typography.bodyDim, { color: colors.textSecondary, marginBottom: spacing['2xl'] }]}>
            {t('auth.register.subtitle')}
          </Text>

          {/* Inputs */}
          <GlassCard strong style={styles.inputCard}>
            <AmberInput
              icon="person-outline"
              eyebrow={t('auth.register.displayNameLabel')}
              placeholder={t('auth.register.displayNamePlaceholder')}
              value={form.displayName}
              onChangeText={(v) => update('displayName', v)}
              autoCapitalize="words"
            />
            <View style={[styles.divider, { backgroundColor: colors.glassBorder }]} />
            <AmberInput
              icon="at-outline"
              eyebrow={t('auth.register.usernameLabel')}
              placeholder={t('auth.register.usernamePlaceholder')}
              value={form.username}
              onChangeText={(v) => update('username', v)}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <View style={[styles.divider, { backgroundColor: colors.glassBorder }]} />
            <AmberInput
              icon="mail-outline"
              eyebrow={t('auth.register.emailLabel')}
              placeholder={t('auth.register.emailPlaceholder')}
              value={form.email}
              onChangeText={(v) => update('email', v)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <View style={[styles.divider, { backgroundColor: colors.glassBorder }]} />
            <AmberInput
              icon="lock-closed-outline"
              eyebrow={t('auth.register.passwordLabel')}
              placeholder={t('auth.register.passwordPlaceholder')}
              value={form.password}
              onChangeText={(v) => update('password', v)}
              isPassword
            />
            <View style={[styles.divider, { backgroundColor: colors.glassBorder }]} />
            <AmberInput
              icon="shield-checkmark-outline"
              eyebrow={t('auth.register.confirmPasswordLabel')}
              placeholder={t('auth.register.confirmPasswordPlaceholder')}
              value={form.confirmPassword}
              onChangeText={(v) => update('confirmPassword', v)}
              isPassword
            />
          </GlassCard>

          <AmberButton
            label={t('auth.register.registerBtn')}
            onPress={handleRegister}
            loading={loading}
            style={[styles.btn, shadow.amber]}
          />

          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.loginLink}
            accessibilityRole="button"
          >
            <Text style={[typography.bodyDim, { color: colors.textSecondary }]}>
              {t('auth.register.loginLink')}{' '}
              <Text style={{ color: colors.accent, fontWeight: '700' }}>{t('auth.register.loginLinkAccent')}</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  inner: {
    paddingHorizontal: spacing.xl,
    paddingTop: 80,
    paddingBottom: 40,
  },
  inputCard: {
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  divider: {
    height: 1,
    marginHorizontal: spacing.md,
  },
  btn: {
    marginBottom: spacing.sm,
  },
  loginLink: {
    alignItems: 'center',
    marginTop: spacing.lg,
    paddingVertical: spacing.sm,
  },
});

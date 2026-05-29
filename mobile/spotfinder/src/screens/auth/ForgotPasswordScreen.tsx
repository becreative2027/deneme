import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { AuthStackParamList } from '../../types';
import { forgotPassword, resetPassword } from '../../api/auth';
import { useAuthStore } from '../../store/authStore';
import { useToast } from '../../components/Toast';
import { useTheme, spacing, typography, radius } from '../../theme';
import { GlassCard, AmberButton, AmberInput } from '../../components/ui';
import { Ionicons } from '@expo/vector-icons';

type Props = { navigation: NativeStackNavigationProp<AuthStackParamList, 'ForgotPassword'> };

export function ForgotPasswordScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const [step, setStep] = useState<'email' | 'reset'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { showToast } = useToast();
  const { colors } = useTheme();
  const setAuth = useAuthStore((s) => s.setAuth);

  async function handleSendCode() {
    if (!email.trim()) {
      showToast(t('auth.forgotPassword.emailRequired'), 'warning');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
      showToast(t('auth.forgotPassword.emailInvalid'), 'warning');
      return;
    }
    setLoading(true);
    try {
      await forgotPassword(email.trim().toLowerCase());
      showToast(t('auth.forgotPassword.codeSent'), 'success');
      setStep('reset');
    } catch (err: any) {
      showToast(err.message ?? t('auth.forgotPassword.genericError'), 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword() {
    if (!code.trim()) {
      showToast(t('auth.forgotPassword.codeRequired'), 'warning');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      showToast(t('auth.forgotPassword.passwordTooShort'), 'warning');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast(t('auth.forgotPassword.passwordMismatch'), 'warning');
      return;
    }
    setLoading(true);
    try {
      await resetPassword(email.trim().toLowerCase(), code.trim(), newPassword);
      showToast(t('auth.forgotPassword.resetSuccess'), 'success');
      navigation.navigate('Login');
    } catch (err: any) {
      showToast(err.message ?? t('auth.forgotPassword.codeError'), 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Back */}
          <TouchableOpacity
            style={[styles.backBtn, { backgroundColor: colors.glassBg, borderColor: colors.glassBorder }]}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={20} color={colors.text} />
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.iconWrap, { backgroundColor: `${colors.accent}20` }]}>
              <Ionicons name="lock-open-outline" size={32} color={colors.accent} />
            </View>
            <Text style={[typography.titleL, { color: colors.text, marginTop: spacing.lg }]}>
              {step === 'email' ? t('auth.forgotPassword.title') : t('auth.forgotPassword.titleReset')}
            </Text>
            <Text style={[typography.bodyDim, { color: colors.textSecondary, marginTop: spacing.sm, textAlign: 'center' }]}>
              {step === 'email'
                ? t('auth.forgotPassword.subtitleEmail')
                : t('auth.forgotPassword.subtitleReset', { email })}
            </Text>
          </View>

          {step === 'email' ? (
            <GlassCard strong style={styles.card}>
              <AmberInput
                icon="mail-outline"
                eyebrow={t('auth.forgotPassword.emailLabel')}
                placeholder={t('auth.forgotPassword.emailPlaceholder')}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </GlassCard>
          ) : (
            <GlassCard strong style={styles.card}>
              <AmberInput
                icon="keypad-outline"
                eyebrow={t('auth.forgotPassword.resetCodeLabel')}
                placeholder={t('auth.forgotPassword.resetCodePlaceholder')}
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
                autoCapitalize="none"
              />
              <View style={[styles.divider, { backgroundColor: colors.glassBorder }]} />
              <AmberInput
                icon="lock-closed-outline"
                eyebrow={t('auth.forgotPassword.newPasswordLabel')}
                placeholder="••••••••"
                value={newPassword}
                onChangeText={setNewPassword}
                isPassword
              />
              <View style={[styles.divider, { backgroundColor: colors.glassBorder }]} />
              <AmberInput
                icon="lock-closed-outline"
                eyebrow={t('auth.forgotPassword.newPasswordRepeatLabel')}
                placeholder="••••••••"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                isPassword
              />
            </GlassCard>
          )}

          <AmberButton
            label={
              loading
                ? step === 'email' ? t('auth.forgotPassword.sending') : t('auth.forgotPassword.resetting')
                : step === 'email' ? t('auth.forgotPassword.sendCodeBtn') : t('auth.forgotPassword.resetBtn')
            }
            onPress={step === 'email' ? handleSendCode : handleResetPassword}
            loading={loading}
            style={styles.btn}
          />

          {step === 'reset' && (
            <AmberButton
              label={t('auth.forgotPassword.resendCode')}
              variant="ghost"
              onPress={() => { setStep('email'); setCode(''); }}
              style={styles.btn}
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:    { flex: 1 },
  scroll:  { paddingHorizontal: spacing.xl, paddingTop: 60, paddingBottom: 40 },
  backBtn: {
    width: 40, height: 40, borderRadius: radius.pill,
    borderWidth: 1, alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  header:  { alignItems: 'center', marginBottom: spacing['2xl'] },
  iconWrap: {
    width: 72, height: 72, borderRadius: 36,
    alignItems: 'center', justifyContent: 'center',
  },
  card:    { marginBottom: spacing.lg, overflow: 'hidden' },
  divider: { height: 1, marginHorizontal: spacing.md },
  btn:     { marginBottom: spacing.sm },
});

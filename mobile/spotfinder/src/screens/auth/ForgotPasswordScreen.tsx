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
import { AuthStackParamList } from '../../types';
import { forgotPassword, resetPassword } from '../../api/auth';
import { useAuthStore } from '../../store/authStore';
import { useToast } from '../../components/Toast';
import { useTheme, spacing, typography, radius } from '../../theme';
import { GlassCard, AmberButton, AmberInput } from '../../components/ui';
import { Ionicons } from '@expo/vector-icons';

type Props = { navigation: NativeStackNavigationProp<AuthStackParamList, 'ForgotPassword'> };

export function ForgotPasswordScreen({ navigation }: Props) {
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
      showToast('E-posta adresini gir.', 'warning');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
      showToast('Geçerli bir e-posta adresi gir.', 'warning');
      return;
    }
    setLoading(true);
    try {
      await forgotPassword(email.trim().toLowerCase());
      showToast('Sıfırlama kodu e-postana gönderildi.', 'success');
      setStep('reset');
    } catch (err: any) {
      showToast(err.message ?? 'Bir hata oluştu, tekrar dene.', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword() {
    if (!code.trim()) {
      showToast('Kodu gir.', 'warning');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      showToast('Şifre en az 6 karakter olmalı.', 'warning');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('Şifreler eşleşmiyor.', 'warning');
      return;
    }
    setLoading(true);
    try {
      await resetPassword(email.trim().toLowerCase(), code.trim(), newPassword);
      showToast('Şifren başarıyla sıfırlandı! Giriş yapabilirsin.', 'success');
      navigation.navigate('Login');
    } catch (err: any) {
      showToast(err.message ?? 'Kod hatalı veya süresi dolmuş.', 'error');
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
              {step === 'email' ? 'Şifremi Unuttum' : 'Yeni Şifre Belirle'}
            </Text>
            <Text style={[typography.bodyDim, { color: colors.textSecondary, marginTop: spacing.sm, textAlign: 'center' }]}>
              {step === 'email'
                ? 'E-posta adresini gir, sıfırlama kodunu gönderelim.'
                : `${email} adresine gönderilen kodu ve yeni şifreni gir.`}
            </Text>
          </View>

          {step === 'email' ? (
            <GlassCard strong style={styles.card}>
              <AmberInput
                icon="mail-outline"
                eyebrow="E-POSTA"
                placeholder="ornek@email.com"
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
                eyebrow="SIFIRLAMA KODU"
                placeholder="123456"
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
                autoCapitalize="none"
              />
              <View style={[styles.divider, { backgroundColor: colors.glassBorder }]} />
              <AmberInput
                icon="lock-closed-outline"
                eyebrow="YENİ ŞİFRE"
                placeholder="••••••••"
                value={newPassword}
                onChangeText={setNewPassword}
                isPassword
              />
              <View style={[styles.divider, { backgroundColor: colors.glassBorder }]} />
              <AmberInput
                icon="lock-closed-outline"
                eyebrow="YENİ ŞİFRE (TEKRAR)"
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
                ? step === 'email' ? 'Gönderiliyor…' : 'Sıfırlanıyor…'
                : step === 'email' ? 'Kod Gönder' : 'Şifreyi Sıfırla'
            }
            onPress={step === 'email' ? handleSendCode : handleResetPassword}
            loading={loading}
            style={styles.btn}
          />

          {step === 'reset' && (
            <AmberButton
              label="Kodu yeniden gönder"
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

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
import { AuthStackParamList } from '../../types';
import { register } from '../../api/auth';
import { useAuthStore } from '../../store/authStore';
import { useToast } from '../../components/Toast';
import { useTheme, radius, spacing, typography, shadow } from '../../theme';
import { GlassCard, AmberButton, AmberInput, Eyebrow } from '../../components/ui';

type Props = { navigation: NativeStackNavigationProp<AuthStackParamList, 'Register'> };

export function RegisterScreen({ navigation }: Props) {
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
      showToast('Tüm alanlar zorunludur.', 'warning');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
      showToast('Geçerli bir e-posta adresi gir.', 'warning');
      return;
    }
    if (password !== confirmPassword) {
      showToast('Şifreler eşleşmiyor.', 'warning');
      return;
    }
    if (password.length < 8) {
      showToast('Şifre en az 8 karakter olmalı.', 'warning');
      return;
    }
    if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      showToast('Şifre en az 1 büyük harf ve 1 rakam içermeli.', 'warning');
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
      showToast(err.message ?? 'Kayıt başarısız. Tekrar dene.', 'error');
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
          <Eyebrow style={{ marginBottom: spacing.sm }}>— Aramıza katıl</Eyebrow>

          <Text style={[typography.displayL, { color: colors.text, marginBottom: spacing.sm }]}>
            Hesap oluştur,{'\n'}
            <Text style={{ color: colors.accent }}>maceraya başla.</Text>
          </Text>

          <Text style={[typography.bodyDim, { color: colors.textSecondary, marginBottom: spacing['2xl'] }]}>
            Şehrin kalbini keşfet, deneyimlerini paylaş.
          </Text>

          {/* Inputs */}
          <GlassCard strong style={styles.inputCard}>
            <AmberInput
              icon="person-outline"
              eyebrow="AD SOYAD"
              placeholder="Adın"
              value={form.displayName}
              onChangeText={(v) => update('displayName', v)}
              autoCapitalize="words"
            />
            <View style={[styles.divider, { backgroundColor: colors.glassBorder }]} />
            <AmberInput
              icon="at-outline"
              eyebrow="KULLANICI ADI"
              placeholder="kullaniciadi"
              value={form.username}
              onChangeText={(v) => update('username', v)}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <View style={[styles.divider, { backgroundColor: colors.glassBorder }]} />
            <AmberInput
              icon="mail-outline"
              eyebrow="E-POSTA"
              placeholder="ornek@email.com"
              value={form.email}
              onChangeText={(v) => update('email', v)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <View style={[styles.divider, { backgroundColor: colors.glassBorder }]} />
            <AmberInput
              icon="lock-closed-outline"
              eyebrow="ŞİFRE"
              placeholder="Min. 8 karakter"
              value={form.password}
              onChangeText={(v) => update('password', v)}
              isPassword
            />
            <View style={[styles.divider, { backgroundColor: colors.glassBorder }]} />
            <AmberInput
              icon="shield-checkmark-outline"
              eyebrow="ŞİFRE TEKRAR"
              placeholder="Şifreni tekrar gir"
              value={form.confirmPassword}
              onChangeText={(v) => update('confirmPassword', v)}
              isPassword
            />
          </GlassCard>

          <AmberButton
            label="Hesap Oluştur"
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
              Zaten hesabın var mı?{' '}
              <Text style={{ color: colors.accent, fontWeight: '700' }}>Giriş yap</Text>
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

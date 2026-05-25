import React, { useState } from 'react';
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types';
import { login, oauthLogin } from '../../api/auth';
import { useAuthStore } from '../../store/authStore';
import { useToast } from '../../components/Toast';
import { useTheme, radius, spacing, typography, shadow } from '../../theme';
import { GlassCard, AmberButton, AmberInput, Eyebrow } from '../../components/ui';

// Required for expo-auth-session to handle the browser redirect
WebBrowser.maybeCompleteAuthSession();

const { width, height } = Dimensions.get('window');

// ─── Google OAuth — replace with your actual client IDs from Google Cloud Console ───
// https://console.cloud.google.com → APIs & Services → Credentials → Create OAuth 2.0 Client ID
// iOS Client ID  : "App type = iOS", Bundle ID = com.spotfinder.app
// Web Client ID  : "App type = Web application" (required for id_token)
const GOOGLE_IOS_CLIENT_ID = '196817036029-74cmitujnep5s5il8cmsbfjb6hjif5so.apps.googleusercontent.com';
const GOOGLE_WEB_CLIENT_ID = '196817036029-ad7o8lof6tm0le250vjo5b03jdak1961.apps.googleusercontent.com';
// ────────────────────────────────────────────────────────────────────────────────────

type Props = { navigation: NativeStackNavigationProp<AuthStackParamList, 'Login'> };

const CARD_ANGLES = [-8, 5, -4, 9, -6];
const CARD_POSITIONS = [
  { top: -20, left: -30 },
  { top: 30, right: -20 },
  { top: 80, left: 40 },
  { top: -10, left: width * 0.4 },
  { top: 100, right: 30 },
];
const CARD_COLORS = [
  ['#2D1B69', '#11998e'],
  ['#373B44', '#4286f4'],
  ['#1a1a2e', '#e94560'],
  ['#0f3460', '#533483'],
  ['#16213e', '#0f3460'],
];

function CollageCard({ index }: { index: number }) {
  return (
    <LinearGradient
      colors={CARD_COLORS[index] as [string, string]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.collageCard,
        {
          transform: [{ rotate: `${CARD_ANGLES[index]}deg` }],
          ...CARD_POSITIONS[index],
        },
      ]}
    />
  );
}

export function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);
  const { showToast } = useToast();
  const { colors } = useTheme();

  // ── Google OAuth ────────────────────────────────────────────────────────────
  const [_googleRequest, googleResponse, promptGoogleAsync] = Google.useAuthRequest({
    iosClientId: GOOGLE_IOS_CLIENT_ID,
    webClientId: GOOGLE_WEB_CLIENT_ID,
    scopes: ['openid', 'profile', 'email'],
  });

  React.useEffect(() => {
    if (googleResponse?.type === 'success') {
      const idToken = googleResponse.authentication?.idToken;
      if (idToken) {
        handleOAuthSuccess('google', idToken, undefined, undefined);
      } else {
        showToast('Google girişi başarısız.', 'error');
      }
    }
  }, [googleResponse]);

  // ── Handlers ────────────────────────────────────────────────────────────────
  async function handleLogin() {
    if (!email.trim() || !password) {
      showToast('E-posta ve şifre gerekli.', 'warning');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
      showToast('Geçerli bir e-posta adresi gir.', 'warning');
      return;
    }
    setLoading(true);
    try {
      const response = await login({ email: email.trim().toLowerCase(), password });
      await setAuth(response.token, response.refreshToken, response.user);
    } catch (err: any) {
      showToast(err.message ?? 'Bilgilerini kontrol et.', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleAppleLogin() {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!credential.identityToken) {
        showToast('Apple girişi başarısız.', 'error');
        return;
      }

      const displayName = credential.fullName
        ? `${credential.fullName.givenName ?? ''} ${credential.fullName.familyName ?? ''}`.trim()
        : undefined;

      await handleOAuthSuccess('apple', credential.identityToken, credential.email ?? undefined, displayName);
    } catch (err: any) {
      if (err.code !== 'ERR_REQUEST_CANCELED') {
        showToast('Apple girişi başarısız.', 'error');
      }
    }
  }

  async function handleGoogleLogin() {
    setGoogleLoading(true);
    try {
      await promptGoogleAsync();
    } catch {
      showToast('Google girişi başarısız.', 'error');
    } finally {
      setGoogleLoading(false);
    }
  }

  async function handleOAuthSuccess(
    provider: 'apple' | 'google',
    identityToken: string,
    email?: string,
    displayName?: string,
  ) {
    setLoading(true);
    try {
      const response = await oauthLogin(provider, identityToken, email, displayName);
      await setAuth(response.token, response.refreshToken, response.user);
    } catch (err: any) {
      showToast(err.message ?? 'Giriş başarısız.', 'error');
    } finally {
      setLoading(false);
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar style="light" />

      <View style={styles.heroContainer}>
        {CARD_ANGLES.map((_, i) => (
          <CollageCard key={i} index={i} />
        ))}
        <LinearGradient
          colors={['transparent', colors.background]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.heroFade}
        />
      </View>

      <KeyboardAvoidingView
        style={styles.formOuter}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.formScroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Eyebrow style={{ marginBottom: spacing.sm }}>— Tekrar hoş geldin</Eyebrow>

          <Text style={[typography.displayL, { color: colors.text, marginBottom: spacing.sm }]}>
            Lezzetini bul,{'\n'}
            <Text style={{ color: colors.accent }}>şehrini keşfet.</Text>
          </Text>

          <Text style={[typography.bodyDim, { color: colors.textSecondary, marginBottom: spacing['2xl'] }]}>
            Şehrin en iyi mekanlarını keşfet ve paylaş.
          </Text>

          {/* E-posta / şifre */}
          <GlassCard strong style={styles.inputCard}>
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
            <View style={[styles.divider, { backgroundColor: colors.glassBorder }]} />
            <AmberInput
              icon="lock-closed-outline"
              eyebrow="ŞİFRE"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              isPassword
            />
          </GlassCard>

          <AmberButton
            label="Giriş yap"
            onPress={handleLogin}
            loading={loading}
            style={[styles.btn, shadow.amber]}
          />

          <AmberButton
            label="Şifremi Unuttum"
            variant="ghost"
            onPress={() => navigation.navigate('ForgotPassword')}
            style={styles.btn}
          />

          {/* Ayırıcı */}
          <View style={styles.orRow}>
            <View style={[styles.orLine, { backgroundColor: colors.border }]} />
            <Text style={[typography.caption, { color: colors.textTertiary, marginHorizontal: spacing.md }]}>
              veya
            </Text>
            <View style={[styles.orLine, { backgroundColor: colors.border }]} />
          </View>

          {/* Apple Sign In */}
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
            buttonStyle={
              colors.background === '#ffffff' || colors.background === '#fafaf9'
                ? AppleAuthentication.AppleAuthenticationButtonStyle.BLACK
                : AppleAuthentication.AppleAuthenticationButtonStyle.WHITE
            }
            cornerRadius={12}
            style={[styles.appleBtn, styles.btn]}
            onPress={handleAppleLogin}
          />

          {/* Google Sign In */}
          <AmberButton
            label={googleLoading ? 'Bağlanıyor…' : 'Google ile devam et'}
            variant="ghost"
            icon="logo-google"
            loading={googleLoading}
            onPress={handleGoogleLogin}
            style={styles.btn}
          />

          <AmberButton
            label="Yeni misin? Hesap oluştur →"
            variant="ghost"
            onPress={() => navigation.navigate('Register')}
            style={styles.btn}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  heroContainer: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: height * 0.45,
    overflow: 'hidden',
  },
  collageCard: {
    position: 'absolute',
    width: 160,
    height: 200,
    borderRadius: radius.xl,
  },
  heroFade: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    height: 140,
  },
  formOuter: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  formScroll: {
    paddingHorizontal: spacing.xl,
    paddingTop: height * 0.32,
    paddingBottom: 40,
    gap: 0,
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
  orRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  orLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  appleBtn: {
    height: 52,
  },
});

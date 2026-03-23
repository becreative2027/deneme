import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types';
import { register } from '../../api/auth';
import { useAuthStore } from '../../store/authStore';
import { useToast } from '../../components/Toast';

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

  function update(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleRegister() {
    const { username, email, displayName, password, confirmPassword } = form;

    if (!username.trim() || !email.trim() || !displayName.trim() || !password) {
      showToast('All fields are required.', 'warning');
      return;
    }
    if (password !== confirmPassword) {
      showToast('Passwords do not match.', 'warning');
      return;
    }
    if (password.length < 8) {
      showToast('Password must be at least 8 characters.', 'warning');
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
      showToast(err.message ?? 'Registration failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  }

  const fields: Array<{ key: keyof typeof form; label: string; secure?: boolean; type?: any }> = [
    { key: 'displayName', label: 'Display name' },
    { key: 'username', label: 'Username' },
    { key: 'email', label: 'Email', type: 'email-address' },
    { key: 'password', label: 'Password', secure: true },
    { key: 'confirmPassword', label: 'Confirm password', secure: true },
  ];

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Create account</Text>
        <Text style={styles.subtitle}>Join SpotFinder today</Text>

        {fields.map(({ key, label, secure, type }) => (
          <TextInput
            key={key}
            style={styles.input}
            placeholder={label}
            value={form[key]}
            onChangeText={(v) => update(key, v)}
            secureTextEntry={secure}
            keyboardType={type ?? 'default'}
            autoCapitalize="none"
            autoCorrect={false}
            placeholderTextColor="#aaa"
          />
        ))}

        <TouchableOpacity
          style={[styles.btn, loading && styles.btnDisabled]}
          onPress={handleRegister}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.btnText}>Create Account</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.loginLink}>
          <Text style={styles.loginText}>
            Already have an account? <Text style={styles.loginBold}>Sign in</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  inner: { padding: 28, paddingTop: 60 },
  title: { fontSize: 30, fontWeight: '800', color: '#1a1a2e' },
  subtitle: { fontSize: 15, color: '#888', marginTop: 6, marginBottom: 32 },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#333',
    marginBottom: 14,
    backgroundColor: '#fafafa',
  },
  btn: {
    backgroundColor: '#6c63ff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 6,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  loginLink: { alignItems: 'center', marginTop: 24 },
  loginText: { fontSize: 14, color: '#888' },
  loginBold: { color: '#6c63ff', fontWeight: '700' },
});

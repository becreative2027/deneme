'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, MapPin, Loader2 } from 'lucide-react';
import { register } from '@/api/auth';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/components/Toast';
import { useT } from '@/lib/i18n';

interface FormState {
  displayName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterPage() {
  const t = useT();
  const [form, setForm] = useState<FormState>({
    displayName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);
  const { showToast } = useToast();
  const router = useRouter();

  function update(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    const { displayName, username, email, password, confirmPassword } = form;

    if (!username.trim() || !email.trim() || !displayName.trim() || !password) {
      showToast(t('auth.allRequired'), 'warning');
      return;
    }
    if (password !== confirmPassword) {
      showToast(t('auth.passwordMismatch'), 'warning');
      return;
    }
    if (password.length < 8) {
      showToast(t('auth.passwordTooShort'), 'warning');
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
      setAuth(response.token, response.refreshToken, response.user);
      router.replace('/feed');
    } catch (err: any) {
      showToast(err.message ?? t('auth.regFailed'), 'error');
    } finally {
      setLoading(false);
    }
  }

  const fields: Array<{
    key: keyof FormState;
    labelKey: string;
    type?: string;
    autoComplete?: string;
  }> = [
    { key: 'displayName', labelKey: 'auth.displayName', autoComplete: 'name' },
    { key: 'username', labelKey: 'auth.username', autoComplete: 'username' },
    { key: 'email', labelKey: 'auth.email', type: 'email', autoComplete: 'email' },
    { key: 'password', labelKey: 'auth.password', type: 'password', autoComplete: 'new-password' },
    { key: 'confirmPassword', labelKey: 'auth.confirmPassword', type: 'password', autoComplete: 'new-password' },
  ];

  return (
    <div className="min-h-dvh flex flex-col bg-white dark:bg-surface-dark">
      {/* Logo */}
      <div className="flex flex-col items-center pt-14 pb-8">
        <div className="w-16 h-16 bg-[#6c63ff] rounded-2xl flex items-center justify-center mb-4 shadow-lg">
          <MapPin size={30} className="text-white" />
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-50">{t('auth.createAccount')}</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1.5 text-[15px]">{t('auth.joinToday')}</p>
      </div>

      {/* Form */}
      <form onSubmit={handleRegister} className="flex-1 px-7 space-y-3.5 pb-8">
        {fields.map(({ key, labelKey, type, autoComplete }) => {
          const isPasswordField = type === 'password';
          return (
            <div key={key} className="relative">
              <input
                type={isPasswordField && showPassword ? 'text' : (type ?? 'text')}
                placeholder={t(labelKey)}
                value={form[key]}
                onChange={(e) => update(key, e.target.value)}
                autoComplete={autoComplete}
                autoCapitalize="none"
                className="w-full border border-border-light dark:border-border-dark rounded-xl px-4 py-3.5 text-[15px] text-gray-800 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#6c63ff] focus:ring-1 focus:ring-[#6c63ff] transition pr-12"
              />
              {isPasswordField && (
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              )}
            </div>
          );
        })}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#6c63ff] text-white rounded-xl py-4 text-[16px] font-bold hover:bg-[#5a52e0] active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              {t('auth.creatingAccount')}
            </>
          ) : (
            t('auth.createAccountBtn')
          )}
        </button>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
          {t('auth.hasAccount')}{' '}
          <Link href="/login" className="text-[#6c63ff] font-bold hover:underline">
            {t('auth.signIn')}
          </Link>
        </p>
      </form>
    </div>
  );
}

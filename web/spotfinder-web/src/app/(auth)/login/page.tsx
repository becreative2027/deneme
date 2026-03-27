'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, MapPin, Loader2 } from 'lucide-react';
import { login } from '@/api/auth';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/components/Toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);
  const { isAuthenticated, isHydrated } = useAuthStore();
  const { showToast } = useToast();
  const router = useRouter();

  React.useEffect(() => {
    if (isHydrated && isAuthenticated) {
      router.replace('/feed');
    }
  }, [isHydrated, isAuthenticated, router]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) {
      showToast('Email and password are required.', 'warning');
      return;
    }
    setLoading(true);
    try {
      const response = await login({ email: email.trim().toLowerCase(), password });
      setAuth(response.token, response.refreshToken, response.user);
      router.replace('/feed');
    } catch (err: any) {
      showToast(err.message ?? 'Please check your credentials.', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh flex flex-col bg-white dark:bg-surface-dark">
      {/* Logo area */}
      <div className="flex flex-col items-center pt-20 pb-10">
        <div className="w-16 h-16 bg-[#6c63ff] rounded-2xl flex items-center justify-center mb-4 shadow-lg">
          <MapPin size={30} className="text-white" />
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-50">Welcome back</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1.5 text-[15px]">Sign in to SpotFinder</p>
      </div>

      {/* Form */}
      <form onSubmit={handleLogin} className="flex-1 px-7 space-y-4">
        <div>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            className="w-full border border-border-light dark:border-border-dark rounded-xl px-4 py-3.5 text-[15px] text-gray-800 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#6c63ff] focus:ring-1 focus:ring-[#6c63ff] transition"
          />
        </div>

        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            className="w-full border border-border-light dark:border-border-dark rounded-xl px-4 py-3.5 text-[15px] text-gray-800 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#6c63ff] focus:ring-1 focus:ring-[#6c63ff] transition pr-12"
          />
          <button
            type="button"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
            onClick={() => setShowPassword((v) => !v)}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#6c63ff] text-white rounded-xl py-4 text-[16px] font-bold hover:bg-[#5a52e0] active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Signing in…
            </>
          ) : (
            'Sign In'
          )}
        </button>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-[#6c63ff] font-bold hover:underline">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
}

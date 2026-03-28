'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuthStore } from '@/store/adminAuthStore';
import { adminLogin } from '@/api/auth';
import { isAdminRole } from '@/lib/types';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setToken } = useAdminAuthStore();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { accessToken } = await adminLogin(email, password);
      setToken(accessToken);

      // Parse role from store after setting token
      const { user } = useAdminAuthStore.getState();
      if (!user) throw new Error('Token geçersiz.');

      if (user.role === 'User') {
        setError('Bu hesabın admin paneline erişim yetkisi yok.');
        useAdminAuthStore.getState().logout();
        return;
      }

      if (isAdminRole(user.role)) router.push('/super/dashboard');
      else if (user.role === 'PlaceOwner') router.push('/place/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.message ?? err.message ?? 'Giriş başarısız.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-brand rounded-xl flex items-center justify-center text-white font-bold text-xl mx-auto mb-3">
            S
          </div>
          <h1 className="text-2xl font-bold text-gray-900">SpotFinder Admin</h1>
          <p className="text-sm text-gray-500 mt-1">Admin veya Mekan Sahibi girişi</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Şifre</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand hover:bg-brand-dark text-white py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? 'Giriş yapılıyor…' : 'Giriş Yap'}
          </button>
        </form>
      </div>
    </div>
  );
}

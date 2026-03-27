import { apiClient } from './client';
import { ApiResponse, AuthResponse, LoginRequest, RegisterRequest } from '@/lib/types';

export async function login(body: LoginRequest): Promise<AuthResponse> {
  const { data } = await apiClient.post<ApiResponse<any>>('/api/auth/login', body);
  if (!data.success || !data.data) throw new Error(data.errors?.join('; ') ?? 'Login failed');
  const raw = data.data;
  return {
    token: raw.token ?? raw.accessToken,
    refreshToken: raw.refreshToken,
    expiresAt: raw.expiresAt ?? new Date(Date.now() + 3_600_000).toISOString(),
    user: raw.user ?? {
      id: raw.userId ?? '',
      username: raw.username ?? '',
      displayName: raw.displayName ?? raw.username ?? '',
      postsCount: 0,
      followersCount: 0,
      followingCount: 0,
    },
  };
}

export async function register(body: RegisterRequest): Promise<AuthResponse> {
  const { data } = await apiClient.post<ApiResponse<any>>('/api/auth/register', body);
  if (!data.success || !data.data) throw new Error(data.errors?.join('; ') ?? 'Registration failed');
  const raw = data.data;
  return {
    token: raw.token ?? raw.accessToken,
    refreshToken: raw.refreshToken,
    expiresAt: raw.expiresAt ?? new Date(Date.now() + 3_600_000).toISOString(),
    user: raw.user ?? {
      id: raw.userId ?? '',
      username: raw.username ?? '',
      displayName: raw.displayName ?? raw.username ?? '',
      postsCount: 0,
      followersCount: 0,
      followingCount: 0,
    },
  };
}

export async function logout(): Promise<void> {
  await apiClient.post('/api/auth/logout').catch(() => {});
}

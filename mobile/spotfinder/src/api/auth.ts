import { apiClient } from './client';
import { ApiResponse, AuthResponse, LoginRequest, RegisterRequest } from '../types';

function mapAuthResponse(raw: any, email?: string): AuthResponse {
  return {
    token: raw.accessToken ?? raw.token,
    refreshToken: raw.refreshToken,
    expiresAt: raw.expiresAt ?? '',
    user: raw.user ?? { id: raw.userId, email: email ?? '' } as any,
  };
}

export async function login(body: LoginRequest): Promise<AuthResponse> {
  const { data } = await apiClient.post<ApiResponse<any>>('/api/auth/login', body);
  if (!data.success || !data.data) throw new Error(data.errors?.join('; ') ?? 'Login failed');
  return mapAuthResponse(data.data, body.email);
}

export async function register(body: RegisterRequest): Promise<AuthResponse> {
  const { data } = await apiClient.post<ApiResponse<any>>('/api/auth/register', body);
  if (!data.success || !data.data) throw new Error(data.errors?.join('; ') ?? 'Registration failed');
  return mapAuthResponse(data.data, body.email);
}

export async function logout(): Promise<void> {
  // Best-effort — server invalidates refresh token
  await apiClient.post('/api/auth/logout').catch(() => {});
}

export async function oauthLogin(
  provider: 'apple' | 'google',
  identityToken: string,
  email?: string,
  displayName?: string,
): Promise<AuthResponse> {
  const { data } = await apiClient.post<ApiResponse<any>>('/api/auth/oauth', {
    provider,
    identityToken,
    email,
    displayName,
  });
  if (!data.success || !data.data) throw new Error(data.errors?.join('; ') ?? 'OAuth login failed');
  return mapAuthResponse(data.data, email);
}

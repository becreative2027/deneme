import { apiClient } from './client';
import { ApiResponse, AuthResponse, LoginRequest, RegisterRequest } from '../types';

export async function login(body: LoginRequest): Promise<AuthResponse> {
  const { data } = await apiClient.post<ApiResponse<AuthResponse>>('/api/auth/login', body);
  if (!data.success || !data.data) throw new Error(data.errors?.join('; ') ?? 'Login failed');
  return data.data;
}

export async function register(body: RegisterRequest): Promise<AuthResponse> {
  const { data } = await apiClient.post<ApiResponse<AuthResponse>>('/api/auth/register', body);
  if (!data.success || !data.data) throw new Error(data.errors?.join('; ') ?? 'Registration failed');
  return data.data;
}

export async function logout(): Promise<void> {
  // Best-effort — server invalidates refresh token
  await apiClient.post('/api/auth/logout').catch(() => {});
}

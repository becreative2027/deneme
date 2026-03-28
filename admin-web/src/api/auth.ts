import { adminClient } from './adminClient';

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  userId: string;
}

export async function adminLogin(email: string, password: string): Promise<LoginResponse> {
  const { data } = await adminClient.post('/api/auth/login', { email, password });
  // API wraps response in { data: { accessToken, ... } }
  return data?.data ?? data;
}

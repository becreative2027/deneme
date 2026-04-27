import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import Constants from 'expo-constants';
import { getToken, saveToken, removeToken } from '../utils/storage';

// Priority: EXPO_PUBLIC_API_URL env var → app.json extra.apiBaseUrl → local proxy
const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ??
  (Constants.expoConfig?.extra?.apiBaseUrl as string | undefined) ??
  'http://localhost:9000';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor — attach Bearer token ─────────────────────────────────
apiClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log(`[API →] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
  return config;
});

// ── Response interceptor — handle 401 globally ───────────────────────────────
apiClient.interceptors.response.use(
  (response) => {
    console.log(`[API ←] ${response.status} ${response.config.url}`);
    return response;
  },
  async (error: AxiosError) => {
    const status = error.response?.status;
    const url = error.config?.url;
    const data = error.response?.data;
    console.log(`[API ✗] status=${status ?? 'none'} code=${(error as any).code ?? 'none'} url=${url} msg=${error.message}`, JSON.stringify(data ?? ''));
    if (status === 401) {
      await removeToken();
    }
    return Promise.reject(error);
  },
);

export function setAuthToken(token: string): void {
  apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

export function clearAuthToken(): void {
  delete apiClient.defaults.headers.common['Authorization'];
}

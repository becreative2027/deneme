import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import Constants from 'expo-constants';
import { getToken, saveToken, getRefreshToken, saveRefreshToken, clearAll } from '../utils/storage';

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
  if (__DEV__) {
    console.log(`[API →] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
  }
  return config;
});

// ── Token refresh state — prevents parallel refresh storms ───────────────────
let isRefreshing = false;
let pendingQueue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = [];

function processPendingQueue(error: unknown, token: string | null) {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (token) resolve(token);
    else reject(error);
  });
  pendingQueue = [];
}

// ── Response interceptor — 401 → try refresh, else logout ───────────────────
apiClient.interceptors.response.use(
  (response) => {
    if (__DEV__) {
      console.log(`[API ←] ${response.status} ${response.config.url}`);
    }
    return response;
  },
  async (error: AxiosError) => {
    const status = error.response?.status;
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (__DEV__) {
      console.log(
        `[API ✗] status=${status ?? 'none'} url=${originalRequest?.url} msg=${error.message}`,
      );
    }

    // Only attempt refresh on 401, not on the refresh endpoint itself
    if (status === 401 && !originalRequest._retry && originalRequest.url !== '/api/auth/refresh') {
      if (isRefreshing) {
        // Queue concurrent requests while a refresh is in flight
        return new Promise((resolve, reject) => {
          pendingQueue.push({
            resolve: (newToken) => {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              resolve(apiClient(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await getRefreshToken();
        if (!refreshToken) throw new Error('No refresh token');

        const { data } = await apiClient.post<{
          data: { accessToken: string; refreshToken: string };
          success: boolean;
        }>('/api/auth/refresh', { refreshToken });

        if (!data.success || !data.data) throw new Error('Refresh failed');

        const { accessToken: newAccess, refreshToken: newRefresh } = data.data;
        await saveToken(newAccess);
        await saveRefreshToken(newRefresh);
        setAuthToken(newAccess);

        processPendingQueue(null, newAccess);

        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed — clear session and force re-login
        processPendingQueue(refreshError, null);
        await clearAll();
        clearAuthToken();
        // Notify auth store to reset state (imported lazily to avoid circular deps)
        const { useAuthStore } = await import('../store/authStore');
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
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

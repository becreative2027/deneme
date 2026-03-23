import { apiClient } from './client';

/**
 * Registers the device Expo push token with the backend.
 * Backend stores it per-user to send targeted push notifications.
 * POST /api/notifications/register-device
 */
export async function registerDevice(pushToken: string): Promise<void> {
  await apiClient.post('/api/notifications/register-device', { token: pushToken });
}

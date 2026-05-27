import { apiClient } from './client';

/**
 * Registers the device Expo push token with the backend.
 * Backend stores it per-user to send targeted push notifications.
 * POST /api/notifications/register-device
 */
export async function registerDevice(pushToken: string): Promise<void> {
  await apiClient.post('/api/notifications/register-device', { token: pushToken });
}

export interface ApiNotification {
  id: string;
  title: string;
  body: string;
  type: string;
  postId?: string;
  placeId?: string;
  actorId?: string;
  isRead: boolean;
  createdAt: string;
}

export async function getMyNotifications(page = 1, pageSize = 30): Promise<ApiNotification[]> {
  const { data } = await apiClient.get('/api/notifications/my', { params: { page, pageSize } });
  const inner = data?.data ?? data;
  return Array.isArray(inner) ? inner : [];
}

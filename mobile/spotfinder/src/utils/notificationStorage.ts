import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'spotfinder_notifications_v1';
const MAX_STORED = 30;
const DISPLAY_COUNT = 5;

export interface StoredNotification {
  id: string;
  title: string;
  body: string;
  type?: string;     // 'like' | 'follow' | 'comment' | 'new_post' | ...
  postId?: string;
  userId?: string;
  placeId?: string;
  receivedAt: string; // ISO
  read: boolean;
}

export async function saveNotification(
  notif: Omit<StoredNotification, 'id' | 'receivedAt' | 'read'>,
): Promise<void> {
  try {
    const existing = await loadAll();
    const entry: StoredNotification = {
      ...notif,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      receivedAt: new Date().toISOString(),
      read: false,
    };
    // Prepend newest, cap at MAX_STORED
    const updated = [entry, ...existing].slice(0, MAX_STORED);
    await AsyncStorage.setItem(KEY, JSON.stringify(updated));
  } catch {}
}

export async function loadAll(): Promise<StoredNotification[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as StoredNotification[]) : [];
  } catch {
    return [];
  }
}

export async function loadRecent(): Promise<StoredNotification[]> {
  const all = await loadAll();
  return all.slice(0, DISPLAY_COUNT);
}

export async function markAllRead(): Promise<void> {
  try {
    const all = await loadAll();
    const updated = all.map((n) => ({ ...n, read: true }));
    await AsyncStorage.setItem(KEY, JSON.stringify(updated));
  } catch {}
}

export async function clearAll(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEY);
  } catch {}
}

export function unreadCount(notifications: StoredNotification[]): number {
  return notifications.filter((n) => !n.read).length;
}

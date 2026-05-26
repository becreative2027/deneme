import { useCallback, useEffect, useState } from 'react';
import {
  StoredNotification,
  loadRecent,
  markAllRead,
  clearAll,
  unreadCount,
} from '../utils/notificationStorage';

export function useStoredNotifications() {
  const [notifications, setNotifications] = useState<StoredNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const recent = await loadRecent();
    setNotifications(recent);
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, []);

  const handleMarkAllRead = useCallback(async () => {
    await markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const handleClearAll = useCallback(async () => {
    await clearAll();
    setNotifications([]);
  }, []);

  return {
    notifications,
    loading,
    unread: unreadCount(notifications),
    refresh,
    markAllRead: handleMarkAllRead,
    clearAll: handleClearAll,
  };
}

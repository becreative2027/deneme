import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ApiNotification, getMyNotifications, markAllNotificationsRead } from '../../api/notifications';
import { formatRelativeTime } from '../../utils/formatters';
import { useTheme, typography, spacing } from '../../theme';

// ── Icon config per notification type ────────────────────────────────────────

type IconCfg = { name: keyof typeof Ionicons.glyphMap; bg: string; color: string };

function iconFor(type?: string): IconCfg {
  switch (type) {
    case 'like':
      return { name: 'heart', bg: '#fef2f2', color: '#ef4444' };
    case 'follow':
      return { name: 'person-add', bg: '#f0eeff', color: '#6c63ff' };
    case 'comment':
      return { name: 'chatbubble', bg: '#eff6ff', color: '#3b82f6' };
    case 'new_post':
      return { name: 'images', bg: '#fffbeb', color: '#f59e0b' };
    case 'admin_response':
      return { name: 'megaphone', bg: '#fff7ed', color: '#f97316' };
    default:
      return { name: 'notifications', bg: '#f5f5f5', color: '#888' };
  }
}

// ── Single row ────────────────────────────────────────────────────────────────

function NotifRow({
  notif,
  colors,
}: {
  notif: ApiNotification;
  colors: ReturnType<typeof useTheme>['colors'];
}) {
  const cfg = iconFor(notif.type);

  return (
    <View style={[s.row, { borderBottomColor: colors.borderLight }]}>
      {/* Unread dot */}
      <View style={s.dotCol}>
        {!notif.isRead && <View style={s.unreadDot} />}
      </View>

      {/* Icon */}
      <View style={[s.iconCircle, { backgroundColor: cfg.bg }]}>
        <Ionicons name={cfg.name} size={16} color={cfg.color} />
      </View>

      {/* Text */}
      <View style={s.textCol}>
        <Text
          style={[s.title, { color: colors.text }, !notif.isRead && s.titleUnread]}
          numberOfLines={1}
        >
          {notif.title}
        </Text>
        {!!notif.body && (
          <Text style={[s.body, { color: colors.textTertiary }]} numberOfLines={1}>
            {notif.body}
          </Text>
        )}
      </View>

      {/* Time */}
      <Text style={[s.time, { color: colors.textMuted }]}>
        {formatRelativeTime(notif.createdAt)}
      </Text>
    </View>
  );
}

// ── Tab ───────────────────────────────────────────────────────────────────────

interface Props {
  /** Extra bottom padding (tab bar height) */
  bottomPadding?: number;
}

export function NotificationsTab({ bottomPadding = 0 }: Props) {
  const { colors } = useTheme();
  const [notifications, setNotifications] = useState<ApiNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMyNotifications();
      setNotifications(data);
      // Auto-mark all as read on load if there are unread ones
      if (data.some((n) => !n.isRead)) {
        await markAllNotificationsRead().catch(() => {});
      }
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, []);

  const unread = notifications.filter((n) => !n.isRead).length;

  if (loading) {
    return (
      <View style={[s.center, { paddingBottom: bottomPadding }]}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return (
    <View style={[s.container, { backgroundColor: colors.background }]}>
      {/* Header row */}
      <View style={[s.header, { borderBottomColor: colors.borderLight }]}>
        <Text style={[typography.captionBold, { color: colors.textTertiary, letterSpacing: 0.8 }]}>
          SON BİLDİRİMLER
        </Text>
        <View style={s.headerActions}>
          {unread > 0 && (
            <TouchableOpacity
              onPress={async () => {
                setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
                await markAllNotificationsRead().catch(() => {});
              }}
              style={s.headerBtn}
              hitSlop={8}
            >
              <Text style={[s.headerBtnText, { color: colors.accent }]}>Okundu işaretle</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={refresh} style={s.headerBtn} hitSlop={8}>
            <Ionicons name="refresh-outline" size={14} color={colors.textTertiary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* List */}
      {notifications.length === 0 ? (
        <View style={[s.empty, { paddingBottom: bottomPadding }]}>
          <View style={[s.emptyIcon, { backgroundColor: colors.surfaceElevated }]}>
            <Ionicons name="notifications-off-outline" size={28} color={colors.textTertiary} />
          </View>
          <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.md }]}>
            Henüz bildirim yok
          </Text>
          <Text style={[typography.caption, { color: colors.textMuted, marginTop: 4, textAlign: 'center' }]}>
            Birisi seni takip ettiğinde veya{'\n'}gönderini beğendiğinde burada görürsün.
          </Text>
        </View>
      ) : (
        <View style={[s.list, { paddingBottom: bottomPadding + 16 }]}>
          {notifications.map((n) => (
            <NotifRow key={n.id} notif={n} colors={colors} />
          ))}
        </View>
      )}
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container: { flex: 1 },
  center:    { flex: 1, alignItems: 'center', justifyContent: 'center' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerBtn:     { paddingVertical: 2 },
  headerBtnText: { fontSize: 12, fontWeight: '600' },

  list: { paddingTop: 4 },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  dotCol:    { width: 8, alignItems: 'center' },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F5A623',
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textCol: { flex: 1 },
  title:   { fontSize: 13, fontWeight: '500' },
  titleUnread: { fontWeight: '700' },
  body:    { fontSize: 12, marginTop: 1 },
  time:    { fontSize: 11, flexShrink: 0 },

  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 14,
  },
  refreshText: { fontSize: 12 },

  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 48,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

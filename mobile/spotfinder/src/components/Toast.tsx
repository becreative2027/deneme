/**
 * Phase 8.1 — Global Toast System
 *
 * Usage:
 *   const { showToast } = useToast();
 *   showToast('Post shared!', 'success');
 *   showToast('Network error', 'error');
 *
 * Wrap the app root with <ToastProvider>.
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ── Types ────────────────────────────────────────────────────────────────────

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType, durationMs?: number) => void;
}

// ── Context ───────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue>({
  showToast: () => {},
});

export function useToast(): ToastContextValue {
  return useContext(ToastContext);
}

// ── Config per type ────────────────────────────────────────────────────────────

const CONFIG: Record<ToastType, { bg: string; icon: string; iconColor: string }> = {
  success: { bg: '#27ae60', icon: 'checkmark-circle',   iconColor: '#fff' },
  error:   { bg: '#e74c3c', icon: 'close-circle',       iconColor: '#fff' },
  info:    { bg: '#2980b9', icon: 'information-circle',  iconColor: '#fff' },
  warning: { bg: '#f39c12', icon: 'warning',             iconColor: '#fff' },
};

// ── Single Toast Pill ─────────────────────────────────────────────────────────

function ToastPill({
  item,
  onDismiss,
}: {
  item: ToastItem;
  onDismiss: (id: string) => void;
}) {
  const cfg = CONFIG[item.type];
  const translateY = useRef(new Animated.Value(80)).current;
  const opacity    = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    // Slide up + fade in
    Animated.parallel([
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true, tension: 70, friction: 10 }),
      Animated.timing(opacity,   { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  }, []);

  const dismiss = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateY, { toValue: 80, duration: 220, useNativeDriver: true }),
      Animated.timing(opacity,    { toValue: 0,  duration: 220, useNativeDriver: true }),
    ]).start(() => onDismiss(item.id));
  }, [item.id, onDismiss, translateY, opacity]);

  return (
    <Animated.View style={[styles.pill, { backgroundColor: cfg.bg }, { opacity, transform: [{ translateY }] }]}>
      <Ionicons name={cfg.icon as any} size={20} color={cfg.iconColor} />
      <Text style={styles.pillText} numberOfLines={2}>{item.message}</Text>
      <Pressable onPress={dismiss} hitSlop={10}>
        <Ionicons name="close" size={16} color="rgba(255,255,255,0.8)" />
      </Pressable>
    </Animated.View>
  );
}

// ── Provider ──────────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const insets = useSafeAreaInsets();
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    clearTimeout(timers.current[id]);
    delete timers.current[id];
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = 'info', durationMs = 3500) => {
      const id = `${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev.slice(-2), { id, message, type }]); // max 3 toasts
      timers.current[id] = setTimeout(() => remove(id), durationMs);
    },
    [remove],
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <View
        style={[styles.container, { bottom: insets.bottom + 16 }]}
        pointerEvents="box-none"
      >
        {toasts.map((t) => (
          <ToastPill key={t.id} item={t} onDismiss={remove} />
        ))}
      </View>
    </ToastContext.Provider>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    gap: 8,
    zIndex: 9999,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 6,
  },
  pillText: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
  },
});

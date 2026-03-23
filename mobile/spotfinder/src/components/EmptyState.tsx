/**
 * Phase 8.3 — Enhanced EmptyState
 *
 * Improvements over Phase 8 original:
 *   - Themed icon circle with brand tint
 *   - Optional action button (CTA)
 *   - Optional `variant` for pre-wired configs (feed, search, profile, media)
 *   - Theme-aware colors via useTheme()
 */
import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, ThemeColors } from '../theme';

// ── Variant presets ───────────────────────────────────────────────────────────

type EmptyVariant = 'feed' | 'search' | 'profile' | 'media' | 'notifications' | 'custom';

const VARIANT_DEFAULTS: Record<
  Exclude<EmptyVariant, 'custom'>,
  { icon: keyof typeof Ionicons.glyphMap; title: string; subtitle: string }
> = {
  feed: {
    icon: 'newspaper-outline',
    title: 'Nothing here yet',
    subtitle: 'Follow people or explore to see posts.',
  },
  search: {
    icon: 'search-outline',
    title: 'No results found',
    subtitle: 'Try a different search term.',
  },
  profile: {
    icon: 'images-outline',
    title: 'No posts yet',
    subtitle: 'Share your first spot!',
  },
  media: {
    icon: 'camera-outline',
    title: 'No photos yet',
    subtitle: 'Add a photo to your post.',
  },
  notifications: {
    icon: 'notifications-outline',
    title: 'No notifications',
    subtitle: "You're all caught up!",
  },
};

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  /** Preset variant — overrides icon/title/subtitle if provided */
  variant?: EmptyVariant;
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  /** Label for the optional CTA button */
  actionLabel?: string;
  onAction?: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function EmptyState({
  variant,
  icon,
  title,
  subtitle,
  actionLabel,
  onAction,
}: Props) {
  const theme = useTheme();
  const s = useMemo(() => createStyles(theme.colors), [theme.colors]);

  // Resolve values: explicit props take priority, then variant preset
  const preset = variant && variant !== 'custom' ? VARIANT_DEFAULTS[variant] : null;
  const resolvedIcon = icon ?? preset?.icon ?? 'file-tray-outline';
  const resolvedTitle = title ?? preset?.title ?? '';
  const resolvedSubtitle = subtitle ?? preset?.subtitle;

  return (
    <View style={s.container}>
      {/* Icon in a soft-tinted circle */}
      <View style={s.iconCircle}>
        <Ionicons name={resolvedIcon} size={36} color={theme.colors.primary} />
      </View>

      <Text style={s.title}>{resolvedTitle}</Text>
      {resolvedSubtitle ? (
        <Text style={s.subtitle}>{resolvedSubtitle}</Text>
      ) : null}

      {/* Optional CTA */}
      {actionLabel && onAction ? (
        <TouchableOpacity style={s.actionBtn} onPress={onAction} activeOpacity={0.8}>
          <Text style={s.actionText}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

// ── Theme-aware styles ────────────────────────────────────────────────────────

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 32,
      gap: 10,
    },
    iconCircle: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: c.primary + '15', // 8% opacity tint
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 4,
    },
    title: {
      fontSize: 17,
      fontWeight: '700',
      color: c.text,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 14,
      color: c.textTertiary,
      textAlign: 'center',
      lineHeight: 20,
    },
    actionBtn: {
      marginTop: 8,
      backgroundColor: c.primary,
      paddingHorizontal: 24,
      paddingVertical: 10,
      borderRadius: 20,
    },
    actionText: {
      color: c.primaryText,
      fontSize: 14,
      fontWeight: '700',
    },
  });

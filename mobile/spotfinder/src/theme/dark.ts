import { Theme } from './light';

export const dark: Theme = {
  isDark: true,
  colors: {
    // Backgrounds
    background: '#0D0D0F',
    surface: '#111118',
    surfaceSecondary: '#15151D',
    surfaceElevated: '#1A1A22',
    // Brand
    primary: '#F5A623',
    primaryText: '#1a0e00',
    accent: '#F5A623',
    accentDeep: '#E07B1A',
    accentSoft: 'rgba(245,166,35,0.12)',
    accentBorder: 'rgba(245,166,35,0.35)',
    accentGlow: 'rgba(245,166,35,0.35)',
    accentOnAccent: '#1a0e00',
    // Text
    text: '#FFFFFF',
    textSecondary: 'rgba(255,255,255,0.72)',
    textTertiary: 'rgba(255,255,255,0.48)',
    textMuted: 'rgba(255,255,255,0.32)',
    // Borders
    border: 'rgba(255,255,255,0.10)',
    borderLight: 'rgba(255,255,255,0.06)',
    // Glass
    glassBg: 'rgba(255,255,255,0.06)',
    glassBgStrong: 'rgba(255,255,255,0.09)',
    glassBorder: 'rgba(255,255,255,0.10)',
    glassBorderStrong: 'rgba(255,255,255,0.16)',
    // Semantic
    danger: '#ff453a',
    success: '#32d74b',
    warning: '#ffd60a',
    info: '#0a84ff',
    // UI elements
    skeleton: '#15151D',
    overlay: 'rgba(0,0,0,0.55)',
    icon: 'rgba(255,255,255,0.48)',
    iconActive: '#F5A623',
    // Navigation
    tabBar: 'rgba(18,18,22,0.78)',
    tabBarBorder: 'rgba(255,255,255,0.10)',
    // Status bar
    statusBar: 'light',
  },
};

// ── Theme shape (shared by light + dark) ─────────────────────────────────────

export interface ThemeColors {
  // Backgrounds
  background: string;
  surface: string;
  surfaceSecondary: string;
  surfaceElevated: string;
  // Brand — amber/gold
  primary: string;
  primaryText: string;
  accent: string;
  accentDeep: string;
  accentSoft: string;
  accentBorder: string;
  accentGlow: string;
  accentOnAccent: string;
  // Text
  text: string;
  textSecondary: string;
  textTertiary: string;
  textMuted: string;
  // Borders
  border: string;
  borderLight: string;
  // Glass / elevation
  glassBg: string;
  glassBgStrong: string;
  glassBorder: string;
  glassBorderStrong: string;
  // Semantic
  danger: string;
  success: string;
  warning: string;
  info: string;
  // UI elements
  skeleton: string;
  overlay: string;
  icon: string;
  iconActive: string;
  // Navigation
  tabBar: string;
  tabBarBorder: string;
  // Status bar
  statusBar: 'dark' | 'light';
}

export interface Theme {
  isDark: boolean;
  colors: ThemeColors;
}

// ── Light token values ────────────────────────────────────────────────────────

export const light: Theme = {
  isDark: false,
  colors: {
    // Backgrounds
    background: '#FAF8F5',
    surface: '#FFFFFF',
    surfaceSecondary: '#F5F3F0',
    surfaceElevated: '#FFFFFF',
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
    text: '#0D0D0F',
    textSecondary: 'rgba(13,13,15,0.72)',
    textTertiary: 'rgba(13,13,15,0.48)',
    textMuted: 'rgba(13,13,15,0.32)',
    // Borders
    border: 'rgba(13,13,15,0.10)',
    borderLight: 'rgba(13,13,15,0.06)',
    // Glass
    glassBg: 'rgba(0,0,0,0.04)',
    glassBgStrong: 'rgba(0,0,0,0.07)',
    glassBorder: 'rgba(0,0,0,0.08)',
    glassBorderStrong: 'rgba(0,0,0,0.14)',
    // Semantic
    danger: '#e74c3c',
    success: '#27ae60',
    warning: '#f39c12',
    info: '#2980b9',
    // UI elements
    skeleton: '#EAE8E4',
    overlay: 'rgba(0,0,0,0.35)',
    icon: 'rgba(13,13,15,0.48)',
    iconActive: '#F5A623',
    // Navigation
    tabBar: 'rgba(250,248,245,0.88)',
    tabBarBorder: 'rgba(13,13,15,0.10)',
    // Status bar
    statusBar: 'dark',
  },
};

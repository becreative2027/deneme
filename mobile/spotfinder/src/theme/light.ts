// ── Theme shape (shared by light + dark) ─────────────────────────────────────

export interface ThemeColors {
  // Backgrounds
  background: string;
  surface: string;
  surfaceSecondary: string;
  surfaceElevated: string;
  // Brand
  primary: string;
  primaryText: string;
  // Text
  text: string;
  textSecondary: string;
  textTertiary: string;
  textMuted: string;
  // Borders
  border: string;
  borderLight: string;
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
    background: '#f8f8f8',
    surface: '#ffffff',
    surfaceSecondary: '#fafafa',
    surfaceElevated: '#ffffff',
    // Brand
    primary: '#6c63ff',
    primaryText: '#ffffff',
    // Text
    text: '#1a1a1a',
    textSecondary: '#555555',
    textTertiary: '#888888',
    textMuted: '#aaaaaa',
    // Borders
    border: '#e8e8e8',
    borderLight: '#f0f0f0',
    // Semantic
    danger: '#e74c3c',
    success: '#27ae60',
    warning: '#f39c12',
    info: '#2980b9',
    // UI elements
    skeleton: '#e0e0e0',
    overlay: 'rgba(0,0,0,0.35)',
    icon: '#888888',
    iconActive: '#6c63ff',
    // Navigation
    tabBar: '#ffffff',
    tabBarBorder: '#e0e0e0',
    // Status bar
    statusBar: 'dark',
  },
};

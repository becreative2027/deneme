import { Theme } from './light';

export const dark: Theme = {
  isDark: true,
  colors: {
    // Backgrounds
    background: '#111114',
    surface: '#1c1c1e',
    surfaceSecondary: '#2c2c2e',
    surfaceElevated: '#3a3a3c',
    // Brand (slightly brighter in dark)
    primary: '#7c74ff',
    primaryText: '#ffffff',
    // Text
    text: '#f2f2f7',
    textSecondary: '#ebebf5cc',
    textTertiary: '#ebebf599',
    textMuted: '#636366',
    // Borders
    border: '#38383a',
    borderLight: '#2c2c2e',
    // Semantic
    danger: '#ff453a',
    success: '#32d74b',
    warning: '#ffd60a',
    info: '#0a84ff',
    // UI elements
    skeleton: '#2c2c2e',
    overlay: 'rgba(0,0,0,0.55)',
    icon: '#636366',
    iconActive: '#7c74ff',
    // Navigation
    tabBar: '#1c1c1e',
    tabBarBorder: '#38383a',
    // Status bar
    statusBar: 'light',
  },
};

import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { light, Theme } from './light';
import { dark } from './dark';
import { useThemeStore } from '../store/themeStore';

export { type Theme, type ThemeColors } from './light';
export { light } from './light';
export { dark } from './dark';

// ── Design tokens ─────────────────────────────────────────────────────────────

export const spacing = {
  xs:   4,
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  '2xl': 28,
  '3xl': 40,
} as const;

export const radius = {
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  '2xl': 24,
  pill: 999,
} as const;

export const shadow = {
  card: {
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  hero: {
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 20 },
    elevation: 14,
  },
  amber: {
    shadowColor: '#F5A623',
    shadowOpacity: 0.4,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
} as const;

export const typography = {
  displayXL: {
    fontWeight: '800' as const,
    fontSize: 38,
    letterSpacing: -1.5,
    lineHeight: 42,
  },
  displayL: {
    fontWeight: '800' as const,
    fontSize: 28,
    letterSpacing: -0.8,
    lineHeight: 32,
  },
  titleL: {
    fontWeight: '800' as const,
    fontSize: 24,
    letterSpacing: -0.6,
  },
  titleM: {
    fontWeight: '700' as const,
    fontSize: 18,
    letterSpacing: -0.3,
  },
  body: {
    fontWeight: '500' as const,
    fontSize: 15,
  },
  bodyDim: {
    fontWeight: '400' as const,
    fontSize: 14,
  },
  caption: {
    fontWeight: '500' as const,
    fontSize: 12,
  },
  eyebrow: {
    fontWeight: '700' as const,
    fontSize: 10,
    letterSpacing: 1.5,
    textTransform: 'uppercase' as const,
  },
} as const;

// ── Context ───────────────────────────────────────────────────────────────────

const ThemeContext = createContext<Theme>(light);

// ── Provider ──────────────────────────────────────────────────────────────────

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const { override } = useThemeStore();

  const theme = useMemo(() => {
    const scheme = override ?? systemScheme ?? 'dark';
    return scheme === 'dark' ? dark : light;
  }, [override, systemScheme]);

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useTheme(): Theme {
  return useContext(ThemeContext);
}

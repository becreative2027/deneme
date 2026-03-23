import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { light, Theme } from './light';
import { dark } from './dark';
import { useThemeStore } from '../store/themeStore';

export { type Theme, type ThemeColors } from './light';
export { light } from './light';
export { dark } from './dark';

// ── Context ───────────────────────────────────────────────────────────────────

const ThemeContext = createContext<Theme>(light);

// ── Provider ──────────────────────────────────────────────────────────────────

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const { override } = useThemeStore();

  const theme = useMemo(() => {
    const scheme = override ?? systemScheme ?? 'light';
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

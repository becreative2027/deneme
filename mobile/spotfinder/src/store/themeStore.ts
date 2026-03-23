import { create } from 'zustand';
import { ColorSchemeName } from 'react-native';

interface ThemeState {
  /** null = follow system */
  override: ColorSchemeName;
  setOverride: (scheme: Exclude<ColorSchemeName, null | undefined>) => void;
  clearOverride: () => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  override: null,
  setOverride: (scheme) => set({ override: scheme }),
  clearOverride: () => set({ override: null }),
}));

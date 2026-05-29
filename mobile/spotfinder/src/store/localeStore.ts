import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../i18n';

type Language = 'tr' | 'en';

interface LocaleState {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      language: 'tr',
      setLanguage: (language) => {
        set({ language });
        i18n.changeLanguage(language);
      },
    }),
    {
      name: 'locale-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

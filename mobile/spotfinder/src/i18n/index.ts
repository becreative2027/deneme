import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import tr from './tr';
import en from './en';

i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v4' as any,
    lng: 'tr',
    fallbackLng: 'tr',
    resources: {
      tr: { translation: tr },
      en: { translation: en },
    },
    interpolation: { escapeValue: false },
  });

export default i18n;

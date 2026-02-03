import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import de from '../locales/de/translation.json';
import en from '../locales/en/translation.json';

const resources = {
  de: {
    translation: de,
  },
  en: {
    translation: en,
  },
};

// Available languages for the language chooser
export const AVAILABLE_LANGUAGES = [
  { code: 'de', name: 'Deutsch', nativeName: 'Deutsch' },
  { code: 'en', name: 'English', nativeName: 'English' },
] as const;

export type LanguageCode = (typeof AVAILABLE_LANGUAGES)[number]['code'];

// Get stored language preference or default to German
const getInitialLanguage = (): LanguageCode => {
  const stored = localStorage.getItem('labgate-language');
  if (stored && (stored === 'de' || stored === 'en')) {
    return stored;
  }
  return 'de';
};

i18n.use(initReactI18next).init({
  resources,
  lng: getInitialLanguage(),
  fallbackLng: 'de',
  interpolation: {
    escapeValue: false,
  },
});

// Helper function to change language and persist it
export const changeLanguage = (lang: LanguageCode) => {
  localStorage.setItem('labgate-language', lang);
  i18n.changeLanguage(lang);
};

export default i18n;

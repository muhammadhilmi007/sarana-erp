import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

// Import translation files
import enCommon from '../locales/en/common.json';
import idCommon from '../locales/id/common.json';

// Initialize i18next
i18n
  // Load translations using http backend
  .use(Backend)
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    // Default language
    fallbackLng: 'en',
    // Debug mode in development
    debug: process.env.NODE_ENV === 'development',
    // Namespace separation
    ns: ['common'],
    defaultNS: 'common',
    // Interpolation configuration
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    // Resources (translations)
    resources: {
      en: {
        common: enCommon,
      },
      id: {
        common: idCommon,
      },
    },
    // Detection options
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage'],
    },
    // React options
    react: {
      useSuspense: true,
    },
  });

export default i18n;

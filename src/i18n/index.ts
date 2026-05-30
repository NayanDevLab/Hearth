// i18n setup — i18next with react-i18next, module-wise namespaces.
// Call initI18n() once at app startup (before rendering any screen).
// Each namespace maps to a feature: 'common', 'onboarding', 'dashboard', etc.

import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

import type { AppLanguage } from '@/storage/prefs';

// ─── English ──────────────────────────────────────────────────
import enCommon from './locales/en/common.json';
import enDashboard from './locales/en/dashboard.json';
import enOnboarding from './locales/en/onboarding.json';
// ─── Gujarati ────────────────────────────────────────────────
import guCommon from './locales/gu/common.json';
import guDashboard from './locales/gu/dashboard.json';
import guOnboarding from './locales/gu/onboarding.json';
// ─── Hindi ───────────────────────────────────────────────────
import hiCommon from './locales/hi/common.json';
import hiDashboard from './locales/hi/dashboard.json';
import hiOnboarding from './locales/hi/onboarding.json';

export const SUPPORTED_LANGUAGES: AppLanguage[] = ['en', 'hi', 'gu'];

export const LANGUAGE_META: Record<
  AppLanguage,
  { native: string; name: string; region: string; flag: string }
> = {
  en: { native: 'English', name: 'English', region: 'United States', flag: '🇺🇸' },
  hi: { native: 'हिन्दी', name: 'Hindi', region: 'भारत', flag: '🇮🇳' },
  gu: { native: 'ગુજરાતી', name: 'Gujarati', region: 'ભારત · ગુજરાત', flag: '🇮🇳' },
};

export async function initI18n(language: AppLanguage = 'en'): Promise<void> {
  if (i18next.isInitialized) {
    // Already initialized — just switch language if needed
    if (i18next.language !== language) {
      // eslint-disable-next-line import/no-named-as-default-member
      await i18next.changeLanguage(language);
    }
    return;
  }

  // eslint-disable-next-line import/no-named-as-default-member
  await i18next.use(initReactI18next).init({
    lng: language,
    fallbackLng: 'en',
    defaultNS: 'common',
    ns: ['common', 'onboarding', 'dashboard'],
    resources: {
      en: { common: enCommon, onboarding: enOnboarding, dashboard: enDashboard },
      hi: { common: hiCommon, onboarding: hiOnboarding, dashboard: hiDashboard },
      gu: { common: guCommon, onboarding: guOnboarding, dashboard: guDashboard },
    },
    interpolation: { escapeValue: false },
    compatibilityJSON: 'v4',
  });
}

export { i18next };

// i18n setup — i18next with react-i18next, module-wise namespaces.
// Call initI18n() once at app startup (before rendering any screen).
// Each namespace maps to a feature: 'common', 'onboarding', 'dashboard', etc.

import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

import type { AppLanguage } from '@/storage/prefs';

import enCalendar from './locales/en/calendar.json';
// ─── English ──────────────────────────────────────────────────
import enCommon from './locales/en/common.json';
import enDashboard from './locales/en/dashboard.json';
import enLocator from './locales/en/locator.json';
import enMaintenance from './locales/en/maintenance.json';
import enMoney from './locales/en/money.json';
import enOnboarding from './locales/en/onboarding.json';
import enPantry from './locales/en/pantry.json';
import enSettings from './locales/en/settings.json';
import enShopping from './locales/en/shopping.json';
import enTasks from './locales/en/tasks.json';
// ─── Gujarati ────────────────────────────────────────────────
import guCalendar from './locales/gu/calendar.json';
import guCommon from './locales/gu/common.json';
import guDashboard from './locales/gu/dashboard.json';
import guLocator from './locales/gu/locator.json';
import guMaintenance from './locales/gu/maintenance.json';
import guMoney from './locales/gu/money.json';
import guOnboarding from './locales/gu/onboarding.json';
import guPantry from './locales/gu/pantry.json';
import guSettings from './locales/gu/settings.json';
import guShopping from './locales/gu/shopping.json';
import guTasks from './locales/gu/tasks.json';
// ─── Hindi ───────────────────────────────────────────────────
import hiCalendar from './locales/hi/calendar.json';
import hiCommon from './locales/hi/common.json';
import hiDashboard from './locales/hi/dashboard.json';
import hiLocator from './locales/hi/locator.json';
import hiMaintenance from './locales/hi/maintenance.json';
import hiMoney from './locales/hi/money.json';
import hiOnboarding from './locales/hi/onboarding.json';
import hiPantry from './locales/hi/pantry.json';
import hiSettings from './locales/hi/settings.json';
import hiShopping from './locales/hi/shopping.json';
import hiTasks from './locales/hi/tasks.json';

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
    ns: [
      'common',
      'onboarding',
      'dashboard',
      'tasks',
      'shopping',
      'calendar',
      'settings',
      'locator',
      'maintenance',
      'money',
      'pantry',
    ],
    resources: {
      en: {
        common: enCommon,
        onboarding: enOnboarding,
        dashboard: enDashboard,
        tasks: enTasks,
        shopping: enShopping,
        calendar: enCalendar,
        settings: enSettings,
        locator: enLocator,
        maintenance: enMaintenance,
        money: enMoney,
        pantry: enPantry,
      },
      hi: {
        common: hiCommon,
        onboarding: hiOnboarding,
        dashboard: hiDashboard,
        tasks: hiTasks,
        shopping: hiShopping,
        calendar: hiCalendar,
        settings: hiSettings,
        locator: hiLocator,
        maintenance: hiMaintenance,
        money: hiMoney,
        pantry: hiPantry,
      },
      gu: {
        common: guCommon,
        onboarding: guOnboarding,
        dashboard: guDashboard,
        tasks: guTasks,
        shopping: guShopping,
        calendar: guCalendar,
        settings: guSettings,
        locator: guLocator,
        maintenance: guMaintenance,
        money: guMoney,
        pantry: guPantry,
      },
    },
    interpolation: { escapeValue: false },
    compatibilityJSON: 'v4',
  });
}

export { i18next };

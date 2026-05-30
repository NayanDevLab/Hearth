// Typed AsyncStorage helpers — always use these instead of raw AsyncStorage calls.

import AsyncStorage from '@react-native-async-storage/async-storage';

import { PREF_KEYS } from './keys';

export type AppLanguage = 'en' | 'hi' | 'gu';

export interface UserPrefs {
  onboardingComplete: boolean;
  language: AppLanguage;
  userName: string;
  householdName: string;
}

// ─── Generic helpers ─────────────────────────────────────────

async function getItem<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function setItem<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

// ─── Typed preference accessors ──────────────────────────────

export const prefs = {
  getOnboardingComplete: () => getItem<boolean>(PREF_KEYS.ONBOARDING_COMPLETE, false),

  setOnboardingComplete: (value: boolean) => setItem(PREF_KEYS.ONBOARDING_COMPLETE, value),

  getLanguage: () => getItem<AppLanguage>(PREF_KEYS.LANGUAGE, 'en'),

  setLanguage: (lang: AppLanguage) => setItem(PREF_KEYS.LANGUAGE, lang),

  getUserName: () => getItem<string>(PREF_KEYS.USER_NAME, ''),

  setUserName: (name: string) => setItem(PREF_KEYS.USER_NAME, name),

  getHouseholdName: () => getItem<string>(PREF_KEYS.HOUSEHOLD_NAME, ''),

  setHouseholdName: (name: string) => setItem(PREF_KEYS.HOUSEHOLD_NAME, name),

  // Batch-save name + household + mark onboarding complete
  completeOnboarding: async (userName: string, householdName: string, language: AppLanguage) => {
    await AsyncStorage.multiSet([
      [PREF_KEYS.USER_NAME, JSON.stringify(userName)],
      [PREF_KEYS.HOUSEHOLD_NAME, JSON.stringify(householdName)],
      [PREF_KEYS.LANGUAGE, JSON.stringify(language)],
      [PREF_KEYS.ONBOARDING_COMPLETE, JSON.stringify(true)],
    ]);
  },
};

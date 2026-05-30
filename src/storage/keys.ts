// AsyncStorage key constants — all preference keys in one place.
// Only lightweight preferences live here; all app data goes in SQLite.

export const PREF_KEYS = {
  ONBOARDING_COMPLETE: '@hearth/onboarding_complete',
  LANGUAGE: '@hearth/language',
  USER_NAME: '@hearth/user_name',
  HOUSEHOLD_NAME: '@hearth/household_name',
} as const;

export type PrefKey = (typeof PREF_KEYS)[keyof typeof PREF_KEYS];

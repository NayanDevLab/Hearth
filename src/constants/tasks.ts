// App-wide constants for tasks: household members and category config.
// Will be replaced with DB-backed data in a future household management phase.

import { colors } from '@/theme';

export const MEMBER_CONFIG: Record<string, { name: string; color: string }> = {
  A: { name: 'Aarav', color: colors.primary },
  M: { name: 'Maya', color: colors.sky },
  L: { name: 'Leo', color: colors.butter },
  R: { name: 'Riya', color: colors.lilac },
  S: { name: 'Sara', color: colors.rose },
};

export const HOUSEHOLD_MEMBERS = Object.entries(MEMBER_CONFIG).map(([initial, v]) => ({
  initial,
  ...v,
}));

export interface CategoryConfig {
  id: string;
  label: string;
  color: string;
  soft: string;
}

export const CATEGORY_CONFIG: Record<string, CategoryConfig> = {
  clean: { id: 'clean', label: 'Cleaning', color: colors.sky, soft: colors.skySoft },
  kitchen: { id: 'kitchen', label: 'Kitchen', color: colors.primaryInk, soft: colors.primarySoft },
  pets: { id: 'pets', label: 'Pets', color: '#6A50A0', soft: colors.lilacSoft },
  outdoor: { id: 'outdoor', label: 'Outdoor', color: '#2F8A5E', soft: colors.mintSoft },
  errand: { id: 'errand', label: 'Errand', color: '#8A6220', soft: colors.butterSoft },
};

export const CATEGORIES = Object.values(CATEGORY_CONFIG);

export const REPEAT_OPTIONS = [
  { value: null, label: 'Never' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Every week' },
  { value: 'monthly', label: 'Every month' },
] as const;

// Pure helper — returns the i18n key for a recurrence value so callers can do t(getRepeatKey(...))
export function getRepeatKey(recurrence: string | null | undefined): string {
  if (recurrence === 'daily') return 'tasks:repeats_daily';
  if (recurrence === 'weekly') return 'tasks:repeats_weekly';
  if (recurrence === 'monthly') return 'tasks:repeats_monthly';
  return 'tasks:repeats_never';
}

// Returns tag string given a recurrence (already-translated label)
export function repeatTagLabel(
  recurrence: string | null | undefined,
  labels: { daily: string; weekly: string; monthly: string; never: string }
): string {
  if (recurrence === 'daily') return labels.daily;
  if (recurrence === 'weekly') return labels.weekly;
  if (recurrence === 'monthly') return labels.monthly;
  return labels.never;
}

export const REMINDER_OPTIONS = [
  { value: null, label: 'None' },
  { value: '15min', label: '15 min before' },
  { value: '1hour', label: '1 hour before' },
  { value: '1day', label: '1 day before' },
] as const;

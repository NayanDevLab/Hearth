// Calendar constants — event categories, recurrence, reminder, visibility options.

import { colors } from '@/theme';

export interface EventCategory {
  id: string;
  label: string;
  emoji: string;
  color: string;
  soft: string;
}

export const EVENT_CATEGORIES: EventCategory[] = [
  { id: 'family', label: 'Family', emoji: '👨‍👩‍👧', color: colors.primary, soft: colors.primarySoft },
  { id: 'school', label: 'School', emoji: '🎒', color: '#E55A48', soft: colors.roseSoft },
  { id: 'work', label: 'Work', emoji: '💼', color: colors.ink2, soft: colors.surface2 },
  { id: 'health', label: 'Health', emoji: '🩺', color: '#4AADD1', soft: colors.skySoft },
  { id: 'social', label: 'Social', emoji: '🎉', color: colors.lilac, soft: colors.lilacSoft },
  { id: 'fitness', label: 'Fitness', emoji: '🏃', color: '#2F8A5E', soft: colors.mintSoft },
  { id: 'pet', label: 'Pet', emoji: '🐾', color: '#8A6220', soft: colors.butterSoft },
  { id: 'travel', label: 'Travel', emoji: '✈️', color: colors.sky, soft: colors.skySoft },
  { id: 'home', label: 'Home', emoji: '🏠', color: colors.primaryInk, soft: colors.primarySoft },
  { id: 'other', label: 'Other', emoji: '⭐', color: colors.ink3, soft: colors.surface2 },
];

export const EVENT_CAT_MAP: Record<string, EventCategory> = Object.fromEntries(
  EVENT_CATEGORIES.map((c) => [c.id, c])
);

export const RECURRENCE_OPTIONS = [
  { value: null, label: 'Does not repeat' },
  { value: 'daily', label: 'Every day' },
  { value: 'weekly', label: 'Every week' },
  { value: 'monthly', label: 'Every month' },
  { value: 'yearly', label: 'Every year' },
] as const;

export const EVENT_REMINDER_OPTIONS = [
  { value: null, label: 'None' },
  { value: '5min', label: '5 minutes before' },
  { value: '15min', label: '15 minutes before' },
  { value: '30min', label: '30 minutes before' },
  { value: '1hour', label: '1 hour before' },
  { value: '1day', label: '1 day before' },
] as const;

export const VISIBILITY_OPTIONS = [
  { value: 'household', label: 'Household', description: 'Everyone can see this event' },
  { value: 'just_me', label: 'Just me', description: 'Only you can see this event' },
] as const;

/** Duration chips shown in the event form for quick end-time selection. */
export const DURATION_CHIPS = [
  { label: '+15 min', minutes: 15 },
  { label: '+30 min', minutes: 30 },
  { label: '+1 hr', minutes: 60 },
  { label: '+2 hr', minutes: 120 },
  { label: '+3 hr', minutes: 180 },
];

/** Day-of-week column headers (Sunday first). */
export const WEEK_HEADERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

/** Calendar view modes. */
export type CalendarView = 'month' | 'schedule';

/** Parse "10:30" → { h: 10, m: 30 } */
export function parseTime(t: string): { h: number; m: number } {
  const [h, m] = t.split(':').map(Number);
  return { h: h ?? 0, m: m ?? 0 };
}

/** Format { h: 10, m: 30 } → "10:30 AM" */
export function formatTime12(t: string): string {
  const { h, m } = parseTime(t);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${suffix}`;
}

/** "2026-03-17" → Date */
export function parseDate(dateStr: string): Date {
  const [y, mo, d] = dateStr.split('-').map(Number);
  return new Date(y, (mo ?? 1) - 1, d ?? 1);
}

/** Date → "2026-03-17" */
export function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Add `minutes` to a "HH:mm" string. */
export function addMinutes(time: string, minutes: number): string {
  const { h, m } = parseTime(time);
  const total = h * 60 + m + minutes;
  const nh = Math.floor(total / 60) % 24;
  const nm = total % 60;
  return `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}`;
}

/** "2026-03-17" → "Tue, Mar 17, 2026" */
export function formatDisplayDate(dateStr: string): string {
  const d = parseDate(dateStr);
  return d.toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/** Get days array for a month grid (42 cells = 6 rows × 7 cols, null = padding). */
export function getMonthDays(year: number, month: number): (number | null)[] {
  const firstWeekday = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: (number | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);
  while (days.length < 42) days.push(null);
  return days;
}

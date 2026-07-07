// Meal Planner — slots, dish emojis, and date helpers.

export interface MealSlot {
  id: string;
  emoji: string;
  tint: string;
  bg: string;
}

export const MEAL_SLOTS: MealSlot[] = [
  { id: 'breakfast', emoji: '🌅', tint: '#8A6220', bg: '#FBF3DD' },
  { id: 'lunch', emoji: '☀️', tint: '#2F8A5E', bg: '#E8F7F0' },
  { id: 'dinner', emoji: '🌙', tint: '#6A50A0', bg: '#F0ECF8' },
];

export const SLOT_MAP: Record<string, MealSlot> = Object.fromEntries(
  MEAL_SLOTS.map((s) => [s.id, s])
);

export const DISH_EMOJIS = [
  '🍽️',
  '🍛',
  '🍲',
  '🥘',
  '🍚',
  '🍝',
  '🍜',
  '🍕',
  '🍔',
  '🌮',
  '🌯',
  '🥪',
  '🥗',
  '🍳',
  '🥞',
  '🧇',
  '🥣',
  '🍞',
  '🫓',
  '🥟',
  '🍢',
  '🍤',
  '🍗',
  '🥩',
  '🐟',
  '🍰',
  '🍨',
  '🍩',
  '☕',
  '🧃',
];

export const PREP_MINUTES_OPTIONS = [10, 15, 20, 30, 45, 60, 90, 120];

// Returns the local date key (YYYY-MM-DD) for a Date.
export function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// Returns 7 consecutive dates starting from today + startOffset days.
export function getWeekDates(startOffset = 0): Date[] {
  const dates: Date[] = [];
  const base = new Date();
  base.setHours(0, 0, 0, 0);
  base.setDate(base.getDate() + startOffset);
  for (let i = 0; i < 7; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    dates.push(d);
  }
  return dates;
}

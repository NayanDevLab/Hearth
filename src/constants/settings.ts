// Settings constants — member colors, roles, library section config.

import { type MemberRole } from '@/db/modules/members';
import { colors } from '@/theme';

/** 8 color swatches shown in the member color picker. */
export const MEMBER_COLORS = [
  colors.primary, // terracotta
  colors.sky, // blue
  colors.butter, // yellow
  colors.lilac, // purple
  colors.mint, // green
  colors.rose, // red
  '#2A6640', // dark green
  '#5B3A8C', // dark purple
] as const;

export interface RoleConfig {
  value: MemberRole;
  label: string;
  subtitle: string;
}

export const MEMBER_ROLES: RoleConfig[] = [
  { value: 'admin', label: 'Admin', subtitle: 'Full control' },
  { value: 'adult', label: 'Adult', subtitle: 'Edit all' },
  { value: 'teen', label: 'Teen', subtitle: 'No money' },
  { value: 'kid', label: 'Kid', subtitle: 'View + tasks' },
];

/** Derive a single-letter initial from a name. */
export function nameToInitial(name: string): string {
  return name.trim().charAt(0).toUpperCase() || '?';
}

/** Derive initial from name, ensure it doesn't conflict with existing initials. */
export function uniqueInitial(name: string, existingInitials: string[]): string {
  const base = nameToInitial(name);
  if (!existingInitials.includes(base)) return base;
  // Try first letter of each word
  const words = name.trim().split(/\s+/);
  for (const word of words) {
    const c = word.charAt(0).toUpperCase();
    if (c && !existingInitials.includes(c)) return c;
  }
  // Fallback: first unused letter A-Z
  for (let i = 65; i <= 90; i++) {
    const c = String.fromCharCode(i);
    if (!existingInitials.includes(c)) return c;
  }
  return base;
}

/** 7 color swatches shown in the category color picker. */
export const CATEGORY_COLORS = [
  colors.primary,
  colors.sky,
  colors.butter,
  colors.lilac,
  colors.mint,
  colors.rose,
  colors.ink,
] as const;

/** Emoji picker options for categories. */
export const CATEGORY_EMOJIS = [
  '🧹',
  '🍳',
  '🐾',
  '🌿',
  '🚗',
  '🏠',
  '⚡',
  '🛒',
  '🎬',
  '🥗',
  '🔧',
  '💧',
  '🔌',
  '🥞',
  '🌱',
  '📚',
  '🎨',
  '🧺',
] as const;

/** Area codes that categories can belong to. */
export const CATEGORY_AREAS = [
  { id: 'tasks', label: 'Tasks' },
  { id: 'money', label: 'Money' },
  { id: 'meals', label: 'Meals' },
  { id: 'maintenance', label: 'Maintenance' },
  { id: 'calendar', label: 'Calendar' },
] as const;

/** Area display labels used in the categories list. */
export const AREA_DISPLAY: Record<string, string> = {
  tasks: 'Chores & Tasks',
  money: 'Money & Bills',
  meals: 'Meals & Pantry',
  maintenance: 'Maintenance',
  calendar: 'Calendar',
};

/** Unit group order and colors. */
export const UNIT_GROUPS = ['Count', 'Weight', 'Volume', 'Packaging'] as const;

export const UNIT_GROUP_COLORS: Record<string, string> = {
  Count: colors.lilac,
  Weight: colors.primary,
  Volume: colors.sky,
  Packaging: colors.butter,
};

/** App version string — update when releasing. */
export const APP_VERSION = '1.0.0';
export const APP_BUILD = '2026.06';

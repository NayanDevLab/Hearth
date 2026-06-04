// Locator constants — categories and room/spot emoji options.

import { colors } from '@/theme';

export interface LocatorCategory {
  id: string;
  label: string;
  emoji: string;
  color: string;
  soft: string;
}

export const LOCATOR_CATEGORIES: LocatorCategory[] = [
  { id: 'docs', label: 'Documents', emoji: '📄', color: colors.rose, soft: colors.roseSoft },
  { id: 'elec', label: 'Electronics', emoji: '🔌', color: colors.sky, soft: colors.skySoft },
  { id: 'season', label: 'Seasonal', emoji: '🧥', color: '#8A6220', soft: colors.butterSoft },
  { id: 'tools', label: 'Tools', emoji: '🔧', color: colors.ink2, soft: colors.surface2 },
  { id: 'jewel', label: 'Jewelry', emoji: '💍', color: '#8A6220', soft: colors.butterSoft },
  { id: 'papers', label: 'Papers', emoji: '📑', color: colors.primary, soft: colors.primarySoft },
  { id: 'keys', label: 'Keys', emoji: '🔑', color: '#8A6220', soft: colors.butterSoft },
  { id: 'meds', label: 'Medicines', emoji: '💊', color: colors.rose, soft: colors.roseSoft },
  { id: 'craft', label: 'Craft', emoji: '🎨', color: colors.lilac, soft: colors.lilacSoft },
  { id: 'gift', label: 'Gifts', emoji: '🎁', color: colors.rose, soft: colors.roseSoft },
  { id: 'kids', label: 'Kids', emoji: '🧸', color: colors.mint, soft: colors.mintSoft },
  { id: 'other', label: 'Other', emoji: '📦', color: colors.ink3, soft: colors.surface2 },
];

export const LOCATOR_CAT_MAP: Record<string, LocatorCategory> = Object.fromEntries(
  LOCATOR_CATEGORIES.map((c) => [c.id, c])
);

export const ROOM_EMOJIS = ['🛏', '🍳', '🛋', '🛁', '📚', '📦', '🚗', '🧸', '🌿', '🏋', '🎮', '🎨'];
export const SPOT_EMOJIS = ['📦', '🗄', '🚪', '🛋', '🪑', '👕', '👞', '📔', '🧳', '🔑', '💊', '🛠'];

export function formatLastSeen(iso: string): string {
  const then = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - then.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

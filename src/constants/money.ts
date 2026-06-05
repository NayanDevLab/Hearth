// Money & Bills constants — categories, recurrence options, currency.

import { colors } from '@/theme';

export interface MoneyCategory {
  id: string;
  label: string;
  emoji: string;
  color: string;
  soft: string;
}

export const MONEY_CATEGORIES: MoneyCategory[] = [
  { id: 'rent', label: 'Housing', emoji: '🏠', color: colors.primaryInk, soft: colors.primarySoft },
  { id: 'util', label: 'Utilities', emoji: '⚡', color: '#8A6220', soft: colors.butterSoft },
  { id: 'net', label: 'Internet', emoji: '🌐', color: colors.sky, soft: colors.skySoft },
  { id: 'food', label: 'Groceries', emoji: '🛒', color: colors.mint, soft: colors.mintSoft },
  { id: 'dining', label: 'Dining', emoji: '🍽', color: '#8A6220', soft: colors.butterSoft },
  { id: 'travel', label: 'Transport', emoji: '🚗', color: colors.lilac, soft: colors.lilacSoft },
  { id: 'health', label: 'Healthcare', emoji: '💊', color: colors.rose, soft: colors.roseSoft },
  { id: 'fun', label: 'Fun', emoji: '🎬', color: colors.sky, soft: colors.skySoft },
  { id: 'repair', label: 'Repairs', emoji: '🛠', color: colors.ink2, soft: colors.surface2 },
  { id: 'other', label: 'Other', emoji: '💼', color: colors.ink2, soft: colors.surface2 },
];

export const MONEY_CAT_MAP: Record<string, MoneyCategory> = Object.fromEntries(
  MONEY_CATEGORIES.map((c) => [c.id, c])
);

export const RECURRENCE_OPTIONS = [
  { value: null, label: 'Once' },
  { value: 'weekly', label: 'Every week' },
  { value: 'monthly', label: 'Every month' },
  { value: 'yearly', label: 'Every year' },
] as const;

export const REMINDER_OPTIONS = [
  { value: null, label: 'None' },
  { value: '1day', label: '1 day before' },
  { value: '3days', label: '3 days before' },
  { value: '1week', label: '1 week before' },
] as const;

export const SPLIT_METHODS = [
  { id: 'equal', label: 'Equal' },
  { id: 'custom', label: 'Custom' },
] as const;

export const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'AED'] as const;
export const DEFAULT_CURRENCY = 'INR';

export function formatAmount(amount: number, currency = DEFAULT_CURRENCY): string {
  const symbols: Record<string, string> = { INR: '₹', USD: '$', EUR: '€', GBP: '£', AED: 'د.إ' };
  const sym = symbols[currency] ?? currency;
  return `${sym}${amount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export function dueDateLabel(due: string | null): string {
  if (!due) return 'No due date';
  const d = new Date(due);
  const today = new Date();
  const diff = Math.ceil((d.getTime() - today.getTime()) / 86400000);
  if (diff < 0) return `${Math.abs(diff)} days overdue`;
  if (diff === 0) return 'Due today';
  if (diff === 1) return 'Due tomorrow';
  if (diff <= 7) return `Due in ${diff} days`;
  return `Due ${d.toLocaleDateString([], { month: 'short', day: 'numeric' })}`;
}

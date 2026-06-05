// Maintenance & Repairs — status, priority, trade constants.

import { colors } from '@/theme';

export interface IssueStatusMeta {
  id: string;
  label: string;
  color: string;
  soft: string;
}

export const ISSUE_STATUSES: IssueStatusMeta[] = [
  { id: 'open', label: 'Open', color: colors.rose, soft: colors.roseSoft },
  { id: 'in_progress', label: 'In Progress', color: '#8A6220', soft: colors.butterSoft },
  { id: 'done', label: 'Done', color: colors.mint, soft: colors.mintSoft },
];

export const STATUS_MAP: Record<string, IssueStatusMeta> = Object.fromEntries(
  ISSUE_STATUSES.map((s) => [s.id, s])
);

export interface IssuePriorityMeta {
  id: string;
  label: string;
  color: string;
  soft: string;
}

export const ISSUE_PRIORITIES: IssuePriorityMeta[] = [
  { id: 'high', label: 'High', color: colors.rose, soft: colors.roseSoft },
  { id: 'medium', label: 'Medium', color: '#8A6220', soft: colors.butterSoft },
  { id: 'low', label: 'Low', color: colors.sky, soft: colors.skySoft },
];

export const PRIORITY_MAP: Record<string, IssuePriorityMeta> = Object.fromEntries(
  ISSUE_PRIORITIES.map((p) => [p.id, p])
);

export interface VendorTradeMeta {
  id: string;
  label: string;
  emoji: string;
}

export const VENDOR_TRADES: VendorTradeMeta[] = [
  { id: 'plumber', label: 'Plumber', emoji: '🔧' },
  { id: 'electrician', label: 'Electrician', emoji: '⚡' },
  { id: 'carpenter', label: 'Carpenter', emoji: '🪚' },
  { id: 'painter', label: 'Painter', emoji: '🎨' },
  { id: 'ac_tech', label: 'AC Technician', emoji: '❄️' },
  { id: 'appliance', label: 'Appliance Repair', emoji: '🔌' },
  { id: 'pest', label: 'Pest Control', emoji: '🪲' },
  { id: 'other', label: 'Other', emoji: '🛠' },
];

export const TRADE_MAP: Record<string, VendorTradeMeta> = Object.fromEntries(
  VENDOR_TRADES.map((t) => [t.id, t])
);

export function warrantyLabel(warrantyUntil: string | null): {
  text: string;
  status: 'active' | 'expired' | 'none';
} {
  if (!warrantyUntil) return { text: 'No warranty info', status: 'none' };
  const expiry = new Date(warrantyUntil);
  const today = new Date();
  if (expiry < today) return { text: 'Warranty expired', status: 'expired' };
  const months = Math.round((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30));
  if (months < 1) return { text: 'Warranty expires soon', status: 'active' };
  if (months < 12) return { text: `${months}mo warranty left`, status: 'active' };
  const years = Math.floor(months / 12);
  return { text: `${years}yr warranty left`, status: 'active' };
}

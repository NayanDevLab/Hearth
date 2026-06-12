// Pantry & Inventory — locations, units, and status helpers.

export interface PantryLocation {
  id: string;
  label: string;
  emoji: string;
  tint: string;
  bg: string;
}

export const PANTRY_LOCATIONS: PantryLocation[] = [
  { id: 'pantry', label: 'Pantry', emoji: '🥫', tint: '#A0522D', bg: '#FBF1EB' },
  { id: 'fridge', label: 'Fridge', emoji: '❄️', tint: '#2B8CB8', bg: '#EAF6FB' },
  { id: 'freezer', label: 'Freezer', emoji: '🧊', tint: '#3A7AC0', bg: '#EDF4FA' },
  { id: 'bathroom', label: 'Bathroom', emoji: '🛁', tint: '#6A50A0', bg: '#F0ECF8' },
  { id: 'cleaning', label: 'Cleaning', emoji: '🧴', tint: '#2F8A5E', bg: '#E8F7F0' },
  { id: 'garage', label: 'Garage', emoji: '🚗', tint: '#6B7533', bg: '#F3F5E0' },
];

export const LOCATION_MAP: Record<string, PantryLocation> = Object.fromEntries(
  PANTRY_LOCATIONS.map((l) => [l.id, l])
);

export const PANTRY_UNITS = [
  'ea',
  'kg',
  'g',
  'L',
  'ml',
  'lb',
  'oz',
  'pack',
  'bottle',
  'box',
  'bag',
  'cup',
  'roll',
];

export const PANTRY_EMOJIS = [
  '📦',
  '🥫',
  '🍞',
  '🥚',
  '🥛',
  '🧀',
  '🧈',
  '🍚',
  '🍝',
  '🌾',
  '🧂',
  '🍯',
  '🫙',
  '🥤',
  '☕',
  '🍵',
  '🧃',
  '🍫',
  '🍪',
  '🥩',
  '🍗',
  '🐟',
  '🥦',
  '🥕',
  '🧅',
  '🧄',
  '🍎',
  '🍌',
  '🧻',
  '🧼',
  '🧴',
  '🧽',
  '🪥',
  '🧯',
  '🔋',
  '💊',
];

export type ItemStatus = 'ok' | 'low' | 'out' | 'expiring' | 'expired';

export function getItemStatus(
  qty: number,
  lowThreshold: number,
  expiryDate: string | null,
  warnDays: number,
  today: string
): ItemStatus {
  if (qty <= 0) return 'out';
  if (expiryDate) {
    const expiry = expiryDate.slice(0, 10);
    if (expiry < today) return 'expired';
    const warnDate = new Date(today);
    warnDate.setDate(warnDate.getDate() + warnDays);
    const warnStr = warnDate.toISOString().slice(0, 10);
    if (expiry <= warnStr) return 'expiring';
  }
  if (lowThreshold > 0 && qty <= lowThreshold) return 'low';
  return 'ok';
}

export function expiryLabel(expiryDate: string, today: string): string {
  const expiry = expiryDate.slice(0, 10);
  const diffDays = Math.round((new Date(expiry).getTime() - new Date(today).getTime()) / 86400000);
  if (diffDays < 0) return `Expired ${Math.abs(diffDays)}d ago`;
  if (diffDays === 0) return 'Expires today';
  if (diffDays === 1) return 'Expires tomorrow';
  return `Expires in ${diffDays}d`;
}

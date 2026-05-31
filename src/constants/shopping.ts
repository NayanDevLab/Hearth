// Shopping constants — categories, units, list icons, keyword auto-detection.

// ─── Shared form types ───────────────────────────────────────
// Both new-item and edit-item forms use the same shape.
import { type ShoppingItem } from '@/db/modules/shopping';
import { colors } from '@/theme';

export interface ShoppingCategory {
  id: string;
  label: string;
  emoji: string;
  color: string;
  soft: string;
}

export const SHOPPING_CATEGORIES: ShoppingCategory[] = [
  { id: 'produce', label: 'Produce', emoji: '🥬', color: '#2F8A5E', soft: colors.mintSoft },
  { id: 'dairy', label: 'Dairy', emoji: '🥛', color: colors.sky, soft: colors.skySoft },
  { id: 'bakery', label: 'Bakery', emoji: '🥖', color: '#8A6220', soft: colors.butterSoft },
  { id: 'meat', label: 'Meat & Fish', emoji: '🐟', color: '#4AADD1', soft: '#D0EEF9' },
  { id: 'pantry', label: 'Pantry', emoji: '🥫', color: colors.primary, soft: colors.primarySoft },
  { id: 'frozen', label: 'Frozen', emoji: '❄️', color: '#4A90D9', soft: '#D6E9F8' },
  { id: 'household', label: 'Household', emoji: '🧹', color: '#6A50A0', soft: colors.lilacSoft },
  { id: 'other', label: 'Other', emoji: '🛒', color: colors.ink3, soft: colors.surface2 },
];

export const SHOPPING_CAT_MAP: Record<string, ShoppingCategory> = Object.fromEntries(
  SHOPPING_CATEGORIES.map((c) => [c.id, c])
);

// Auto-detect category from item name (English keyword matching)
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  produce: [
    'apple',
    'banana',
    'lemon',
    'lime',
    'orange',
    'mango',
    'grape',
    'berry',
    'strawberry',
    'blueberry',
    'raspberry',
    'peach',
    'pear',
    'plum',
    'cherry',
    'kiwi',
    'melon',
    'watermelon',
    'spinach',
    'kale',
    'lettuce',
    'arugula',
    'cabbage',
    'broccoli',
    'cauliflower',
    'carrot',
    'onion',
    'garlic',
    'ginger',
    'potato',
    'sweet potato',
    'tomato',
    'cucumber',
    'zucchini',
    'pepper',
    'avocado',
    'mushroom',
    'celery',
    'beet',
    'corn',
    'pea',
    'bean',
    'herb',
    'cilantro',
    'basil',
    'parsley',
    'mint',
    'thyme',
    'rosemary',
    'vegetable',
    'fruit',
  ],
  dairy: [
    'milk',
    'yogurt',
    'curd',
    'dahi',
    'cheese',
    'butter',
    'ghee',
    'cream',
    'paneer',
    'egg',
    'eggs',
    'whey',
    'kefir',
    'sour cream',
    'cottage cheese',
    'mozzarella',
    'cheddar',
  ],
  bakery: [
    'bread',
    'sourdough',
    'baguette',
    'croissant',
    'muffin',
    'bagel',
    'roll',
    'bun',
    'pita',
    'naan',
    'roti',
    'chapati',
    'tortilla',
    'wrap',
    'cake',
    'cookie',
    'biscuit',
    'cracker',
    'wafer',
    'donut',
    'pastry',
    'pie',
    'tart',
  ],
  meat: [
    'chicken',
    'beef',
    'pork',
    'lamb',
    'mutton',
    'turkey',
    'fish',
    'salmon',
    'tuna',
    'shrimp',
    'prawn',
    'crab',
    'lobster',
    'bacon',
    'sausage',
    'ham',
    'mince',
    'steak',
    'fillet',
    'wings',
    'thigh',
    'breast',
    'seafood',
    'meat',
  ],
  pantry: [
    'rice',
    'dal',
    'lentil',
    'pasta',
    'noodle',
    'flour',
    'atta',
    'maida',
    'sugar',
    'salt',
    'oil',
    'vinegar',
    'sauce',
    'ketchup',
    'mustard',
    'mayo',
    'mayonnaise',
    'pickle',
    'jam',
    'honey',
    'syrup',
    'soup',
    'can',
    'tin',
    'cereal',
    'oats',
    'quinoa',
    'beans',
    'chickpea',
    'chana',
    'masala',
    'spice',
    'cumin',
    'turmeric',
    'pepper',
    'chili',
    'soy sauce',
    'coffee',
    'tea',
    'cocoa',
    'chocolate',
    'nuts',
    'almonds',
    'cashews',
  ],
  frozen: ['frozen', 'ice cream', 'gelato', 'ice', 'pizza', 'burrito', 'dumpling', 'samosa'],
  household: [
    'soap',
    'shampoo',
    'conditioner',
    'toothpaste',
    'toothbrush',
    'detergent',
    'dish',
    'laundry',
    'bleach',
    'cleaner',
    'spray',
    'wipe',
    'tissue',
    'towel',
    'trash',
    'bag',
    'foil',
    'wrap',
    'sponge',
    'brush',
    'toilet',
    'paper',
    'napkin',
    'razor',
    'deodorant',
    'lotion',
    'sunscreen',
    'sanitizer',
  ],
};

export function detectCategory(name: string): string {
  const lower = name.toLowerCase();
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) return cat;
  }
  return 'other';
}

// Units
export const SHOPPING_UNITS = [
  'ea',
  'lb',
  'oz',
  'g',
  'kg',
  'ml',
  'L',
  'gal',
  'pack',
  'dozen',
] as const;
export type ShoppingUnit = (typeof SHOPPING_UNITS)[number];

// Default icons for new lists
export const LIST_ICON_OPTIONS = [
  { emoji: '🛒', color: '#2F8A5E', soft: colors.mintSoft },
  { emoji: '🏪', color: colors.primary, soft: colors.primarySoft },
  { emoji: '🔧', color: '#8A6220', soft: colors.butterSoft },
  { emoji: '💊', color: '#E55A48', soft: colors.roseSoft },
  { emoji: '🐾', color: '#6A50A0', soft: colors.lilacSoft },
  { emoji: '🎉', color: colors.sky, soft: colors.skySoft },
];

export interface ShoppingFormFields {
  name: string;
  quantity: number;
  unit: ShoppingUnit;
  category: string;
  assignee: string | null;
  brand: string;
  note: string;
  urgent: boolean;
}

export const INITIAL_SHOPPING_FORM: ShoppingFormFields = {
  name: '',
  quantity: 1,
  unit: 'ea',
  category: '',
  assignee: null,
  brand: '',
  note: '',
  urgent: false,
};

/** Convert a DB row into form fields for the edit screen. */
export function itemToForm(item: ShoppingItem): ShoppingFormFields {
  return {
    name: item.name,
    quantity: item.quantity,
    unit: (item.unit ?? 'ea') as ShoppingUnit,
    category: item.category ?? '',
    assignee: item.assignee ?? null,
    brand: item.brand ?? '',
    note: item.note ?? '',
    urgent: item.urgent,
  };
}

// Parse "2 lemons" → { qty: 2, name: "lemons" }
export function parseQuickAdd(raw: string): { name: string; quantity: number; unit: ShoppingUnit } {
  const trimmed = raw.trim();
  const match = trimmed.match(/^(\d+(?:\.\d+)?)\s+(.+)$/);
  if (match) {
    const qty = parseFloat(match[1]);
    return { name: match[2].trim(), quantity: isNaN(qty) ? 1 : qty, unit: 'ea' };
  }
  return { name: trimmed, quantity: 1, unit: 'ea' };
}

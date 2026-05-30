// Pantry module — stub. Implemented fully in Phase 9.

import { getDb } from '../index';

export interface PantryItem {
  id: string;
  name: string;
  quantity: number;
  unit?: string;
  category?: string;
  expiry_date?: string;
  low_threshold?: number;
}

export async function getAllPantryItems(): Promise<PantryItem[]> {
  return getDb().getAllAsync<PantryItem>('SELECT * FROM pantry_items ORDER BY name ASC;');
}

// Shopping module — CRUD operations. Implemented fully in Phase 5.

import { getDb } from '../index';

export interface ShoppingList {
  id: string;
  name: string;
  store?: string;
  created_at: string;
}

export interface ShoppingItem {
  id: string;
  list_id: string;
  name: string;
  quantity: number;
  unit?: string;
  category?: string;
  done: boolean;
  price?: number;
}

export async function getAllLists(): Promise<ShoppingList[]> {
  return getDb().getAllAsync<ShoppingList>(
    'SELECT * FROM shopping_lists ORDER BY created_at DESC;'
  );
}

export async function getItemsForList(listId: string): Promise<ShoppingItem[]> {
  return getDb().getAllAsync<ShoppingItem>(
    'SELECT * FROM shopping_items WHERE list_id = ? ORDER BY created_at ASC;',
    [listId]
  );
}

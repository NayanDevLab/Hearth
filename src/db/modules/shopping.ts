// Shopping DB module — full CRUD for lists and items.

import { getDb } from '../index';

export interface ShoppingList {
  id: string;
  name: string;
  store?: string;
  emoji?: string;
  icon_color?: string;
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
  brand?: string;
  note?: string;
  assignee?: string;
  urgent: boolean;
  created_at: string;
}

export interface ListStats {
  total: number;
  done: number;
}

// ─── Lists ────────────────────────────────────────────────────

export async function getAllLists(): Promise<ShoppingList[]> {
  return getDb().getAllAsync<ShoppingList>(
    'SELECT * FROM shopping_lists ORDER BY created_at DESC;'
  );
}

export async function getListById(id: string): Promise<ShoppingList | null> {
  const row = await getDb().getFirstAsync<ShoppingList>(
    'SELECT * FROM shopping_lists WHERE id = ?;',
    [id]
  );
  return row ?? null;
}

export async function getListStats(listId: string): Promise<ListStats> {
  const row = await getDb().getFirstAsync<{ total: number; done: number }>(
    'SELECT COUNT(*) as total, SUM(done) as done FROM shopping_items WHERE list_id = ?;',
    [listId]
  );
  return { total: row?.total ?? 0, done: row?.done ?? 0 };
}

export async function insertList(list: Omit<ShoppingList, 'created_at'>): Promise<void> {
  await getDb().runAsync(
    'INSERT INTO shopping_lists (id, name, store, emoji, icon_color) VALUES (?, ?, ?, ?, ?);',
    [list.id, list.name, list.store ?? null, list.emoji ?? null, list.icon_color ?? null]
  );
}

export async function updateList(
  id: string,
  fields: Partial<Pick<ShoppingList, 'name' | 'store' | 'emoji' | 'icon_color'>>
): Promise<void> {
  const keys = Object.keys(fields) as (keyof typeof fields)[];
  if (keys.length === 0) return;
  const set = keys.map((k) => `${k} = ?`).join(', ');
  const vals = keys.map((k) => fields[k] ?? null);
  await getDb().runAsync(`UPDATE shopping_lists SET ${set} WHERE id = ?;`, [...vals, id]);
}

export async function deleteList(id: string): Promise<void> {
  await getDb().runAsync('DELETE FROM shopping_lists WHERE id = ?;', [id]);
}

// ─── Items ────────────────────────────────────────────────────

function castItem(row: ShoppingItem): ShoppingItem {
  return { ...row, done: Boolean(row.done), urgent: Boolean(row.urgent) };
}

export async function getItemsForList(listId: string): Promise<ShoppingItem[]> {
  const rows = await getDb().getAllAsync<ShoppingItem>(
    `SELECT * FROM shopping_items WHERE list_id = ?
     ORDER BY urgent DESC, done ASC, category ASC, created_at ASC;`,
    [listId]
  );
  return rows.map(castItem);
}

export async function getItemById(id: string): Promise<ShoppingItem | null> {
  const row = await getDb().getFirstAsync<ShoppingItem>(
    'SELECT * FROM shopping_items WHERE id = ?;',
    [id]
  );
  return row ? castItem(row) : null;
}

export interface CreateItemInput {
  id: string;
  list_id: string;
  name: string;
  quantity?: number;
  unit?: string;
  category?: string;
  brand?: string;
  note?: string;
  assignee?: string;
  urgent?: boolean;
  price?: number;
}

export async function insertItem(item: CreateItemInput): Promise<void> {
  await getDb().runAsync(
    `INSERT INTO shopping_items
       (id, list_id, name, quantity, unit, category, brand, note, assignee, urgent, price, done)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0);`,
    [
      item.id,
      item.list_id,
      item.name,
      item.quantity ?? 1,
      item.unit ?? 'ea',
      item.category ?? 'other',
      item.brand ?? null,
      item.note ?? null,
      item.assignee ?? null,
      item.urgent ? 1 : 0,
      item.price ?? null,
    ]
  );
}

export async function updateItem(
  id: string,
  fields: Partial<Omit<ShoppingItem, 'id' | 'list_id' | 'created_at'>>
): Promise<void> {
  const keys = Object.keys(fields) as (keyof typeof fields)[];
  if (keys.length === 0) return;
  const set = keys.map((k) => `${k} = ?`).join(', ');
  const vals = keys.map((k) => {
    const v = fields[k];
    if (typeof v === 'boolean') return v ? 1 : 0;
    return v ?? null;
  });
  await getDb().runAsync(`UPDATE shopping_items SET ${set} WHERE id = ?;`, [...vals, id]);
}

export async function toggleItem(id: string, done: boolean): Promise<void> {
  await getDb().runAsync('UPDATE shopping_items SET done = ? WHERE id = ?;', [done ? 1 : 0, id]);
}

export async function deleteItem(id: string): Promise<void> {
  await getDb().runAsync('DELETE FROM shopping_items WHERE id = ?;', [id]);
}

export async function clearDoneItems(listId: string): Promise<void> {
  await getDb().runAsync('DELETE FROM shopping_items WHERE list_id = ? AND done = 1;', [listId]);
}

// Group items by category (preserves urgent-first order from SQL)
export function groupItemsByCategory(
  items: ShoppingItem[]
): { category: string; data: ShoppingItem[] }[] {
  const map = new Map<string, ShoppingItem[]>();
  for (const item of items) {
    const cat = item.category ?? 'other';
    if (!map.has(cat)) map.set(cat, []);
    map.get(cat)!.push(item);
  }
  return Array.from(map.entries()).map(([category, data]) => ({ category, data }));
}

// Pantry & Inventory DB module — Phase 9.

import { getDb } from '../index';

export interface PantryItem {
  id: string;
  name: string;
  brand: string | null;
  emoji: string;
  location_id: string;
  qty: number;
  unit: string;
  low_threshold: number;
  expiry_date: string | null;
  warn_days: number;
  auto_add: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface LocationStat {
  location_id: string;
  count: number;
  low_count: number;
}

export type PantryFilter = 'all' | 'low' | 'expiring';

export async function getAllItems(
  locationId?: string,
  filter: PantryFilter = 'all'
): Promise<PantryItem[]> {
  const today = new Date().toISOString().slice(0, 10);
  let sql = 'SELECT * FROM pantry_items';
  const conds: string[] = [];
  const params: string[] = [];
  if (locationId) {
    conds.push('location_id = ?');
    params.push(locationId);
  }
  if (filter === 'low') conds.push('qty > 0 AND low_threshold > 0 AND qty <= low_threshold');
  if (filter === 'expiring') {
    conds.push('expiry_date IS NOT NULL AND expiry_date >= ?');
    params.push(today);
  }
  if (conds.length) sql += ` WHERE ${conds.join(' AND ')}`;
  sql += ' ORDER BY name ASC;';
  return getDb().getAllAsync<PantryItem>(sql, params);
}

export async function getItemById(id: string): Promise<PantryItem | null> {
  return getDb().getFirstAsync<PantryItem>('SELECT * FROM pantry_items WHERE id = ?;', [id]);
}

export interface InsertPantryItem {
  name: string;
  brand?: string;
  emoji?: string;
  location_id: string;
  qty: number;
  unit: string;
  low_threshold?: number;
  expiry_date?: string;
  warn_days?: number;
  auto_add?: number;
  notes?: string;
}

export async function insertItem(data: InsertPantryItem): Promise<string> {
  const id = `pi_${Date.now()}`;
  await getDb().runAsync(
    `INSERT INTO pantry_items
       (id, name, brand, emoji, location_id, qty, unit, low_threshold,
        expiry_date, warn_days, auto_add, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      id,
      data.name,
      data.brand ?? null,
      data.emoji ?? '📦',
      data.location_id,
      data.qty,
      data.unit,
      data.low_threshold ?? 0,
      data.expiry_date ?? null,
      data.warn_days ?? 3,
      data.auto_add ?? 0,
      data.notes ?? null,
    ]
  );
  return id;
}

export async function updateItem(
  id: string,
  data: Partial<Omit<PantryItem, 'id' | 'created_at' | 'updated_at'>>
): Promise<void> {
  const keys = Object.keys(data) as (keyof typeof data)[];
  if (!keys.length) return;
  const sets = keys.map((k) => `${k} = ?`).join(', ');
  const vals = keys.map((k) => data[k] ?? null);
  await getDb().runAsync(
    `UPDATE pantry_items SET ${sets}, updated_at = datetime('now') WHERE id = ?;`,
    [...vals, id]
  );
}

export async function updateQty(id: string, qty: number): Promise<void> {
  await getDb().runAsync(
    `UPDATE pantry_items SET qty = ?, updated_at = datetime('now') WHERE id = ?;`,
    [qty, id]
  );
}

export async function deleteItem(id: string): Promise<void> {
  await getDb().runAsync('DELETE FROM pantry_items WHERE id = ?;', [id]);
}

export async function getLocationStats(): Promise<LocationStat[]> {
  return getDb().getAllAsync<LocationStat>(`
    SELECT
      location_id,
      COUNT(*) AS count,
      SUM(CASE WHEN low_threshold > 0 AND qty <= low_threshold AND qty > 0 THEN 1 ELSE 0 END) AS low_count
    FROM pantry_items
    GROUP BY location_id;
  `);
}

export async function getExpiringItems(days = 7): Promise<PantryItem[]> {
  const today = new Date().toISOString().slice(0, 10);
  const limit = new Date(Date.now() + days * 86400000).toISOString().slice(0, 10);
  return getDb().getAllAsync<PantryItem>(
    `SELECT * FROM pantry_items
     WHERE expiry_date IS NOT NULL AND expiry_date >= ? AND expiry_date <= ?
     ORDER BY expiry_date ASC;`,
    [today, limit]
  );
}

export async function getLowItems(): Promise<PantryItem[]> {
  return getDb().getAllAsync<PantryItem>(
    `SELECT * FROM pantry_items
     WHERE low_threshold > 0 AND qty <= low_threshold
     ORDER BY qty ASC;`
  );
}

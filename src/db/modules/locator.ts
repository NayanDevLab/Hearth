// Locator DB module — CRUD for rooms, storage spots, and located items.

import { getDb } from '../index';

export interface Room {
  id: string;
  name: string;
  emoji: string;
  sort_order: number;
}
export interface StorageSpot {
  id: string;
  room_id: string;
  name: string;
  emoji: string;
  sort_order: number;
}
export interface LocatedItem {
  id: string;
  spot_id: string | null;
  name: string;
  category: string | null;
  emoji: string;
  notes: string | null;
  visibility: 'household' | 'just_me';
  created_by: string | null;
  last_seen: string;
  created_at: string;
}
export interface LocatedItemWithPath extends LocatedItem {
  room_name: string | null;
  room_emoji: string | null;
  spot_name: string | null;
}

// ─── Rooms ────────────────────────────────────────────────────

export async function getAllRooms(): Promise<Room[]> {
  return getDb().getAllAsync<Room>('SELECT * FROM rooms ORDER BY sort_order ASC, name ASC;');
}
export async function getRoomById(id: string): Promise<Room | null> {
  return getDb().getFirstAsync<Room>('SELECT * FROM rooms WHERE id = ?;', [id]);
}
export async function getRoomStats(id: string): Promise<{ spots: number; items: number }> {
  const row = await getDb().getFirstAsync<{ spots: number; items: number }>(
    `
    SELECT
      (SELECT COUNT(*) FROM storage_spots WHERE room_id = ?) as spots,
      (SELECT COUNT(*) FROM located_items li JOIN storage_spots ss ON ss.id = li.spot_id WHERE ss.room_id = ?) as items;
  `,
    [id, id]
  );
  return { spots: row?.spots ?? 0, items: row?.items ?? 0 };
}
export async function insertRoom(input: {
  id: string;
  name: string;
  emoji: string;
}): Promise<void> {
  const count = await getDb().getFirstAsync<{ n: number }>('SELECT COUNT(*) as n FROM rooms;');
  await getDb().runAsync(`INSERT INTO rooms (id, name, emoji, sort_order) VALUES (?,?,?,?);`, [
    input.id,
    input.name,
    input.emoji,
    count?.n ?? 0,
  ]);
}
export async function updateRoom(
  id: string,
  fields: Partial<Pick<Room, 'name' | 'emoji'>>
): Promise<void> {
  const keys = Object.keys(fields) as (keyof typeof fields)[];
  if (!keys.length) return;
  await getDb().runAsync(
    `UPDATE rooms SET ${keys.map((k) => `${k} = ?`).join(', ')} WHERE id = ?;`,
    [...keys.map((k) => fields[k] ?? null), id]
  );
}
export async function deleteRoom(id: string): Promise<void> {
  await getDb().runAsync('DELETE FROM rooms WHERE id = ?;', [id]);
}

// ─── Storage Spots ────────────────────────────────────────────

export async function getSpotsForRoom(roomId: string): Promise<StorageSpot[]> {
  return getDb().getAllAsync<StorageSpot>(
    'SELECT * FROM storage_spots WHERE room_id = ? ORDER BY sort_order ASC, name ASC;',
    [roomId]
  );
}
export async function getSpotById(id: string): Promise<StorageSpot | null> {
  return getDb().getFirstAsync<StorageSpot>('SELECT * FROM storage_spots WHERE id = ?;', [id]);
}
export async function getSpotItemCount(id: string): Promise<number> {
  const row = await getDb().getFirstAsync<{ n: number }>(
    'SELECT COUNT(*) as n FROM located_items WHERE spot_id = ?;',
    [id]
  );
  return row?.n ?? 0;
}
export async function insertSpot(input: {
  id: string;
  room_id: string;
  name: string;
  emoji: string;
}): Promise<void> {
  const count = await getDb().getFirstAsync<{ n: number }>(
    'SELECT COUNT(*) as n FROM storage_spots WHERE room_id = ?;',
    [input.room_id]
  );
  await getDb().runAsync(
    `INSERT INTO storage_spots (id, room_id, name, emoji, sort_order) VALUES (?,?,?,?,?);`,
    [input.id, input.room_id, input.name, input.emoji, count?.n ?? 0]
  );
}
export async function updateSpot(
  id: string,
  fields: Partial<Pick<StorageSpot, 'name' | 'emoji'>>
): Promise<void> {
  const keys = Object.keys(fields) as (keyof typeof fields)[];
  if (!keys.length) return;
  await getDb().runAsync(
    `UPDATE storage_spots SET ${keys.map((k) => `${k} = ?`).join(', ')} WHERE id = ?;`,
    [...keys.map((k) => fields[k] ?? null), id]
  );
}
export async function deleteSpot(id: string): Promise<void> {
  await getDb().runAsync('DELETE FROM storage_spots WHERE id = ?;', [id]);
}

// ─── Located Items ────────────────────────────────────────────

const WITH_PATH = `
  SELECT li.*, r.name as room_name, r.emoji as room_emoji, ss.name as spot_name
  FROM located_items li
  LEFT JOIN storage_spots ss ON ss.id = li.spot_id
  LEFT JOIN rooms r ON r.id = ss.room_id`;

export async function getItemsForSpot(spotId: string): Promise<LocatedItem[]> {
  return getDb().getAllAsync<LocatedItem>(
    'SELECT * FROM located_items WHERE spot_id = ? ORDER BY last_seen DESC;',
    [spotId]
  );
}
export async function getItemById(id: string): Promise<LocatedItemWithPath | null> {
  return getDb().getFirstAsync<LocatedItemWithPath>(`${WITH_PATH} WHERE li.id = ?;`, [id]);
}
export async function getRecentItems(limit = 10): Promise<LocatedItemWithPath[]> {
  return getDb().getAllAsync<LocatedItemWithPath>(
    `${WITH_PATH} ORDER BY li.last_seen DESC LIMIT ?;`,
    [limit]
  );
}
export async function searchItems(query: string): Promise<LocatedItemWithPath[]> {
  return getDb().getAllAsync<LocatedItemWithPath>(
    `${WITH_PATH} WHERE li.name LIKE ? OR li.notes LIKE ? ORDER BY li.last_seen DESC LIMIT 30;`,
    [`%${query}%`, `%${query}%`]
  );
}
export async function getLocatorStats(): Promise<{ rooms: number; spots: number; items: number }> {
  const row = await getDb().getFirstAsync<{ rooms: number; spots: number; items: number }>(`
    SELECT (SELECT COUNT(*) FROM rooms) as rooms,
           (SELECT COUNT(*) FROM storage_spots) as spots,
           (SELECT COUNT(*) FROM located_items) as items;`);
  return { rooms: row?.rooms ?? 0, spots: row?.spots ?? 0, items: row?.items ?? 0 };
}

export interface CreateItemInput {
  id: string;
  spot_id?: string;
  name: string;
  category?: string;
  emoji?: string;
  notes?: string;
  visibility?: 'household' | 'just_me';
  created_by?: string;
}
export async function insertLocatedItem(input: CreateItemInput): Promise<void> {
  await getDb().runAsync(
    `INSERT INTO located_items (id, spot_id, name, category, emoji, notes, visibility, created_by, last_seen)
     VALUES (?,?,?,?,?,?,?,?,datetime('now'));`,
    [
      input.id,
      input.spot_id ?? null,
      input.name,
      input.category ?? null,
      input.emoji ?? '📦',
      input.notes ?? null,
      input.visibility ?? 'household',
      input.created_by ?? null,
    ]
  );
}
export async function updateLocatedItem(
  id: string,
  fields: Partial<Omit<LocatedItem, 'id' | 'created_at'>>
): Promise<void> {
  const keys = Object.keys(fields) as (keyof typeof fields)[];
  if (!keys.length) return;
  const set = keys.map((k) => `${k} = ?`).join(', ');
  await getDb().runAsync(
    `UPDATE located_items SET ${set}, last_seen = datetime('now') WHERE id = ?;`,
    [...keys.map((k) => fields[k] ?? null), id]
  );
}
export async function deleteLocatedItem(id: string): Promise<void> {
  await getDb().runAsync('DELETE FROM located_items WHERE id = ?;', [id]);
}
export async function confirmItemLocation(id: string): Promise<void> {
  await getDb().runAsync(`UPDATE located_items SET last_seen = datetime('now') WHERE id = ?;`, [
    id,
  ]);
}

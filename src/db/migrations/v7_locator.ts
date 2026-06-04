// v7 — adds rooms, storage_spots, located_items tables with seed rooms.

import type { SQLiteDatabase } from 'expo-sqlite';

export async function migrateV7(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS rooms (
      id         TEXT PRIMARY KEY,
      name       TEXT NOT NULL,
      emoji      TEXT NOT NULL DEFAULT '🏠',
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS storage_spots (
      id         TEXT PRIMARY KEY,
      room_id    TEXT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
      name       TEXT NOT NULL,
      emoji      TEXT NOT NULL DEFAULT '📦',
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS located_items (
      id          TEXT PRIMARY KEY,
      spot_id     TEXT REFERENCES storage_spots(id) ON DELETE SET NULL,
      name        TEXT NOT NULL,
      category    TEXT,
      emoji       TEXT NOT NULL DEFAULT '📦',
      notes       TEXT,
      visibility  TEXT NOT NULL DEFAULT 'household',
      created_by  TEXT,
      last_seen   TEXT NOT NULL DEFAULT (datetime('now')),
      created_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // Seed default rooms
  const seedRooms = [
    { id: 'room_bedroom', name: 'Bedroom', emoji: '🛏', sort: 0 },
    { id: 'room_kitchen', name: 'Kitchen', emoji: '🍳', sort: 1 },
    { id: 'room_living', name: 'Living room', emoji: '🛋', sort: 2 },
    { id: 'room_bathroom', name: 'Bathroom', emoji: '🛁', sort: 3 },
    { id: 'room_study', name: 'Study', emoji: '📚', sort: 4 },
    { id: 'room_storage', name: 'Storage room', emoji: '📦', sort: 5 },
  ];

  for (const r of seedRooms) {
    await db.runAsync(
      `INSERT OR IGNORE INTO rooms (id, name, emoji, sort_order) VALUES (?,?,?,?);`,
      [r.id, r.name, r.emoji, r.sort]
    );
  }
}

// v10 — upgrades pantry_items to the full Pantry & Inventory schema.
// Recreates the table (rather than ALTER TABLE) so it works whether the
// existing table has the old v9 columns (id, name, quantity, unit, category,
// expiry_date, low_threshold, created_at) or already matches the new schema
// (fresh installs where v1 created it directly from SQL_TABLES).

import type { SQLiteDatabase } from 'expo-sqlite';

export async function migrateV10(db: SQLiteDatabase): Promise<void> {
  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS pantry_items_v10 (
      id            TEXT PRIMARY KEY,
      name          TEXT NOT NULL,
      brand         TEXT,
      emoji         TEXT NOT NULL DEFAULT '📦',
      location_id   TEXT NOT NULL DEFAULT 'pantry',
      qty           REAL NOT NULL DEFAULT 1,
      unit          TEXT NOT NULL DEFAULT 'ea',
      low_threshold REAL NOT NULL DEFAULT 0,
      expiry_date   TEXT,
      warn_days     INTEGER NOT NULL DEFAULT 3,
      auto_add      INTEGER NOT NULL DEFAULT 0,
      notes         TEXT,
      created_at    TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  // Old v9 schema had 'quantity' instead of 'qty' and no location/emoji/etc.
  try {
    await db.runAsync(`
      INSERT OR IGNORE INTO pantry_items_v10
        (id, name, qty, unit, low_threshold, expiry_date, created_at)
      SELECT id, name, quantity,
        COALESCE(unit, 'ea'),
        COALESCE(low_threshold, 0),
        expiry_date,
        COALESCE(created_at, datetime('now'))
      FROM pantry_items
    `);
  } catch {
    // Table already matches the new schema (fresh install) — copy directly
    try {
      await db.runAsync(`INSERT OR IGNORE INTO pantry_items_v10 SELECT * FROM pantry_items`);
    } catch {
      // pantry_items doesn't exist or has an unexpected schema — nothing to copy
    }
  }

  await db.runAsync(`DROP TABLE IF EXISTS pantry_items`);
  await db.runAsync(`ALTER TABLE pantry_items_v10 RENAME TO pantry_items`);
}

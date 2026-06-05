// v8 — extends bills with type/paid_by/notes/reminder + adds bill_splits table.

import type { SQLiteDatabase } from 'expo-sqlite';

export async function migrateV8(db: SQLiteDatabase): Promise<void> {
  // Extend the bills table with new columns (safe — ADD COLUMN is backwards-compatible)
  await db.execAsync(`
    ALTER TABLE bills ADD COLUMN type      TEXT NOT NULL DEFAULT 'bill';
    ALTER TABLE bills ADD COLUMN paid_by   TEXT;
    ALTER TABLE bills ADD COLUMN notes     TEXT;
    ALTER TABLE bills ADD COLUMN reminder  TEXT;
  `);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS bill_splits (
      id             TEXT PRIMARY KEY,
      bill_id        TEXT NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
      member_initial TEXT NOT NULL,
      amount         REAL NOT NULL,
      settled        INTEGER NOT NULL DEFAULT 0
    );
  `);
}

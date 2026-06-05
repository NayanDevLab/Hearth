// v9 — adds vendors, maintenance_issues, and appliances tables.

import type { SQLiteDatabase } from 'expo-sqlite';

export async function migrateV9(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS vendors (
      id        TEXT PRIMARY KEY,
      name      TEXT NOT NULL,
      trade     TEXT,
      phone     TEXT,
      rating    INTEGER,
      last_used TEXT,
      notes     TEXT
    );

    CREATE TABLE IF NOT EXISTS maintenance_issues (
      id          TEXT PRIMARY KEY,
      title       TEXT NOT NULL,
      status      TEXT NOT NULL DEFAULT 'open',
      priority    TEXT DEFAULT 'medium',
      photo_uri   TEXT,
      notes       TEXT,
      vendor_id   TEXT REFERENCES vendors(id) ON DELETE SET NULL,
      cost        REAL,
      resolved_at TEXT,
      created_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS appliances (
      id             TEXT PRIMARY KEY,
      name           TEXT NOT NULL,
      brand          TEXT,
      purchase_date  TEXT,
      price          REAL,
      warranty_until TEXT,
      serial_no      TEXT,
      notes          TEXT,
      created_at     TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}

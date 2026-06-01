// Migration v4 — events + event_attendees tables for the Calendar feature.

import { type SQLiteDatabase } from 'expo-sqlite';

export async function migrateV4(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS events (
      id             TEXT PRIMARY KEY,
      title          TEXT NOT NULL,
      category       TEXT,
      date           TEXT NOT NULL,          -- "2026-03-17" (local date)
      start_time     TEXT,                   -- "10:30" or null for all-day
      end_time       TEXT,                   -- "11:15" or null for all-day
      all_day        INTEGER NOT NULL DEFAULT 0,
      location       TEXT,
      notes          TEXT,
      visibility     TEXT NOT NULL DEFAULT 'household',
      recurrence     TEXT,                   -- 'daily' | 'weekly' | 'monthly' | 'yearly' | null
      recurrence_id  TEXT,
      reminder       TEXT,                   -- '15min' | '1hour' | '1day' | null
      created_by     TEXT,
      created_at     TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS event_attendees (
      id              TEXT PRIMARY KEY,
      event_id        TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
      member_initial  TEXT NOT NULL,
      status          TEXT NOT NULL DEFAULT 'going'
    );
  `);
}

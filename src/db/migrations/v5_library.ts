// Migration v5 — household_members table for the Settings > Library > Members feature.

import { type SQLiteDatabase } from 'expo-sqlite';

// Default members matching the hardcoded HOUSEHOLD_MEMBERS constant used across the app.
const DEFAULT_MEMBERS = [
  { id: 'member_A', name: 'Aarav', nickname: null, role: 'adult', color: '#C96B50', initial: 'A' },
  { id: 'member_M', name: 'Maya', nickname: null, role: 'adult', color: '#4AADD1', initial: 'M' },
  { id: 'member_L', name: 'Leo', nickname: null, role: 'teen', color: '#EFC84E', initial: 'L' },
  { id: 'member_R', name: 'Riya', nickname: null, role: 'kid', color: '#9A7ECF', initial: 'R' },
  { id: 'member_S', name: 'Sara', nickname: null, role: 'admin', color: '#E55A48', initial: 'S' },
];

export async function migrateV5(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS household_members (
      id              TEXT PRIMARY KEY,
      name            TEXT NOT NULL,
      nickname        TEXT,
      role            TEXT NOT NULL DEFAULT 'adult',
      color           TEXT NOT NULL DEFAULT '#C96B50',
      initial         TEXT NOT NULL,
      show_in_tasks   INTEGER NOT NULL DEFAULT 1,
      show_in_bills   INTEGER NOT NULL DEFAULT 1,
      show_in_calendar INTEGER NOT NULL DEFAULT 1,
      show_in_meals   INTEGER NOT NULL DEFAULT 1,
      sort_order      INTEGER NOT NULL DEFAULT 0,
      created_at      TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // Seed default members only if table is empty
  const count = await db.getFirstAsync<{ n: number }>(
    'SELECT COUNT(*) as n FROM household_members;'
  );
  if ((count?.n ?? 0) === 0) {
    for (let i = 0; i < DEFAULT_MEMBERS.length; i++) {
      const m = DEFAULT_MEMBERS[i];
      await db.runAsync(
        `INSERT INTO household_members (id, name, nickname, role, color, initial, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?);`,
        [m.id, m.name, m.nickname, m.role, m.color, m.initial, i]
      );
    }
  }
}

// Migration v2 — enhance tasks table: category, priority, notes, reminder,
// recurrence_id. Also adds task_completions table for history.

import { type SQLiteDatabase } from 'expo-sqlite';

export async function migrateV2(db: SQLiteDatabase): Promise<void> {
  // Add new columns to existing tasks table (ALTER TABLE is safe — idempotent via IF NOT EXISTS workaround)
  const alterStatements = [
    'ALTER TABLE tasks ADD COLUMN recurrence_id TEXT;',
    'ALTER TABLE tasks ADD COLUMN category TEXT;',
    "ALTER TABLE tasks ADD COLUMN priority TEXT NOT NULL DEFAULT 'normal';",
    'ALTER TABLE tasks ADD COLUMN notes TEXT;',
    'ALTER TABLE tasks ADD COLUMN reminder TEXT;',
  ];

  for (const sql of alterStatements) {
    try {
      await db.execAsync(sql);
    } catch {
      // Column already exists — safe to ignore on re-run
    }
  }

  // Create new table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS task_completions (
      id           TEXT PRIMARY KEY,
      task_id      TEXT NOT NULL,
      completed_by TEXT,
      completed_at TEXT NOT NULL DEFAULT (datetime('now')),
      on_time      INTEGER NOT NULL DEFAULT 1
    );
  `);
}

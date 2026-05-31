// Migration v3 — add emoji/color to shopping_lists; add brand, note, assignee, urgent to shopping_items.

import { type SQLiteDatabase } from 'expo-sqlite';

export async function migrateV3(db: SQLiteDatabase): Promise<void> {
  const alterStatements = [
    // shopping_lists
    'ALTER TABLE shopping_lists ADD COLUMN emoji TEXT;',
    'ALTER TABLE shopping_lists ADD COLUMN icon_color TEXT;',
    // shopping_items
    'ALTER TABLE shopping_items ADD COLUMN brand TEXT;',
    'ALTER TABLE shopping_items ADD COLUMN note TEXT;',
    'ALTER TABLE shopping_items ADD COLUMN assignee TEXT;',
    'ALTER TABLE shopping_items ADD COLUMN urgent INTEGER NOT NULL DEFAULT 0;',
  ];

  for (const sql of alterStatements) {
    try {
      await db.execAsync(sql);
    } catch {
      // Column already exists — safe to ignore
    }
  }
}

// Migration v1 — initial schema. Creates all tables from SQL_TABLES.

import { type SQLiteDatabase } from 'expo-sqlite';

import { SQL_TABLES } from '../schema';

export async function migrateV1(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(Object.values(SQL_TABLES).join('\n'));
}

// Database — opens the SQLite connection and runs pending migrations.
// Call initDb() once at app startup (in root _layout.tsx).

import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';

import { migrateV1 } from './migrations/v1_init';
import { DB_VERSION } from './schema';

const DB_NAME = 'hearth.db';

let _db: SQLiteDatabase | null = null;

export async function initDb(): Promise<SQLiteDatabase> {
  if (_db) return _db;

  const db = await openDatabaseAsync(DB_NAME);

  // Enable WAL mode for better concurrent read performance
  await db.execAsync('PRAGMA journal_mode = WAL;');

  // Run migrations based on user_version pragma
  const result = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version;');
  const currentVersion = result?.user_version ?? 0;

  if (currentVersion < 1) {
    await migrateV1(db);
    await db.execAsync(`PRAGMA user_version = ${DB_VERSION};`);
  }

  _db = db;
  return db;
}

export function getDb(): SQLiteDatabase {
  if (!_db) throw new Error('DB not initialized — call initDb() first');
  return _db;
}

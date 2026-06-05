// Database — opens the SQLite connection and runs pending migrations.
// Call initDb() once at app startup (in root _layout.tsx).

import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';

import { migrateV1 } from './migrations/v1_init';
import { migrateV2 } from './migrations/v2_tasks_enhanced';
import { migrateV3 } from './migrations/v3_shopping_enhanced';
import { migrateV4 } from './migrations/v4_calendar';
import { migrateV5 } from './migrations/v5_library';
import { migrateV6 } from './migrations/v6_categories_units';
import { migrateV7 } from './migrations/v7_locator';
import { migrateV8 } from './migrations/v8_money';
import { migrateV9 } from './migrations/v9_maintenance';
import { DB_VERSION } from './schema';

const DB_NAME = 'hearth.db';

let _db: SQLiteDatabase | null = null;

export async function initDb(): Promise<SQLiteDatabase> {
  if (_db) return _db;

  const db = await openDatabaseAsync(DB_NAME);

  await db.execAsync('PRAGMA journal_mode = WAL;');

  const result = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version;');
  const currentVersion = result?.user_version ?? 0;

  if (currentVersion < 1) {
    await migrateV1(db);
  }
  if (currentVersion < 2) {
    await migrateV2(db);
  }
  if (currentVersion < 3) {
    await migrateV3(db);
  }
  if (currentVersion < 4) {
    await migrateV4(db);
  }
  if (currentVersion < 5) {
    await migrateV5(db);
  }
  if (currentVersion < 6) {
    await migrateV6(db);
  }
  if (currentVersion < 7) {
    await migrateV7(db);
  }
  if (currentVersion < 8) {
    await migrateV8(db);
  }
  if (currentVersion < 9) {
    await migrateV9(db);
  }

  if (currentVersion < DB_VERSION) {
    await db.execAsync(`PRAGMA user_version = ${DB_VERSION};`);
  }

  _db = db;
  return db;
}

export function getDb(): SQLiteDatabase {
  if (!_db) throw new Error('DB not initialized — call initDb() first');
  return _db;
}

// v11 — Meal Planner. Creates dishes, dish_ingredients, and meal_plan tables
// and drops the unused v1 `meals` stub table (it never had a write path in
// the UI, so there is no data to migrate).

import type { SQLiteDatabase } from 'expo-sqlite';

import { SQL_TABLES } from '../schema';

export async function migrateV11(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(SQL_TABLES.dishes);
  await db.execAsync(SQL_TABLES.dish_ingredients);
  await db.execAsync(SQL_TABLES.meal_plan);
  await db.execAsync('DROP TABLE IF EXISTS meals;');
}

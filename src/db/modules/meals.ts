// Meal Planner DB module — Phase 10. Dishes (recipe library), their
// ingredients, and the date/slot meal plan.

import { getDb } from '../index';

export interface Dish {
  id: string;
  name: string;
  emoji: string;
  meal_type: string;
  prep_minutes: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface DishIngredient {
  id: string;
  dish_id: string;
  name: string;
  qty: number;
  unit: string;
}

export interface DishWithCount extends Dish {
  ingredient_count: number;
}

// A meal_plan row joined with its dish's display fields.
export interface PlanEntry {
  id: string;
  date: string;
  slot: string;
  dish_id: string;
  cook: string | null;
  notes: string | null;
  dish_name: string;
  dish_emoji: string;
  prep_minutes: number | null;
}

export interface IngredientInput {
  name: string;
  qty: number;
  unit: string;
}

// ─── Dishes ──────────────────────────────────────────────────

export async function getAllDishes(): Promise<DishWithCount[]> {
  return getDb().getAllAsync<DishWithCount>(`
    SELECT d.*, COUNT(i.id) AS ingredient_count
    FROM dishes d
    LEFT JOIN dish_ingredients i ON i.dish_id = d.id
    GROUP BY d.id
    ORDER BY d.name ASC;
  `);
}

export async function getDishById(id: string): Promise<Dish | null> {
  return getDb().getFirstAsync<Dish>('SELECT * FROM dishes WHERE id = ?;', [id]);
}

export async function getIngredients(dishId: string): Promise<DishIngredient[]> {
  return getDb().getAllAsync<DishIngredient>(
    'SELECT * FROM dish_ingredients WHERE dish_id = ? ORDER BY rowid ASC;',
    [dishId]
  );
}

export interface InsertDishInput {
  name: string;
  emoji?: string;
  meal_type?: string;
  prep_minutes?: number;
  notes?: string;
  ingredients?: IngredientInput[];
}

export async function insertDish(data: InsertDishInput): Promise<string> {
  const id = `dish_${Date.now()}`;
  await getDb().runAsync(
    `INSERT INTO dishes (id, name, emoji, meal_type, prep_minutes, notes)
     VALUES (?, ?, ?, ?, ?, ?);`,
    [
      id,
      data.name,
      data.emoji ?? '🍽️',
      data.meal_type ?? 'dinner',
      data.prep_minutes ?? null,
      data.notes ?? null,
    ]
  );
  if (data.ingredients?.length) {
    await replaceIngredients(id, data.ingredients);
  }
  return id;
}

export async function updateDish(
  id: string,
  data: Partial<Omit<Dish, 'id' | 'created_at' | 'updated_at'>>,
  ingredients?: IngredientInput[]
): Promise<void> {
  const keys = Object.keys(data) as (keyof typeof data)[];
  if (keys.length) {
    const sets = keys.map((k) => `${k} = ?`).join(', ');
    const vals = keys.map((k) => data[k] ?? null);
    await getDb().runAsync(
      `UPDATE dishes SET ${sets}, updated_at = datetime('now') WHERE id = ?;`,
      [...vals, id]
    );
  }
  if (ingredients) {
    await replaceIngredients(id, ingredients);
  }
}

async function replaceIngredients(dishId: string, ingredients: IngredientInput[]): Promise<void> {
  const db = getDb();
  await db.runAsync('DELETE FROM dish_ingredients WHERE dish_id = ?;', [dishId]);
  for (let i = 0; i < ingredients.length; i++) {
    const ing = ingredients[i];
    await db.runAsync(
      'INSERT INTO dish_ingredients (id, dish_id, name, qty, unit) VALUES (?, ?, ?, ?, ?);',
      [`ing_${dishId}_${i}_${Date.now()}`, dishId, ing.name, ing.qty, ing.unit]
    );
  }
}

export async function deleteDish(id: string): Promise<void> {
  const db = getDb();
  // Cascades don't fire without foreign_keys pragma — delete children explicitly.
  await db.runAsync('DELETE FROM meal_plan WHERE dish_id = ?;', [id]);
  await db.runAsync('DELETE FROM dish_ingredients WHERE dish_id = ?;', [id]);
  await db.runAsync('DELETE FROM dishes WHERE id = ?;', [id]);
}

// ─── Meal plan ───────────────────────────────────────────────

export async function getPlanForRange(startDate: string, endDate: string): Promise<PlanEntry[]> {
  return getDb().getAllAsync<PlanEntry>(
    `SELECT p.id, p.date, p.slot, p.dish_id, p.cook, p.notes,
            d.name AS dish_name, d.emoji AS dish_emoji, d.prep_minutes
     FROM meal_plan p
     JOIN dishes d ON d.id = p.dish_id
     WHERE p.date >= ? AND p.date <= ?
     ORDER BY p.date ASC, p.created_at ASC;`,
    [startDate, endDate]
  );
}

export async function addPlanEntry(
  date: string,
  slot: string,
  dishId: string,
  cook?: string
): Promise<string> {
  const id = `plan_${Date.now()}`;
  await getDb().runAsync(
    'INSERT INTO meal_plan (id, date, slot, dish_id, cook) VALUES (?, ?, ?, ?, ?);',
    [id, date, slot, dishId, cook ?? null]
  );
  return id;
}

export async function removePlanEntry(id: string): Promise<void> {
  await getDb().runAsync('DELETE FROM meal_plan WHERE id = ?;', [id]);
}

// Today's planned meals — for the dashboard card.
export async function getTodayMeals(todayKey: string): Promise<PlanEntry[]> {
  return getPlanForRange(todayKey, todayKey);
}

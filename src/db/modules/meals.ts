// Meals module — stub. Implemented fully in Phase 10.

import { getDb } from '../index';

export interface Meal {
  id: string;
  name: string;
  scheduled_at?: string;
  meal_type?: string;
  duration_min?: number;
  cook?: string;
}

export async function getUpcomingMeals(): Promise<Meal[]> {
  return getDb().getAllAsync<Meal>(
    "SELECT * FROM meals WHERE scheduled_at >= datetime('now') ORDER BY scheduled_at ASC LIMIT 7;"
  );
}

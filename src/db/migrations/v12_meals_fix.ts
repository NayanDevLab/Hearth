// v12 — re-runs the v11 meal-tables setup. During development some devices
// had user_version bumped to 11 before migrateV11 was wired into initDb,
// leaving dishes/dish_ingredients/meal_plan missing. migrateV11 only uses
// CREATE TABLE IF NOT EXISTS / DROP TABLE IF EXISTS, so re-running is safe.

export { migrateV11 as migrateV12 } from './v11_meals';

// Categories DB module — CRUD for Settings > Library > Categories.

import { getDb } from '../index';

export interface Category {
  id: string;
  name: string;
  emoji: string;
  color: string;
  areas: string; // comma-separated: tasks,money,meals,maintenance,calendar
  is_system: boolean;
  sort_order: number;
}

function castCategory(row: Category): Category {
  return { ...row, is_system: Boolean(row.is_system) };
}

export async function getAllCategories(): Promise<Category[]> {
  const rows = await getDb().getAllAsync<Category>(
    'SELECT * FROM categories ORDER BY sort_order ASC, name ASC;'
  );
  return rows.map(castCategory);
}

export async function getCategoryById(id: string): Promise<Category | null> {
  const row = await getDb().getFirstAsync<Category>('SELECT * FROM categories WHERE id = ?;', [id]);
  return row ? castCategory(row) : null;
}

export interface CreateCategoryInput {
  id: string;
  name: string;
  emoji: string;
  color: string;
  areas: string;
}

export async function insertCategory(input: CreateCategoryInput): Promise<void> {
  const count = await getDb().getFirstAsync<{ n: number }>('SELECT COUNT(*) as n FROM categories;');
  const sort = count?.n ?? 0;
  await getDb().runAsync(
    `INSERT INTO categories (id, name, emoji, color, areas, is_system, sort_order) VALUES (?,?,?,?,?,0,?);`,
    [input.id, input.name, input.emoji, input.color, input.areas, sort]
  );
}

export async function updateCategory(
  id: string,
  fields: Partial<Pick<Category, 'name' | 'emoji' | 'color' | 'areas'>>
): Promise<void> {
  const keys = Object.keys(fields) as (keyof typeof fields)[];
  if (keys.length === 0) return;
  const set = keys.map((k) => `${k} = ?`).join(', ');
  const vals = keys.map((k) => fields[k] ?? null);
  await getDb().runAsync(`UPDATE categories SET ${set} WHERE id = ?;`, [...vals, id]);
}

export async function deleteCategory(id: string): Promise<void> {
  await getDb().runAsync('DELETE FROM categories WHERE id = ? AND is_system = 0;', [id]);
}

export function groupCategoriesByArea(cats: Category[]): Record<string, Category[]> {
  const grouped: Record<string, Category[]> = {};
  for (const cat of cats) {
    const primary = cat.areas.split(',')[0].trim();
    if (!grouped[primary]) grouped[primary] = [];
    grouped[primary].push(cat);
  }
  return grouped;
}

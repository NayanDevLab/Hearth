// v6 — adds categories and units tables with seed data.

import type { SQLiteDatabase } from 'expo-sqlite';

export async function migrateV6(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS categories (
      id         TEXT PRIMARY KEY,
      name       TEXT NOT NULL,
      emoji      TEXT NOT NULL DEFAULT '🏷',
      color      TEXT NOT NULL DEFAULT '#C96B50',
      areas      TEXT NOT NULL DEFAULT 'tasks',
      is_system  INTEGER NOT NULL DEFAULT 0,
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS units (
      id         TEXT PRIMARY KEY,
      name       TEXT NOT NULL,
      abbr       TEXT NOT NULL,
      group_name TEXT NOT NULL,
      is_system  INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0
    );
  `);

  // Seed categories
  const cats: {
    id: string;
    name: string;
    emoji: string;
    color: string;
    areas: string;
    sort: number;
  }[] = [
    {
      id: 'cat_cleaning',
      name: 'Cleaning',
      emoji: '🧹',
      color: '#4AADD1',
      areas: 'tasks',
      sort: 0,
    },
    { id: 'cat_kitchen', name: 'Kitchen', emoji: '🍳', color: '#C96B50', areas: 'tasks', sort: 1 },
    { id: 'cat_pets', name: 'Pets', emoji: '🐾', color: '#9A7ECF', areas: 'tasks', sort: 2 },
    { id: 'cat_outdoor', name: 'Outdoor', emoji: '🌿', color: '#4BBE8D', areas: 'tasks', sort: 3 },
    { id: 'cat_errand', name: 'Errand', emoji: '🚗', color: '#EFC84E', areas: 'tasks', sort: 4 },
    {
      id: 'cat_rent',
      name: 'Rent & Housing',
      emoji: '🏠',
      color: '#C96B50',
      areas: 'money',
      sort: 5,
    },
    {
      id: 'cat_utilities',
      name: 'Utilities',
      emoji: '⚡',
      color: '#EFC84E',
      areas: 'money',
      sort: 6,
    },
    {
      id: 'cat_groceries',
      name: 'Groceries',
      emoji: '🛒',
      color: '#4BBE8D',
      areas: 'money',
      sort: 7,
    },
    {
      id: 'cat_subscriptions',
      name: 'Subscriptions',
      emoji: '🎬',
      color: '#9A7ECF',
      areas: 'money',
      sort: 8,
    },
    { id: 'cat_dinner', name: 'Dinner', emoji: '🥗', color: '#4BBE8D', areas: 'meals', sort: 9 },
    {
      id: 'cat_breakfast',
      name: 'Breakfast',
      emoji: '🥞',
      color: '#EFC84E',
      areas: 'meals',
      sort: 10,
    },
    { id: 'cat_hvac', name: 'HVAC', emoji: '🔧', color: '#23252F', areas: 'maintenance', sort: 11 },
    {
      id: 'cat_plumbing',
      name: 'Plumbing',
      emoji: '💧',
      color: '#4AADD1',
      areas: 'maintenance',
      sort: 12,
    },
    {
      id: 'cat_electrical',
      name: 'Electrical',
      emoji: '🔌',
      color: '#E55A48',
      areas: 'maintenance',
      sort: 13,
    },
  ];

  for (const c of cats) {
    await db.runAsync(
      `INSERT OR IGNORE INTO categories (id, name, emoji, color, areas, is_system, sort_order) VALUES (?,?,?,?,?,1,?);`,
      [c.id, c.name, c.emoji, c.color, c.areas, c.sort]
    );
  }

  // Seed units
  const units: { id: string; name: string; abbr: string; group: string; sort: number }[] = [
    { id: 'u_each', name: 'each', abbr: 'ea', group: 'Count', sort: 0 },
    { id: 'u_piece', name: 'piece', abbr: 'pc', group: 'Count', sort: 1 },
    { id: 'u_dozen', name: 'dozen', abbr: 'dz', group: 'Count', sort: 2 },
    { id: 'u_pair', name: 'pair', abbr: 'pr', group: 'Count', sort: 3 },
    { id: 'u_gram', name: 'gram', abbr: 'g', group: 'Weight', sort: 4 },
    { id: 'u_kg', name: 'kilogram', abbr: 'kg', group: 'Weight', sort: 5 },
    { id: 'u_oz', name: 'ounce', abbr: 'oz', group: 'Weight', sort: 6 },
    { id: 'u_lb', name: 'pound', abbr: 'lb', group: 'Weight', sort: 7 },
    { id: 'u_ml', name: 'millilitre', abbr: 'ml', group: 'Volume', sort: 8 },
    { id: 'u_litre', name: 'litre', abbr: 'L', group: 'Volume', sort: 9 },
    { id: 'u_cup', name: 'cup', abbr: 'cup', group: 'Volume', sort: 10 },
    { id: 'u_gallon', name: 'gallon', abbr: 'gal', group: 'Volume', sort: 11 },
    { id: 'u_pack', name: 'pack', abbr: 'pack', group: 'Packaging', sort: 12 },
    { id: 'u_bottle', name: 'bottle', abbr: 'btl', group: 'Packaging', sort: 13 },
    { id: 'u_box', name: 'box', abbr: 'box', group: 'Packaging', sort: 14 },
    { id: 'u_bag', name: 'bag', abbr: 'bag', group: 'Packaging', sort: 15 },
    { id: 'u_can', name: 'can', abbr: 'can', group: 'Packaging', sort: 16 },
    { id: 'u_loaf', name: 'loaf', abbr: 'loaf', group: 'Packaging', sort: 17 },
  ];

  for (const u of units) {
    await db.runAsync(
      `INSERT OR IGNORE INTO units (id, name, abbr, group_name, is_system, sort_order) VALUES (?,?,?,?,1,?);`,
      [u.id, u.name, u.abbr, u.group, u.sort]
    );
  }
}

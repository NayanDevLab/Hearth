// Units DB module — CRUD for Settings > Library > Units.

import { getDb } from '../index';

export interface Unit {
  id: string;
  name: string;
  abbr: string;
  group_name: string;
  is_system: boolean;
  sort_order: number;
}

function castUnit(row: Unit): Unit {
  return { ...row, is_system: Boolean(row.is_system) };
}

export async function getAllUnits(): Promise<Unit[]> {
  const rows = await getDb().getAllAsync<Unit>(
    'SELECT * FROM units ORDER BY group_name ASC, sort_order ASC;'
  );
  return rows.map(castUnit);
}

export interface CreateUnitInput {
  id: string;
  name: string;
  abbr: string;
  group_name: string;
}

export async function insertUnit(input: CreateUnitInput): Promise<void> {
  const count = await getDb().getFirstAsync<{ n: number }>('SELECT COUNT(*) as n FROM units;');
  const sort = count?.n ?? 0;
  await getDb().runAsync(
    `INSERT INTO units (id, name, abbr, group_name, is_system, sort_order) VALUES (?,?,?,?,0,?);`,
    [input.id, input.name, input.abbr, input.group_name, sort]
  );
}

export async function deleteUnit(id: string): Promise<void> {
  await getDb().runAsync('DELETE FROM units WHERE id = ? AND is_system = 0;', [id]);
}

export function groupUnitsByGroup(units: Unit[]): Record<string, Unit[]> {
  const grouped: Record<string, Unit[]> = {};
  for (const u of units) {
    if (!grouped[u.group_name]) grouped[u.group_name] = [];
    grouped[u.group_name].push(u);
  }
  return grouped;
}

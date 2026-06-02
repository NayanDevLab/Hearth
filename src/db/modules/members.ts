// Household members DB module — CRUD for Settings > Library > Members.

import { getDb } from '../index';

export type MemberRole = 'admin' | 'adult' | 'teen' | 'kid';

export interface HouseholdMember {
  id: string;
  name: string;
  nickname?: string;
  role: MemberRole;
  color: string;
  initial: string;
  show_in_tasks: boolean;
  show_in_bills: boolean;
  show_in_calendar: boolean;
  show_in_meals: boolean;
  sort_order: number;
  created_at: string;
}

function castMember(row: HouseholdMember): HouseholdMember {
  return {
    ...row,
    show_in_tasks: Boolean(row.show_in_tasks),
    show_in_bills: Boolean(row.show_in_bills),
    show_in_calendar: Boolean(row.show_in_calendar),
    show_in_meals: Boolean(row.show_in_meals),
  };
}

export async function getAllMembers(): Promise<HouseholdMember[]> {
  const rows = await getDb().getAllAsync<HouseholdMember>(
    'SELECT * FROM household_members ORDER BY sort_order ASC, created_at ASC;'
  );
  return rows.map(castMember);
}

export async function getMemberById(id: string): Promise<HouseholdMember | null> {
  const row = await getDb().getFirstAsync<HouseholdMember>(
    'SELECT * FROM household_members WHERE id = ?;',
    [id]
  );
  return row ? castMember(row) : null;
}

export interface CreateMemberInput {
  id: string;
  name: string;
  nickname?: string;
  role: MemberRole;
  color: string;
  initial: string;
  show_in_tasks?: boolean;
  show_in_bills?: boolean;
  show_in_calendar?: boolean;
  show_in_meals?: boolean;
}

export async function insertMember(input: CreateMemberInput): Promise<void> {
  const count = await getDb().getFirstAsync<{ n: number }>(
    'SELECT COUNT(*) as n FROM household_members;'
  );
  const sort = count?.n ?? 0;

  await getDb().runAsync(
    `INSERT INTO household_members
       (id, name, nickname, role, color, initial,
        show_in_tasks, show_in_bills, show_in_calendar, show_in_meals, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      input.id,
      input.name,
      input.nickname ?? null,
      input.role,
      input.color,
      input.initial,
      input.show_in_tasks !== false ? 1 : 0,
      input.show_in_bills !== false ? 1 : 0,
      input.show_in_calendar !== false ? 1 : 0,
      input.show_in_meals !== false ? 1 : 0,
      sort,
    ]
  );
}

export async function updateMember(
  id: string,
  fields: Partial<Omit<HouseholdMember, 'id' | 'created_at'>>
): Promise<void> {
  const keys = Object.keys(fields) as (keyof typeof fields)[];
  if (keys.length === 0) return;
  const set = keys.map((k) => `${k} = ?`).join(', ');
  const vals = keys.map((k) => {
    const v = fields[k];
    if (typeof v === 'boolean') return v ? 1 : 0;
    return v ?? null;
  });
  await getDb().runAsync(`UPDATE household_members SET ${set} WHERE id = ?;`, [...vals, id]);
}

export async function deleteMember(id: string): Promise<void> {
  await getDb().runAsync('DELETE FROM household_members WHERE id = ?;', [id]);
}

export async function getMemberStats(): Promise<{ total: number; admin: number; kid: number }> {
  const row = await getDb().getFirstAsync<{ total: number; admin: number; kid: number }>(`
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as admin,
      SUM(CASE WHEN role = 'kid' THEN 1 ELSE 0 END) as kid
    FROM household_members;
  `);
  return { total: row?.total ?? 0, admin: row?.admin ?? 0, kid: row?.kid ?? 0 };
}

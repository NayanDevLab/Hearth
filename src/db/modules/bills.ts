// Bills & Expenses module — full Phase 11 implementation.

import { getDb } from '../index';

export type BillType = 'bill' | 'expense';

export interface Bill {
  id: string;
  name: string;
  amount: number;
  currency: string;
  due_date: string | null;
  type: BillType;
  paid_by: string | null;
  recurrence: string | null;
  category: string | null;
  notes: string | null;
  reminder: string | null;
  paid: boolean;
  created_at: string;
}

export interface BillSplit {
  id: string;
  bill_id: string;
  member_initial: string;
  amount: number;
  settled: boolean;
}

export interface BillWithSplits extends Bill {
  splits: BillSplit[];
}

export interface MemberBalance {
  initial: string;
  owes_you: number;
  you_owe: number;
  net: number;
}

export interface MonthStats {
  bills_total: number;
  expenses_total: number;
  upcoming_count: number;
}

function castBill(row: Bill): Bill {
  return { ...row, paid: Boolean(row.paid) };
}
function castSplit(row: BillSplit): BillSplit {
  return { ...row, settled: Boolean(row.settled) };
}

// ─── Read ─────────────────────────────────────────────────────

export type BillFilter = 'all' | 'bills' | 'expenses' | 'settled';

export async function getAllBills(filter: BillFilter = 'all'): Promise<Bill[]> {
  let where = '';
  if (filter === 'bills') where = "WHERE type = 'bill' AND paid = 0";
  else if (filter === 'expenses') where = "WHERE type = 'expense' AND paid = 0";
  else if (filter === 'settled') where = 'WHERE paid = 1';
  const rows = await getDb().getAllAsync<Bill>(
    `SELECT * FROM bills ${where} ORDER BY paid ASC, due_date ASC, created_at DESC;`
  );
  return rows.map(castBill);
}

export async function getBillById(id: string): Promise<BillWithSplits | null> {
  const bill = await getDb().getFirstAsync<Bill>('SELECT * FROM bills WHERE id = ?;', [id]);
  if (!bill) return null;
  const splits = await getDb().getAllAsync<BillSplit>(
    'SELECT * FROM bill_splits WHERE bill_id = ?;',
    [id]
  );
  return { ...castBill(bill), splits: splits.map(castSplit) };
}

export async function getMonthStats(): Promise<MonthStats> {
  const today = new Date().toISOString().slice(0, 10);
  const row = await getDb().getFirstAsync<MonthStats>(
    `
    SELECT
      COALESCE(SUM(CASE WHEN type = 'bill' AND paid = 0 THEN amount ELSE 0 END), 0) as bills_total,
      COALESCE(SUM(CASE WHEN type = 'expense' AND paid = 0 THEN amount ELSE 0 END), 0) as expenses_total,
      (SELECT COUNT(*) FROM bills WHERE paid = 0 AND due_date >= ?) as upcoming_count
    FROM bills;
  `,
    [today]
  );
  return {
    bills_total: row?.bills_total ?? 0,
    expenses_total: row?.expenses_total ?? 0,
    upcoming_count: row?.upcoming_count ?? 0,
  };
}

export async function getBalances(youInitial: string): Promise<MemberBalance[]> {
  // What others owe you: your bills, their unsettled splits
  const owesRows = await getDb().getAllAsync<{ member_initial: string; total: number }>(
    `
    SELECT bs.member_initial, SUM(bs.amount) as total
    FROM bill_splits bs JOIN bills b ON b.id = bs.bill_id
    WHERE b.paid_by = ? AND bs.settled = 0 AND bs.member_initial != ?
    GROUP BY bs.member_initial;
  `,
    [youInitial, youInitial]
  );

  // What you owe others: their bills, your unsettled split
  const youOweRows = await getDb().getAllAsync<{ paid_by: string; total: number }>(
    `
    SELECT b.paid_by, SUM(bs.amount) as total
    FROM bill_splits bs JOIN bills b ON b.id = bs.bill_id
    WHERE bs.member_initial = ? AND bs.settled = 0 AND b.paid_by != ?
    GROUP BY b.paid_by;
  `,
    [youInitial, youInitial]
  );

  const map: Record<string, MemberBalance> = {};
  for (const r of owesRows) {
    if (!map[r.member_initial])
      map[r.member_initial] = { initial: r.member_initial, owes_you: 0, you_owe: 0, net: 0 };
    map[r.member_initial].owes_you = r.total;
  }
  for (const r of youOweRows) {
    if (!map[r.paid_by]) map[r.paid_by] = { initial: r.paid_by, owes_you: 0, you_owe: 0, net: 0 };
    map[r.paid_by].you_owe = r.total;
  }
  for (const b of Object.values(map)) b.net = b.owes_you - b.you_owe;
  return Object.values(map);
}

// ─── Write ────────────────────────────────────────────────────

export interface CreateBillInput {
  id: string;
  name: string;
  amount: number;
  type: BillType;
  paid_by?: string;
  category?: string;
  due_date?: string;
  recurrence?: string;
  reminder?: string;
  notes?: string;
  currency?: string;
  splits?: { member_initial: string; amount: number }[];
}

export async function insertBill(input: CreateBillInput): Promise<void> {
  await getDb().runAsync(
    `INSERT INTO bills (id, name, amount, currency, due_date, type, paid_by, recurrence, category, notes, reminder, paid)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,0);`,
    [
      input.id,
      input.name,
      input.amount,
      input.currency ?? 'INR',
      input.due_date ?? null,
      input.type,
      input.paid_by ?? null,
      input.recurrence ?? null,
      input.category ?? null,
      input.notes ?? null,
      input.reminder ?? null,
    ]
  );
  if (input.splits?.length) {
    for (const s of input.splits) {
      await getDb().runAsync(
        `INSERT INTO bill_splits (id, bill_id, member_initial, amount) VALUES (?,?,?,?);`,
        [`${input.id}_${s.member_initial}`, input.id, s.member_initial, s.amount]
      );
    }
  }
}

export async function updateBill(
  id: string,
  fields: Partial<Omit<Bill, 'id' | 'created_at'>>,
  splits?: { member_initial: string; amount: number }[]
): Promise<void> {
  const keys = Object.keys(fields) as (keyof typeof fields)[];
  if (keys.length > 0) {
    const set = keys.map((k) => `${k} = ?`).join(', ');
    const vals = keys.map((k) => {
      const v = fields[k];
      if (typeof v === 'boolean') return v ? 1 : 0;
      return v ?? null;
    });
    await getDb().runAsync(`UPDATE bills SET ${set} WHERE id = ?;`, [...vals, id]);
  }
  if (splits !== undefined) {
    await getDb().runAsync('DELETE FROM bill_splits WHERE bill_id = ?;', [id]);
    for (const s of splits) {
      await getDb().runAsync(
        `INSERT INTO bill_splits (id, bill_id, member_initial, amount) VALUES (?,?,?,?);`,
        [`${id}_${s.member_initial}`, id, s.member_initial, s.amount]
      );
    }
  }
}

export async function deleteBill(id: string): Promise<void> {
  await getDb().runAsync('DELETE FROM bills WHERE id = ?;', [id]);
}

export async function markBillPaid(id: string, paid: boolean): Promise<void> {
  await getDb().runAsync('UPDATE bills SET paid = ? WHERE id = ?;', [paid ? 1 : 0, id]);
}

export async function settleSplit(splitId: string): Promise<void> {
  await getDb().runAsync('UPDATE bill_splits SET settled = 1 WHERE id = ?;', [splitId]);
}

export async function settleAllSplitsForMember(
  billId: string,
  memberInitial: string
): Promise<void> {
  await getDb().runAsync(
    'UPDATE bill_splits SET settled = 1 WHERE bill_id = ? AND member_initial = ?;',
    [billId, memberInitial]
  );
}

// Bills module — CRUD operations. Implemented fully in Phase 11.

import { getDb } from '../index';

export interface Bill {
  id: string;
  name: string;
  amount: number;
  currency: string;
  due_date?: string;
  icon_color?: string;
  paid: boolean;
  recurrence?: string;
  category?: string;
  created_at: string;
}

export async function getAllBills(): Promise<Bill[]> {
  return getDb().getAllAsync<Bill>('SELECT * FROM bills ORDER BY due_date ASC;');
}

export async function insertBill(bill: Omit<Bill, 'created_at'>): Promise<void> {
  await getDb().runAsync(
    `INSERT INTO bills (id, name, amount, currency, due_date, icon_color, paid, recurrence, category)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      bill.id,
      bill.name,
      bill.amount,
      bill.currency,
      bill.due_date ?? null,
      bill.icon_color ?? null,
      bill.paid ? 1 : 0,
      bill.recurrence ?? null,
      bill.category ?? null,
    ]
  );
}

export async function markBillPaid(id: string, paid: boolean): Promise<void> {
  await getDb().runAsync('UPDATE bills SET paid = ? WHERE id = ?;', [paid ? 1 : 0, id]);
}

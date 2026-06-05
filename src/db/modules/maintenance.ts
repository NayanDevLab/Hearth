// Maintenance, Vendors & Appliances DB module — Phase 8.

import { getDb } from '../index';

export interface MaintenanceIssue {
  id: string;
  title: string;
  status: 'open' | 'in_progress' | 'done';
  priority: 'high' | 'medium' | 'low' | null;
  photo_uri: string | null;
  notes: string | null;
  vendor_id: string | null;
  cost: number | null;
  resolved_at: string | null;
  created_at: string;
}

export interface Vendor {
  id: string;
  name: string;
  trade: string | null;
  phone: string | null;
  rating: number | null;
  last_used: string | null;
  notes: string | null;
}

export interface Appliance {
  id: string;
  name: string;
  brand: string | null;
  purchase_date: string | null;
  price: number | null;
  warranty_until: string | null;
  serial_no: string | null;
  notes: string | null;
  created_at: string;
}

export interface MaintenanceStats {
  open: number;
  in_progress: number;
  done: number;
  appliances: number;
  vendors: number;
}

// ─── Issues ──────────────────────────────────────────────────

export type IssueFilter = 'all' | 'open' | 'in_progress' | 'done';

export async function getAllIssues(filter: IssueFilter = 'all'): Promise<MaintenanceIssue[]> {
  const where = filter !== 'all' ? `WHERE status = '${filter}'` : '';
  return getDb().getAllAsync<MaintenanceIssue>(
    `SELECT * FROM maintenance_issues ${where}
     ORDER BY CASE priority WHEN 'high' THEN 0 WHEN 'medium' THEN 1 ELSE 2 END, created_at DESC;`
  );
}

export async function getIssueById(id: string): Promise<MaintenanceIssue | null> {
  return getDb().getFirstAsync<MaintenanceIssue>('SELECT * FROM maintenance_issues WHERE id = ?;', [
    id,
  ]);
}

export interface CreateIssueInput {
  id: string;
  title: string;
  status?: 'open' | 'in_progress' | 'done';
  priority?: 'high' | 'medium' | 'low';
  notes?: string;
  vendor_id?: string;
  cost?: number;
}

export async function insertIssue(input: CreateIssueInput): Promise<void> {
  await getDb().runAsync(
    `INSERT INTO maintenance_issues (id, title, status, priority, notes, vendor_id, cost)
     VALUES (?,?,?,?,?,?,?);`,
    [
      input.id,
      input.title,
      input.status ?? 'open',
      input.priority ?? 'medium',
      input.notes ?? null,
      input.vendor_id ?? null,
      input.cost ?? null,
    ]
  );
}

export async function updateIssue(
  id: string,
  fields: Partial<Omit<MaintenanceIssue, 'id' | 'created_at'>>
): Promise<void> {
  const keys = Object.keys(fields) as (keyof typeof fields)[];
  if (!keys.length) return;
  const set = keys.map((k) => `${k} = ?`).join(', ');
  const vals = keys.map((k) => fields[k] ?? null);
  await getDb().runAsync(`UPDATE maintenance_issues SET ${set} WHERE id = ?;`, [...vals, id]);
}

export async function deleteIssue(id: string): Promise<void> {
  await getDb().runAsync('DELETE FROM maintenance_issues WHERE id = ?;', [id]);
}

// ─── Vendors ─────────────────────────────────────────────────

export async function getAllVendors(): Promise<Vendor[]> {
  return getDb().getAllAsync<Vendor>('SELECT * FROM vendors ORDER BY name ASC;');
}

export async function getVendorById(id: string): Promise<Vendor | null> {
  return getDb().getFirstAsync<Vendor>('SELECT * FROM vendors WHERE id = ?;', [id]);
}

export interface CreateVendorInput {
  id: string;
  name: string;
  trade?: string;
  phone?: string;
  rating?: number;
  notes?: string;
}

export async function insertVendor(input: CreateVendorInput): Promise<void> {
  await getDb().runAsync(
    'INSERT INTO vendors (id, name, trade, phone, rating, notes) VALUES (?,?,?,?,?,?);',
    [
      input.id,
      input.name,
      input.trade ?? null,
      input.phone ?? null,
      input.rating ?? null,
      input.notes ?? null,
    ]
  );
}

export async function updateVendor(id: string, fields: Partial<Omit<Vendor, 'id'>>): Promise<void> {
  const keys = Object.keys(fields) as (keyof typeof fields)[];
  if (!keys.length) return;
  const set = keys.map((k) => `${k} = ?`).join(', ');
  const vals = keys.map((k) => fields[k] ?? null);
  await getDb().runAsync(`UPDATE vendors SET ${set} WHERE id = ?;`, [...vals, id]);
}

export async function deleteVendor(id: string): Promise<void> {
  await getDb().runAsync('DELETE FROM vendors WHERE id = ?;', [id]);
}

// ─── Appliances ──────────────────────────────────────────────

export async function getAllAppliances(): Promise<Appliance[]> {
  return getDb().getAllAsync<Appliance>('SELECT * FROM appliances ORDER BY name ASC;');
}

export async function getApplianceById(id: string): Promise<Appliance | null> {
  return getDb().getFirstAsync<Appliance>('SELECT * FROM appliances WHERE id = ?;', [id]);
}

export interface CreateApplianceInput {
  id: string;
  name: string;
  brand?: string;
  purchase_date?: string;
  price?: number;
  warranty_until?: string;
  serial_no?: string;
  notes?: string;
}

export async function insertAppliance(input: CreateApplianceInput): Promise<void> {
  await getDb().runAsync(
    `INSERT INTO appliances (id, name, brand, purchase_date, price, warranty_until, serial_no, notes)
     VALUES (?,?,?,?,?,?,?,?);`,
    [
      input.id,
      input.name,
      input.brand ?? null,
      input.purchase_date ?? null,
      input.price ?? null,
      input.warranty_until ?? null,
      input.serial_no ?? null,
      input.notes ?? null,
    ]
  );
}

export async function updateAppliance(
  id: string,
  fields: Partial<Omit<Appliance, 'id' | 'created_at'>>
): Promise<void> {
  const keys = Object.keys(fields) as (keyof typeof fields)[];
  if (!keys.length) return;
  const set = keys.map((k) => `${k} = ?`).join(', ');
  const vals = keys.map((k) => fields[k] ?? null);
  await getDb().runAsync(`UPDATE appliances SET ${set} WHERE id = ?;`, [...vals, id]);
}

export async function deleteAppliance(id: string): Promise<void> {
  await getDb().runAsync('DELETE FROM appliances WHERE id = ?;', [id]);
}

// ─── Stats ───────────────────────────────────────────────────

export async function getMaintenanceStats(): Promise<MaintenanceStats> {
  const [issueRows, appRow, vendRow] = await Promise.all([
    getDb().getAllAsync<{ status: string; count: number }>(
      'SELECT status, COUNT(*) as count FROM maintenance_issues GROUP BY status;'
    ),
    getDb().getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM appliances;'),
    getDb().getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM vendors;'),
  ]);

  const stats: MaintenanceStats = { open: 0, in_progress: 0, done: 0, appliances: 0, vendors: 0 };
  for (const r of issueRows) {
    if (r.status === 'open') stats.open = r.count;
    else if (r.status === 'in_progress') stats.in_progress = r.count;
    else if (r.status === 'done') stats.done = r.count;
  }
  stats.appliances = appRow?.count ?? 0;
  stats.vendors = vendRow?.count ?? 0;
  return stats;
}

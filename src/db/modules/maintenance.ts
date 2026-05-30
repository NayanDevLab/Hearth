// Maintenance module — stub. Implemented fully in Phase 8.

import { getDb } from '../index';

export interface MaintenanceIssue {
  id: string;
  title: string;
  status: 'open' | 'in_progress' | 'done';
  priority?: string;
  photo_uri?: string;
  cost?: number;
}

export async function getOpenIssues(): Promise<MaintenanceIssue[]> {
  return getDb().getAllAsync<MaintenanceIssue>(
    "SELECT * FROM maintenance_issues WHERE status != 'done' ORDER BY created_at DESC;"
  );
}

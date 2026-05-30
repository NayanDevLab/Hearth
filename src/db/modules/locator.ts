// Item Locator module — stub. Implemented fully in Phase 7.

import { getDb } from '../index';

export interface Room {
  id: string;
  name: string;
  emoji?: string;
  sort_order: number;
}

export async function getAllRooms(): Promise<Room[]> {
  return getDb().getAllAsync<Room>('SELECT * FROM rooms ORDER BY sort_order ASC;');
}

// Events DB module — CRUD for calendar events and attendees.

import { getDb } from '../index';

export interface CalendarEvent {
  id: string;
  title: string;
  category?: string;
  date: string; // "2026-03-17"
  start_time?: string; // "10:30"
  end_time?: string; // "11:15"
  all_day: boolean;
  location?: string;
  notes?: string;
  visibility: 'household' | 'just_me';
  recurrence?: string; // 'daily' | 'weekly' | 'monthly' | 'yearly'
  recurrence_id?: string;
  reminder?: string;
  created_by?: string;
  created_at: string;
}

export interface EventAttendee {
  id: string;
  event_id: string;
  member_initial: string;
  status: 'going' | 'maybe' | 'no';
}

export interface EventWithAttendees extends CalendarEvent {
  attendees: EventAttendee[];
}

/** Per-day dot data for the month grid — which members have events on each day. */
export interface DayDot {
  date: string; // "2026-03-17"
  member_initial: string;
  color: string; // hex color for the dot
}

// ─── Helpers ─────────────────────────────────────────────────

function castEvent(row: CalendarEvent): CalendarEvent {
  return { ...row, all_day: Boolean(row.all_day) };
}

// ─── Read ─────────────────────────────────────────────────────

export async function getEventsForDay(date: string): Promise<CalendarEvent[]> {
  const rows = await getDb().getAllAsync<CalendarEvent>(
    `SELECT * FROM events WHERE date = ? ORDER BY all_day DESC, start_time ASC;`,
    [date]
  );
  return rows.map(castEvent);
}

export async function getEventsForMonth(
  yearMonth: string // "2026-03" — queries entire month
): Promise<CalendarEvent[]> {
  const rows = await getDb().getAllAsync<CalendarEvent>(
    `SELECT * FROM events WHERE date LIKE ? ORDER BY date ASC, start_time ASC;`,
    [`${yearMonth}-%`]
  );
  return rows.map(castEvent);
}

export async function getUpcomingEvents(limit = 30): Promise<CalendarEvent[]> {
  const today = new Date().toISOString().slice(0, 10);
  const rows = await getDb().getAllAsync<CalendarEvent>(
    `SELECT * FROM events WHERE date >= ? ORDER BY date ASC, start_time ASC LIMIT ?;`,
    [today, limit]
  );
  return rows.map(castEvent);
}

export async function getEventById(id: string): Promise<EventWithAttendees | null> {
  const event = await getDb().getFirstAsync<CalendarEvent>('SELECT * FROM events WHERE id = ?;', [
    id,
  ]);
  if (!event) return null;
  const attendees = await getDb().getAllAsync<EventAttendee>(
    'SELECT * FROM event_attendees WHERE event_id = ?;',
    [id]
  );
  return { ...castEvent(event), attendees };
}

/** Returns colored dots for each day in the month — used to draw the month grid. */
export async function getMonthDots(
  yearMonth: string,
  memberColors: Record<string, string> // { A: '#C96B50', M: '#4AADD1', ... }
): Promise<Record<string, string[]>> {
  // Map date → list of member colors that have events on that day
  const rows = await getDb().getAllAsync<{ date: string; member_initial: string }>(
    `SELECT DISTINCT e.date, ea.member_initial
     FROM events e
     JOIN event_attendees ea ON ea.event_id = e.id
     WHERE e.date LIKE ?
     ORDER BY e.date ASC;`,
    [`${yearMonth}-%`]
  );
  const result: Record<string, string[]> = {};
  for (const row of rows) {
    if (!result[row.date]) result[row.date] = [];
    const color = memberColors[row.member_initial];
    if (color && !result[row.date].includes(color)) {
      result[row.date].push(color);
    }
  }
  return result;
}

// ─── Write ────────────────────────────────────────────────────

export interface CreateEventInput {
  id: string;
  title: string;
  category?: string;
  date: string;
  start_time?: string;
  end_time?: string;
  all_day?: boolean;
  location?: string;
  notes?: string;
  visibility?: 'household' | 'just_me';
  recurrence?: string;
  recurrence_id?: string;
  reminder?: string;
  created_by?: string;
  attendees?: string[]; // member initials
}

export async function insertEvent(input: CreateEventInput): Promise<void> {
  await getDb().runAsync(
    `INSERT INTO events
       (id, title, category, date, start_time, end_time, all_day,
        location, notes, visibility, recurrence, recurrence_id, reminder, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      input.id,
      input.title,
      input.category ?? null,
      input.date,
      input.start_time ?? null,
      input.end_time ?? null,
      input.all_day ? 1 : 0,
      input.location ?? null,
      input.notes ?? null,
      input.visibility ?? 'household',
      input.recurrence ?? null,
      input.recurrence_id ?? null,
      input.reminder ?? null,
      input.created_by ?? null,
    ]
  );
  if (input.attendees?.length) {
    await insertAttendees(input.id, input.attendees);
  }
}

async function insertAttendees(eventId: string, memberInitials: string[]): Promise<void> {
  for (const initial of memberInitials) {
    await getDb().runAsync(
      `INSERT OR REPLACE INTO event_attendees (id, event_id, member_initial, status)
       VALUES (?, ?, ?, 'going');`,
      [`${eventId}_${initial}`, eventId, initial]
    );
  }
}

export async function updateEvent(
  id: string,
  fields: Partial<Omit<CalendarEvent, 'id' | 'created_at'>>,
  attendees?: string[]
): Promise<void> {
  const keys = Object.keys(fields) as (keyof typeof fields)[];
  if (keys.length > 0) {
    const set = keys.map((k) => `${k} = ?`).join(', ');
    const vals = keys.map((k) => {
      const v = fields[k];
      if (typeof v === 'boolean') return v ? 1 : 0;
      return v ?? null;
    });
    await getDb().runAsync(`UPDATE events SET ${set} WHERE id = ?;`, [...vals, id]);
  }
  if (attendees !== undefined) {
    await getDb().runAsync('DELETE FROM event_attendees WHERE event_id = ?;', [id]);
    if (attendees.length > 0) await insertAttendees(id, attendees);
  }
}

export async function deleteEvent(id: string): Promise<void> {
  await getDb().runAsync('DELETE FROM events WHERE id = ?;', [id]);
}

export async function deleteEventSeries(recurrenceId: string): Promise<void> {
  await getDb().runAsync('DELETE FROM events WHERE recurrence_id = ? OR id = ?;', [
    recurrenceId,
    recurrenceId,
  ]);
}

export async function deleteEventAndFuture(id: string, date: string): Promise<void> {
  const event = await getDb().getFirstAsync<{ recurrence_id: string }>(
    'SELECT recurrence_id FROM events WHERE id = ?;',
    [id]
  );
  if (event?.recurrence_id) {
    await getDb().runAsync(
      'DELETE FROM events WHERE (recurrence_id = ? OR id = ?) AND date >= ?;',
      [event.recurrence_id, id, date]
    );
  } else {
    await deleteEvent(id);
  }
}

// Tasks DB module — full CRUD + filter queries + history.

import { getDb } from '../index';

export type TaskPriority = 'low' | 'normal' | 'high';
export type TaskRecurrence = 'daily' | 'weekly' | 'monthly' | null;
export type TaskFilter = 'today' | 'tomorrow' | 'week' | 'mine' | 'done';
export type TimeGroup = 'morning' | 'afternoon' | 'evening' | 'anytime';

export interface Task {
  id: string;
  title: string;
  assignee?: string;
  due_time?: string;
  tag?: string;
  done: boolean;
  recurrence?: TaskRecurrence;
  recurrence_id?: string;
  category?: string;
  priority: TaskPriority;
  notes?: string;
  reminder?: string;
  created_at: string;
  updated_at: string;
}

export interface TaskCompletion {
  id: string;
  task_id: string;
  completed_by?: string;
  completed_at: string;
  on_time: boolean;
}

export interface TaskGroup {
  key: TimeGroup;
  data: Task[];
}

// ─── Helpers ─────────────────────────────────────────────────

export function getTimeGroup(dueTime?: string): TimeGroup {
  if (!dueTime) return 'anytime';
  const hour = new Date(dueTime).getHours();
  if (isNaN(hour)) return 'anytime';
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

function groupTasks(tasks: Task[]): TaskGroup[] {
  const groups: Record<TimeGroup, Task[]> = {
    morning: [],
    afternoon: [],
    evening: [],
    anytime: [],
  };
  for (const t of tasks) {
    groups[getTimeGroup(t.due_time)].push(t);
  }
  return (Object.entries(groups) as [TimeGroup, Task[]][])
    .filter(([, data]) => data.length > 0)
    .map(([key, data]) => ({ key, data }));
}

function todayStart(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function todayEnd(): string {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d.toISOString();
}

function tomorrowStart(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function tomorrowEnd(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(23, 59, 59, 999);
  return d.toISOString();
}

function weekEnd(): string {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  d.setHours(23, 59, 59, 999);
  return d.toISOString();
}

// ─── Read queries ─────────────────────────────────────────────

export async function getTasksByFilter(
  filter: TaskFilter,
  currentUser?: string,
  page = 0,
  pageSize = 20
): Promise<{ groups: TaskGroup[]; hasMore: boolean }> {
  const db = getDb();
  let rows: Task[];

  const offset = page * pageSize;
  const fetchSize = pageSize + 1; // fetch one extra to check hasMore

  switch (filter) {
    case 'today':
      rows = await db.getAllAsync<Task>(
        `SELECT * FROM tasks
         WHERE done = 0 AND (due_time IS NULL OR (due_time >= ? AND due_time <= ?))
         ORDER BY due_time ASC, created_at ASC
         LIMIT ? OFFSET ?;`,
        [todayStart(), todayEnd(), fetchSize, offset]
      );
      break;
    case 'tomorrow':
      rows = await db.getAllAsync<Task>(
        `SELECT * FROM tasks
         WHERE done = 0 AND due_time >= ? AND due_time <= ?
         ORDER BY due_time ASC
         LIMIT ? OFFSET ?;`,
        [tomorrowStart(), tomorrowEnd(), fetchSize, offset]
      );
      break;
    case 'week':
      rows = await db.getAllAsync<Task>(
        `SELECT * FROM tasks
         WHERE done = 0 AND (due_time IS NULL OR due_time <= ?)
         ORDER BY due_time ASC, created_at ASC
         LIMIT ? OFFSET ?;`,
        [weekEnd(), fetchSize, offset]
      );
      break;
    case 'mine':
      rows = await db.getAllAsync<Task>(
        `SELECT * FROM tasks
         WHERE done = 0 AND assignee = ?
         ORDER BY due_time ASC, created_at ASC
         LIMIT ? OFFSET ?;`,
        [currentUser ?? '', fetchSize, offset]
      );
      break;
    case 'done':
      rows = await db.getAllAsync<Task>(
        `SELECT * FROM tasks
         WHERE done = 1
         ORDER BY updated_at DESC
         LIMIT ? OFFSET ?;`,
        [fetchSize, offset]
      );
      break;
  }

  const hasMore = rows.length > pageSize;
  const tasks = (hasMore ? rows.slice(0, pageSize) : rows).map((r) => ({
    ...r,
    done: Boolean(r.done),
  }));
  return { groups: groupTasks(tasks), hasMore };
}

export async function getWeekStats(): Promise<{
  total: number;
  done: number;
  byPerson: { assignee: string; total: number; done: number }[];
}> {
  const db = getDb();
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay()); // Sunday
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);

  const [totals, byPerson] = await Promise.all([
    db.getFirstAsync<{ total: number; done: number }>(
      `SELECT COUNT(*) as total, SUM(done) as done FROM tasks
       WHERE created_at >= ? OR (due_time >= ? AND due_time < ?);`,
      [weekStart.toISOString(), weekStart.toISOString(), weekEnd.toISOString()]
    ),
    db.getAllAsync<{ assignee: string; total: number; done: number }>(
      `SELECT assignee, COUNT(*) as total, SUM(done) as done FROM tasks
       WHERE assignee IS NOT NULL AND (due_time >= ? AND due_time < ?)
       GROUP BY assignee ORDER BY total DESC;`,
      [weekStart.toISOString(), weekEnd.toISOString()]
    ),
  ]);

  return {
    total: totals?.total ?? 0,
    done: totals?.done ?? 0,
    byPerson: byPerson ?? [],
  };
}

export async function getTaskById(id: string): Promise<Task | null> {
  const row = await getDb().getFirstAsync<Task>('SELECT * FROM tasks WHERE id = ?;', [id]);
  return row ?? null;
}

export async function getTaskHistory(taskId: string): Promise<TaskCompletion[]> {
  return getDb().getAllAsync<TaskCompletion>(
    'SELECT * FROM task_completions WHERE task_id = ? ORDER BY completed_at DESC LIMIT 5;',
    [taskId]
  );
}

// ─── Write queries ────────────────────────────────────────────

export interface CreateTaskInput {
  id: string;
  title: string;
  assignee?: string;
  due_time?: string;
  recurrence?: TaskRecurrence;
  recurrence_id?: string;
  category?: string;
  priority?: TaskPriority;
  notes?: string;
  reminder?: string;
  tag?: string;
}

export async function insertTask(task: CreateTaskInput): Promise<void> {
  await getDb().runAsync(
    `INSERT INTO tasks
       (id, title, assignee, due_time, recurrence, recurrence_id,
        category, priority, notes, reminder, tag, done)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0);`,
    [
      task.id,
      task.title,
      task.assignee ?? null,
      task.due_time ?? null,
      task.recurrence ?? null,
      task.recurrence_id ?? null,
      task.category ?? null,
      task.priority ?? 'normal',
      task.notes ?? null,
      task.reminder ?? null,
      task.tag ?? null,
    ]
  );
}

export async function updateTask(
  id: string,
  fields: Partial<Omit<Task, 'id' | 'created_at' | 'updated_at'>>
): Promise<void> {
  const keys = Object.keys(fields) as (keyof typeof fields)[];
  if (keys.length === 0) return;
  const setClauses = keys.map((k) => `${k} = ?`).join(', ');
  const values = keys.map((k) => {
    const v = fields[k];
    if (typeof v === 'boolean') return v ? 1 : 0;
    return v ?? null;
  });
  await getDb().runAsync(
    `UPDATE tasks SET ${setClauses}, updated_at = datetime('now') WHERE id = ?;`,
    [...values, id]
  );
}

export async function toggleTaskDone(
  id: string,
  done: boolean,
  completedBy?: string
): Promise<void> {
  await getDb().runAsync(`UPDATE tasks SET done = ?, updated_at = datetime('now') WHERE id = ?;`, [
    done ? 1 : 0,
    id,
  ]);
  if (done) {
    const completionId = `${id}_${Date.now()}`;
    await getDb().runAsync(
      `INSERT INTO task_completions (id, task_id, completed_by) VALUES (?, ?, ?);`,
      [completionId, id, completedBy ?? null]
    );
  }
}

export async function deleteTask(id: string): Promise<void> {
  await getDb().runAsync('DELETE FROM tasks WHERE id = ?;', [id]);
}

export async function deleteTaskSeries(recurrenceId: string): Promise<void> {
  await getDb().runAsync('DELETE FROM tasks WHERE recurrence_id = ? OR id = ?;', [
    recurrenceId,
    recurrenceId,
  ]);
}

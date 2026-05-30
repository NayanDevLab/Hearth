// Tasks module — CRUD operations. Implemented fully in Phase 4.

import { getDb } from '../index';

export interface Task {
  id: string;
  title: string;
  assignee?: string;
  due_time?: string;
  tag?: string;
  done: boolean;
  recurrence?: string;
  created_at: string;
  updated_at: string;
}

export async function getAllTasks(): Promise<Task[]> {
  return getDb().getAllAsync<Task>('SELECT * FROM tasks ORDER BY created_at DESC;');
}

export async function insertTask(task: Omit<Task, 'created_at' | 'updated_at'>): Promise<void> {
  await getDb().runAsync(
    `INSERT INTO tasks (id, title, assignee, due_time, tag, done, recurrence)
     VALUES (?, ?, ?, ?, ?, ?, ?);`,
    [
      task.id,
      task.title,
      task.assignee ?? null,
      task.due_time ?? null,
      task.tag ?? null,
      task.done ? 1 : 0,
      task.recurrence ?? null,
    ]
  );
}

export async function toggleTask(id: string, done: boolean): Promise<void> {
  await getDb().runAsync(`UPDATE tasks SET done = ?, updated_at = datetime('now') WHERE id = ?;`, [
    done ? 1 : 0,
    id,
  ]);
}

export async function deleteTask(id: string): Promise<void> {
  await getDb().runAsync('DELETE FROM tasks WHERE id = ?;', [id]);
}

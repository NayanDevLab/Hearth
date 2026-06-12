// Local notification scheduling for task reminders.
// Call setupNotifications() + rescheduleAllTaskReminders() once at app startup,
// then scheduleTaskReminder()/cancelTaskReminder() whenever a task's
// title/due_time/reminder/done state changes.

import { Platform } from 'react-native';

import * as Notifications from 'expo-notifications';

import { getTasksWithReminders, type Task } from '@/db/modules/tasks';
import { i18next } from '@/i18n';

const CHANNEL_ID = 'task-reminders';

const REMINDER_OFFSET_MS: Record<string, number> = {
  '15min': 15 * 60 * 1000,
  '1hour': 60 * 60 * 1000,
  '1day': 24 * 60 * 60 * 1000,
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Creates the Android notification channel and requests permission to show
// notifications. Safe to call on every app start — both calls are idempotent.
export async function setupNotifications(): Promise<void> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Task reminders',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') {
    await Notifications.requestPermissionsAsync();
  }
}

function reminderBody(reminder: string): string {
  return i18next.t(`tasks:notif_body_${reminder}`);
}

type ReminderTask = Pick<Task, 'id' | 'title' | 'due_time' | 'reminder' | 'done'>;

// Schedules (or re-schedules) the reminder notification for a task. Cancels
// any existing notification for this task first, then schedules a new one
// if the task is incomplete, has a due time + reminder offset, and the
// resulting trigger time is in the future.
export async function scheduleTaskReminder(task: ReminderTask): Promise<void> {
  await cancelTaskReminder(task.id);

  if (task.done || !task.due_time || !task.reminder) return;
  const offset = REMINDER_OFFSET_MS[task.reminder];
  if (!offset) return;

  const triggerAt = new Date(task.due_time).getTime() - offset;
  if (triggerAt <= Date.now()) return;

  await Notifications.scheduleNotificationAsync({
    identifier: task.id,
    content: {
      title: task.title,
      body: reminderBody(task.reminder),
      sound: 'default',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: new Date(triggerAt),
      ...(Platform.OS === 'android' ? { channelId: CHANNEL_ID } : {}),
    },
  });
}

export async function cancelTaskReminder(taskId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(taskId);
}

export async function cancelTaskReminders(taskIds: string[]): Promise<void> {
  await Promise.all(taskIds.map(cancelTaskReminder));
}

// Re-syncs every scheduled notification with the current DB state — run once
// at app startup so reminders survive app restarts and reinstalled builds.
export async function rescheduleAllTaskReminders(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  const tasks = await getTasksWithReminders();
  await Promise.all(tasks.map(scheduleTaskReminder));
}

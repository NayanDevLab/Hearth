// Task detail — tags, title, mark-done CTA, meta rows, notes, history.

import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { router, useLocalSearchParams } from 'expo-router';

import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icons/Icon';
import { ErrorState } from '@/components/shared';
import { TaskDeleteSheet } from '@/components/tasks';
import { Avatar, ScreenHeader } from '@/components/ui';
import { CATEGORY_CONFIG, MEMBER_CONFIG } from '@/constants/tasks';
import {
  deleteTask,
  deleteTaskSeries,
  getTaskById,
  getTaskHistory,
  type Task,
  type TaskCompletion,
  toggleTaskDone,
} from '@/db/modules/tasks';
import { prefs } from '@/storage/prefs';
import { colors, fontFamily, fontSize, radius, spacing } from '@/theme';
import { formatDateWithTime, formatFullDate } from '@/utils';

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation('tasks');
  const { t: tc } = useTranslation('common');
  const insets = useSafeAreaInsets();

  const [task, setTask] = useState<Task | null>(null);
  const [history, setHistory] = useState<TaskCompletion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [toggling, setToggling] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);

  const loadTask = useCallback(async () => {
    if (!id) return;
    try {
      const [found, hist] = await Promise.all([getTaskById(id), getTaskHistory(id)]);
      setTask(found);
      setHistory(hist);
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [id]);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    loadTask();
  }, [loadTask]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Called by the retry button — resets state before re-fetching
  const handleRetry = useCallback(() => {
    setLoading(true);
    setError(null);
    loadTask();
  }, [loadTask]);

  const handleToggle = async () => {
    if (!task || toggling) return;
    setToggling(true);
    const newDone = !task.done;
    setTask((prev) => (prev ? { ...prev, done: newDone } : prev));
    try {
      const userName = await prefs.getUserName();
      await toggleTaskDone(task.id, newDone, userName?.charAt(0).toUpperCase() ?? undefined);
    } catch {
      setTask((prev) => (prev ? { ...prev, done: !newDone } : prev));
    } finally {
      setToggling(false);
    }
  };

  const handleDeleteOne = async () => {
    if (!task) return;
    setDeleteVisible(false);
    await deleteTask(task.id);
    router.back();
  };

  const handleDeleteSeries = async () => {
    if (!task?.recurrence_id) return;
    setDeleteVisible(false);
    await deleteTaskSeries(task.recurrence_id);
    router.back();
  };

  const cat = task?.category ? CATEGORY_CONFIG[task.category] : null;
  const member = task?.assignee ? MEMBER_CONFIG[task.assignee] : null;
  const isRecurring = Boolean(task?.recurrence);

  // Pre-compute repeat labels to avoid nested ternaries in JSX
  function recurringTagLabel(): string {
    if (task?.recurrence === 'daily') return t('repeats_label_daily');
    if (task?.recurrence === 'monthly') return t('repeats_label_monthly');
    return t('repeats_label_weekly');
  }
  function repeatDetailLabel(): string {
    if (task?.recurrence === 'daily') return t('repeats_daily');
    if (task?.recurrence === 'monthly') return t('repeats_monthly');
    if (task?.recurrence === 'weekly') return t('repeats_weekly');
    return t('repeats_never');
  }
  function reminderDetailLabel(): string {
    if (task?.reminder === '15min') return t('reminder_15min');
    if (task?.reminder === '1hour') return t('reminder_1hour');
    return t('reminder_1day');
  }

  if (loading) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (error || !task) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ScreenHeader title="Task" onBack={() => router.back()} />
        <ErrorState
          title={t('error_title')}
          body={t('error_body')}
          retryLabel={t('error_retry')}
          onRetry={handleRetry}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader
        title="Task"
        onBack={() => router.back()}
        right={
          <TouchableOpacity
            style={styles.moreBtn}
            activeOpacity={0.7}
            onPress={() => router.push(`/task/${id}/edit` as never)}
          >
            <Icon.more size={20} color={colors.ink} />
          </TouchableOpacity>
        }
      />

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Tags */}
        <View style={styles.tagsRow}>
          {cat && (
            <View style={[styles.tag, { backgroundColor: cat.soft }]}>
              <Text style={[styles.tagText, { color: cat.color }]}>{cat.label}</Text>
            </View>
          )}
          {task.priority === 'high' && (
            <View style={[styles.tag, { backgroundColor: colors.roseSoft }]}>
              <Text style={[styles.tagText, { color: colors.rose }]}>
                {t('priority_high_badge')}
              </Text>
            </View>
          )}
          {isRecurring && (
            <View
              style={[
                styles.tag,
                { backgroundColor: colors.surface2, flexDirection: 'row', gap: 4 },
              ]}
            >
              <Icon.sparkle size={11} color={colors.ink2} />
              <Text style={[styles.tagText, { color: colors.ink2 }]}>{recurringTagLabel()}</Text>
            </View>
          )}
        </View>

        {/* Title */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>{task.title}</Text>
          {member && (
            <Text style={styles.createdBy}>
              {t('created_by', { name: member.name, date: formatFullDate(task.created_at) })}
            </Text>
          )}
        </View>

        {/* Mark done */}
        <View style={styles.ctaWrap}>
          <TouchableOpacity
            style={[styles.doneCta, task.done && styles.doneCtaComplete]}
            activeOpacity={0.8}
            onPress={handleToggle}
            disabled={toggling}
          >
            {toggling ? (
              <ActivityIndicator color={task.done ? colors.ink3 : '#2F8A5E'} size="small" />
            ) : (
              <>
                <View style={[styles.doneCheckBox, task.done && styles.doneCheckBoxFilled]}>
                  {task.done && <Icon.check size={16} color={colors.white} stroke={2.5} />}
                </View>
                <Text style={[styles.doneCtaLabel, task.done && styles.doneCtaLabelComplete]}>
                  {task.done ? t('mark_undone') : t('mark_done')}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Meta rows */}
        <View style={styles.detailRows}>
          <DetailRow
            icon={<Icon.users size={18} color={colors.ink3} />}
            label={t('assigned_to')}
            value={member?.name ?? '—'}
          />
          <DetailRow
            icon={<Icon.calendar size={18} color={colors.ink3} />}
            label={t('due')}
            value={task.due_time ? formatDateWithTime(task.due_time) : '—'}
          />
          <DetailRow
            icon={<Icon.sparkle size={18} color={colors.ink3} />}
            label={t('repeats')}
            value={repeatDetailLabel()}
          />
          {task.reminder && (
            <DetailRow
              icon={<Icon.bell size={18} color={colors.ink3} />}
              label={t('reminder')}
              value={reminderDetailLabel()}
            />
          )}
        </View>

        {/* Notes */}
        {task.notes ? (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>
              {t('notes_label').replace(' (optional)', '').toUpperCase()}
            </Text>
            <View style={styles.notesCard}>
              <Text style={styles.notesText}>{task.notes}</Text>
            </View>
          </View>
        ) : null}

        {/* History */}
        {history.length > 0 && (
          <View style={[styles.section, styles.lastSection]}>
            <Text style={styles.sectionLabel}>{t('history').toUpperCase()}</Text>
            <View style={styles.historyCard}>
              {history.map((h, i) => {
                const m2 = h.completed_by ? MEMBER_CONFIG[h.completed_by] : null;
                return (
                  <View
                    key={h.id}
                    style={[styles.historyRow, i < history.length - 1 && styles.historyRowBorder]}
                  >
                    {m2 ? (
                      <Avatar initial={h.completed_by!} color={m2.color} size={26} />
                    ) : (
                      <View style={styles.historyPlaceholder} />
                    )}
                    <View style={styles.historyContent}>
                      <Text style={styles.historyName}>{m2?.name ?? '—'}</Text>
                      <Text style={styles.historyDate}>{formatFullDate(h.completed_at)}</Text>
                    </View>
                    <View
                      style={[
                        styles.historyBadge,
                        { backgroundColor: h.on_time ? colors.mint : colors.butterSoft },
                      ]}
                    >
                      {h.on_time ? (
                        <Icon.check size={12} color={colors.white} stroke={2.5} />
                      ) : (
                        <Icon.clock size={12} color="#8A6220" />
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom bar */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        <TouchableOpacity
          style={styles.editBtn}
          activeOpacity={0.8}
          onPress={() => router.push(`/task/${id}/edit` as never)}
        >
          <Icon.edit size={18} color={colors.ink} />
          <Text style={styles.editBtnLabel}>{tc('edit')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteBtn}
          activeOpacity={0.8}
          onPress={() => setDeleteVisible(true)}
        >
          <Icon.trash size={20} color={colors.rose} />
        </TouchableOpacity>
      </View>

      <TaskDeleteSheet
        visible={deleteVisible}
        taskTitle={task.title}
        isRecurring={isRecurring}
        onDeleteOne={handleDeleteOne}
        onDeleteSeries={isRecurring ? handleDeleteSeries : undefined}
        onCancel={() => setDeleteVisible(false)}
      />
    </View>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.detailRow}>
      <View style={styles.detailIcon}>{icon}</View>
      <View style={styles.detailText}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
      <Icon.arrow size={16} color={colors.ink4} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  moreBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: { flex: 1 },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingHorizontal: spacing[7],
    paddingBottom: 12,
    alignItems: 'center',
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  tagText: { fontFamily: fontFamily.bold, fontSize: 11 },
  titleSection: { paddingHorizontal: spacing[7], paddingBottom: 18 },
  title: {
    fontFamily: fontFamily.extraBold,
    fontSize: 26,
    letterSpacing: -0.52,
    color: colors.ink,
    lineHeight: 32,
    marginBottom: 6,
  },
  createdBy: { fontFamily: fontFamily.regular, fontSize: 13, color: colors.ink3 },
  ctaWrap: { paddingHorizontal: spacing[7], paddingBottom: 18 },
  doneCta: {
    height: 64,
    borderRadius: 18,
    backgroundColor: colors.mintSoft,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  doneCtaComplete: { backgroundColor: colors.surface2 },
  doneCheckBox: {
    width: 26,
    height: 26,
    borderRadius: 9,
    borderWidth: 1.75,
    borderColor: '#2F8A5E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneCheckBoxFilled: { backgroundColor: colors.mint, borderWidth: 0 },
  doneCtaLabel: { fontFamily: fontFamily.bold, fontSize: 16, color: '#2F8A5E' },
  doneCtaLabelComplete: { color: colors.ink3 },
  detailRows: { paddingHorizontal: spacing[7], paddingBottom: 18 },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.sm,
    marginBottom: 8,
  },
  detailIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.xs,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailText: { flex: 1 },
  detailLabel: { fontFamily: fontFamily.semiBold, fontSize: 13, color: colors.ink3 },
  detailValue: { fontFamily: fontFamily.semiBold, fontSize: 15, color: colors.ink, marginTop: 2 },
  section: { paddingHorizontal: spacing[7], paddingBottom: 18 },
  lastSection: { paddingBottom: 100 },
  sectionLabel: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.caption,
    color: colors.ink3,
    letterSpacing: 0.66,
    marginBottom: 10,
  },
  notesCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.sm,
    padding: 14,
  },
  notesText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.body,
    color: colors.ink2,
    lineHeight: 21,
  },
  historyCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  historyRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.line2 },
  historyPlaceholder: { width: 26, height: 26, borderRadius: 13, backgroundColor: colors.surface2 },
  historyContent: { flex: 1 },
  historyName: { fontFamily: fontFamily.semiBold, fontSize: 13, color: colors.ink },
  historyDate: { fontFamily: fontFamily.regular, fontSize: 11, color: colors.ink3 },
  historyBadge: {
    width: 22,
    height: 22,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomBar: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: spacing[7],
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    backgroundColor: colors.white,
  },
  editBtn: {
    flex: 1,
    height: 52,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  editBtnLabel: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.cardTitle,
    color: colors.ink,
  },
  deleteBtn: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.roseSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

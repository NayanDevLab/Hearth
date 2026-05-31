// BigTaskRow — richer task row with checkbox, title, time, recurrence, category, priority tags, assignee.
// Supports optimistic toggle via onToggle prop.

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { Icon } from '@/components/icons/Icon';
import { Avatar } from '@/components/ui';
import { CATEGORY_CONFIG, MEMBER_CONFIG } from '@/constants/tasks';
import { type Task } from '@/db/modules/tasks';
import { colors, fontFamily, fontSize, radius, spacing } from '@/theme';

interface BigTaskRowProps {
  task: Task;
  onToggle?: (id: string, done: boolean) => void;
  onPress?: (id: string) => void;
}

export function BigTaskRow({ task, onToggle, onPress }: BigTaskRowProps) {
  const { t } = useTranslation('tasks');

  const cat = task.category ? CATEGORY_CONFIG[task.category] : null;
  const member = task.assignee ? MEMBER_CONFIG[task.assignee] : null;
  const isHigh = task.priority === 'high';

  let recurringLabel: string | null = null;
  if (task.recurrence === 'daily') recurringLabel = t('repeats_daily');
  else if (task.recurrence === 'weekly') recurringLabel = t('repeats_weekly');
  else if (task.recurrence === 'monthly') recurringLabel = t('repeats_monthly');

  function formatTime(raw?: string): string {
    if (!raw) return '';
    const d = new Date(raw);
    if (isNaN(d.getTime())) return raw;
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  return (
    <TouchableOpacity activeOpacity={0.7} onPress={() => onPress?.(task.id)} style={styles.row}>
      {/* Checkbox */}
      <TouchableOpacity
        hitSlop={{ top: 8, bottom: 8, left: 4, right: 8 }}
        onPress={() => onToggle?.(task.id, !task.done)}
        style={[styles.checkbox, !!task.done && styles.checkboxDone]}
        activeOpacity={0.7}
      >
        {!!task.done && <Icon.check size={14} color={colors.white} stroke={2.5} />}
      </TouchableOpacity>

      {/* Content */}
      <View style={styles.content}>
        <Text style={[styles.title, task.done && styles.titleDone]} numberOfLines={2}>
          {task.title}
        </Text>
        <View style={styles.tags}>
          {task.due_time && (
            <View style={styles.timeTag}>
              <Icon.clock size={12} color={colors.ink3} />
              <Text style={styles.timeText}>{formatTime(task.due_time)}</Text>
            </View>
          )}
          {recurringLabel && (
            <View style={styles.recurrenceTag}>
              <Icon.sparkle size={11} color={colors.ink2} />
              <Text style={styles.recurrenceText}>{recurringLabel}</Text>
            </View>
          )}
          {cat && (
            <View style={[styles.categoryTag, { backgroundColor: cat.soft }]}>
              <Text style={[styles.categoryText, { color: cat.color }]}>{cat.label}</Text>
            </View>
          )}
          {isHigh && (
            <View style={styles.highTag}>
              <Text style={styles.highText}>{t('priority_high')}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Assignee */}
      {member && (
        <View style={styles.assignee}>
          <Avatar initial={task.assignee!} color={member.color} size={28} />
          <Text style={styles.assigneeName}>{member.name}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 14,
    paddingHorizontal: spacing[7],
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 16,
    marginBottom: 8,
    marginHorizontal: spacing[7],
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: radius.xs,
    borderWidth: 1.75,
    borderColor: colors.ink4,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 2,
  },
  checkboxDone: {
    backgroundColor: colors.mint,
    borderWidth: 0,
  },
  content: { flex: 1, gap: 6, minWidth: 0 },
  title: {
    fontFamily: fontFamily.semiBold,
    fontSize: 15,
    color: colors.ink,
    lineHeight: 20,
  },
  titleDone: {
    textDecorationLine: 'line-through',
    opacity: 0.5,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    alignItems: 'center',
  },
  timeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.meta,
    color: colors.ink3,
  },
  recurrenceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill,
    backgroundColor: colors.surface2,
  },
  recurrenceText: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    color: colors.ink2,
  },
  categoryTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  categoryText: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
  },
  highTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill,
    backgroundColor: colors.roseSoft,
  },
  highText: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    color: colors.rose,
  },
  assignee: {
    alignItems: 'center',
    gap: 3,
    flexShrink: 0,
  },
  assigneeName: {
    fontFamily: fontFamily.semiBold,
    fontSize: 10,
    color: colors.ink3,
  },
});

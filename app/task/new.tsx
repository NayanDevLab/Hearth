// New task — uses shared FormField, FormBottomBar, MemberSelector, PickerRow, SimplePickerSheet.

import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { router } from 'expo-router';

import DateTimePicker, {
  DateTimePickerAndroid,
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FormBottomBar, FormField, PickerRow, SimplePickerSheet } from '@/components/forms';
import { Icon } from '@/components/icons/Icon';
import { MemberSelector, ScreenHeader } from '@/components/ui';
import {
  getPriorityOptions,
  REMINDER_OPTIONS,
  REPEAT_OPTIONS,
  repeatTagLabel,
} from '@/constants/tasks';
import { insertTask, type TaskPriority, type TaskRecurrence } from '@/db/modules/tasks';
import { useCategories } from '@/hooks';
import { colors, fontFamily, fontSize, radius, spacing } from '@/theme';
import { formatPickerLabel } from '@/utils';

export default function NewTaskScreen() {
  const { t } = useTranslation('tasks');
  const { t: tc } = useTranslation('common');
  const insets = useSafeAreaInsets();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [assignee, setAssignee] = useState<string | null>(null);
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [recurrence, setRecurrence] = useState<TaskRecurrence>(null);
  const [showRepeatPicker, setShowRepeatPicker] = useState(false);
  const [reminder, setReminder] = useState<string | null>(null);
  const [showReminderPicker, setShowReminderPicker] = useState(false);
  const [priority, setPriority] = useState<TaskPriority>('normal');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const categories = useCategories('tasks');
  const isValid = title.trim().length > 0;
  const priorityOpts = getPriorityOptions(t);
  const repeatLabel =
    REPEAT_OPTIONS.find((r) => r.value === recurrence)?.label ?? t('repeats_never');
  const reminderLabel =
    REMINDER_OPTIONS.find((r) => r.value === reminder)?.label ?? t('reminder_none');

  function openDatePicker() {
    if (Platform.OS !== 'android') {
      setShowDatePicker(true);
      return;
    }
    const initial = dueDate ?? new Date();
    DateTimePickerAndroid.open({
      value: initial,
      mode: 'date',
      onChange: (_ev, selectedDate) => {
        if (!selectedDate) return;
        DateTimePickerAndroid.open({
          value: selectedDate,
          mode: 'time',
          is24Hour: false,
          onChange: (_tEv, selectedTime) => {
            if (selectedTime) setDueDate(selectedTime);
          },
        });
      },
    });
  }

  async function handleCreate() {
    if (!isValid || saving) return;
    setSaving(true);
    try {
      await insertTask({
        id: `task_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        title: title.trim(),
        assignee: assignee ?? undefined,
        due_time: dueDate?.toISOString() ?? undefined,
        recurrence,
        recurrence_id: recurrence ? `series_${Date.now()}` : undefined,
        category: category ?? undefined,
        priority,
        notes: notes.trim() || undefined,
        reminder: reminder ?? undefined,
        tag:
          repeatTagLabel(recurrence, {
            daily: t('repeats_daily'),
            weekly: t('repeats_weekly'),
            monthly: t('repeats_monthly'),
            never: '',
          }) || undefined,
      });
      router.back();
    } catch {
      /* TODO: toast */
    } finally {
      setSaving(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ScreenHeader title={t('new_task')} onBack={() => router.back()} />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <FormField label={t('what_label')}>
            <TextInput
              style={[styles.titleInput, title.length > 0 && styles.inputFilled]}
              placeholder={t('what_placeholder')}
              placeholderTextColor={colors.ink4}
              value={title}
              onChangeText={setTitle}
              autoFocus
              returnKeyType="next"
              autoCapitalize="sentences"
            />
          </FormField>

          <FormField label={t('category_label')}>
            <View style={styles.chips}>
              {categories.map((c) => {
                const active = category === c.id;
                return (
                  <TouchableOpacity
                    key={c.id}
                    style={[
                      styles.categoryChip,
                      { backgroundColor: active ? c.color : colors.surface2 },
                    ]}
                    activeOpacity={0.75}
                    onPress={() => setCategory(active ? null : c.id)}
                  >
                    <Text style={styles.categoryChipEmoji}>{c.emoji}</Text>
                    <Text
                      style={[styles.categoryChipText, { color: active ? colors.white : c.color }]}
                    >
                      {c.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </FormField>

          <FormField label={t('assign_label')}>
            <MemberSelector selected={assignee} onChange={setAssignee} anyoneLabel={tc('done')} />
          </FormField>

          <FormField label={t('when_label')}>
            <PickerRow
              icon={<Icon.calendar size={18} color={colors.ink3} />}
              label={t('due')}
              value={dueDate ? formatPickerLabel(dueDate) : t('due_placeholder')}
              subtle={!dueDate}
              onPress={openDatePicker}
            />
            <PickerRow
              icon={<Icon.sparkle size={18} color={colors.ink3} />}
              label={t('repeats')}
              value={repeatLabel}
              subtle={recurrence === null}
              onPress={() => setShowRepeatPicker(true)}
            />
            <PickerRow
              icon={<Icon.bell size={18} color={colors.ink3} />}
              label={t('reminder')}
              value={reminderLabel}
              subtle={reminder === null}
              onPress={() => setShowReminderPicker(true)}
            />
          </FormField>

          <FormField label={t('priority_label')}>
            <View style={styles.priorityRow}>
              {priorityOpts.map((p) => {
                const active = priority === p.value;
                return (
                  <TouchableOpacity
                    key={p.value}
                    style={[
                      styles.priorityBtn,
                      active
                        ? { backgroundColor: p.soft, borderColor: p.color, borderWidth: 1.5 }
                        : styles.priorityBtnInactive,
                    ]}
                    activeOpacity={0.75}
                    onPress={() => setPriority(p.value)}
                  >
                    <Text style={[styles.priorityLabel, { color: active ? p.color : colors.ink2 }]}>
                      {p.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </FormField>

          <FormField label={t('notes_label')} style={styles.lastField}>
            <TextInput
              style={[styles.notesInput, notes.length > 0 && styles.inputFilled]}
              placeholder={t('notes_placeholder')}
              placeholderTextColor={colors.ink4}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </FormField>
        </ScrollView>

        <FormBottomBar
          onCancel={() => router.back()}
          onSubmit={handleCreate}
          submitLabel={t('create')}
          cancelLabel={tc('cancel')}
          loading={saving}
          disabled={!isValid}
        />

        {Platform.OS === 'ios' && showDatePicker && (
          <DateTimePicker
            value={dueDate ?? new Date()}
            mode="datetime"
            display="spinner"
            onChange={(_: DateTimePickerEvent, date?: Date) => {
              setShowDatePicker(false);
              if (date) setDueDate(date);
            }}
          />
        )}

        {showRepeatPicker && (
          <SimplePickerSheet
            title={t('repeats')}
            options={REPEAT_OPTIONS.map((r) => ({
              value: r.value as string | null,
              label: r.label,
            }))}
            selected={recurrence}
            onSelect={(v) => {
              setRecurrence(v as TaskRecurrence);
              setShowRepeatPicker(false);
            }}
            onClose={() => setShowRepeatPicker(false)}
          />
        )}
        {showReminderPicker && (
          <SimplePickerSheet
            title={t('reminder')}
            options={REMINDER_OPTIONS.map((r) => ({
              value: r.value as string | null,
              label: r.label,
            }))}
            selected={reminder}
            onSelect={(v) => {
              setReminder(v);
              setShowReminderPicker(false);
            }}
            onClose={() => setShowReminderPicker(false)}
          />
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { flex: 1 },
  content: { paddingHorizontal: spacing[7], paddingBottom: 20 },
  lastField: { marginBottom: 8 },
  titleInput: {
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: radius.sm,
    paddingVertical: 14,
    paddingHorizontal: 14,
    fontFamily: fontFamily.semiBold,
    fontSize: 16,
    color: colors.ink,
  },
  notesInput: {
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: radius.sm,
    padding: 14,
    minHeight: 90,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.body,
    color: colors.ink,
  },
  inputFilled: { borderColor: colors.primary },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.pill,
  },
  categoryChipEmoji: { fontSize: 13 },
  categoryChipText: { fontFamily: fontFamily.semiBold, fontSize: 13 },
  priorityRow: { flexDirection: 'row', gap: 8 },
  priorityBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priorityBtnInactive: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line },
  priorityLabel: { fontFamily: fontFamily.semiBold, fontSize: 14 },
});

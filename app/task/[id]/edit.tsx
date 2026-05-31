// Edit task screen — pre-filled form, same UI as new.tsx.

import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { router, useLocalSearchParams } from 'expo-router';

import DateTimePicker, {
  DateTimePickerAndroid,
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icons/Icon';
import { TaskDeleteSheet } from '@/components/tasks';
import { Avatar, Button, ScreenHeader } from '@/components/ui';
import {
  CATEGORIES,
  HOUSEHOLD_MEMBERS,
  REMINDER_OPTIONS,
  REPEAT_OPTIONS,
  repeatTagLabel,
} from '@/constants/tasks';
import {
  deleteTask,
  deleteTaskSeries,
  getTaskById,
  type Task,
  type TaskPriority,
  type TaskRecurrence,
  updateTask,
} from '@/db/modules/tasks';
import { colors, fontFamily, fontSize, radius, spacing } from '@/theme';

export default function EditTaskScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation('tasks');
  const { t: tc } = useTranslation('common');
  const insets = useSafeAreaInsets();

  const [original, setOriginal] = useState<Task | null>(null);
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
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [loadingTask, setLoadingTask] = useState(true);

  useEffect(() => {
    if (!id) return;
    getTaskById(id).then((task) => {
      if (!task) return;
      setOriginal(task);
      setTitle(task.title);
      setCategory(task.category ?? null);
      setAssignee(task.assignee ?? null);
      setDueDate(task.due_time ? new Date(task.due_time) : null);
      setRecurrence((task.recurrence as TaskRecurrence) ?? null);
      setReminder(task.reminder ?? null);
      setPriority(task.priority as TaskPriority);
      setNotes(task.notes ?? '');
      setLoadingTask(false);
    });
  }, [id]);

  const isValid = title.trim().length > 0;

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

  const handleSave = async () => {
    if (!isValid || saving || !id) return;
    setSaving(true);
    try {
      await updateTask(id, {
        title: title.trim(),
        assignee: assignee ?? undefined,
        due_time: dueDate?.toISOString() ?? undefined,
        recurrence,
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
      // TODO: toast
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteOne = async () => {
    if (!id) return;
    setDeleteVisible(false);
    await deleteTask(id);
    router.dismissAll();
  };

  const handleDeleteSeries = async () => {
    if (!original?.recurrence_id) return;
    setDeleteVisible(false);
    await deleteTaskSeries(original.recurrence_id);
    router.dismissAll();
  };

  const PRIORITY_OPTS: { value: TaskPriority; label: string; color: string; soft: string }[] = [
    { value: 'low', label: t('priority_low'), color: colors.ink3, soft: colors.surface2 },
    { value: 'normal', label: t('priority_normal'), color: colors.sky, soft: colors.skySoft },
    { value: 'high', label: t('priority_high'), color: colors.rose, soft: colors.roseSoft },
  ];

  const repeatLabel =
    REPEAT_OPTIONS.find((r) => r.value === recurrence)?.label ?? t('repeats_never');
  const reminderLabel =
    REMINDER_OPTIONS.find((r) => r.value === reminder)?.label ?? t('reminder_none');

  if (loadingTask) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ScreenHeader title={t('edit_task')} onBack={() => router.back()} />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Title */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>{t('what_label').toUpperCase()}</Text>
            <TextInput
              style={[styles.titleInput, title.length > 0 && styles.inputFilled]}
              placeholderTextColor={colors.ink4}
              value={title}
              onChangeText={setTitle}
              autoCapitalize="sentences"
            />
          </View>

          {/* Category */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>{t('category_label').toUpperCase()}</Text>
            <View style={styles.chips}>
              {CATEGORIES.map((c) => {
                const active = category === c.id;
                return (
                  <TouchableOpacity
                    key={c.id}
                    style={[styles.categoryChip, { backgroundColor: active ? c.color : c.soft }]}
                    activeOpacity={0.75}
                    onPress={() => setCategory(active ? null : c.id)}
                  >
                    <Text
                      style={[styles.categoryChipText, { color: active ? colors.white : c.color }]}
                    >
                      {c.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Assign to */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>{t('assign_label').toUpperCase()}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.memberRow}>
                {HOUSEHOLD_MEMBERS.map((m) => {
                  const selected = assignee === m.initial;
                  return (
                    <TouchableOpacity
                      key={m.initial}
                      style={[styles.memberTile, selected && styles.memberTileSelected]}
                      activeOpacity={0.75}
                      onPress={() => setAssignee(selected ? null : m.initial)}
                    >
                      <View style={styles.memberAvatarWrap}>
                        <Avatar initial={m.initial} color={m.color} size={44} />
                        {selected && (
                          <View style={styles.memberCheck}>
                            <Icon.check size={10} color={colors.white} stroke={3} />
                          </View>
                        )}
                      </View>
                      <Text style={[styles.memberName, selected && styles.memberNameSelected]}>
                        {m.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </View>

          {/* When */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>{t('when_label').toUpperCase()}</Text>
            <PickerRow
              icon={<Icon.calendar size={18} color={colors.ink3} />}
              label={t('due')}
              value={
                dueDate
                  ? dueDate.toLocaleDateString([], { month: 'short', day: 'numeric' }) +
                    ' · ' +
                    dueDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : t('due_placeholder')
              }
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
          </View>

          {/* Priority */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>{t('priority_label').toUpperCase()}</Text>
            <View style={styles.priorityRow}>
              {PRIORITY_OPTS.map((p) => {
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
          </View>

          {/* Notes */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>{t('notes_label').toUpperCase()}</Text>
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
          </View>

          {/* Delete in form */}
          <TouchableOpacity
            style={styles.deleteInForm}
            activeOpacity={0.8}
            onPress={() => setDeleteVisible(true)}
          >
            <Icon.trash size={18} color={colors.rose} />
            <Text style={styles.deleteInFormLabel}>{t('delete_task')}</Text>
          </TouchableOpacity>
        </ScrollView>

        <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) + 4 }]}>
          <Button
            variant="soft"
            label={tc('cancel')}
            onPress={() => router.back()}
            fullWidth={false}
            style={styles.cancelBtn}
          />
          <Button
            variant="accent"
            label={t('save')}
            loading={saving}
            disabled={!isValid}
            onPress={handleSave}
            style={styles.saveBtn}
          />
        </View>

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

      <TaskDeleteSheet
        visible={deleteVisible}
        taskTitle={original?.title ?? ''}
        isRecurring={Boolean(original?.recurrence)}
        onDeleteOne={handleDeleteOne}
        onDeleteSeries={original?.recurrence ? handleDeleteSeries : undefined}
        onCancel={() => setDeleteVisible(false)}
      />
    </KeyboardAvoidingView>
  );
}

function PickerRow({
  icon,
  label,
  value,
  subtle,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtle?: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.pickerRow} activeOpacity={0.7} onPress={onPress}>
      <View style={styles.pickerIcon}>{icon}</View>
      <View style={styles.pickerText}>
        <Text style={styles.pickerLabel}>{label}</Text>
        <Text style={[styles.pickerValue, subtle && styles.pickerValueSubtle]}>{value}</Text>
      </View>
      <Icon.arrow size={16} color={colors.ink4} />
    </TouchableOpacity>
  );
}

function SimplePickerSheet({
  title,
  options,
  selected,
  onSelect,
  onClose,
}: {
  title: string;
  options: { value: string | null; label: string }[];
  selected: string | null;
  onSelect: (v: string | null) => void;
  onClose: () => void;
}) {
  return (
    <View style={styles.pickerSheet}>
      <View style={styles.pickerSheetHandle} />
      <Text style={styles.pickerSheetTitle}>{title}</Text>
      {options.map((o) => {
        const active = selected === o.value;
        return (
          <TouchableOpacity
            key={String(o.value)}
            style={styles.pickerOption}
            activeOpacity={0.75}
            onPress={() => onSelect(o.value)}
          >
            <Text style={[styles.pickerOptionLabel, active && styles.pickerOptionLabelActive]}>
              {o.label}
            </Text>
            {active && <Icon.check size={16} color={colors.primary} stroke={2.5} />}
          </TouchableOpacity>
        );
      })}
      <TouchableOpacity style={styles.pickerClose} onPress={onClose}>
        <Text style={styles.pickerCloseLabel}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { flex: 1 },
  content: { paddingHorizontal: spacing[7], paddingBottom: 20 },
  fieldGroup: { marginBottom: 20 },
  fieldLabel: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.caption,
    color: colors.ink3,
    letterSpacing: 0.66,
    marginBottom: 10,
  },
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
  categoryChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.pill },
  categoryChipText: { fontFamily: fontFamily.semiBold, fontSize: 13 },
  memberRow: { flexDirection: 'row', gap: 10, paddingVertical: 4 },
  memberTile: {
    alignItems: 'center',
    gap: 6,
    minWidth: 64,
    borderRadius: 14,
    paddingHorizontal: 6,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.transparent,
  },
  memberTileSelected: { backgroundColor: colors.surface2, borderColor: colors.line },
  memberAvatarWrap: { position: 'relative' },
  memberCheck: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.mint,
    borderWidth: 2,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberName: { fontFamily: fontFamily.semiBold, fontSize: 11, color: colors.ink3 },
  memberNameSelected: { color: colors.ink },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.sm,
    marginBottom: 8,
  },
  pickerIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.xs,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerText: { flex: 1 },
  pickerLabel: { fontFamily: fontFamily.semiBold, fontSize: 13, color: colors.ink3 },
  pickerValue: { fontFamily: fontFamily.semiBold, fontSize: 15, color: colors.ink, marginTop: 2 },
  pickerValueSubtle: { color: colors.ink4 },
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
  deleteInForm: {
    height: 52,
    borderRadius: radius.pill,
    backgroundColor: colors.roseSoft,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 8,
  },
  deleteInFormLabel: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.cardTitle,
    color: colors.rose,
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
  cancelBtn: { flex: 1, height: 52 },
  saveBtn: { flex: 1.6 },
  pickerSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing[7],
    paddingBottom: 32,
  },
  pickerSheetHandle: {
    width: 36,
    height: 5,
    backgroundColor: colors.ink4,
    opacity: 0.4,
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 16,
  },
  pickerSheetTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 16,
    color: colors.ink,
    marginBottom: 14,
    textAlign: 'center',
  },
  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.line2,
  },
  pickerOptionLabel: { fontFamily: fontFamily.semiBold, fontSize: 15, color: colors.ink },
  pickerOptionLabelActive: { color: colors.primary },
  pickerClose: { marginTop: 8, paddingVertical: 14, alignItems: 'center' },
  pickerCloseLabel: { fontFamily: fontFamily.semiBold, fontSize: 15, color: colors.ink3 },
});

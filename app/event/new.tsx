// New event form — title, all-day toggle, date/time, category, attendees, location.

import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
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

import { FormBottomBar, FormField } from '@/components/forms';
import { MemberSelector, ScreenHeader } from '@/components/ui';
import { addMinutes, DURATION_CHIPS, formatDateKey } from '@/constants/calendar';
import { insertEvent } from '@/db/modules/events';
import { useCategories } from '@/hooks';
import { colors, fontFamily, fontSize, radius, spacing } from '@/theme';

interface EventForm {
  title: string;
  allDay: boolean;
  date: Date | null;
  startTime: string; // "HH:mm"
  endTime: string;
  category: string;
  attendees: string[];
  location: string;
  notes: string;
  recurrence: string | null;
  reminder: string | null;
  visibility: 'household' | 'just_me';
}

const INITIAL_FORM: EventForm = {
  title: '',
  allDay: false,
  date: null,
  startTime: '',
  endTime: '',
  category: 'family',
  attendees: [],
  location: '',
  notes: '',
  recurrence: null,
  reminder: null,
  visibility: 'household',
};

export default function NewEventScreen() {
  const { t } = useTranslation('calendar');
  const { t: tc } = useTranslation('common');
  const insets = useSafeAreaInsets();

  const categories = useCategories('calendar');
  const [form, setForm] = useState<EventForm>(INITIAL_FORM);
  const [saving, setSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  function update<K extends keyof EventForm>(key: K, val: EventForm[K]) {
    setForm((prev) => ({ ...prev, [key]: val }));
  }

  const isValid = form.title.trim().length > 0 && form.date !== null;

  function openDatePicker() {
    if (Platform.OS !== 'android') {
      setShowDatePicker(true);
      return;
    }
    DateTimePickerAndroid.open({
      value: form.date ?? new Date(),
      mode: 'date',
      onChange: (_ev, d) => {
        if (d) update('date', d);
      },
    });
  }

  function openTimePicker(field: 'startTime' | 'endTime') {
    if (Platform.OS === 'android') {
      const [h, m] = (form[field] || '09:00').split(':').map(Number);
      const base = new Date();
      base.setHours(h ?? 9, m ?? 0, 0, 0);
      DateTimePickerAndroid.open({
        value: base,
        mode: 'time',
        is24Hour: false,
        onChange: (_ev, d) => {
          if (!d) return;
          const hh = String(d.getHours()).padStart(2, '0');
          const mm = String(d.getMinutes()).padStart(2, '0');
          update(field, `${hh}:${mm}`);
        },
      });
    }
  }

  function applyDurationChip(minutes: number) {
    const base = form.startTime || '09:00';
    update('endTime', addMinutes(base, minutes));
  }

  function formatTimeDisplay(t: string): string {
    if (!t) return '—';
    const [h, m] = t.split(':').map(Number);
    const suffix = (h ?? 0) >= 12 ? 'PM' : 'AM';
    const h12 = (h ?? 0) % 12 === 0 ? 12 : (h ?? 0) % 12;
    return `${h12}:${String(m ?? 0).padStart(2, '0')} ${suffix}`;
  }

  async function handleCreate() {
    if (!isValid || saving || !form.date) return;
    setSaving(true);
    try {
      await insertEvent({
        id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        title: form.title.trim(),
        category: form.category,
        date: formatDateKey(form.date),
        start_time: form.allDay ? undefined : form.startTime || undefined,
        end_time: form.allDay ? undefined : form.endTime || undefined,
        all_day: form.allDay,
        location: form.location.trim() || undefined,
        notes: form.notes.trim() || undefined,
        visibility: form.visibility,
        recurrence: form.recurrence ?? undefined,
        reminder: form.reminder ?? undefined,
        attendees: form.attendees,
      });
      router.back();
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
        <ScreenHeader title={t('new_event')} onBack={() => router.back()} />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Title */}
          <FormField label={t('screen_title')}>
            <View style={styles.titleRow}>
              {form.category && (
                <Text style={styles.catEmoji}>
                  {categories.find((c) => c.id === form.category)?.emoji ?? '📅'}
                </Text>
              )}
              <TextInput
                style={[styles.titleInput, form.title.length > 0 && styles.inputFilled]}
                placeholder="e.g. Dentist, Soccer practice"
                placeholderTextColor={colors.ink4}
                value={form.title}
                onChangeText={(v) => update('title', v)}
                autoFocus
                autoCapitalize="sentences"
              />
            </View>
          </FormField>

          {/* All day toggle */}
          <View style={styles.allDayRow}>
            <View>
              <Text style={styles.allDayLabel}>{t('all_day')}</Text>
              <Text style={styles.allDayHint}>{t('all_day_hint')}</Text>
            </View>
            <Switch
              value={form.allDay}
              onValueChange={(v) => update('allDay', v)}
              trackColor={{ false: colors.line, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>

          {/* When */}
          <FormField label={t('when')}>
            {/* Date + From + To */}
            <View style={styles.whenRow}>
              <TouchableOpacity
                style={[styles.whenBox, styles.whenBoxDate]}
                activeOpacity={0.7}
                onPress={openDatePicker}
              >
                <Text style={styles.whenBoxLabel}>Date</Text>
                <Text style={[styles.whenBoxValue, !form.date && styles.whenBoxPlaceholder]}>
                  {form.date
                    ? form.date.toLocaleDateString([], {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })
                    : t('pick_date')}
                </Text>
              </TouchableOpacity>
              {!form.allDay && (
                <>
                  <TouchableOpacity
                    style={styles.whenBox}
                    activeOpacity={0.7}
                    onPress={() => openTimePicker('startTime')}
                  >
                    <Text style={styles.whenBoxLabel}>{t('from')}</Text>
                    <Text
                      style={[styles.whenBoxValue, !form.startTime && styles.whenBoxPlaceholder]}
                    >
                      {form.startTime ? formatTimeDisplay(form.startTime) : '—'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.whenBox}
                    activeOpacity={0.7}
                    onPress={() => openTimePicker('endTime')}
                  >
                    <Text style={styles.whenBoxLabel}>{t('to')}</Text>
                    <Text style={[styles.whenBoxValue, !form.endTime && styles.whenBoxPlaceholder]}>
                      {form.endTime ? formatTimeDisplay(form.endTime) : '—'}
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
            {/* Duration chips */}
            {!form.allDay && (
              <View style={styles.durationRow}>
                {DURATION_CHIPS.map((chip) => (
                  <TouchableOpacity
                    key={chip.minutes}
                    style={styles.durationChip}
                    activeOpacity={0.75}
                    onPress={() => applyDurationChip(chip.minutes)}
                  >
                    <Text style={styles.durationChipText}>{chip.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </FormField>

          {/* Category */}
          <FormField label={t('category_label')}>
            <View style={styles.catGrid}>
              {categories.map((cat) => {
                const active = form.category === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.catTile,
                      { backgroundColor: active ? cat.color : colors.surface2 },
                    ]}
                    activeOpacity={0.75}
                    onPress={() => update('category', active ? '' : cat.id)}
                  >
                    <Text style={styles.catTileEmoji}>{cat.emoji}</Text>
                    <Text
                      style={[styles.catTileLabel, { color: active ? colors.white : cat.color }]}
                    >
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </FormField>

          {/* Who's going */}
          <FormField label={t('who_going')}>
            <MemberSelector
              selected={form.attendees.length > 0 ? form.attendees[0] : null}
              onChange={(init) => {
                if (!init) {
                  update('attendees', []);
                  return;
                }
                const prev = form.attendees;
                update(
                  'attendees',
                  prev.includes(init) ? prev.filter((i) => i !== init) : [...prev, init]
                );
              }}
              anyoneLabel="Anyone"
            />
          </FormField>

          {/* Location */}
          <FormField label={t('location_label')}>
            <TextInput
              style={[styles.input, form.location.length > 0 && styles.inputFilled]}
              placeholder={t('location_placeholder')}
              placeholderTextColor={colors.ink4}
              value={form.location}
              onChangeText={(v) => update('location', v)}
            />
          </FormField>

          {/* Notes */}
          <FormField label={t('notes_label')}>
            <TextInput
              style={[styles.notesInput, form.notes.length > 0 && styles.inputFilled]}
              placeholder={t('notes_placeholder')}
              placeholderTextColor={colors.ink4}
              value={form.notes}
              onChangeText={(v) => update('notes', v)}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </FormField>
        </ScrollView>

        <FormBottomBar
          onCancel={() => router.back()}
          onSubmit={handleCreate}
          submitLabel={t('create_event')}
          cancelLabel={tc('cancel')}
          loading={saving}
          disabled={!isValid}
        />

        {Platform.OS === 'ios' && showDatePicker && (
          <DateTimePicker
            value={form.date ?? new Date()}
            mode="date"
            display="spinner"
            onChange={(_: DateTimePickerEvent, d?: Date) => {
              setShowDatePicker(false);
              if (d) update('date', d);
            }}
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: radius.sm,
    paddingHorizontal: 14,
    backgroundColor: colors.white,
  },
  catEmoji: { fontSize: 20 },
  titleInput: {
    flex: 1,
    paddingVertical: 13,
    fontFamily: fontFamily.semiBold,
    fontSize: 15,
    color: colors.ink,
  },
  inputFilled: { borderColor: colors.primary },
  allDayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: 20,
  },
  allDayLabel: { fontFamily: fontFamily.semiBold, fontSize: fontSize.body, color: colors.ink },
  allDayHint: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.meta,
    color: colors.ink3,
    marginTop: 2,
  },
  whenRow: { flexDirection: 'row', gap: 8 },
  whenBox: {
    flex: 1,
    padding: 12,
    backgroundColor: colors.white,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.line,
  },
  whenBoxDate: { flex: 1.8 },
  whenBoxLabel: {
    fontFamily: fontFamily.semiBold,
    fontSize: 11,
    color: colors.ink3,
    marginBottom: 3,
  },
  whenBoxValue: { fontFamily: fontFamily.bold, fontSize: 14, color: colors.ink },
  whenBoxPlaceholder: { color: colors.ink4, fontFamily: fontFamily.regular },
  durationRow: { flexDirection: 'row', gap: 8, marginTop: 10, flexWrap: 'wrap' },
  durationChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.line,
  },
  durationChipText: { fontFamily: fontFamily.semiBold, fontSize: 13, color: colors.ink2 },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catTile: { width: '18%', paddingVertical: 10, borderRadius: 12, alignItems: 'center', gap: 4 },
  catTileEmoji: { fontSize: 20 },
  catTileLabel: { fontFamily: fontFamily.semiBold, fontSize: 10, textAlign: 'center' },
  input: {
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: radius.sm,
    paddingVertical: 13,
    paddingHorizontal: 14,
    fontFamily: fontFamily.semiBold,
    fontSize: 15,
    color: colors.ink,
    backgroundColor: colors.white,
  },
  notesInput: {
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: radius.sm,
    padding: 14,
    minHeight: 80,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.body,
    color: colors.ink,
    backgroundColor: colors.white,
  },
});

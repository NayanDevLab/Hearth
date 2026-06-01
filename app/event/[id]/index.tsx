// Event detail — hero card, quick actions, detail rows, attendees, edit/delete.

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

import { EventDeleteSheet, EventHeroCard } from '@/components/calendar';
import { PickerRow } from '@/components/forms';
import { Icon } from '@/components/icons/Icon';
import { ErrorState } from '@/components/shared';
import { Avatar, ScreenHeader } from '@/components/ui';
import {
  EVENT_REMINDER_OPTIONS,
  RECURRENCE_OPTIONS,
  VISIBILITY_OPTIONS,
} from '@/constants/calendar';
import { MEMBER_CONFIG } from '@/constants/tasks';
import {
  deleteEvent,
  deleteEventAndFuture,
  deleteEventSeries,
  type EventWithAttendees,
  getEventById,
} from '@/db/modules/events';
import { colors, fontFamily, fontSize, radius, spacing } from '@/theme';

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation('calendar');
  const { t: tc } = useTranslation('common');
  const insets = useSafeAreaInsets();

  const [event, setEvent] = useState<EventWithAttendees | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [deleteVisible, setDeleteVisible] = useState(false);

  const loadEvent = useCallback(async () => {
    if (!id) return;
    try {
      const ev = await getEventById(id);
      setEvent(ev);
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Error'));
    } finally {
      setLoading(false);
    }
  }, [id]);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    loadEvent();
  }, [loadEvent]);
  /* eslint-enable react-hooks/set-state-in-effect */

  async function handleDeleteJustThis() {
    if (!event) return;
    setDeleteVisible(false);
    await deleteEvent(event.id);
    router.back();
  }

  async function handleDeleteFuture() {
    if (!event) return;
    setDeleteVisible(false);
    await deleteEventAndFuture(event.id, event.date);
    router.back();
  }

  async function handleDeleteSeries() {
    if (!event?.recurrence_id) return;
    setDeleteVisible(false);
    await deleteEventSeries(event.recurrence_id);
    router.back();
  }

  const recLabel = event?.recurrence
    ? (RECURRENCE_OPTIONS.find((r) => r.value === event.recurrence)?.label ?? event.recurrence)
    : tc('done'); // "None"

  const reminderLabel = event?.reminder
    ? (EVENT_REMINDER_OPTIONS.find((r) => r.value === event.reminder)?.label ?? event.reminder)
    : 'None';

  const visLabel =
    VISIBILITY_OPTIONS.find((v) => v.value === event?.visibility)?.label ?? 'Household';

  const goingInitials =
    event?.attendees.filter((a) => a.status === 'going').map((a) => a.member_initial) ?? [];
  const goingNames = goingInitials
    .map((i) => MEMBER_CONFIG[i]?.name)
    .filter(Boolean)
    .join(' & ');

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (error || !event) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ScreenHeader title="Event" onBack={() => router.back()} />
        <ErrorState title={t('error_title')} retryLabel={t('error_retry')} onRetry={loadEvent} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader
        title="Event"
        onBack={() => router.back()}
        right={
          <TouchableOpacity
            style={styles.moreBtn}
            activeOpacity={0.7}
            onPress={() => router.push(`/event/${id}/edit` as never)}
          >
            <Icon.more size={20} color={colors.ink} />
          </TouchableOpacity>
        }
      />

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <EventHeroCard event={event} />

        {/* Quick action buttons */}
        <View style={styles.quickActions}>
          {event.location && (
            <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7}>
              <Icon.pin size={20} color={colors.ink2} />
              <Text style={styles.actionLabel}>{t('directions')}</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.actionBtn}
            activeOpacity={0.7}
            onPress={() => router.push('/task/new' as never)}
          >
            <Icon.tasks size={20} color={colors.ink2} />
            <Text style={styles.actionLabel}>{t('add_task')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtn}
            activeOpacity={0.7}
            onPress={() => router.push(`/event/${id}/edit` as never)}
          >
            <Icon.calendar size={20} color={colors.ink2} />
            <Text style={styles.actionLabel}>{t('reschedule')}</Text>
          </TouchableOpacity>
        </View>

        {/* Detail rows */}
        <View style={styles.rows}>
          {event.location ? (
            <PickerRow
              icon={<Icon.pin size={18} color={colors.ink3} />}
              label="Location"
              value={event.location}
              onPress={() => {}}
            />
          ) : null}
          {goingInitials.length > 0 ? (
            <PickerRow
              icon={<Icon.users size={18} color={colors.ink3} />}
              label={t('going')}
              value={goingNames}
              onPress={() => {}}
            />
          ) : null}
          <PickerRow
            icon={<Icon.bell size={18} color={colors.ink3} />}
            label={t('reminder_label')}
            value={reminderLabel}
            onPress={() => {}}
          />
          <PickerRow
            icon={<Icon.sparkle size={18} color={colors.ink3} />}
            label={t('repeats_label')}
            value={recLabel}
            onPress={() => {}}
          />
          <PickerRow
            icon={<Icon.shield size={18} color={colors.ink3} />}
            label={t('visibility_label')}
            value={visLabel}
            onPress={() => {}}
          />
        </View>

        {/* Who's going */}
        {goingInitials.length > 0 && (
          <View style={styles.whoSection}>
            <Text style={styles.whoLabel}>{t('who_going').toUpperCase()}</Text>
            {goingInitials.map((initial) => {
              const m = MEMBER_CONFIG[initial];
              if (!m) return null;
              return (
                <View key={initial} style={styles.whoRow}>
                  <Avatar initial={initial} color={m.color} size={36} />
                  <View style={styles.whoInfo}>
                    <Text style={styles.whoName}>{m.name}</Text>
                  </View>
                  <View style={styles.goingBadge}>
                    <Icon.check size={12} color="#2F8A5E" stroke={2.5} />
                    <Text style={styles.goingText}>{t('going')}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        <View style={styles.footer} />
      </ScrollView>

      {/* Bottom bar */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        <TouchableOpacity
          style={styles.editBtn}
          activeOpacity={0.8}
          onPress={() => router.push(`/event/${id}/edit` as never)}
        >
          <Icon.edit size={18} color={colors.ink} />
          <Text style={styles.editBtnLabel}>{tc('edit')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.rescheduleBtn} activeOpacity={0.8}>
          <Icon.calendar size={18} color={colors.ink} />
          <Text style={styles.editBtnLabel}>{t('reschedule')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteBtn}
          activeOpacity={0.8}
          onPress={() => setDeleteVisible(true)}
        >
          <Icon.trash size={20} color={colors.rose} />
        </TouchableOpacity>
      </View>

      <EventDeleteSheet
        visible={deleteVisible}
        eventTitle={event.title}
        isRecurring={!!event.recurrence}
        dayLabel={new Date(`${event.date}T00:00:00`).toLocaleDateString([], { weekday: 'long' })}
        recurrenceLabel={recLabel}
        notifyInitials={goingInitials}
        onJustThis={handleDeleteJustThis}
        onThisAndFuture={!!event.recurrence ? handleDeleteFuture : undefined}
        onWholeSeries={event.recurrence_id ? handleDeleteSeries : undefined}
        onCancel={() => setDeleteVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  moreBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: { flex: 1 },
  quickActions: { flexDirection: 'row', gap: 8, paddingHorizontal: spacing[7], marginBottom: 18 },
  actionBtn: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    gap: 4,
  },
  actionLabel: { fontFamily: fontFamily.semiBold, fontSize: 11, color: colors.ink2 },
  rows: { paddingHorizontal: spacing[7], gap: 0 },
  whoSection: { paddingHorizontal: spacing[7], marginTop: 18 },
  whoLabel: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.caption,
    color: colors.ink3,
    letterSpacing: 0.66,
    marginBottom: 10,
  },
  whoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.line2,
  },
  whoInfo: { flex: 1 },
  whoName: { fontFamily: fontFamily.semiBold, fontSize: fontSize.body, color: colors.ink },
  goingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.mintSoft,
  },
  goingText: { fontFamily: fontFamily.bold, fontSize: 11, color: '#2F8A5E' },
  footer: { height: 100 },
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
  rescheduleBtn: {
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

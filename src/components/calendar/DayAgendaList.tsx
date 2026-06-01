// DayAgendaList — the day events list shown below the month grid.
// Shows day header + list of EventRows.

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { formatDateKey } from '@/constants/calendar';
import { type CalendarEvent } from '@/db/modules/events';
import { colors, fontFamily, fontSize, spacing } from '@/theme';

import { EventRow } from './EventRow';

interface DayAgendaListProps {
  date: string; // "2026-03-17"
  events: CalendarEvent[];
  attendeeMap: Record<string, string[]>; // eventId → [initials]
  onEventPress: (id: string) => void;
  onAddEvent: () => void;
}

export function DayAgendaList({
  date,
  events,
  attendeeMap,
  onEventPress,
  onAddEvent,
}: DayAgendaListProps) {
  const { t } = useTranslation('calendar');

  const d = new Date(`${date}T00:00:00`);
  const weekday = d.toLocaleDateString([], { weekday: 'long' }).toUpperCase();
  const dayMonth = d.toLocaleDateString([], { month: 'long', day: 'numeric' });
  const isToday = date === formatDateKey(new Date());

  return (
    <View style={styles.container}>
      {/* Day header */}
      <View style={styles.dayHeader}>
        <View>
          <Text style={styles.weekday}>{isToday ? t('today').toUpperCase() : weekday}</Text>
          <Text style={styles.dayMonth}>{dayMonth}</Text>
        </View>
        <Text style={styles.count}>
          {events.length > 0 ? t('n_events', { n: events.length }) : ''}
        </Text>
      </View>

      {/* Events */}
      {events.length === 0 ? (
        <View style={styles.emptyDay}>
          <Text style={styles.emptyText}>{t('no_events')}</Text>
          <TouchableOpacity onPress={onAddEvent} activeOpacity={0.7}>
            <Text style={styles.addEventLink}>+ {t('new_event')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        events.map((event) => (
          <EventRow
            key={event.id}
            event={event}
            attendeeInitials={attendeeMap[event.id] ?? []}
            onPress={onEventPress}
          />
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 4 },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: spacing[7],
    paddingVertical: 12,
  },
  weekday: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.caption,
    color: colors.ink3,
    letterSpacing: 0.8,
  },
  dayMonth: {
    fontFamily: fontFamily.extraBold,
    fontSize: 22,
    color: colors.ink,
    letterSpacing: -0.44,
  },
  count: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.meta,
    color: colors.primary,
  },
  emptyDay: {
    paddingHorizontal: spacing[7],
    paddingVertical: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  emptyText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.body,
    color: colors.ink3,
  },
  addEventLink: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.body,
    color: colors.primary,
  },
});

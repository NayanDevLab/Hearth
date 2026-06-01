// EventHeroCard — the mint-soft hero card shown at the top of the event detail screen.
// Shows category badge, relative time, title, and date/time range.

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { EVENT_CAT_MAP, formatDisplayDate, formatTime12 } from '@/constants/calendar';
import { type CalendarEvent } from '@/db/modules/events';
import { colors, fontFamily, fontSize, radius, spacing } from '@/theme';

interface EventHeroCardProps {
  event: CalendarEvent;
}

export function EventHeroCard({ event }: EventHeroCardProps) {
  const cat = event.category ? EVENT_CAT_MAP[event.category] : null;

  function getRelativeLabel(): string | null {
    if (event.all_day) return null;
    if (!event.start_time) return null;
    const [h, m] = event.start_time.split(':').map(Number);
    const now = new Date();
    const eventToday = new Date();
    eventToday.setHours(h, m, 0, 0);
    const diffMs = eventToday.getTime() - now.getTime();
    if (diffMs < 0 || diffMs > 24 * 60 * 60 * 1000) return null;
    const hours = Math.round(diffMs / (1000 * 60 * 60));
    if (hours < 1) return 'Soon';
    return `In ${hours} hour${hours > 1 ? 's' : ''}`;
  }

  const relative = getRelativeLabel();
  const bgColor = cat?.soft ?? colors.mintSoft;
  const timeRange = event.all_day
    ? 'All day'
    : `${event.start_time ? formatTime12(event.start_time) : '—'}${event.end_time ? ` – ${formatTime12(event.end_time)}` : ''}`;

  return (
    <View style={[styles.card, { backgroundColor: bgColor }]}>
      <View style={styles.badges}>
        {cat && (
          <View style={styles.catBadge}>
            <Text style={styles.catEmoji}>{cat.emoji}</Text>
            <Text style={[styles.catLabel, { color: cat.color }]}>{cat.label}</Text>
          </View>
        )}
        {relative && (
          <View style={styles.relBadge}>
            <Text style={styles.relLabel}>{relative}</Text>
          </View>
        )}
      </View>
      <Text style={styles.title}>{event.title}</Text>
      <Text style={styles.dateTime}>
        {formatDisplayDate(event.date)} · {timeRange}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing[7],
    marginBottom: 18,
    padding: 16,
    borderRadius: radius.lg,
    gap: 6,
  },
  badges: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  catBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  catEmoji: { fontSize: 13 },
  catLabel: { fontFamily: fontFamily.bold, fontSize: 11 },
  relBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  relLabel: { fontFamily: fontFamily.bold, fontSize: 11, color: colors.ink2 },
  title: {
    fontFamily: fontFamily.extraBold,
    fontSize: 22,
    letterSpacing: -0.44,
    color: colors.ink,
  },
  dateTime: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.body,
    color: colors.ink3,
  },
});

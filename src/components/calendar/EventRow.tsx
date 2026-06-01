// EventRow — single event in the day agenda list.
// Shows: time | colored left accent | title + location | attendee avatar.

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Avatar } from '@/components/ui';
import { EVENT_CAT_MAP, formatTime12 } from '@/constants/calendar';
import { MEMBER_CONFIG } from '@/constants/tasks';
import { type CalendarEvent } from '@/db/modules/events';
import { colors, fontFamily, fontSize, radius } from '@/theme';

interface EventRowProps {
  event: CalendarEvent;
  attendeeInitials?: string[];
  onPress: (id: string) => void;
}

export function EventRow({ event, attendeeInitials = [], onPress }: EventRowProps) {
  const cat = event.category ? EVENT_CAT_MAP[event.category] : null;
  const accentColor = cat?.color ?? colors.primary;

  return (
    <TouchableOpacity style={styles.row} activeOpacity={0.7} onPress={() => onPress(event.id)}>
      {/* Time column */}
      <View style={styles.timeCol}>
        {event.all_day ? (
          <View style={styles.allDayBadge}>
            <Text style={styles.allDayText}>ALL DAY</Text>
          </View>
        ) : (
          <Text style={styles.timeText}>
            {event.start_time ? formatTime12(event.start_time) : '—'}
          </Text>
        )}
      </View>

      {/* Left accent bar */}
      <View style={[styles.accent, { backgroundColor: accentColor }]} />

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.titleRow}>
          {cat && <Text style={styles.catEmoji}>{cat.emoji}</Text>}
          <Text style={styles.title} numberOfLines={1}>
            {event.title}
          </Text>
        </View>
        {event.location ? (
          <Text style={styles.location} numberOfLines={1}>
            {event.location}
          </Text>
        ) : null}
      </View>

      {/* Attendee avatars */}
      <View style={styles.avatarStack}>
        {attendeeInitials.slice(0, 2).map((initial, i) => {
          const member = MEMBER_CONFIG[initial];
          if (!member) return null;
          return (
            <View key={initial} style={[styles.avatarWrap, i > 0 && { marginLeft: -6 }]}>
              <Avatar initial={initial} color={member.color} size={22} ring />
            </View>
          );
        })}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 22,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.line2,
  },
  timeCol: {
    width: 68,
    alignItems: 'flex-end',
    flexShrink: 0,
  },
  timeText: {
    fontFamily: fontFamily.semiBold,
    fontSize: 12,
    color: colors.ink3,
    textAlign: 'right',
  },
  allDayBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.xs,
    backgroundColor: colors.mintSoft,
  },
  allDayText: {
    fontFamily: fontFamily.bold,
    fontSize: 9,
    color: '#2F8A5E',
    letterSpacing: 0.3,
  },
  accent: {
    width: 3,
    height: 38,
    borderRadius: 2,
    flexShrink: 0,
  },
  content: { flex: 1, minWidth: 0 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  catEmoji: { fontSize: 13 },
  title: {
    fontFamily: fontFamily.semiBold,
    fontSize: 14,
    color: colors.ink,
    flex: 1,
  },
  location: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.meta,
    color: colors.ink3,
    marginTop: 2,
  },
  avatarStack: { flexDirection: 'row', flexShrink: 0 },
  avatarWrap: {},
});

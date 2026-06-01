// MonthGrid — monthly calendar grid with per-member colored dots and day selection.

import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { formatDateKey, getMonthDays, WEEK_HEADERS } from '@/constants/calendar';
import { colors, fontFamily, fontSize } from '@/theme';

interface MonthGridProps {
  year: number;
  month: number; // 0-indexed
  selectedDate: string; // "2026-03-17"
  dotMap: Record<string, string[]>; // date → [memberColor, ...]
  onSelectDay: (date: string) => void;
}

export function MonthGrid({ year, month, selectedDate, dotMap, onSelectDay }: MonthGridProps) {
  const todayKey = formatDateKey(new Date());
  const days = useMemo(() => getMonthDays(year, month), [year, month]);

  return (
    <View style={styles.container}>
      {/* Day-of-week headers */}
      <View style={styles.headerRow}>
        {WEEK_HEADERS.map((h, i) => (
          <Text key={i} style={styles.weekHeader}>
            {h}
          </Text>
        ))}
      </View>

      {/* Day cells — 6 rows × 7 */}
      <View style={styles.grid}>
        {days.map((day, idx) => {
          if (!day) return <View key={`pad-${idx}`} style={styles.cell} />;
          const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isToday = dateKey === todayKey;
          const isSelected = dateKey === selectedDate;
          const dots = (dotMap[dateKey] ?? []).slice(0, 4);

          return (
            <TouchableOpacity
              key={dateKey}
              style={styles.cell}
              activeOpacity={0.7}
              onPress={() => onSelectDay(dateKey)}
            >
              <View
                style={[
                  styles.dayCircle,
                  isToday && styles.dayCircleToday,
                  isSelected && !isToday && styles.dayCircleSelected,
                ]}
              >
                <Text
                  style={[
                    styles.dayNum,
                    isToday && styles.dayNumToday,
                    isSelected && !isToday && styles.dayNumSelected,
                  ]}
                >
                  {day}
                </Text>
              </View>
              {/* Colored dots */}
              <View style={styles.dotRow}>
                {dots.map((color, di) => (
                  <View key={di} style={[styles.dot, { backgroundColor: color }]} />
                ))}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 8 },
  headerRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  weekHeader: {
    flex: 1,
    textAlign: 'center',
    fontFamily: fontFamily.bold,
    fontSize: fontSize.caption,
    color: colors.ink3,
    letterSpacing: 0.5,
    paddingVertical: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: `${100 / 7}%`,
    alignItems: 'center',
    paddingVertical: 3,
  },
  dayCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircleToday: {
    backgroundColor: colors.ink,
  },
  dayCircleSelected: {
    backgroundColor: colors.primarySoft,
  },
  dayNum: {
    fontFamily: fontFamily.semiBold,
    fontSize: 14,
    color: colors.ink,
  },
  dayNumToday: {
    color: colors.white,
    fontFamily: fontFamily.bold,
  },
  dayNumSelected: {
    color: colors.primary,
    fontFamily: fontFamily.bold,
  },
  dotRow: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 2,
    height: 5,
    alignItems: 'center',
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
});

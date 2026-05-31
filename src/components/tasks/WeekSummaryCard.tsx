// WeekSummaryCard — "THIS WEEK · X of Y done" gradient card with per-person mini bars.

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { colors, fontFamily, fontSize, radius, spacing } from '@/theme';

interface PersonStat {
  assignee: string;
  total: number;
  done: number;
  color: string;
}

interface WeekSummaryCardProps {
  total: number;
  done: number;
  byPerson: PersonStat[];
}

export function WeekSummaryCard({ total, done, byPerson }: WeekSummaryCardProps) {
  const { t } = useTranslation('tasks');
  const pct = total > 0 ? done / total : 0;

  return (
    <View style={styles.card}>
      <View style={styles.left}>
        <Text style={styles.weekLabel}>{t('this_week').toUpperCase()}</Text>
        <Text style={styles.summary}>{t('week_summary', { done, total })}</Text>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${Math.round(pct * 100)}%` }]} />
        </View>
      </View>

      {byPerson.length > 0 && (
        <View style={styles.personBars}>
          {byPerson.slice(0, 4).map((p) => {
            const personPct = p.total > 0 ? p.done / p.total : 0;
            return (
              <View key={p.assignee} style={styles.personRow}>
                <Text style={styles.personInitial}>{p.assignee}</Text>
                <View style={styles.personTrack}>
                  <View
                    style={[
                      styles.personFill,
                      { width: `${Math.round(personPct * 100)}%`, backgroundColor: p.color },
                    ]}
                  />
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing[7],
    marginBottom: 18,
    padding: 16,
    borderRadius: radius.lg,
    backgroundColor: '#F9EFE9',
    borderWidth: 1,
    borderColor: colors.line,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  left: { flex: 1 },
  weekLabel: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.caption,
    color: colors.primaryInk,
    letterSpacing: 0.88,
    marginBottom: 4,
  },
  summary: {
    fontFamily: fontFamily.extraBold,
    fontSize: 22,
    letterSpacing: -0.44,
    color: colors.ink,
    marginBottom: 8,
  },
  track: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(0,0,0,0.08)',
    overflow: 'hidden',
    width: '80%',
  },
  fill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  personBars: {
    gap: 5,
    alignItems: 'flex-end',
  },
  personRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  personInitial: {
    fontFamily: fontFamily.bold,
    fontSize: 10,
    color: colors.ink3,
    width: 12,
    textAlign: 'right',
  },
  personTrack: {
    width: 56,
    height: 5,
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  personFill: {
    height: '100%',
    borderRadius: 3,
  },
});

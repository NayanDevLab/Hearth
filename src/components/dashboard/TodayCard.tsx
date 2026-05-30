// TodayCard — dark gradient summary with task progress bar and stats.

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';

import Svg, { Circle } from 'react-native-svg';

import { colors, fontFamily, fontSize, spacing } from '@/theme';

function formatTodayLabel(): string {
  const now = new Date();
  const weekday = now.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
  const month = now.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  return `TODAY · ${weekday} ${month} ${now.getDate()}`;
}

interface TodayCardProps {
  totalTasks?: number;
  doneTasks?: number;
  amountDue?: string;
}

export function TodayCard({ totalTasks = 4, doneTasks = 2, amountDue = '$84' }: TodayCardProps) {
  const toGo = totalTasks - doneTasks;
  const pct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  return (
    <LinearGradient
      colors={['#3D2218', '#22242E']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      {/* Decorative ring */}
      <Svg style={styles.ring} width={180} height={180} viewBox="0 0 180 180">
        <Circle
          cx={140}
          cy={40}
          r={80}
          stroke="white"
          strokeWidth={20}
          opacity={0.12}
          fill="none"
        />
      </Svg>

      <Text style={styles.dateLabel}>{formatTodayLabel()}</Text>
      <Text style={styles.summary}>
        {totalTasks} things on the list.{'\n'}You&apos;re {pct}% done.
      </Text>

      {/* Progress track */}
      <View style={styles.track}>
        <LinearGradient
          colors={[colors.butter, colors.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.fill, { width: `${pct}%` }]}
        />
      </View>

      {/* Stats row */}
      <View style={styles.stats}>
        <Stat value={String(doneTasks)} label="done" />
        <Stat value={String(toGo)} label="to go" />
        <Stat value={amountDue} label="due" highlight />
      </View>
    </LinearGradient>
  );
}

function Stat({ value, label, highlight }: { value: string; label: string; highlight?: boolean }) {
  return (
    <View style={styles.stat}>
      <Text style={[styles.statValue, highlight && styles.statHighlight]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 20,
    marginHorizontal: spacing[7],
    marginBottom: 18,
    overflow: 'hidden',
  },
  ring: {
    position: 'absolute',
    right: -20,
    top: -20,
  },
  dateLabel: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.caption,
    color: colors.white,
    opacity: 0.7,
    letterSpacing: 0.88,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  summary: {
    fontFamily: fontFamily.bold,
    fontSize: 22,
    letterSpacing: -0.44,
    color: colors.white,
    lineHeight: 28,
    marginBottom: 14,
  },
  track: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    overflow: 'hidden',
    marginBottom: 14,
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
  stats: {
    flexDirection: 'row',
    gap: 14,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  statValue: {
    fontFamily: fontFamily.bold,
    fontSize: 18,
    letterSpacing: -0.36,
    color: colors.white,
  },
  statHighlight: {
    color: colors.butter,
  },
  statLabel: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.meta,
    color: 'rgba(255,255,255,0.7)',
  },
});

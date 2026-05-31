// TaskGroupHeader — MORNING / AFTERNOON / EVENING / ANYTIME section divider.

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { type TimeGroup } from '@/db/modules/tasks';
import { colors, fontFamily, fontSize, spacing } from '@/theme';

interface TaskGroupHeaderProps {
  group: TimeGroup;
  first?: boolean;
}

export function TaskGroupHeader({ group, first = false }: TaskGroupHeaderProps) {
  const { t } = useTranslation('tasks');

  const LABELS: Record<TimeGroup, string> = {
    morning: t('group_morning'),
    afternoon: t('group_afternoon'),
    evening: t('group_evening'),
    anytime: t('group_anytime'),
  };

  return (
    <View style={[styles.container, first && styles.first]}>
      <Text style={styles.label}>{LABELS[group].toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing[7],
    paddingTop: 18,
    paddingBottom: 10,
  },
  first: { paddingTop: 6 },
  label: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.meta,
    color: colors.ink3,
    letterSpacing: 0.72,
  },
});

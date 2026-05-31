// TaskFilterRow — horizontal scrolling filter chips for task list.

import React, { useMemo } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { useTranslation } from 'react-i18next';

import { Chip } from '@/components/ui';
import { type TaskFilter } from '@/db/modules/tasks';
import { colors, spacing } from '@/theme';

interface TaskFilterRowProps {
  active: TaskFilter;
  onChange: (f: TaskFilter) => void;
}

export function TaskFilterRow({ active, onChange }: TaskFilterRowProps) {
  const { t } = useTranslation('tasks');

  const FILTERS: { id: TaskFilter; label: string }[] = useMemo(
    () => [
      { id: 'today', label: t('filter_today') },
      { id: 'tomorrow', label: t('filter_tomorrow') },
      { id: 'week', label: t('filter_week') },
      { id: 'mine', label: t('filter_mine') },
      { id: 'done', label: t('filter_done') },
    ],
    [t]
  );

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      style={styles.scroll}
    >
      {FILTERS.map((f) => (
        <Chip
          key={f.id}
          label={f.label}
          active={active === f.id}
          activeColor={colors.ink}
          onPress={() => onChange(f.id)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { marginBottom: 8 },
  row: {
    paddingHorizontal: spacing[7],
    gap: 8,
  },
});

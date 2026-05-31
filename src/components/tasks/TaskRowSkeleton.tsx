// TaskRowSkeleton — shimmer placeholder shown while tasks are loading.

import React from 'react';
import { StyleSheet, View } from 'react-native';

import { ShimmerBox } from '@/components/shared';
import { colors, spacing } from '@/theme';

export function TaskRowSkeleton() {
  return (
    <View style={styles.row}>
      <ShimmerBox width={24} height={24} borderRadius={8} />
      <View style={styles.content}>
        <ShimmerBox width="68%" height={14} />
        <View style={styles.tags}>
          <ShimmerBox width={60} height={11} borderRadius={6} />
          <ShimmerBox width={50} height={11} borderRadius={6} />
        </View>
      </View>
      <ShimmerBox width={28} height={28} borderRadius={14} />
    </View>
  );
}

// Renders a full loading state (group header + N skeleton rows)
export function TaskListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <TaskRowSkeleton key={i} />
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 14,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 16,
    marginBottom: 8,
    marginHorizontal: spacing[7],
  },
  content: { flex: 1, gap: 8 },
  tags: { flexDirection: 'row', gap: 6 },
});

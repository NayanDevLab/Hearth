// SectionTitle — section heading row with optional item count and "See all" hint.
// Used across dashboard and feature list screens.

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { colors, fontFamily, fontSize, spacing } from '@/theme';

interface SectionTitleProps {
  title: string;
  count?: string;
  hint?: string;
  onHint?: () => void;
}

export function SectionTitle({ title, count, hint, onHint }: SectionTitleProps) {
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <Text style={styles.title}>{title}</Text>
        {count !== undefined && <Text style={styles.count}>{count}</Text>}
      </View>
      {hint && (
        <TouchableOpacity onPress={onHint} activeOpacity={0.7}>
          <Text style={styles.hint}>{hint}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: spacing[7],
    paddingTop: spacing[3],
    paddingBottom: spacing[4],
  },
  left: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  title: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.cardTitle,
    letterSpacing: -0.08,
    color: colors.ink,
  },
  count: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.meta,
    color: colors.ink3,
  },
  hint: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.meta + 1,
    color: colors.primary,
  },
});

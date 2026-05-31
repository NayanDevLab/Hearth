// ShoppingListCard — list entry with colored icon, name, store, progress bar, avatars.

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { colors, fontFamily, fontSize, radius, spacing } from '@/theme';

interface ShoppingListCardProps {
  id: string;
  name: string;
  store?: string;
  emoji?: string;
  iconColor?: string;
  total: number;
  done: number;
  updatedLabel?: string;
  onPress: () => void;
}

export function ShoppingListCard({
  name,
  store,
  emoji = '🛒',
  iconColor,
  total,
  done,
  updatedLabel,
  onPress,
}: ShoppingListCardProps) {
  const isComplete = total > 0 && done === total;
  const pct = total > 0 ? done / total : 0;
  const bg = iconColor ?? colors.mint;

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.75} onPress={onPress}>
      {/* Icon */}
      <View style={[styles.iconBox, { backgroundColor: bg }]}>
        <Text style={styles.iconEmoji}>{emoji}</Text>
      </View>

      {/* Content */}
      <View style={styles.body}>
        <View style={styles.topRow}>
          <Text style={styles.name} numberOfLines={1}>
            {name}
          </Text>
          {isComplete && (
            <View style={styles.doneBadge}>
              <Text style={styles.doneBadgeText}>Done</Text>
            </View>
          )}
        </View>
        {(store || updatedLabel) && (
          <Text style={styles.meta} numberOfLines={1}>
            {[store, updatedLabel].filter(Boolean).join(' · ')}
          </Text>
        )}
        {/* Progress row */}
        <View style={styles.progressRow}>
          <View style={styles.track}>
            <View
              style={[
                styles.fill,
                {
                  width: `${Math.round(pct * 100)}%`,
                  backgroundColor: isComplete ? colors.mint : colors.primary,
                },
              ]}
            />
          </View>
          <Text style={styles.countLabel}>
            {done}/{total}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: spacing[7],
    paddingVertical: 14,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.line2,
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  iconEmoji: { fontSize: 26 },
  body: { flex: 1, minWidth: 0, gap: 4 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: {
    flex: 1,
    fontFamily: fontFamily.bold,
    fontSize: 16,
    color: colors.ink,
    letterSpacing: -0.2,
  },
  doneBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    backgroundColor: colors.mintSoft,
  },
  doneBadgeText: {
    fontFamily: fontFamily.bold,
    fontSize: 10,
    color: '#2F8A5E',
  },
  meta: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.meta,
    color: colors.ink3,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  track: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.line,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 2,
  },
  countLabel: {
    fontFamily: fontFamily.semiBold,
    fontSize: 11,
    color: colors.ink3,
  },
});

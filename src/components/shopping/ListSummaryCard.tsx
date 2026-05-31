// ListSummaryCard — "3 of 8 checked off" header card for the list detail screen.

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { colors, fontFamily, fontSize, radius, spacing } from '@/theme';

interface ListSummaryCardProps {
  total: number;
  done: number;
  onClearDone?: () => void;
}

export function ListSummaryCard({ total, done, onClearDone }: ListSummaryCardProps) {
  const { t } = useTranslation('shopping');
  const pct = total > 0 ? done / total : 0;
  const isAll = total > 0 && done === total;

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <Text style={styles.summary}>
          {isAll ? t('all_done') : t('checked_off', { done, total })}
        </Text>
        {done > 0 && onClearDone && (
          <TouchableOpacity onPress={onClearDone} activeOpacity={0.7}>
            <Text style={styles.clearBtn}>{t('clear_done')}</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            {
              width: `${Math.round(pct * 100)}%`,
              backgroundColor: isAll ? colors.mint : colors.primary,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing[7],
    marginVertical: 12,
    padding: 14,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    gap: 10,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summary: {
    fontFamily: fontFamily.extraBold,
    fontSize: 20,
    letterSpacing: -0.4,
    color: colors.ink,
  },
  clearBtn: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.meta,
    color: colors.primary,
  },
  track: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.line,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
});

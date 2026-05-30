// BillRow — bill/subscription with icon, name, due label, amount, and paid status.

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { Icon } from '@/components/icons/Icon';
import { colors, fontFamily, fontSize, radius } from '@/theme';

export interface BillRowProps {
  name: string;
  amount: string;
  dueLabel: string;
  iconColor: string;
  paid?: boolean;
}

export function BillRow({ name, amount, dueLabel, iconColor, paid = false }: BillRowProps) {
  const { t } = useTranslation('dashboard');
  return (
    <View style={styles.row}>
      <View style={[styles.iconBox, { backgroundColor: iconColor }]}>
        <Icon.wallet size={18} color={colors.white} />
      </View>

      <View style={styles.content}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.due}>{dueLabel}</Text>
      </View>

      <View style={styles.right}>
        <Text style={styles.amount}>{amount}</Text>
        <Text style={[styles.status, { color: paid ? colors.mint : colors.rose }]}>
          {paid ? t('task.paid') : t('task.due_soon')}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 16,
    marginBottom: 8,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.body,
    color: colors.ink,
  },
  due: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.meta,
    color: colors.ink3,
    marginTop: 2,
  },
  right: {
    alignItems: 'flex-end',
  },
  amount: {
    fontFamily: fontFamily.bold,
    fontSize: 16,
    letterSpacing: -0.32,
    color: colors.ink,
  },
  status: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    marginTop: 2,
  },
});

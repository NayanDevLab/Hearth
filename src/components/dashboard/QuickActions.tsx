// QuickActions — 4 shortcut tiles (Add task / Add item / Log bill / Plan meal).

import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { Icon, type IconName } from '@/components/icons/Icon';
import { colors, fontFamily, radius, spacing } from '@/theme';

interface ActionConfig {
  label: string;
  icon: IconName;
  bg: string;
  ink: string;
  onPress?: () => void;
}

const ACTION_BASES: Omit<ActionConfig, 'label'>[] = [
  { icon: 'tasks', bg: colors.mintSoft, ink: '#2F8A5E' },
  { icon: 'cart', bg: colors.butterSoft, ink: '#8A6220' },
  { icon: 'wallet', bg: colors.primarySoft, ink: colors.primaryInk },
  { icon: 'meal', bg: colors.lilacSoft, ink: '#6A50A0' },
];

export function QuickActions() {
  const { t } = useTranslation('dashboard');

  const actions = useMemo<ActionConfig[]>(
    () => [
      { ...ACTION_BASES[0], label: t('quick_actions.add_task') },
      { ...ACTION_BASES[1], label: t('quick_actions.add_item') },
      { ...ACTION_BASES[2], label: t('quick_actions.log_bill') },
      { ...ACTION_BASES[3], label: t('quick_actions.plan_meal') },
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
      {actions.map((action) => {
        const IconComp = Icon[action.icon];
        return (
          <TouchableOpacity
            key={action.label}
            style={[styles.tile, { backgroundColor: action.bg }]}
            activeOpacity={0.75}
            onPress={action.onPress}
          >
            <View style={styles.iconWrap}>
              <IconComp size={20} color={action.ink} />
            </View>
            <Text style={[styles.label, { color: action.ink }]}>{action.label}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    marginBottom: 22,
  },
  row: {
    paddingHorizontal: spacing[7],
    gap: 10,
  },
  tile: {
    width: 82,
    borderRadius: 18,
    paddingTop: 14,
    paddingBottom: 12,
    paddingHorizontal: 12,
    alignItems: 'center',
    gap: 8,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(255,255,255,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: fontFamily.semiBold,
    fontSize: 12,
    textAlign: 'center',
  },
});

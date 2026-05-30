// QuickActions — 4 shortcut tiles (Add task / Add item / Log bill / Plan meal).

import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Icon, type IconName } from '@/components/icons/Icon';
import { colors, fontFamily, radius, spacing } from '@/theme';

interface ActionConfig {
  label: string;
  icon: IconName;
  bg: string;
  ink: string;
  onPress?: () => void;
}

const ACTIONS: ActionConfig[] = [
  { label: 'Add task', icon: 'tasks', bg: colors.mintSoft, ink: '#2F8A5E' },
  { label: 'Add item', icon: 'cart', bg: colors.butterSoft, ink: '#8A6220' },
  { label: 'Log bill', icon: 'wallet', bg: colors.primarySoft, ink: colors.primaryInk },
  { label: 'Plan meal', icon: 'meal', bg: colors.lilacSoft, ink: '#6A50A0' },
];

export function QuickActions() {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      style={styles.scroll}
    >
      {ACTIONS.map((action) => {
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

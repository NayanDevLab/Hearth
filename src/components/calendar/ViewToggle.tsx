// ViewToggle — Day / Week / Month / Schedule segmented control.

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { type CalendarView } from '@/constants/calendar';
import { colors, fontFamily, fontSize, radius } from '@/theme';

interface ViewToggleProps {
  active: CalendarView;
  onChange: (v: CalendarView) => void;
}

const VIEWS: { id: CalendarView; tKey: string }[] = [
  { id: 'month', tKey: 'view_month' },
  { id: 'schedule', tKey: 'view_schedule' },
];

export function ViewToggle({ active, onChange }: ViewToggleProps) {
  const { t } = useTranslation('calendar');

  return (
    <View style={styles.container}>
      {VIEWS.map((v) => {
        const isActive = active === v.id;
        return (
          <TouchableOpacity
            key={v.id}
            style={[styles.tab, isActive && styles.tabActive]}
            activeOpacity={0.75}
            onPress={() => onChange(v.id)}
          >
            <Text style={[styles.label, isActive && styles.labelActive]}>{t(v.tKey)}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.surface2,
    borderRadius: radius.sm,
    padding: 3,
    marginHorizontal: 22,
    marginBottom: 12,
  },
  tab: {
    flex: 1,
    height: 34,
    borderRadius: radius.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {
    backgroundColor: colors.ink,
  },
  label: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.meta,
    color: colors.ink3,
  },
  labelActive: {
    color: colors.white,
  },
});

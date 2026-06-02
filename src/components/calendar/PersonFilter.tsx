// PersonFilter — Everyone / Just me / Member initial chips for calendar filtering.

import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { useMembers } from '@/hooks';
import { colors, fontFamily, fontSize, radius } from '@/theme';

export type CalendarPerson = 'everyone' | 'just_me' | string; // string = member initial

interface PersonFilterProps {
  selected: CalendarPerson;
  onChange: (p: CalendarPerson) => void;
}

export function PersonFilter({ selected, onChange }: PersonFilterProps) {
  const { t } = useTranslation('calendar');
  const members = useMembers('calendar');

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      style={styles.scroll}
    >
      {/* Everyone */}
      <TouchableOpacity
        style={[styles.chip, selected === 'everyone' && styles.chipActive]}
        activeOpacity={0.7}
        onPress={() => onChange('everyone')}
      >
        <Text style={[styles.chipText, selected === 'everyone' && styles.chipTextActive]}>
          {t('filter_everyone')}
        </Text>
      </TouchableOpacity>

      {/* Just me */}
      <TouchableOpacity
        style={[styles.chip, selected === 'just_me' && styles.chipActive]}
        activeOpacity={0.7}
        onPress={() => onChange('just_me')}
      >
        <Text style={[styles.chipText, selected === 'just_me' && styles.chipTextActive]}>
          {t('filter_just_me')}
        </Text>
      </TouchableOpacity>

      {/* Members */}
      {members.map((m) => {
        const isActive = selected === m.initial;
        return (
          <TouchableOpacity
            key={m.initial}
            style={[styles.chip, isActive && { backgroundColor: m.color, borderColor: m.color }]}
            activeOpacity={0.7}
            onPress={() => onChange(m.initial)}
          >
            <View style={[styles.memberDot, { backgroundColor: m.color }]} />
            <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{m.name}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { marginBottom: 8 },
  row: { paddingHorizontal: 22, gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
  },
  chipActive: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  chipText: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.meta,
    color: colors.ink2,
  },
  chipTextActive: { color: colors.white },
  memberDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
});

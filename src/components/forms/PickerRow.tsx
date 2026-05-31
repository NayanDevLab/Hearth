// PickerRow — tappable row showing icon + label + value + arrow.
// Used in task and shopping item forms for due date, repeats, reminder, etc.

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Icon } from '@/components/icons/Icon';
import { colors, fontFamily, radius } from '@/theme';

interface PickerRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtle?: boolean;
  onPress: () => void;
}

export function PickerRow({ icon, label, value, subtle = false, onPress }: PickerRowProps) {
  return (
    <TouchableOpacity style={styles.row} activeOpacity={0.7} onPress={onPress}>
      <View style={styles.iconBox}>{icon}</View>
      <View style={styles.text}>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.value, subtle && styles.valueSubtle]}>{value}</Text>
      </View>
      <Icon.arrow size={16} color={colors.ink4} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.sm,
    marginBottom: 8,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: radius.xs,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { flex: 1 },
  label: { fontFamily: fontFamily.semiBold, fontSize: 13, color: colors.ink3 },
  value: { fontFamily: fontFamily.semiBold, fontSize: 15, color: colors.ink, marginTop: 2 },
  valueSubtle: { color: colors.ink4 },
});

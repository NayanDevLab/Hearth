// SimplePickerSheet — bottom sheet with a list of options and checkmark on the selected one.
// Used for Repeats (Never/Daily/Weekly/Monthly) and Reminder pickers in task forms.

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Icon } from '@/components/icons/Icon';
import { colors, fontFamily, fontSize, radius, spacing } from '@/theme';

interface PickerOption {
  value: string | null;
  label: string;
}

interface SimplePickerSheetProps {
  title: string;
  options: PickerOption[];
  selected: string | null;
  onSelect: (value: string | null) => void;
  onClose: () => void;
  cancelLabel?: string;
}

export function SimplePickerSheet({
  title,
  options,
  selected,
  onSelect,
  onClose,
  cancelLabel = 'Cancel',
}: SimplePickerSheetProps) {
  return (
    <View style={styles.sheet}>
      <View style={styles.handle} />
      <Text style={styles.title}>{title}</Text>
      {options.map((o) => {
        const active = selected === o.value;
        return (
          <TouchableOpacity
            key={String(o.value)}
            style={styles.option}
            activeOpacity={0.75}
            onPress={() => onSelect(o.value)}
          >
            <Text style={[styles.optionLabel, active && styles.optionLabelActive]}>{o.label}</Text>
            {active && <Icon.check size={16} color={colors.primary} stroke={2.5} />}
          </TouchableOpacity>
        );
      })}
      <TouchableOpacity style={styles.closeRow} onPress={onClose}>
        <Text style={styles.closeLabel}>{cancelLabel}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing[7],
    paddingBottom: 32,
  },
  handle: {
    width: 36,
    height: 5,
    backgroundColor: colors.ink4,
    opacity: 0.4,
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontFamily: fontFamily.bold,
    fontSize: 16,
    color: colors.ink,
    marginBottom: 14,
    textAlign: 'center',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.line2,
  },
  optionLabel: {
    fontFamily: fontFamily.semiBold,
    fontSize: 15,
    color: colors.ink,
  },
  optionLabelActive: { color: colors.primary },
  closeRow: { marginTop: 8, paddingVertical: 14, alignItems: 'center' },
  closeLabel: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.cardTitle,
    color: colors.ink3,
  },
});

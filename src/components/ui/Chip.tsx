// Chip — filter chip for horizontal filter rows.
// Active state: filled dark/colored background. Inactive: white + line border.

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, type TouchableOpacityProps } from 'react-native';

import { colors, fontFamily, fontSize, radius } from '@/theme';

interface ChipProps extends TouchableOpacityProps {
  label: string;
  active?: boolean;
  activeColor?: string;
}

export function Chip({
  label,
  active = false,
  activeColor = colors.ink,
  style,
  ...rest
}: ChipProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.75}
      style={[
        styles.base,
        active ? { backgroundColor: activeColor, borderColor: activeColor } : styles.inactive,
        style,
      ]}
      {...rest}
    >
      <Text style={[styles.label, { color: active ? colors.white : colors.ink2 }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inactive: {
    backgroundColor: colors.white,
    borderColor: colors.line,
  },
  label: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.meta,
    letterSpacing: 0,
  },
});

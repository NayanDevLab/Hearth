// Badge / status pill — semantic status indicators (settled, expiring, overdue, upcoming).
// Pair each variant with its matching soft color surface.

import React from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { colors, fontFamily, fontSize, radius } from '@/theme';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'dark';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
}

const variantColors: Record<BadgeVariant, { bg: string; text: string }> = {
  success: { bg: colors.mintSoft, text: '#2F8A5E' },
  warning: { bg: colors.butterSoft, text: '#8A6220' },
  danger: { bg: colors.roseSoft, text: colors.rose },
  info: { bg: colors.skySoft, text: '#2A7A9E' },
  neutral: { bg: colors.surface2, text: colors.ink2 },
  dark: { bg: colors.ink, text: colors.white },
};

export function Badge({ label, variant = 'neutral', style }: BadgeProps) {
  const { bg, text } = variantColors[variant];

  return (
    <View style={[styles.base, { backgroundColor: bg }, style]}>
      <Text style={[styles.label, { color: text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  label: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.caption,
    letterSpacing: 0.04,
  },
});

// FormField — labelled field group used in every form screen.
// Wraps children in a View with consistent bottom spacing.

import React from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { colors, fontFamily, fontSize } from '@/theme';

interface FormFieldProps {
  label: string;
  children: React.ReactNode;
  style?: ViewStyle;
}

export function FormField({ label, children, style }: FormFieldProps) {
  return (
    <View style={[styles.group, style]}>
      <Text style={styles.label}>{label.toUpperCase()}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  group: { marginBottom: 20 },
  label: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.caption,
    color: colors.ink3,
    letterSpacing: 0.66,
    marginBottom: 10,
  },
});

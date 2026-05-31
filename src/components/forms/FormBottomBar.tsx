// FormBottomBar — sticky Cancel + primary CTA row at the bottom of every form screen.

import React from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui';
import { colors, spacing } from '@/theme';

interface FormBottomBarProps {
  onCancel: () => void;
  onSubmit: () => void;
  submitLabel: string;
  cancelLabel?: string;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export function FormBottomBar({
  onCancel,
  onSubmit,
  submitLabel,
  cancelLabel = 'Cancel',
  loading = false,
  disabled = false,
  style,
}: FormBottomBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 16) + 4 }, style]}>
      <Button
        variant="soft"
        label={cancelLabel}
        onPress={onCancel}
        fullWidth={false}
        style={styles.cancelBtn}
      />
      <Button
        variant="accent"
        label={submitLabel}
        loading={loading}
        disabled={disabled}
        onPress={onSubmit}
        style={styles.submitBtn}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: spacing[7],
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    backgroundColor: colors.white,
  },
  cancelBtn: { flex: 1, height: 52 },
  submitBtn: { flex: 1.6 },
});

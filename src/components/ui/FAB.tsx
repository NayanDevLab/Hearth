// FAB — Floating Action Button. Positioned absolute, bottom-right.
// Used on list/detail screens for primary add actions.

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, type TouchableOpacityProps, View } from 'react-native';

import { Icon } from '@/components/icons/Icon';
import { colors, fontFamily, fontSize, radius, shadows } from '@/theme';

interface FABProps extends TouchableOpacityProps {
  label?: string;
  icon?: React.ReactNode;
}

export function FAB({ label, icon, style, ...rest }: FABProps) {
  const hasLabel = Boolean(label);

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={[styles.base, hasLabel ? styles.withLabel : styles.iconOnly, shadows.cta, style]}
      {...rest}
    >
      <View style={styles.inner}>
        {icon ?? <Icon.plus size={22} color={colors.white} />}
        {label && <Text style={styles.label}>{label}</Text>}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    position: 'absolute',
    right: 18,
    bottom: 92,
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconOnly: {
    width: 56,
    height: 56,
  },
  withLabel: {
    height: 56,
    paddingHorizontal: 22,
    paddingLeft: 18,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    color: colors.white,
    fontFamily: fontFamily.bold,
    fontSize: fontSize.body,
  },
});

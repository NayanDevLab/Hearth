// Button — 4 variants matching the Hearth design system.
// accent: terracotta fill (primary CTAs)
// primary: dark ink fill (secondary CTAs)
// soft: surface bg + line border
// ghost: transparent text-only

import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  type TouchableOpacityProps,
  View,
} from 'react-native';

import { colors, fontFamily, fontSize, radius, shadows } from '@/theme';

type ButtonVariant = 'accent' | 'primary' | 'soft' | 'ghost' | 'destructive';

interface ButtonProps extends TouchableOpacityProps {
  variant?: ButtonVariant;
  label: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, object> = {
  accent: {
    backgroundColor: colors.primary,
    height: 56,
    ...shadows.cta,
  },
  primary: {
    backgroundColor: colors.ink,
    height: 56,
    ...shadows.sh2,
  },
  soft: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    height: 52,
  },
  ghost: {
    backgroundColor: colors.transparent,
    height: 48,
  },
  destructive: {
    backgroundColor: colors.roseSoft,
    height: 52,
  },
};

const variantTextColor: Record<ButtonVariant, string> = {
  accent: colors.white,
  primary: colors.white,
  soft: colors.ink,
  ghost: colors.ink2,
  destructive: colors.rose,
};

export function Button({
  variant = 'accent',
  label,
  leftIcon,
  rightIcon,
  loading = false,
  fullWidth = true,
  style,
  disabled,
  ...rest
}: ButtonProps) {
  const textColor = variantTextColor[variant];

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      disabled={disabled || loading}
      style={[
        styles.base,
        variantStyles[variant],
        fullWidth && styles.fullWidth,
        (disabled || loading) && styles.disabled,
        style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <View style={styles.inner}>
          {leftIcon && <View style={styles.iconGap}>{leftIcon}</View>}
          <Text style={[styles.label, { color: textColor }]}>{label}</Text>
          {rightIcon && <View style={styles.iconGap}>{rightIcon}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 22,
  },
  fullWidth: {
    width: '100%',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.cardTitle,
    letterSpacing: 0,
  },
  iconGap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
});

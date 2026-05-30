// Avatar — initial letter circle with configurable color, size, and optional ring.
// Used for household members throughout the app.

import React from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { colors, fontFamily } from '@/theme';

interface AvatarProps {
  initial: string;
  color?: string;
  size?: number;
  ring?: boolean;
  style?: ViewStyle;
}

export function Avatar({
  initial,
  color = colors.primary,
  size = 32,
  ring = false,
  style,
}: AvatarProps) {
  const fontSize = Math.round(size * 0.42);

  return (
    <View
      style={[
        styles.base,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
        ring && styles.ring,
        style,
      ]}
    >
      <Text style={[styles.initial, { fontSize, lineHeight: size }]}>
        {initial.charAt(0).toUpperCase()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    borderWidth: 2,
    borderColor: colors.white,
  },
  initial: {
    color: colors.white,
    fontFamily: fontFamily.bold,
    letterSpacing: -0.5,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
});

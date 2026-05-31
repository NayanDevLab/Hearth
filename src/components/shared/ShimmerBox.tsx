// ShimmerBox — animated shimmer gradient placeholder for loading states.
// Wrap any skeleton shape with this component.

import React, { useEffect } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { colors } from '@/theme';

interface ShimmerBoxProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function ShimmerBox({
  width = '100%',
  height = 16,
  borderRadius = 8,
  style,
}: ShimmerBoxProps) {
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(withTiming(1, { duration: 700 }), withTiming(0.4, { duration: 700 })),
      -1,
      true
    );
  }, [opacity]);

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[styles.base, { width: width as number, height, borderRadius }, animStyle, style]}
    />
  );
}

// Convenience wrapper for a full shimmer row (title + meta lines)
export function ShimmerRow() {
  return (
    <View style={styles.rowWrap}>
      <ShimmerBox width={24} height={24} borderRadius={8} style={styles.check} />
      <View style={styles.content}>
        <ShimmerBox width="70%" height={14} />
        <ShimmerBox width="45%" height={11} style={styles.metaLine} />
      </View>
      <ShimmerBox width={28} height={28} borderRadius={14} />
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.line,
  },
  rowWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 16,
    marginBottom: 8,
  },
  check: { flexShrink: 0 },
  content: { flex: 1, gap: 6 },
  metaLine: { marginTop: 2 },
});

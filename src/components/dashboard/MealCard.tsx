// MealCard — tonight's meal preview with gradient thumbnail and arrow.

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';

import { Icon } from '@/components/icons/Icon';
import { colors, fontFamily, fontSize, radius } from '@/theme';

interface MealCardProps {
  mealName?: string;
  time?: string;
  duration?: string;
  cook?: string;
  onPress?: () => void;
}

export function MealCard({
  mealName = 'Lemon herb chicken',
  time = 'Tonight · 7:00 PM',
  duration = '35 min',
  cook = 'Aarav',
  onPress,
}: MealCardProps) {
  return (
    <View style={styles.card}>
      <LinearGradient
        colors={[colors.butter, '#D4963A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.thumb}
      >
        <Icon.meal size={30} color={colors.white} />
      </LinearGradient>

      <View style={styles.content}>
        <Text style={styles.timeLabel}>{time}</Text>
        <Text style={styles.mealName} numberOfLines={1}>
          {mealName}
        </Text>
        <Text style={styles.meta}>
          ⏱ {duration}
          {'  '}·{'  '}👤 {cook} cooks
        </Text>
      </View>

      <TouchableOpacity style={styles.arrowBtn} activeOpacity={0.7} onPress={onPress}>
        <Icon.arrow size={16} color={colors.ink2} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 18,
  },
  thumb: {
    width: 70,
    height: 70,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  content: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  timeLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    color: colors.ink3,
    letterSpacing: 0.66,
    textTransform: 'uppercase',
  },
  mealName: {
    fontFamily: fontFamily.bold,
    fontSize: 15,
    color: colors.ink,
    marginTop: 2,
  },
  meta: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.meta,
    color: colors.ink3,
    marginTop: 4,
  },
  arrowBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
});

// ScreenHeader — back button + title + optional lightbulb tutorial trigger + right slot.
// Used on every feature screen. The lightbulb opens the feature's TutorialSheet.

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Icon } from '@/components/icons/Icon';
import { colors, fontFamily, fontSize, radius, spacing } from '@/theme';

interface ScreenHeaderProps {
  title: string;
  onBack?: () => void;
  showBack?: boolean;
  onTutorial?: () => void;
  right?: React.ReactNode;
}

export function ScreenHeader({
  title,
  onBack,
  showBack = true,
  onTutorial,
  right,
}: ScreenHeaderProps) {
  return (
    <View style={styles.container}>
      {showBack ? (
        <TouchableOpacity onPress={onBack} style={styles.iconBtn} activeOpacity={0.7}>
          <Icon.arrowLeft size={20} color={colors.ink} />
        </TouchableOpacity>
      ) : (
        <View style={styles.iconBtn} />
      )}

      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>

      <View style={styles.rightSlot}>
        {right}
        {onTutorial && (
          <TouchableOpacity onPress={onTutorial} style={styles.bulbBtn} activeOpacity={0.7}>
            <Icon.bulb size={20} color={colors.primaryInk} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[5],
    paddingTop: spacing[3],
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bulbBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    fontFamily: fontFamily.bold,
    fontSize: fontSize.sectionTitle,
    letterSpacing: -0.28,
    color: colors.ink,
    paddingLeft: 4,
  },
  rightSlot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});

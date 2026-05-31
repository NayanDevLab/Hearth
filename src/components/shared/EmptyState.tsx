// EmptyState — reusable empty list placeholder.
// Shows an emoji icon, title, body text, and an optional CTA button.

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { colors, fontFamily, fontSize, radius, spacing } from '@/theme';

interface EmptyStateProps {
  emoji?: string;
  title: string;
  body?: string;
  ctaLabel?: string;
  onCta?: () => void;
}

export function EmptyState({ emoji = '✅', title, body, ctaLabel, onCta }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Text style={styles.emoji}>{emoji}</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      {body ? <Text style={styles.body}>{body}</Text> : null}
      {ctaLabel && onCta ? (
        <TouchableOpacity style={styles.cta} activeOpacity={0.8} onPress={onCta}>
          <Text style={styles.ctaLabel}>{ctaLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[7],
    paddingVertical: 40,
    gap: 10,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emoji: { fontSize: 32 },
  title: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.cardTitle,
    color: colors.ink,
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  body: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.body,
    color: colors.ink3,
    textAlign: 'center',
    lineHeight: 21,
  },
  cta: {
    marginTop: 8,
    paddingHorizontal: 22,
    paddingVertical: 13,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  ctaLabel: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.body,
    color: colors.white,
  },
});

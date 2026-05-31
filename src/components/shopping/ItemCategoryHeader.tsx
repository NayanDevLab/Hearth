// ItemCategoryHeader — "🥬 PRODUCE 3 ITEMS" section header inside a shopping list.

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { SHOPPING_CAT_MAP } from '@/constants/shopping';
import { colors, fontFamily, fontSize, spacing } from '@/theme';

interface ItemCategoryHeaderProps {
  category: string;
  count: number;
}

export function ItemCategoryHeader({ category, count }: ItemCategoryHeaderProps) {
  const { t } = useTranslation('shopping');
  const cat = SHOPPING_CAT_MAP[category];

  return (
    <View style={styles.container}>
      {cat && <Text style={styles.emoji}>{cat.emoji}</Text>}
      <Text style={[styles.label, cat && { color: cat.color }]}>
        {cat ? cat.label.toUpperCase() : category.toUpperCase()}
        {'  '}
        <Text style={styles.count}>{t('items_count', { n: count })}</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing[7],
    paddingTop: 16,
    paddingBottom: 6,
    backgroundColor: colors.bg,
  },
  emoji: { fontSize: 14 },
  label: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.caption,
    letterSpacing: 0.72,
    color: colors.ink3,
  },
  count: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.caption,
    color: colors.ink4,
    letterSpacing: 0.66,
  },
});

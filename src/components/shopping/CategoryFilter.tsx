// CategoryFilter — horizontal chip row: All · Produce · Dairy · Bakery…
// Shows emoji + label + count per category.

import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';

import { useTranslation } from 'react-i18next';

import { SHOPPING_CATEGORIES } from '@/constants/shopping';
import { colors, fontFamily, fontSize, radius, spacing } from '@/theme';

interface CategoryCount {
  category: string;
  total: number;
}

interface CategoryFilterProps {
  active: string | null; // null = All
  counts: CategoryCount[];
  totalCount: number;
  onChange: (cat: string | null) => void;
}

export function CategoryFilter({ active, counts, totalCount, onChange }: CategoryFilterProps) {
  const { t } = useTranslation('shopping');

  const catMap = Object.fromEntries(counts.map((c) => [c.category, c.total]));

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      style={styles.scroll}
    >
      {/* All chip */}
      <TouchableOpacity
        style={[styles.chip, active === null && styles.chipActive]}
        activeOpacity={0.7}
        onPress={() => onChange(null)}
      >
        <Text style={[styles.chipText, active === null && styles.chipTextActive]}>
          {t('filter_all')} · {totalCount}
        </Text>
      </TouchableOpacity>

      {/* Per-category chips — only show categories that have items */}
      {SHOPPING_CATEGORIES.filter((c) => catMap[c.id] && catMap[c.id] > 0).map((cat) => {
        const isActive = active === cat.id;
        return (
          <TouchableOpacity
            key={cat.id}
            style={[styles.chip, isActive && { backgroundColor: cat.soft, borderColor: cat.color }]}
            activeOpacity={0.7}
            onPress={() => onChange(cat.id)}
          >
            <Text style={styles.chipEmoji}>{cat.emoji}</Text>
            <Text style={[styles.chipText, isActive && { color: cat.color }]}>
              {cat.label} · {catMap[cat.id]}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { marginBottom: 4 },
  row: {
    paddingHorizontal: spacing[7],
    gap: 8,
    paddingVertical: 4,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
  },
  chipActive: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  chipEmoji: { fontSize: 13 },
  chipText: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.meta,
    color: colors.ink2,
  },
  chipTextActive: { color: colors.white },
});

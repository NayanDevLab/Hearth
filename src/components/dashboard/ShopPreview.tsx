// ShopPreview — shopping list mini-card with progress badge and item chips.

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icons/Icon';
import { colors, fontFamily, fontSize, radius } from '@/theme';

const DEFAULT_ITEMS = ['Eggs', 'Sourdough', 'Spinach (1 bag)', '+ 5 more'];

interface ShopPreviewProps {
  listName?: string;
  store?: string;
  totalItems?: number;
  doneItems?: number;
  previewItems?: string[];
}

export function ShopPreview({
  listName = 'Weekly groceries',
  store = "Trader Joe's",
  totalItems = 8,
  doneItems = 3,
  previewItems = DEFAULT_ITEMS,
}: ShopPreviewProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconBox}>
            <Icon.cart size={16} color="#8A6220" />
          </View>
          <View>
            <Text style={styles.listName}>{listName}</Text>
            <Text style={styles.storeName}>
              {totalItems} items · {store}
            </Text>
          </View>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {doneItems} / {totalItems}
          </Text>
        </View>
      </View>

      <View style={styles.chips}>
        {previewItems.map((item, i) => (
          <View key={i} style={styles.chip}>
            <Text style={styles.chipText}>{item}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 14,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 18,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.butterSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listName: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.body,
    color: colors.ink,
  },
  storeName: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.meta,
    color: colors.ink3,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
    backgroundColor: colors.mintSoft,
  },
  badgeText: {
    fontFamily: fontFamily.bold,
    fontSize: 12,
    color: '#2F8A5E',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.surface2,
  },
  chipText: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    color: colors.ink2,
  },
});

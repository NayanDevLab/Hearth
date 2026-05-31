// ShoppingItemRow — item with checkbox, name/brand/note, qty, urgent badge, assignee.

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { Icon } from '@/components/icons/Icon';
import { Avatar } from '@/components/ui';
import { SHOPPING_CAT_MAP } from '@/constants/shopping';
import { MEMBER_CONFIG } from '@/constants/tasks';
import { type ShoppingItem } from '@/db/modules/shopping';
import { colors, fontFamily, fontSize, radius } from '@/theme';

interface ShoppingItemRowProps {
  item: ShoppingItem;
  onToggle: (id: string, done: boolean) => void;
  onPress: (id: string) => void;
}

export function ShoppingItemRow({ item, onToggle, onPress }: ShoppingItemRowProps) {
  const { t } = useTranslation('shopping');
  const cat = item.category ? SHOPPING_CAT_MAP[item.category] : null;
  const member = item.assignee ? MEMBER_CONFIG[item.assignee] : null;
  const qtyLabel =
    item.quantity !== 1 ? `${item.quantity} ${item.unit ?? ''}`.trim() : (item.unit ?? '');

  return (
    <TouchableOpacity style={styles.row} activeOpacity={0.7} onPress={() => onPress(item.id)}>
      {/* Checkbox */}
      <TouchableOpacity
        style={[styles.checkbox, item.done && styles.checkboxDone]}
        activeOpacity={0.7}
        hitSlop={{ top: 8, bottom: 8, left: 4, right: 8 }}
        onPress={() => onToggle(item.id, !item.done)}
      >
        {!!item.done && <Icon.check size={13} color={colors.white} stroke={2.5} />}
      </TouchableOpacity>

      {/* Category emoji */}
      {cat && (
        <View style={[styles.catDot, { backgroundColor: cat.soft }]}>
          <Text style={styles.catEmoji}>{cat.emoji}</Text>
        </View>
      )}

      {/* Name + brand/note */}
      <View style={styles.content}>
        <View style={styles.nameRow}>
          <Text style={[styles.name, !!item.done && styles.nameDone]} numberOfLines={1}>
            {item.name}
            {qtyLabel ? <Text style={styles.qty}> · {qtyLabel}</Text> : null}
          </Text>
          {!!item.urgent && !item.done && (
            <View style={styles.urgentBadge}>
              <Text style={styles.urgentText}>{t('urgent')}</Text>
            </View>
          )}
        </View>
        {item.brand ? (
          <Text style={styles.brand} numberOfLines={1}>
            &quot;{item.brand}&quot;
          </Text>
        ) : null}
      </View>

      {/* Assignee */}
      {member && <Avatar initial={item.assignee!} color={member.color} size={26} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.line2,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.ink4,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  checkboxDone: {
    backgroundColor: colors.mint,
    borderWidth: 0,
  },
  catDot: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  catEmoji: { fontSize: 16 },
  content: { flex: 1, minWidth: 0, gap: 2 },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  name: {
    fontFamily: fontFamily.semiBold,
    fontSize: 15,
    color: colors.ink,
    flexShrink: 1,
  },
  nameDone: {
    textDecorationLine: 'line-through',
    opacity: 0.45,
  },
  qty: {
    fontFamily: fontFamily.regular,
    color: colors.ink3,
  },
  urgentBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: radius.pill,
    backgroundColor: colors.roseSoft,
  },
  urgentText: {
    fontFamily: fontFamily.bold,
    fontSize: 10,
    color: colors.rose,
  },
  brand: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.meta,
    color: colors.ink3,
    fontStyle: 'italic',
  },
});

// Dish detail — hero, meta, ingredients, add-to-shopping, edit/delete.

import { useCallback, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { router, useLocalSearchParams } from 'expo-router';

import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icons/Icon';
import { ErrorState } from '@/components/shared';
import { ScreenHeader } from '@/components/ui';
import {
  deleteDish,
  type Dish,
  type DishIngredient,
  getDishById,
  getIngredients,
} from '@/db/modules/meals';
import { getAllLists, insertItem, insertList } from '@/db/modules/shopping';
import { useFocusRefresh } from '@/hooks';
import { colors, fontFamily, fontSize, radius, shadows, spacing } from '@/theme';

function formatQty(qty: number): string {
  return Number.isInteger(qty) ? String(qty) : qty.toFixed(2);
}

export default function DishDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation('meals');
  const insets = useSafeAreaInsets();

  const [dish, setDish] = useState<Dish | null>(null);
  const [ingredients, setIngredients] = useState<DishIngredient[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [addedMessage, setAddedMessage] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const [d, ings] = await Promise.all([getDishById(id), getIngredients(id)]);
      setDish(d);
      setIngredients(ings);
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Error'));
    }
  }, [id]);

  useFocusRefresh(load, load);

  async function handleAddToShopping() {
    if (!ingredients.length || adding) return;
    setAdding(true);
    try {
      const lists = await getAllLists();
      let list = lists[0];
      if (!list) {
        const listId = `list_${Date.now()}`;
        await insertList({ id: listId, name: t('groceries'), emoji: '🛒' });
        list = { id: listId, name: t('groceries'), created_at: '' };
      }
      for (const ing of ingredients) {
        await insertItem({
          id: `item_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          list_id: list.id,
          name: ing.name,
          quantity: ing.qty,
          unit: ing.unit,
        });
      }
      setAddedMessage(t('added_to_shopping', { n: ingredients.length, list: list.name }));
      setTimeout(() => setAddedMessage(null), 3000);
    } finally {
      setAdding(false);
    }
  }

  async function handleDelete() {
    if (!dish) return;
    setShowDelete(false);
    await deleteDish(dish.id);
    router.back();
  }

  if (error) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ScreenHeader title="" onBack={() => router.back()} />
        <ErrorState title={t('error_title')} retryLabel={t('error_retry')} onRetry={load} />
      </View>
    );
  }

  if (!dish) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ScreenHeader title="" onBack={() => router.back()} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader
        title=""
        onBack={() => router.back()}
        right={
          <TouchableOpacity
            style={styles.editBtn}
            activeOpacity={0.7}
            onPress={() => router.push(`/meals/dish/${id}/edit` as never)}
          >
            <Icon.edit size={18} color={colors.ink} />
          </TouchableOpacity>
        }
      />

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Text style={styles.heroEmoji}>{dish.emoji}</Text>
          </View>
          <View style={styles.heroMeta}>
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>{t(`type_${dish.meal_type}`)}</Text>
            </View>
            <Text style={styles.heroTitle}>{dish.name}</Text>
            {dish.prep_minutes ? (
              <View style={styles.prepRow}>
                <Icon.clock size={13} color={colors.ink3} />
                <Text style={styles.prepText}>{t('n_min', { n: dish.prep_minutes })}</Text>
              </View>
            ) : null}
          </View>
        </View>

        {ingredients.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>{t('ingredients_label')}</Text>
            <View style={styles.card}>
              {ingredients.map((ing, i) => (
                <View
                  key={ing.id}
                  style={[styles.ingRow, i < ingredients.length - 1 && styles.ingRowBorder]}
                >
                  <Text style={styles.ingName}>{ing.name}</Text>
                  <Text style={styles.ingQty}>
                    {formatQty(ing.qty)} {ing.unit}
                  </Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.shoppingBtn, adding && styles.shoppingBtnDisabled]}
              activeOpacity={0.85}
              onPress={handleAddToShopping}
              disabled={adding}
            >
              <Icon.cart size={17} color={colors.primaryInk} />
              <Text style={styles.shoppingBtnLabel}>{t('add_to_shopping')}</Text>
            </TouchableOpacity>

            {addedMessage && (
              <View style={styles.addedBanner}>
                <Icon.check size={14} color="#2F8A5E" stroke={2.5} />
                <Text style={styles.addedText}>{addedMessage}</Text>
              </View>
            )}
          </View>
        )}

        {dish.notes ? (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>{t('notes_label')}</Text>
            <View style={styles.card}>
              <Text style={styles.notesText}>{dish.notes}</Text>
            </View>
          </View>
        ) : null}

        <View style={styles.footer} />
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        <TouchableOpacity
          style={styles.editBarBtn}
          activeOpacity={0.85}
          onPress={() => router.push(`/meals/dish/${id}/edit` as never)}
        >
          <Icon.edit size={18} color={colors.ink} />
          <Text style={styles.editBarLabel}>{t('edit')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteBarBtn}
          activeOpacity={0.85}
          onPress={() => setShowDelete(true)}
        >
          <Icon.trash size={18} color={colors.rose} />
        </TouchableOpacity>
      </View>

      <Modal
        transparent
        visible={showDelete}
        animationType="slide"
        onRequestClose={() => setShowDelete(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setShowDelete(false)} />
        <View style={styles.sheet}>
          <View style={styles.grabber} />
          <View style={styles.deleteIcon}>
            <Icon.trash size={24} color={colors.rose} />
          </View>
          <Text style={styles.deleteTitle}>{t('delete_title', { name: dish.name })}</Text>
          <Text style={styles.deleteBody}>{t('delete_body')}</Text>
          <TouchableOpacity
            style={styles.deleteConfirmBtn}
            activeOpacity={0.85}
            onPress={handleDelete}
          >
            <Text style={styles.deleteConfirmLabel}>{t('delete_confirm')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cancelBtn}
            activeOpacity={0.8}
            onPress={() => setShowDelete(false)}
          >
            <Text style={styles.cancelLabel}>{t('cancel')}</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  editBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: { flex: 1 },
  hero: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    paddingHorizontal: spacing[7],
    marginBottom: 18,
  },
  heroIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  heroEmoji: { fontSize: 28 },
  heroMeta: { flex: 1, paddingTop: 2 },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: colors.primarySoft,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  typeBadgeText: { fontFamily: fontFamily.bold, fontSize: 10, color: colors.primaryInk },
  heroTitle: {
    fontFamily: fontFamily.extraBold,
    fontSize: 22,
    color: colors.ink,
    letterSpacing: -0.5,
  },
  prepRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 },
  prepText: { fontFamily: fontFamily.semiBold, fontSize: 13, color: colors.ink3 },
  section: { paddingHorizontal: spacing[7], marginBottom: 16 },
  sectionLabel: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.caption,
    color: colors.ink3,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
  },
  ingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 13,
  },
  ingRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.line2 },
  ingName: { fontFamily: fontFamily.semiBold, fontSize: fontSize.body, color: colors.ink },
  ingQty: { fontFamily: fontFamily.semiBold, fontSize: fontSize.body, color: colors.ink3 },
  shoppingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    marginTop: 10,
  },
  shoppingBtnDisabled: { opacity: 0.6 },
  shoppingBtnLabel: { fontFamily: fontFamily.bold, fontSize: 14, color: colors.primaryInk },
  addedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 8,
    paddingVertical: 8,
    borderRadius: radius.sm,
    backgroundColor: colors.mintSoft,
  },
  addedText: { fontFamily: fontFamily.semiBold, fontSize: 12.5, color: '#1A6040' },
  notesText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.body,
    color: colors.ink2,
    lineHeight: 22,
    padding: 14,
  },
  footer: { height: 80 },
  bottomBar: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: spacing[7],
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    backgroundColor: colors.white,
  },
  editBarBtn: {
    flex: 1,
    height: 52,
    borderRadius: radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderWidth: 1,
    borderColor: colors.line,
  },
  editBarLabel: { fontFamily: fontFamily.bold, fontSize: fontSize.cardTitle, color: colors.ink },
  deleteBarBtn: {
    width: 52,
    height: 52,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.line,
  },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(20,22,30,0.45)' },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing[7],
    paddingTop: spacing[5],
    paddingBottom: 32,
    alignItems: 'center',
    ...shadows.sh3,
  },
  grabber: {
    width: 36,
    height: 5,
    backgroundColor: colors.ink4,
    opacity: 0.4,
    borderRadius: 3,
    marginBottom: 16,
  },
  deleteIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.roseSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  deleteTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 19,
    color: colors.ink,
    textAlign: 'center',
    marginBottom: 6,
  },
  deleteBody: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.body,
    color: colors.ink2,
    textAlign: 'center',
    marginBottom: 20,
  },
  deleteConfirmBtn: {
    width: '100%',
    height: 52,
    borderRadius: radius.pill,
    backgroundColor: colors.rose,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  deleteConfirmLabel: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.cardTitle,
    color: colors.white,
  },
  cancelBtn: { height: 48, width: '100%', alignItems: 'center', justifyContent: 'center' },
  cancelLabel: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.cardTitle,
    color: colors.ink3,
  },
});

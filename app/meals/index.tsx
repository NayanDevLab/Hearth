// Meal Planner hub — week day strip, slot cards (breakfast/lunch/dinner),
// dish picker sheet, and remove-from-plan confirm.

import { useCallback, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { router } from 'expo-router';

import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icons/Icon';
import { ErrorState } from '@/components/shared';
import { ScreenHeader } from '@/components/ui';
import { getWeekDates, MEAL_SLOTS, toDateKey } from '@/constants/meals';
import {
  addPlanEntry,
  type DishWithCount,
  getAllDishes,
  getPlanForRange,
  type PlanEntry,
  removePlanEntry,
} from '@/db/modules/meals';
import { useFocusRefresh } from '@/hooks';
import { colors, fontFamily, fontSize, radius, shadows, spacing } from '@/theme';

export default function MealPlannerScreen() {
  const { t } = useTranslation('meals');
  const insets = useSafeAreaInsets();

  const weekDates = useMemo(() => getWeekDates(), []);
  const todayKey = toDateKey(weekDates[0]);

  const [selectedDate, setSelectedDate] = useState(todayKey);
  const [plan, setPlan] = useState<PlanEntry[]>([]);
  const [dishes, setDishes] = useState<DishWithCount[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [pickerSlot, setPickerSlot] = useState<string | null>(null);
  const [removeEntry, setRemoveEntry] = useState<PlanEntry | null>(null);

  async function loadData(isRefresh = false) {
    if (isRefresh) setRefreshing(true);
    setError(null);
    try {
      const endKey = toDateKey(weekDates[weekDates.length - 1]);
      const [planRows, dishRows] = await Promise.all([
        getPlanForRange(todayKey, endKey),
        getAllDishes(),
      ]);
      setPlan(planRows);
      setDishes(dishRows);
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Error'));
    } finally {
      setRefreshing(false);
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const load = useCallback(() => loadData(false), []);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const refresh = useCallback(() => loadData(true), []);
  useFocusRefresh(load, refresh);

  const entriesByDaySlot = useMemo(() => {
    const map: Record<string, PlanEntry[]> = {};
    for (const entry of plan) {
      const key = `${entry.date}_${entry.slot}`;
      (map[key] ??= []).push(entry);
    }
    return map;
  }, [plan]);

  const plannedCountByDay = useMemo(() => {
    const map: Record<string, number> = {};
    for (const entry of plan) map[entry.date] = (map[entry.date] ?? 0) + 1;
    return map;
  }, [plan]);

  async function handlePickDish(dishId: string) {
    if (!pickerSlot) return;
    setPickerSlot(null);
    await addPlanEntry(selectedDate, pickerSlot, dishId);
    load();
  }

  async function handleRemove() {
    if (!removeEntry) return;
    setRemoveEntry(null);
    await removePlanEntry(removeEntry.id);
    load();
  }

  if (error) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ScreenHeader title={t('screen_title')} onBack={() => router.back()} />
        <ErrorState title={t('error_title')} retryLabel={t('error_retry')} onRetry={load} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader
        title={t('screen_title')}
        onBack={() => router.back()}
        right={
          <TouchableOpacity
            style={styles.libraryBtn}
            activeOpacity={0.7}
            onPress={() => router.push('/meals/library' as never)}
          >
            <Icon.recipe size={18} color={colors.ink} />
          </TouchableOpacity>
        }
      />

      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dayStrip}
        >
          {weekDates.map((d) => {
            const key = toDateKey(d);
            const active = key === selectedDate;
            const planned = plannedCountByDay[key] ?? 0;
            return (
              <TouchableOpacity
                key={key}
                style={[styles.dayChip, active && styles.dayChipActive]}
                activeOpacity={0.8}
                onPress={() => setSelectedDate(key)}
              >
                <Text style={[styles.dayName, active && styles.dayTextActive]}>
                  {key === todayKey ? t('today') : d.toLocaleDateString([], { weekday: 'short' })}
                </Text>
                <Text style={[styles.dayNum, active && styles.dayTextActive]}>{d.getDate()}</Text>
                {planned > 0 && <View style={[styles.dayDot, active && styles.dayDotActive]} />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {MEAL_SLOTS.map((slot) => {
          const entries = entriesByDaySlot[`${selectedDate}_${slot.id}`] ?? [];
          return (
            <View key={slot.id} style={styles.slotCard}>
              <View style={styles.slotHeader}>
                <View style={[styles.slotIcon, { backgroundColor: slot.bg }]}>
                  <Text style={styles.slotEmoji}>{slot.emoji}</Text>
                </View>
                <Text style={[styles.slotLabel, { color: slot.tint }]}>{t(`slot_${slot.id}`)}</Text>
              </View>

              {entries.length === 0 ? (
                <Text style={styles.emptySlotText}>{t('nothing_planned')}</Text>
              ) : (
                entries.map((entry) => (
                  <TouchableOpacity
                    key={entry.id}
                    style={styles.mealRow}
                    activeOpacity={0.8}
                    onPress={() => router.push(`/meals/dish/${entry.dish_id}` as never)}
                  >
                    <Text style={styles.mealEmoji}>{entry.dish_emoji}</Text>
                    <View style={styles.mealBody}>
                      <Text style={styles.mealName} numberOfLines={1}>
                        {entry.dish_name}
                      </Text>
                      {entry.prep_minutes ? (
                        <Text style={styles.mealMeta}>{t('n_min', { n: entry.prep_minutes })}</Text>
                      ) : null}
                    </View>
                    <TouchableOpacity
                      style={styles.removeBtn}
                      activeOpacity={0.7}
                      onPress={() => setRemoveEntry(entry)}
                    >
                      <Icon.close size={14} color={colors.ink3} />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))
              )}

              <TouchableOpacity
                style={styles.addMealBtn}
                activeOpacity={0.75}
                onPress={() => setPickerSlot(slot.id)}
              >
                <Icon.plus size={14} color={colors.primary} stroke={2.5} />
                <Text style={styles.addMealLabel}>{t('add_meal')}</Text>
              </TouchableOpacity>
            </View>
          );
        })}

        <View style={styles.footer} />
      </ScrollView>

      {/* Dish picker sheet */}
      <Modal
        transparent
        visible={pickerSlot !== null}
        animationType="slide"
        onRequestClose={() => setPickerSlot(null)}
      >
        <Pressable style={styles.backdrop} onPress={() => setPickerSlot(null)} />
        <View style={styles.sheet}>
          <View style={styles.grabber} />
          <Text style={styles.sheetTitle}>{t('pick_dish_title')}</Text>
          {dishes.length === 0 ? (
            <View style={styles.sheetEmpty}>
              <Text style={styles.sheetEmptyEmoji}>🍽️</Text>
              <Text style={styles.sheetEmptyTitle}>{t('no_dishes')}</Text>
              <Text style={styles.sheetEmptyBody}>{t('no_dishes_body')}</Text>
              <TouchableOpacity
                style={styles.sheetCta}
                activeOpacity={0.85}
                onPress={() => {
                  setPickerSlot(null);
                  router.push('/meals/dish/new' as never);
                }}
              >
                <Text style={styles.sheetCtaLabel}>{t('create_dish')}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView style={styles.sheetList} showsVerticalScrollIndicator={false}>
              {dishes.map((dish) => (
                <TouchableOpacity
                  key={dish.id}
                  style={styles.sheetRow}
                  activeOpacity={0.75}
                  onPress={() => handlePickDish(dish.id)}
                >
                  <Text style={styles.sheetRowEmoji}>{dish.emoji}</Text>
                  <View style={styles.sheetRowBody}>
                    <Text style={styles.sheetRowName} numberOfLines={1}>
                      {dish.name}
                    </Text>
                    <Text style={styles.sheetRowMeta}>
                      {t(`type_${dish.meal_type}`)}
                      {dish.prep_minutes ? ` · ${t('n_min', { n: dish.prep_minutes })}` : ''}
                    </Text>
                  </View>
                  <Icon.plus size={16} color={colors.primary} stroke={2.5} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
          <TouchableOpacity
            style={styles.sheetCancel}
            activeOpacity={0.8}
            onPress={() => setPickerSlot(null)}
          >
            <Text style={styles.sheetCancelLabel}>{t('cancel')}</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Remove-from-plan confirm */}
      <Modal
        transparent
        visible={removeEntry !== null}
        animationType="slide"
        onRequestClose={() => setRemoveEntry(null)}
      >
        <Pressable style={styles.backdrop} onPress={() => setRemoveEntry(null)} />
        <View style={styles.sheet}>
          <View style={styles.grabber} />
          <Text style={styles.confirmTitle}>
            {t('remove_meal_title', { name: removeEntry?.dish_name ?? '' })}
          </Text>
          <Text style={styles.confirmBody}>{t('remove_meal_body')}</Text>
          <TouchableOpacity style={styles.confirmBtn} activeOpacity={0.85} onPress={handleRemove}>
            <Text style={styles.confirmBtnLabel}>{t('remove')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.sheetCancel}
            activeOpacity={0.8}
            onPress={() => setRemoveEntry(null)}
          >
            <Text style={styles.sheetCancelLabel}>{t('cancel')}</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  libraryBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayStrip: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: spacing[7],
    paddingBottom: 14,
  },
  dayChip: {
    width: 58,
    paddingVertical: 10,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    gap: 2,
  },
  dayChipActive: { backgroundColor: colors.ink, borderColor: colors.ink },
  dayName: { fontFamily: fontFamily.semiBold, fontSize: 11, color: colors.ink3 },
  dayNum: { fontFamily: fontFamily.extraBold, fontSize: 17, color: colors.ink },
  dayTextActive: { color: colors.white },
  dayDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginTop: 2,
  },
  dayDotActive: { backgroundColor: colors.butter },
  scroll: { flex: 1 },
  slotCard: {
    marginHorizontal: spacing[7],
    marginBottom: 12,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 14,
  },
  slotHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  slotIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotEmoji: { fontSize: 16 },
  slotLabel: { fontFamily: fontFamily.bold, fontSize: fontSize.cardTitle },
  emptySlotText: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    color: colors.ink4,
    marginBottom: 10,
    marginLeft: 4,
  },
  mealRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 9,
    paddingHorizontal: 10,
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    marginBottom: 8,
  },
  mealEmoji: { fontSize: 22 },
  mealBody: { flex: 1, minWidth: 0 },
  mealName: { fontFamily: fontFamily.bold, fontSize: fontSize.body, color: colors.ink },
  mealMeta: { fontFamily: fontFamily.regular, fontSize: 11.5, color: colors.ink3, marginTop: 1 },
  removeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addMealBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 40,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.primarySoft,
    backgroundColor: colors.primarySoft,
  },
  addMealLabel: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.primaryInk },
  footer: { height: 60 },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(20,22,30,0.45)' },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: '72%',
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing[7],
    paddingTop: spacing[5],
    paddingBottom: 28,
    ...shadows.sh3,
  },
  grabber: {
    width: 36,
    height: 5,
    backgroundColor: colors.ink4,
    opacity: 0.4,
    borderRadius: 3,
    marginBottom: 14,
    alignSelf: 'center',
  },
  sheetTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 18,
    color: colors.ink,
    marginBottom: 12,
  },
  sheetList: { flexGrow: 0 },
  sheetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.line2,
  },
  sheetRowEmoji: { fontSize: 24 },
  sheetRowBody: { flex: 1, minWidth: 0 },
  sheetRowName: { fontFamily: fontFamily.bold, fontSize: fontSize.body, color: colors.ink },
  sheetRowMeta: { fontFamily: fontFamily.regular, fontSize: 12, color: colors.ink3, marginTop: 1 },
  sheetEmpty: { alignItems: 'center', paddingVertical: 24, gap: 6 },
  sheetEmptyEmoji: { fontSize: 40 },
  sheetEmptyTitle: { fontFamily: fontFamily.bold, fontSize: 16, color: colors.ink },
  sheetEmptyBody: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    color: colors.ink3,
    textAlign: 'center',
  },
  sheetCta: {
    marginTop: 10,
    paddingHorizontal: 22,
    height: 46,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetCtaLabel: { fontFamily: fontFamily.bold, fontSize: 14, color: colors.white },
  sheetCancel: { height: 46, alignItems: 'center', justifyContent: 'center', marginTop: 6 },
  sheetCancelLabel: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.cardTitle,
    color: colors.ink3,
  },
  confirmTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 19,
    color: colors.ink,
    textAlign: 'center',
    marginBottom: 6,
  },
  confirmBody: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.body,
    color: colors.ink2,
    textAlign: 'center',
    marginBottom: 18,
  },
  confirmBtn: {
    height: 52,
    borderRadius: radius.pill,
    backgroundColor: colors.rose,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnLabel: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.cardTitle,
    color: colors.white,
  },
});

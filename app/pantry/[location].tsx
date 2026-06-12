// Pantry location detail — stat strip, filter chips, item list with qty steppers.

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

import { router, useLocalSearchParams } from 'expo-router';

import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icons/Icon';
import { EmptyState, ErrorState } from '@/components/shared';
import { FAB, ScreenHeader } from '@/components/ui';
import { expiryLabel, getItemStatus, type ItemStatus, LOCATION_MAP } from '@/constants/pantry';
import { deleteItem, getAllItems, type PantryItem, updateQty } from '@/db/modules/pantry';
import { useFocusRefresh } from '@/hooks';
import { colors, fontFamily, fontSize, radius, shadows, spacing } from '@/theme';

const TODAY = new Date().toISOString().slice(0, 10);

type FilterTab = 'all' | 'low' | 'expiring';

const STATUS_STYLE: Record<ItemStatus, { bg: string; color: string }> = {
  ok: { bg: colors.mintSoft, color: colors.mint },
  low: { bg: colors.butterSoft, color: '#8A6220' },
  out: { bg: colors.roseSoft, color: colors.rose },
  expiring: { bg: colors.butterSoft, color: '#8A6220' },
  expired: { bg: colors.roseSoft, color: colors.rose },
};

function formatQty(qty: number): string {
  return Number.isInteger(qty) ? String(qty) : qty.toFixed(2);
}

export default function PantryLocationScreen() {
  const { location: locationId } = useLocalSearchParams<{ location: string }>();
  const { t } = useTranslation('pantry');
  const insets = useSafeAreaInsets();

  const [items, setItems] = useState<PantryItem[]>([]);
  const [filter, setFilter] = useState<FilterTab>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PantryItem | null>(null);

  const location = LOCATION_MAP[locationId];

  async function loadData(isRefresh = false) {
    if (isRefresh) setRefreshing(true);
    setError(null);
    try {
      setItems(await getAllItems(locationId));
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Error'));
    } finally {
      setRefreshing(false);
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const load = useCallback(() => loadData(false), [locationId]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const refresh = useCallback(() => loadData(true), [locationId]);
  useFocusRefresh(load, refresh);

  const itemsWithStatus = useMemo(
    () =>
      items.map((item) => ({
        item,
        status: getItemStatus(
          item.qty,
          item.low_threshold,
          item.expiry_date,
          item.warn_days,
          TODAY
        ),
      })),
    [items]
  );

  const stats = useMemo(() => {
    let low = 0;
    let expiring = 0;
    let fresh = 0;
    for (const { status } of itemsWithStatus) {
      if (status === 'low' || status === 'out') low += 1;
      else if (status === 'expiring' || status === 'expired') expiring += 1;
      else fresh += 1;
    }
    return { total: itemsWithStatus.length, low, expiring, fresh };
  }, [itemsWithStatus]);

  const filtered = useMemo(() => {
    if (filter === 'low') {
      return itemsWithStatus.filter(({ status }) => status === 'low' || status === 'out');
    }
    if (filter === 'expiring') {
      return itemsWithStatus.filter(({ status }) => status === 'expiring' || status === 'expired');
    }
    return itemsWithStatus;
  }, [itemsWithStatus, filter]);

  async function handleQtyChange(item: PantryItem, delta: number) {
    const next = Math.max(0, item.qty + delta);
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, qty: next } : i)));
    await updateQty(item.id, next);
  }

  async function handleDelete(removeForever: boolean) {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setDeleteTarget(null);
    if (removeForever) {
      await deleteItem(target.id);
    } else {
      await updateQty(target.id, 0);
    }
    load();
  }

  const title = location ? t(`loc_${location.id}`) : locationId;

  if (error) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ScreenHeader title={title} onBack={() => router.back()} />
        <ErrorState title={t('error_title')} retryLabel={t('error_retry')} onRetry={load} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader title={title} onBack={() => router.back()} />

      <View style={styles.statsRow}>
        <StatPill label={t('stat_items')} value={stats.total} color={colors.ink} />
        <StatPill label={t('stat_low')} value={stats.low} color={colors.rose} />
        <StatPill label={t('stat_expiring')} value={stats.expiring} color="#8A6220" />
        <StatPill label={t('stat_fresh')} value={stats.fresh} color={colors.mint} />
      </View>

      <View style={styles.tabBar}>
        {(['all', 'low', 'expiring'] as FilterTab[]).map((id) => {
          const labels: Record<FilterTab, string> = {
            all: t('filter_all'),
            low: t('filter_low'),
            expiring: t('filter_expiring'),
          };
          return (
            <TouchableOpacity
              key={id}
              style={[styles.tabBtn, filter === id && styles.tabBtnActive]}
              onPress={() => setFilter(id)}
              activeOpacity={0.75}
            >
              <Text style={[styles.tabLabel, filter === id && styles.tabLabelActive]}>
                {labels[id]}
              </Text>
            </TouchableOpacity>
          );
        })}
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
        {filtered.length === 0 ? (
          <EmptyState
            emoji={location?.emoji ?? '📦'}
            title={t('no_items')}
            body={t('no_items_body')}
          />
        ) : (
          <View style={styles.list}>
            {filtered.map(({ item, status }) => {
              const statusStyle = STATUS_STYLE[status];
              let badgeText: string | null = null;
              if (status === 'expiring' || status === 'expired') {
                badgeText = item.expiry_date ? expiryLabel(item.expiry_date, TODAY) : null;
              } else if (status === 'low') {
                badgeText = t('below_threshold', {
                  threshold: item.low_threshold,
                  unit: item.unit,
                });
              }

              return (
                <TouchableOpacity
                  key={item.id}
                  style={styles.card}
                  activeOpacity={0.8}
                  onPress={() => router.push(`/pantry/item/${item.id}` as never)}
                >
                  <Text style={styles.itemEmoji}>{item.emoji}</Text>
                  <View style={styles.cardBody}>
                    <Text style={styles.cardTitle} numberOfLines={1}>
                      {item.name}
                    </Text>
                    {badgeText ? (
                      <View style={[styles.badge, { backgroundColor: statusStyle.bg }]}>
                        <Text style={[styles.badgeText, { color: statusStyle.color }]}>
                          {badgeText}
                        </Text>
                      </View>
                    ) : (
                      <Text style={styles.cardMeta} numberOfLines={1}>
                        {item.brand ?? t('in_stock')}
                      </Text>
                    )}
                  </View>
                  <View style={styles.stepper}>
                    <TouchableOpacity
                      style={styles.stepperBtn}
                      activeOpacity={0.7}
                      onPress={() => handleQtyChange(item, -1)}
                    >
                      <Text style={styles.stepperBtnText}>−</Text>
                    </TouchableOpacity>
                    <Text style={[styles.stepperValue, status === 'out' && { color: colors.rose }]}>
                      {formatQty(item.qty)} {item.unit}
                    </Text>
                    <TouchableOpacity
                      style={styles.stepperBtn}
                      activeOpacity={0.7}
                      onPress={() => handleQtyChange(item, 1)}
                    >
                      <Text style={styles.stepperBtnText}>+</Text>
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity
                    onPress={() => setDeleteTarget(item)}
                    activeOpacity={0.7}
                    style={styles.deleteBtn}
                  >
                    <Icon.trash size={14} color={colors.ink4} />
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <View style={styles.footer} />
      </ScrollView>

      <FAB onPress={() => router.push(`/pantry/item/new?location=${locationId}` as never)} />

      <Modal
        transparent
        visible={!!deleteTarget}
        animationType="slide"
        onRequestClose={() => setDeleteTarget(null)}
      >
        <Pressable style={styles.backdrop} onPress={() => setDeleteTarget(null)} />
        <View style={styles.sheet}>
          <View style={styles.grabber} />
          <View style={styles.deleteIcon}>
            <Icon.trash size={24} color={colors.rose} />
          </View>
          <Text style={styles.deleteTitle}>
            {t('delete_title', { name: deleteTarget?.name ?? '' })}
          </Text>
          <Text style={styles.deleteBody}>{t('delete_body')}</Text>
          <TouchableOpacity
            style={styles.deleteConfirmBtn}
            activeOpacity={0.85}
            onPress={() => handleDelete(true)}
          >
            <Text style={styles.deleteConfirmLabel}>{t('remove_forever')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.setZeroBtn}
            activeOpacity={0.85}
            onPress={() => handleDelete(false)}
          >
            <Text style={styles.setZeroLabel}>{t('set_zero_instead')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cancelBtn}
            activeOpacity={0.8}
            onPress={() => setDeleteTarget(null)}
          >
            <Text style={styles.cancelLabel}>{t('cancel')}</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

function StatPill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={styles.statPill}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: spacing[7],
    marginBottom: 12,
    gap: 8,
  },
  statPill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
  },
  statValue: { fontFamily: fontFamily.extraBold, fontSize: 20 },
  statLabel: { fontFamily: fontFamily.semiBold, fontSize: 10, color: colors.ink3, marginTop: 1 },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: spacing[7],
    marginBottom: 14,
    backgroundColor: colors.surface2,
    borderRadius: radius.md,
    padding: 3,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: radius.sm,
    alignItems: 'center',
  },
  tabBtnActive: { backgroundColor: colors.white, ...shadows.sh1 },
  tabLabel: { fontFamily: fontFamily.semiBold, fontSize: 12, color: colors.ink3 },
  tabLabelActive: { color: colors.ink, fontFamily: fontFamily.bold },
  scroll: { flex: 1 },
  list: { paddingHorizontal: spacing[7], gap: 8 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
  },
  itemEmoji: { fontSize: 22 },
  cardBody: { flex: 1, minWidth: 0 },
  cardTitle: { fontFamily: fontFamily.bold, fontSize: fontSize.body, color: colors.ink },
  cardMeta: { fontFamily: fontFamily.regular, fontSize: 12, color: colors.ink3, marginTop: 1 },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    marginTop: 3,
  },
  badgeText: { fontFamily: fontFamily.bold, fontSize: 10 },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
  },
  stepperBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBtnText: {
    fontFamily: fontFamily.bold,
    fontSize: 16,
    color: colors.ink2,
    lineHeight: 18,
  },
  stepperValue: {
    fontFamily: fontFamily.bold,
    fontSize: 12,
    color: colors.ink,
    minWidth: 48,
    textAlign: 'center',
  },
  deleteBtn: { padding: 6 },
  footer: { height: 80 },
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
  setZeroBtn: {
    width: '100%',
    height: 52,
    borderRadius: radius.pill,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  setZeroLabel: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.cardTitle,
    color: colors.ink,
  },
  cancelBtn: { height: 48, width: '100%', alignItems: 'center', justifyContent: 'center' },
  cancelLabel: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.cardTitle,
    color: colors.ink3,
  },
});

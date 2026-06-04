// Spot detail — items grid inside this storage spot.

import { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { router, useLocalSearchParams } from 'expo-router';

import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState, ErrorState } from '@/components/shared';
import { FAB, ScreenHeader } from '@/components/ui';
import { formatLastSeen, LOCATOR_CAT_MAP } from '@/constants/locator';
import {
  getItemsForSpot,
  getRoomById,
  getSpotById,
  type LocatedItem,
  type Room,
  type StorageSpot,
} from '@/db/modules/locator';
import { useFocusRefresh } from '@/hooks';
import { colors, fontFamily, fontSize, spacing } from '@/theme';

export default function SpotDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation('locator');
  const insets = useSafeAreaInsets();

  const [spot, setSpot] = useState<StorageSpot | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [items, setItems] = useState<LocatedItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadData = useCallback(
    async (isRefresh = false) => {
      if (!id) return;
      if (isRefresh) setRefreshing(true);
      setError(null);
      try {
        const s = await getSpotById(id);
        const [r, allItems] = await Promise.all([
          s ? getRoomById(s.room_id) : Promise.resolve(null),
          getItemsForSpot(id),
        ]);
        setSpot(s);
        setRoom(r);
        setItems(allItems);
      } catch (e) {
        setError(e instanceof Error ? e : new Error('Error'));
      } finally {
        setRefreshing(false);
      }
    },
    [id]
  );

  const load = useCallback(() => {
    loadData(false);
  }, [loadData]);
  const refresh = useCallback(() => {
    loadData(true);
  }, [loadData]);
  useFocusRefresh(load, refresh);

  if (error) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ScreenHeader title={spot?.name ?? '...'} onBack={() => router.back()} />
        <ErrorState title={t('error_title')} retryLabel={t('error_retry')} onRetry={load} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader title={spot?.name ?? '...'} onBack={() => router.back()} />

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
        {/* Breadcrumb + header */}
        {room && (
          <View style={styles.breadcrumb}>
            <Text style={styles.crumbPart}>{room.name}</Text>
            <Text style={styles.crumbArrow}>›</Text>
            <Text style={[styles.crumbPart, styles.crumbActive]}>{spot?.name}</Text>
          </View>
        )}

        <View style={styles.countRow}>
          <Text style={styles.countText}>{t('items_inside_label')}</Text>
          <Text style={styles.countBadge}>{items.length}</Text>
        </View>

        {/* Items grid */}
        {items.length === 0 ? (
          <EmptyState emoji="📦" title={t('no_items_spot_title')} body={t('no_items_spot_body')} />
        ) : (
          <View style={styles.grid}>
            {items.map((item) => {
              const cat = item.category ? LOCATOR_CAT_MAP[item.category] : null;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={styles.itemCard}
                  activeOpacity={0.8}
                  onPress={() => router.push(`/locator/item/${item.id}` as never)}
                >
                  <View
                    style={[styles.itemPhoto, { backgroundColor: cat?.soft ?? colors.surface2 }]}
                  >
                    <Text style={styles.itemEmoji}>{item.emoji}</Text>
                  </View>
                  <Text style={styles.itemName} numberOfLines={2}>
                    {item.name}
                  </Text>
                  <Text style={styles.itemWhen}>{formatLastSeen(item.last_seen)}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <View style={styles.footer} />
      </ScrollView>

      <FAB
        onPress={() =>
          router.push({ pathname: '/locator/item/new', params: { spotId: id } } as never)
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { flex: 1 },
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing[7],
    marginBottom: 4,
  },
  crumbPart: { fontFamily: fontFamily.semiBold, fontSize: 12, color: colors.ink3 },
  crumbArrow: { fontFamily: fontFamily.regular, fontSize: 12, color: colors.ink4 },
  crumbActive: { fontFamily: fontFamily.bold, color: colors.ink },
  countRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: spacing[7],
    marginBottom: 14,
  },
  countText: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.caption,
    color: colors.ink3,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  countBadge: { fontFamily: fontFamily.bold, fontSize: 12, color: colors.primary },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: spacing[7], gap: 10 },
  itemCard: {
    width: '47%',
    padding: 10,
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.line,
  },
  itemPhoto: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  itemEmoji: { fontSize: 42 },
  itemName: { fontFamily: fontFamily.bold, fontSize: 12.5, color: colors.ink, lineHeight: 17 },
  itemWhen: { fontFamily: fontFamily.regular, fontSize: 10, color: colors.ink4, marginTop: 3 },
  footer: { height: 100 },
});

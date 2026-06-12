// Pantry & Inventory hub — search, expiry/low-stock alerts, location grid.

import { useCallback, useMemo, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { router } from 'expo-router';

import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icons/Icon';
import { EmptyState, ErrorState } from '@/components/shared';
import { FAB, ScreenHeader } from '@/components/ui';
import { LOCATION_MAP, PANTRY_LOCATIONS } from '@/constants/pantry';
import {
  getAllItems,
  getExpiringItems,
  getLocationStats,
  getLowItems,
  type LocationStat,
  type PantryItem,
} from '@/db/modules/pantry';
import { useFocusRefresh } from '@/hooks';
import { colors, fontFamily, fontSize, radius, spacing } from '@/theme';

export default function PantryScreen() {
  const { t } = useTranslation('pantry');
  const insets = useSafeAreaInsets();

  const [allItems, setAllItems] = useState<PantryItem[]>([]);
  const [stats, setStats] = useState<LocationStat[]>([]);
  const [expiringItems, setExpiringItems] = useState<PantryItem[]>([]);
  const [lowItems, setLowItems] = useState<PantryItem[]>([]);
  const [query, setQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  async function loadData(isRefresh = false) {
    if (isRefresh) setRefreshing(true);
    setError(null);
    try {
      const [items, locationStats, expiring, low] = await Promise.all([
        getAllItems(),
        getLocationStats(),
        getExpiringItems(7),
        getLowItems(),
      ]);
      setAllItems(items);
      setStats(locationStats);
      setExpiringItems(expiring);
      setLowItems(low);
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Error'));
    } finally {
      setRefreshing(false);
    }
  }

  const load = useCallback(() => loadData(false), []);
  const refresh = useCallback(() => loadData(true), []);
  useFocusRefresh(load, refresh);

  const statsByLocation = useMemo(() => {
    const map: Record<string, LocationStat> = {};
    for (const s of stats) map[s.location_id] = s;
    return map;
  }, [stats]);

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return allItems.filter(
      (item) =>
        item.name.toLowerCase().includes(q) || (item.brand?.toLowerCase().includes(q) ?? false)
    );
  }, [allItems, query]);

  if (error) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ScreenHeader title={t('screen_title')} showBack={false} />
        <ErrorState title={t('error_title')} retryLabel={t('error_retry')} onRetry={load} />
      </View>
    );
  }

  const isSearching = query.trim().length > 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader title={t('screen_title')} showBack={false} />

      <View style={styles.searchBar}>
        <Icon.search size={18} color={colors.ink3} />
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder={t('search_placeholder')}
          placeholderTextColor={colors.ink4}
          returnKeyType="search"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')} activeOpacity={0.7}>
            <Icon.close size={16} color={colors.ink3} />
          </TouchableOpacity>
        )}
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
        {isSearching ? (
          <View style={styles.list}>
            {searchResults.length === 0 ? (
              <EmptyState emoji="🔍" title={t('no_results', { query: query.trim() })} />
            ) : (
              searchResults.map((item) => {
                const loc = LOCATION_MAP[item.location_id];
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
                      <Text style={styles.cardMeta} numberOfLines={1}>
                        {loc ? t(`loc_${loc.id}`) : item.location_id}
                        {item.brand ? ` · ${item.brand}` : ''}
                      </Text>
                    </View>
                    <Text style={styles.cardQty}>
                      {item.qty} {item.unit}
                    </Text>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        ) : (
          <>
            {expiringItems.length > 0 && (
              <View style={[styles.alertBanner, { backgroundColor: colors.butterSoft }]}>
                <Icon.clock size={18} color={colors.primaryInk} />
                <Text style={styles.alertText}>
                  {t('alert_expiring_title', { n: expiringItems.length })}
                </Text>
              </View>
            )}

            {lowItems.length > 0 && (
              <View style={[styles.alertBanner, { backgroundColor: colors.roseSoft }]}>
                <Icon.bell size={18} color={colors.rose} />
                <View style={styles.alertBody}>
                  <Text style={styles.alertText}>
                    {t('alert_low_title', { n: lowItems.length })}
                  </Text>
                  <Text style={styles.alertSubText}>{t('alert_low_action')}</Text>
                </View>
              </View>
            )}

            <Text style={styles.sectionTitle}>{t('section_locations')}</Text>

            <View style={styles.grid}>
              {PANTRY_LOCATIONS.map((loc) => {
                const stat = statsByLocation[loc.id];
                const count = stat?.count ?? 0;
                const lowCount = stat?.low_count ?? 0;
                return (
                  <TouchableOpacity
                    key={loc.id}
                    style={[styles.tile, { backgroundColor: loc.bg }]}
                    activeOpacity={0.8}
                    onPress={() => router.push(`/pantry/${loc.id}` as never)}
                  >
                    {lowCount > 0 && (
                      <View style={styles.tileBadge}>
                        <Text style={styles.tileBadgeText}>{lowCount}</Text>
                      </View>
                    )}
                    <Text style={styles.tileEmoji}>{loc.emoji}</Text>
                    <Text style={[styles.tileLabel, { color: loc.tint }]}>
                      {t(`loc_${loc.id}`)}
                    </Text>
                    <Text style={styles.tileCount}>{t('n_items', { n: count })}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}

        <View style={styles.footer} />
      </ScrollView>

      <FAB onPress={() => router.push('/pantry/item/new' as never)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: spacing[7],
    marginBottom: 14,
    paddingHorizontal: 14,
    height: 44,
    backgroundColor: colors.white,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.line,
  },
  searchInput: {
    flex: 1,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.body,
    color: colors.ink,
  },
  scroll: { flex: 1 },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: spacing[7],
    marginBottom: 10,
    padding: 12,
    borderRadius: radius.md,
  },
  alertBody: { flex: 1 },
  alertText: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.ink },
  alertSubText: { fontFamily: fontFamily.regular, fontSize: 11, color: colors.ink3, marginTop: 1 },
  sectionTitle: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.cardTitle,
    color: colors.ink,
    marginHorizontal: spacing[7],
    marginTop: 6,
    marginBottom: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: spacing[7],
    gap: 10,
  },
  tile: {
    width: '47%',
    borderRadius: radius.lg,
    padding: 14,
    minHeight: 104,
    justifyContent: 'space-between',
  },
  tileEmoji: { fontSize: 28 },
  tileLabel: { fontFamily: fontFamily.bold, fontSize: fontSize.cardTitle, marginTop: 8 },
  tileCount: { fontFamily: fontFamily.semiBold, fontSize: 12, color: colors.ink3, marginTop: 2 },
  tileBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    minWidth: 22,
    height: 22,
    paddingHorizontal: 5,
    borderRadius: 11,
    backgroundColor: colors.rose,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileBadgeText: { fontFamily: fontFamily.bold, fontSize: 11, color: colors.white },
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
  cardQty: { fontFamily: fontFamily.bold, fontSize: 12, color: colors.ink2, flexShrink: 0 },
  footer: { height: 80 },
});

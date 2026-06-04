// Locator home — search bar + rooms grid + recent items.

import { useCallback, useState } from 'react';
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
import { formatLastSeen, LOCATOR_CAT_MAP, LOCATOR_CATEGORIES } from '@/constants/locator';
import {
  getAllRooms,
  getLocatorStats,
  getRecentItems,
  getRoomStats,
  type LocatedItemWithPath,
  type Room,
} from '@/db/modules/locator';
import { useFocusRefresh } from '@/hooks';
import { colors, fontFamily, fontSize, radius, shadows, spacing } from '@/theme';

type RoomWithStats = Room & { spots: number; items: number };

export default function LocatorHomeScreen() {
  const { t } = useTranslation('locator');
  const insets = useSafeAreaInsets();

  const [rooms, setRooms] = useState<RoomWithStats[]>([]);
  const [recent, setRecent] = useState<LocatedItemWithPath[]>([]);
  const [stats, setStats] = useState({ rooms: 0, spots: 0, items: 0 });
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [query, setQuery] = useState('');

  async function loadData(isRefresh = false) {
    if (isRefresh) setRefreshing(true);
    setError(null);
    try {
      const [allRooms, recentItems, locStats] = await Promise.all([
        getAllRooms(),
        getRecentItems(5),
        getLocatorStats(),
      ]);
      const roomsWithStats = await Promise.all(
        allRooms.map(async (r) => ({ ...r, ...(await getRoomStats(r.id)) }))
      );
      setRooms(roomsWithStats);
      setRecent(recentItems);
      setStats(locStats);
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Error'));
    } finally {
      setRefreshing(false);
    }
  }

  const load = useCallback(() => loadData(false), []);
  const refresh = useCallback(() => loadData(true), []);
  useFocusRefresh(load, refresh);

  function handleSearch() {
    if (query.trim().length < 2) return;
    router.push({ pathname: '/locator/search', params: { q: query.trim() } } as never);
  }

  if (error) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ScreenHeader title={t('screen_title')} showBack={false} />
        <ErrorState title={t('error_title')} retryLabel={t('error_retry')} onRetry={load} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader title={t('screen_title')} showBack={false} />

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
        {/* Search bar */}
        <View style={styles.searchSection}>
          <TouchableOpacity style={styles.searchBar} activeOpacity={0.85} onPress={handleSearch}>
            <Icon.search size={20} color={colors.ink3} />
            <TextInput
              style={styles.searchInput}
              placeholder={t('search_placeholder')}
              placeholderTextColor={colors.ink4}
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery('')} activeOpacity={0.7}>
                <Icon.close size={16} color={colors.ink3} />
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        </View>

        {/* Stats strip */}
        <View style={styles.statsRow}>
          <StatTile label={t('stat_items')} value={stats.items} color={colors.ink} />
          <StatTile label={t('stat_rooms')} value={stats.rooms} color={colors.primary} />
          <StatTile label={t('stat_spots')} value={stats.spots} color={colors.sky} />
        </View>

        {/* Rooms grid */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('your_home')}</Text>
          <Text style={styles.sectionCount}>{t('rooms_count', { n: rooms.length })}</Text>
        </View>

        <View style={styles.roomsGrid}>
          {rooms.map((r) => (
            <TouchableOpacity
              key={r.id}
              style={styles.roomCard}
              activeOpacity={0.8}
              onPress={() => router.push(`/locator/room/${r.id}` as never)}
            >
              <Text style={styles.roomEmoji}>{r.emoji}</Text>
              <Text style={styles.roomName}>{r.name}</Text>
              <Text style={styles.roomMeta}>
                {r.spots} spots · {r.items} items
              </Text>
            </TouchableOpacity>
          ))}

          {/* Add room */}
          <TouchableOpacity
            style={styles.addRoomCard}
            activeOpacity={0.75}
            onPress={() => router.push('/locator/room/new' as never)}
          >
            <Icon.plus size={22} color={colors.ink4} />
            <Text style={styles.addRoomLabel}>{t('add_room')}</Text>
          </TouchableOpacity>
        </View>

        {/* Browse categories */}
        <Text style={[styles.sectionTitle, styles.sectionPad]}>{t('browse_category')}</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.catRow}
        >
          {LOCATOR_CATEGORIES.map((c) => (
            <View key={c.id} style={styles.catTile}>
              <View style={[styles.catIcon, { backgroundColor: c.soft }]}>
                <Text style={styles.catEmoji}>{c.emoji}</Text>
              </View>
              <Text style={styles.catLabel}>{c.label}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Recently added */}
        <Text style={[styles.sectionTitle, styles.sectionPad]}>{t('recently_added')}</Text>
        {recent.length === 0 ? (
          <EmptyState emoji="📦" title={t('no_items_yet')} body={t('no_items_body')} />
        ) : (
          <View style={styles.recentList}>
            {recent.map((item) => (
              <RecentRow
                key={item.id}
                item={item}
                onPress={() => router.push(`/locator/item/${item.id}` as never)}
              />
            ))}
          </View>
        )}

        <View style={styles.footer} />
      </ScrollView>

      <FAB onPress={() => router.push('/locator/item/new' as never)} />
    </View>
  );
}

function StatTile({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={styles.statTile}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function RecentRow({ item, onPress }: { item: LocatedItemWithPath; onPress: () => void }) {
  const cat = item.category ? LOCATOR_CAT_MAP[item.category] : null;
  const pathParts = [item.room_name, item.spot_name].filter(Boolean) as string[];
  return (
    <TouchableOpacity style={styles.recentCard} activeOpacity={0.8} onPress={onPress}>
      <View style={[styles.recentPhoto, { backgroundColor: cat?.soft ?? colors.surface2 }]}>
        <Text style={styles.recentEmoji}>{item.emoji}</Text>
      </View>
      <View style={styles.recentInfo}>
        <Text style={styles.recentName} numberOfLines={1}>
          {item.name}
        </Text>
        {pathParts.length > 0 ? (
          <Text style={styles.recentPath}>{pathParts.join(' › ')}</Text>
        ) : (
          <Text style={styles.recentPath}>{item.notes ?? ''}</Text>
        )}
        <Text style={styles.recentWhen}>{formatLastSeen(item.last_seen)}</Text>
      </View>
      <Icon.arrow size={16} color={colors.ink4} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { flex: 1 },
  searchSection: { paddingHorizontal: spacing[7], marginBottom: 16 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.ink,
    borderRadius: 16,
    paddingVertical: 13,
    paddingHorizontal: 16,
    ...shadows.sh1,
  },
  searchInput: { flex: 1, fontFamily: fontFamily.medium, fontSize: 15, color: colors.ink },
  statsRow: { flexDirection: 'row', gap: 8, paddingHorizontal: spacing[7], marginBottom: 20 },
  statTile: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 12,
    alignItems: 'center',
  },
  statValue: { fontFamily: fontFamily.extraBold, fontSize: 22, letterSpacing: -0.5 },
  statLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 10,
    color: colors.ink3,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[7],
    marginBottom: 10,
  },
  sectionTitle: { fontFamily: fontFamily.bold, fontSize: fontSize.cardTitle, color: colors.ink },
  sectionCount: { fontFamily: fontFamily.semiBold, fontSize: 12, color: colors.ink3 },
  sectionPad: { paddingHorizontal: spacing[7], marginBottom: 10 },
  roomsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing[7],
    gap: 10,
    marginBottom: 20,
  },
  roomCard: {
    width: '47%',
    minHeight: 110,
    padding: 14,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
  },
  roomEmoji: { fontSize: 32, lineHeight: 38 },
  roomName: { fontFamily: fontFamily.bold, fontSize: 14, color: colors.ink2, marginTop: 8 },
  roomMeta: { fontFamily: fontFamily.regular, fontSize: 11, color: colors.ink3, marginTop: 4 },
  addRoomCard: {
    width: '47%',
    minHeight: 110,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.ink4,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  addRoomLabel: { fontFamily: fontFamily.bold, fontSize: 12, color: colors.ink3 },
  catRow: { paddingHorizontal: spacing[7], paddingBottom: 4, gap: 10 },
  catTile: { alignItems: 'center', gap: 6, width: 72, marginBottom: 4 },
  catIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catEmoji: { fontSize: 22 },
  catLabel: { fontFamily: fontFamily.bold, fontSize: 10, color: colors.ink2, textAlign: 'center' },
  recentList: { paddingHorizontal: spacing[7], gap: 8 },
  recentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.line,
  },
  recentPhoto: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  recentEmoji: { fontSize: 28 },
  recentInfo: { flex: 1, minWidth: 0 },
  recentName: { fontFamily: fontFamily.bold, fontSize: 14, color: colors.ink },
  recentPath: { fontFamily: fontFamily.medium, fontSize: 12, color: colors.ink3, marginTop: 3 },
  recentWhen: { fontFamily: fontFamily.regular, fontSize: 11, color: colors.ink4, marginTop: 2 },
  footer: { height: 100 },
});

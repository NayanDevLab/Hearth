// Room detail — storage spots list + add spot sheet.

import { useCallback, useState } from 'react';
import {
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { router, useLocalSearchParams } from 'expo-router';

import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icons/Icon';
import { EmptyState, ErrorState } from '@/components/shared';
import { FAB, ScreenHeader } from '@/components/ui';
import { SPOT_EMOJIS } from '@/constants/locator';
import {
  getRoomById,
  getRoomStats,
  getSpotItemCount,
  getSpotsForRoom,
  insertSpot,
  type Room,
  type StorageSpot,
} from '@/db/modules/locator';
import { useFocusRefresh } from '@/hooks';
import { colors, fontFamily, fontSize, radius, shadows, spacing } from '@/theme';

type SpotWithCount = StorageSpot & { itemCount: number };

export default function RoomDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation('locator');
  const insets = useSafeAreaInsets();

  const [room, setRoom] = useState<Room | null>(null);
  const [spots, setSpots] = useState<SpotWithCount[]>([]);
  const [roomStats, setRoomStats] = useState({ spots: 0, items: 0 });
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Add spot sheet
  const [sheetVisible, setSheetVisible] = useState(false);
  const [spotName, setSpotName] = useState('');
  const [spotEmoji, setSpotEmoji] = useState(SPOT_EMOJIS[0]);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (isRefresh = false) => {
      if (!id) return;
      if (isRefresh) setRefreshing(true);
      setError(null);
      try {
        const [r, allSpots, stats] = await Promise.all([
          getRoomById(id),
          getSpotsForRoom(id),
          getRoomStats(id),
        ]);
        const spotsWithCount = await Promise.all(
          allSpots.map(async (s) => ({ ...s, itemCount: await getSpotItemCount(s.id) }))
        );
        setRoom(r);
        setSpots(spotsWithCount);
        setRoomStats(stats);
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

  async function handleAddSpot() {
    if (!spotName.trim() || saving || !id) return;
    setSaving(true);
    try {
      await insertSpot({
        id: `spot_${Date.now()}`,
        room_id: id,
        name: spotName.trim(),
        emoji: spotEmoji,
      });
      setSheetVisible(false);
      setSpotName('');
      setSpotEmoji(SPOT_EMOJIS[0]);
      loadData(false);
    } finally {
      setSaving(false);
    }
  }

  if (error) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ScreenHeader title={room?.name ?? '...'} onBack={() => router.back()} />
        <ErrorState title={t('error_title')} retryLabel={t('error_retry')} onRetry={load} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader title={room?.name ?? '...'} onBack={() => router.back()} />

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
        {/* Hero */}
        {room && (
          <View style={styles.hero}>
            <Text style={styles.heroEmoji}>{room.emoji}</Text>
            <View style={styles.heroText}>
              <Text style={styles.heroMeta}>{t('room_hero_spots', { n: roomStats.spots })}</Text>
              <Text style={styles.heroTitle}>{t('room_hero_items', { n: roomStats.items })}</Text>
              <Text style={styles.heroSub}>{t('room_hero_sub')}</Text>
            </View>
          </View>
        )}

        {/* Spots */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionLabel}>{t('storage_spots')}</Text>
        </View>

        {spots.length === 0 ? (
          <EmptyState emoji="📦" title={t('no_spots_title')} body={t('no_spots_body')} />
        ) : (
          <View style={styles.spotList}>
            {spots.map((s) => (
              <TouchableOpacity
                key={s.id}
                style={styles.spotCard}
                activeOpacity={0.8}
                onPress={() => router.push(`/locator/spot/${s.id}` as never)}
              >
                <View style={styles.spotPhoto}>
                  <Text style={styles.spotEmoji}>{s.emoji}</Text>
                </View>
                <View style={styles.spotInfo}>
                  <Text style={styles.spotName}>{s.name}</Text>
                  <Text style={styles.spotCount}>{t('items_inside', { n: s.itemCount })}</Text>
                </View>
                <Icon.arrow size={16} color={colors.ink4} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Add spot dashed button */}
        <TouchableOpacity
          style={styles.addSpotBtn}
          activeOpacity={0.75}
          onPress={() => setSheetVisible(true)}
        >
          <Icon.plus size={18} color={colors.ink3} />
          <Text style={styles.addSpotLabel}>{t('add_spot')}</Text>
        </TouchableOpacity>

        <View style={styles.footer} />
      </ScrollView>

      <FAB
        onPress={() =>
          router.push({ pathname: '/locator/item/new', params: { roomId: id } } as never)
        }
      />

      {/* Add spot sheet */}
      <Modal
        transparent
        visible={sheetVisible}
        animationType="slide"
        onRequestClose={() => setSheetVisible(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setSheetVisible(false)} />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.grabber} />
          <Text style={styles.sheetTitle}>{t('add_spot_title')}</Text>
          <Text style={styles.fieldLabel}>{t('spot_name_label')}</Text>
          <TextInput
            style={[styles.input, spotName.length > 0 && styles.inputFilled]}
            placeholder={t('spot_name_placeholder')}
            placeholderTextColor={colors.ink4}
            value={spotName}
            onChangeText={setSpotName}
            autoFocus
            autoCapitalize="words"
          />
          <Text style={[styles.fieldLabel, { marginTop: 12 }]}>{t('spot_emoji_label')}</Text>
          <View style={styles.emojiRow}>
            {SPOT_EMOJIS.map((e) => (
              <TouchableOpacity
                key={e}
                style={[styles.emojiCell, spotEmoji === e && styles.emojiCellActive]}
                activeOpacity={0.75}
                onPress={() => setSpotEmoji(e)}
              >
                <Text style={styles.emojiText}>{e}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity
            style={[styles.addBtn, !spotName.trim() && styles.addBtnDisabled]}
            activeOpacity={0.85}
            onPress={handleAddSpot}
            disabled={!spotName.trim() || saving}
          >
            <Icon.plus size={18} color={colors.white} />
            <Text style={styles.addBtnLabel}>{t('add_spot')}</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { flex: 1 },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginHorizontal: spacing[7],
    marginBottom: 20,
    padding: 18,
    borderRadius: 22,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
  },
  heroEmoji: { fontSize: 48, lineHeight: 54 },
  heroText: { flex: 1 },
  heroMeta: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    color: colors.primaryInk,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontFamily: fontFamily.extraBold,
    fontSize: 22,
    color: colors.ink,
    letterSpacing: -0.5,
    marginTop: 2,
  },
  heroSub: { fontFamily: fontFamily.regular, fontSize: 12, color: colors.ink3, marginTop: 2 },
  sectionRow: { paddingHorizontal: spacing[7], marginBottom: 10 },
  sectionLabel: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.caption,
    color: colors.ink3,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  spotList: { paddingHorizontal: spacing[7], gap: 8, marginBottom: 10 },
  spotCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
  },
  spotPhoto: {
    width: 60,
    height: 60,
    borderRadius: 14,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  spotEmoji: { fontSize: 30 },
  spotInfo: { flex: 1, minWidth: 0 },
  spotName: { fontFamily: fontFamily.bold, fontSize: 15, color: colors.ink },
  spotCount: { fontFamily: fontFamily.regular, fontSize: 12, color: colors.ink3, marginTop: 3 },
  addSpotBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: spacing[7],
    paddingVertical: 16,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderStyle: 'dashed',
  },
  addSpotLabel: { fontFamily: fontFamily.bold, fontSize: fontSize.body, color: colors.ink3 },
  footer: { height: 100 },
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
  sheetTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 18,
    color: colors.ink,
    marginBottom: 14,
    letterSpacing: -0.015,
  },
  fieldLabel: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.caption,
    color: colors.ink3,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: radius.sm,
    paddingVertical: 13,
    paddingHorizontal: 14,
    fontFamily: fontFamily.semiBold,
    fontSize: 15,
    color: colors.ink,
    backgroundColor: colors.white,
  },
  inputFilled: { borderColor: colors.primary },
  emojiRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  emojiCell: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiCellActive: { borderWidth: 2, borderColor: colors.ink, backgroundColor: colors.surface2 },
  emojiText: { fontSize: 26 },
  addBtn: {
    height: 52,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 8,
  },
  addBtnDisabled: { opacity: 0.45 },
  addBtnLabel: { fontFamily: fontFamily.bold, fontSize: fontSize.cardTitle, color: colors.white },
});

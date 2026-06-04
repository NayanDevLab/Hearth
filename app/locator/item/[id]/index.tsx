// Item detail — "You'll find it here" hero + location path + meta + confirm CTA.

import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { router, useLocalSearchParams } from 'expo-router';

import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icons/Icon';
import { ErrorState } from '@/components/shared';
import { ScreenHeader } from '@/components/ui';
import { formatLastSeen, LOCATOR_CAT_MAP } from '@/constants/locator';
import { confirmItemLocation, getItemById, type LocatedItemWithPath } from '@/db/modules/locator';
import { useFocusRefresh } from '@/hooks';
import { colors, fontFamily, fontSize, radius, spacing } from '@/theme';

export default function ItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation('locator');
  const insets = useSafeAreaInsets();

  const [item, setItem] = useState<LocatedItemWithPath | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [confirming, setConfirming] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      setItem(await getItemById(id));
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Error'));
    }
  }, [id]);
  useFocusRefresh(load, load);

  async function handleConfirm() {
    if (!id || confirming) return;
    setConfirming(true);
    try {
      await confirmItemLocation(id);
      await load();
    } finally {
      setConfirming(false);
    }
  }

  if (error) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ScreenHeader title={t('screen_title')} onBack={() => router.back()} />
        <ErrorState title={t('error_title')} retryLabel={t('error_retry')} onRetry={load} />
      </View>
    );
  }

  const cat = item?.category ? LOCATOR_CAT_MAP[item.category] : null;
  const pathParts = [item?.room_name, item?.spot_name].filter(Boolean) as string[];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader
        title=""
        onBack={() => router.back()}
        right={
          <TouchableOpacity
            style={styles.editBtn}
            activeOpacity={0.7}
            onPress={() => router.push(`/locator/item/${id}/edit` as never)}
          >
            <Icon.edit size={18} color={colors.ink} />
          </TouchableOpacity>
        }
      />

      {item && (
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Hero photo */}
          <View style={styles.heroPad}>
            <View style={[styles.heroPhoto, { backgroundColor: cat?.soft ?? colors.surface2 }]}>
              <Text style={styles.heroEmoji}>{item.emoji}</Text>
            </View>
          </View>

          {/* Title + category tag */}
          <View style={styles.titleSection}>
            {cat && (
              <View style={[styles.catTag, { backgroundColor: cat.soft }]}>
                <Text style={styles.catTagEmoji}>{cat.emoji}</Text>
                <Text style={[styles.catTagLabel, { color: cat.color }]}>{cat.label}</Text>
              </View>
            )}
            <Text style={styles.itemName}>{item.name}</Text>
          </View>

          {/* Location hero card */}
          {pathParts.length > 0 ? (
            <View style={styles.locationHero}>
              <Text style={styles.locationHeroLabel}>{t('found_here')}</Text>
              <View style={styles.pathRow}>
                {pathParts.map((p, i) => (
                  <View key={p} style={styles.pathPart}>
                    {i > 0 && <Text style={styles.pathArrow}>{t('path_arrow')}</Text>}
                    <Text style={styles.pathText}>{p}</Text>
                  </View>
                ))}
              </View>
              {item.notes ? <Text style={styles.locationNotes}>{item.notes}</Text> : null}
              <TouchableOpacity
                style={styles.confirmBtn}
                activeOpacity={0.85}
                onPress={handleConfirm}
                disabled={confirming}
              >
                <Icon.check size={14} color={colors.ink} stroke={2.5} />
                <Text style={styles.confirmBtnLabel}>{t('confirm_location')}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={[styles.locationHero, styles.locationUnset]}>
              <Text style={styles.locationHeroLabel}>{t('unplaced')}</Text>
              <TouchableOpacity
                style={styles.setLocationBtn}
                activeOpacity={0.8}
                onPress={() => router.push(`/locator/item/${id}/edit` as never)}
              >
                <Text style={styles.setLocationLabel}>{t('edit_item')}</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Meta */}
          <View style={styles.metaSection}>
            <MetaRow label={t('last_seen')} value={formatLastSeen(item.last_seen)} />
            {item.visibility === 'just_me' && (
              <MetaRow label={t('who_can_see')} value={t('visibility_me')} />
            )}
          </View>

          {/* Notes */}
          {item.notes ? (
            <View style={styles.notesSection}>
              <Text style={styles.notesLabel}>Notes</Text>
              <View style={styles.notesCard}>
                <Text style={styles.notesText}>{item.notes}</Text>
              </View>
            </View>
          ) : null}

          <View style={styles.footer} />
        </ScrollView>
      )}

      {/* Bottom bar */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        <TouchableOpacity
          style={styles.editBarBtn}
          activeOpacity={0.8}
          onPress={() => router.push(`/locator/item/${id}/edit` as never)}
        >
          <Icon.edit size={18} color={colors.ink} />
          <Text style={styles.editBarLabel}>{t('edit_item')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.confirmBarBtn}
          activeOpacity={0.85}
          onPress={handleConfirm}
          disabled={confirming}
        >
          <Icon.check size={18} color={colors.white} stroke={2.5} />
          <Text style={styles.confirmBarLabel}>{t('confirm_location')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metaRow}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue}>{value}</Text>
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
  heroPad: { paddingHorizontal: spacing[7], marginBottom: 14 },
  heroPhoto: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.line,
  },
  heroEmoji: { fontSize: 110 },
  titleSection: { paddingHorizontal: spacing[7], marginBottom: 16, gap: 8 },
  catTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
  catTagEmoji: { fontSize: 13 },
  catTagLabel: { fontFamily: fontFamily.bold, fontSize: 12 },
  itemName: {
    fontFamily: fontFamily.extraBold,
    fontSize: 26,
    color: colors.ink,
    letterSpacing: -0.5,
    lineHeight: 31,
  },
  locationHero: {
    marginHorizontal: spacing[7],
    marginBottom: 16,
    padding: 16,
    borderRadius: 18,
    backgroundColor: colors.ink,
    overflow: 'hidden',
  },
  locationUnset: { backgroundColor: colors.surface },
  locationHeroLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  pathRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: 8 },
  pathPart: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  pathArrow: { fontFamily: fontFamily.regular, fontSize: 13, color: 'rgba(255,255,255,0.5)' },
  pathText: { fontFamily: fontFamily.bold, fontSize: 14, color: colors.white },
  locationNotes: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    lineHeight: 19,
    marginBottom: 10,
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,240,200,0.9)',
    alignSelf: 'flex-start',
  },
  confirmBtnLabel: { fontFamily: fontFamily.bold, fontSize: 12, color: colors.ink },
  setLocationBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  setLocationLabel: { fontFamily: fontFamily.bold, fontSize: 12, color: colors.white },
  metaSection: {
    marginHorizontal: spacing[7],
    marginBottom: 12,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: 'hidden',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.line2,
  },
  metaLabel: {
    flex: 1,
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.body,
    color: colors.ink3,
  },
  metaValue: { fontFamily: fontFamily.semiBold, fontSize: fontSize.body, color: colors.ink },
  notesSection: { marginHorizontal: spacing[7], marginBottom: 12 },
  notesLabel: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.caption,
    color: colors.ink3,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  notesCard: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 14,
  },
  notesText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.body,
    color: colors.ink2,
    lineHeight: 22,
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
  confirmBarBtn: {
    flex: 1.6,
    height: 52,
    borderRadius: radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    backgroundColor: colors.mint,
  },
  confirmBarLabel: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.cardTitle,
    color: colors.white,
  },
});

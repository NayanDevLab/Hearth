// Vendor detail — name, trade, phone, rating, notes.

import { useCallback, useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { router, useLocalSearchParams } from 'expo-router';

import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icons/Icon';
import { ErrorState } from '@/components/shared';
import { ScreenHeader } from '@/components/ui';
import { TRADE_MAP } from '@/constants/maintenance';
import { getVendorById, type Vendor } from '@/db/modules/maintenance';
import { useFocusRefresh } from '@/hooks';
import { colors, fontFamily, fontSize, radius, spacing } from '@/theme';

export default function VendorDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation('maintenance');
  const { t: tc } = useTranslation('common');
  const insets = useSafeAreaInsets();

  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      setVendor(await getVendorById(id));
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Error'));
    }
  }, [id]);

  useFocusRefresh(load, load);

  if (error) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ScreenHeader title={t('vendor_detail_title')} onBack={() => router.back()} />
        <ErrorState title={t('error_title')} retryLabel={t('error_retry')} onRetry={load} />
      </View>
    );
  }

  if (!vendor) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ScreenHeader title={t('vendor_detail_title')} onBack={() => router.back()} />
      </View>
    );
  }

  const trade = vendor.trade ? TRADE_MAP[vendor.trade] : null;
  const stars = vendor.rating ? vendor.rating : 0;
  const starStr = '★'.repeat(stars) + '☆'.repeat(5 - stars);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader
        title=""
        onBack={() => router.back()}
        right={
          <TouchableOpacity
            style={styles.editBtn}
            activeOpacity={0.7}
            onPress={() => router.push(`/maintenance/vendor/${id}/edit` as never)}
          >
            <Icon.edit size={18} color={colors.ink} />
          </TouchableOpacity>
        }
      />

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroTop}>
            <View style={styles.tradeCircle}>
              <Text style={styles.tradeEmoji}>{trade?.emoji ?? '🛠'}</Text>
            </View>
            <View style={styles.heroMeta}>
              {trade ? (
                <View style={styles.tradeBadge}>
                  <Text style={styles.tradeBadgeText}>{trade.label}</Text>
                </View>
              ) : null}
              <Text style={styles.heroTitle}>{vendor.name}</Text>
              {vendor.rating ? <Text style={styles.stars}>{starStr}</Text> : null}
            </View>
          </View>
        </View>

        {/* Meta card */}
        <View style={styles.metaCard}>
          {vendor.phone ? (
            <View style={styles.metaRow}>
              <Icon.bell size={16} color={colors.ink3} />
              <Text style={styles.metaLabel}>{t('phone_label')}</Text>
              <Text style={styles.metaValue}>{vendor.phone}</Text>
            </View>
          ) : null}
          {vendor.trade ? (
            <View style={styles.metaRow}>
              <Icon.tools size={16} color={colors.ink3} />
              <Text style={styles.metaLabel}>{t('trade_label')}</Text>
              <Text style={styles.metaValue}>{trade?.label ?? vendor.trade}</Text>
            </View>
          ) : null}
        </View>

        {vendor.notes ? (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>{t('notes_label')}</Text>
            <View style={styles.notesCard}>
              <Text style={styles.notesText}>{vendor.notes}</Text>
            </View>
          </View>
        ) : null}

        <View style={styles.footer} />
      </ScrollView>

      {/* Bottom bar */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        <TouchableOpacity
          style={styles.editBarBtn}
          activeOpacity={0.8}
          onPress={() => router.push(`/maintenance/vendor/${id}/edit` as never)}
        >
          <Icon.edit size={18} color={colors.ink} />
          <Text style={styles.editBarLabel}>{tc('edit')}</Text>
        </TouchableOpacity>
        {vendor.phone ? (
          <TouchableOpacity
            style={styles.callBarBtn}
            activeOpacity={0.85}
            onPress={() => Linking.openURL(`tel:${vendor.phone}`)}
          >
            <Icon.bell size={18} color={colors.white} />
            <Text style={styles.callBarLabel}>{t('call_vendor')}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
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
  hero: { paddingHorizontal: spacing[7], marginBottom: 14 },
  heroTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, marginBottom: 12 },
  tradeCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  tradeEmoji: { fontSize: 28 },
  heroMeta: { flex: 1, paddingTop: 4 },
  tradeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: colors.surface2,
    marginBottom: 6,
  },
  tradeBadgeText: { fontFamily: fontFamily.bold, fontSize: 10, color: colors.ink2 },
  heroTitle: {
    fontFamily: fontFamily.extraBold,
    fontSize: 22,
    color: colors.ink,
    letterSpacing: -0.5,
  },
  stars: { fontFamily: fontFamily.regular, fontSize: 18, color: '#F5A623', marginTop: 4 },
  metaCard: {
    marginHorizontal: spacing[7],
    marginBottom: 14,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 13,
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
  section: { paddingHorizontal: spacing[7], marginBottom: 14 },
  sectionLabel: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.caption,
    color: colors.ink3,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 8,
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
  callBarBtn: {
    flex: 1.6,
    height: 52,
    borderRadius: radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    backgroundColor: colors.primary,
  },
  callBarLabel: { fontFamily: fontFamily.bold, fontSize: fontSize.cardTitle, color: colors.white },
});

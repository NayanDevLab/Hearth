// Appliance detail — name, brand, warranty, serial, purchase info.

import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { router, useLocalSearchParams } from 'expo-router';

import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icons/Icon';
import { ErrorState } from '@/components/shared';
import { ScreenHeader } from '@/components/ui';
import { warrantyLabel } from '@/constants/maintenance';
import { type Appliance, getApplianceById } from '@/db/modules/maintenance';
import { useFocusRefresh } from '@/hooks';
import { colors, fontFamily, fontSize, radius, spacing } from '@/theme';

export default function ApplianceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation('maintenance');
  const { t: tc } = useTranslation('common');
  const insets = useSafeAreaInsets();

  const [appliance, setAppliance] = useState<Appliance | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      setAppliance(await getApplianceById(id));
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Error'));
    }
  }, [id]);

  useFocusRefresh(load, load);

  if (error) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ScreenHeader title={t('appliance_detail_title')} onBack={() => router.back()} />
        <ErrorState title={t('error_title')} retryLabel={t('error_retry')} onRetry={load} />
      </View>
    );
  }

  if (!appliance) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ScreenHeader title={t('appliance_detail_title')} onBack={() => router.back()} />
      </View>
    );
  }

  const wl = warrantyLabel(appliance.warranty_until);
  let warrantyColor: string = colors.ink3;
  if (wl.status === 'active') warrantyColor = colors.mint;
  if (wl.status === 'expired') warrantyColor = colors.rose;
  let warrantySoft: string = colors.surface2;
  if (wl.status === 'active') warrantySoft = colors.mintSoft;
  if (wl.status === 'expired') warrantySoft = colors.roseSoft;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader
        title=""
        onBack={() => router.back()}
        right={
          <TouchableOpacity
            style={styles.editBtn}
            activeOpacity={0.7}
            onPress={() => router.push(`/maintenance/appliance/${id}/edit` as never)}
          >
            <Icon.edit size={18} color={colors.ink} />
          </TouchableOpacity>
        }
      />

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroTop}>
            <View style={styles.heroIcon}>
              <Text style={styles.heroEmoji}>🔌</Text>
            </View>
            <View style={styles.heroMeta}>
              <View style={[styles.warrantyBadge, { backgroundColor: warrantySoft }]}>
                <Text style={[styles.warrantyBadgeText, { color: warrantyColor }]}>{wl.text}</Text>
              </View>
              <Text style={styles.heroTitle}>{appliance.name}</Text>
              {appliance.brand ? <Text style={styles.heroBrand}>{appliance.brand}</Text> : null}
            </View>
          </View>

          {appliance.price ? (
            <View style={styles.priceRow}>
              <Icon.wallet size={16} color={colors.ink3} />
              <Text style={styles.priceText}>₹{appliance.price.toLocaleString('en-IN')} paid</Text>
            </View>
          ) : null}
        </View>

        {/* Meta card */}
        <View style={styles.metaCard}>
          {appliance.purchase_date ? (
            <MetaRow
              label={t('purchase_date_label').replace(' (YYYY-MM-DD)', '')}
              value={appliance.purchase_date}
            />
          ) : null}
          {appliance.warranty_until ? (
            <MetaRow
              label={t('warranty_until_label').replace(' (YYYY-MM-DD)', '')}
              value={appliance.warranty_until}
            />
          ) : null}
          {appliance.serial_no ? (
            <MetaRow label={t('serial_no_label')} value={appliance.serial_no} />
          ) : null}
          <MetaRow label={t('created_on')} value={appliance.created_at.slice(0, 10)} />
        </View>

        {appliance.notes ? (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>{t('notes_label')}</Text>
            <View style={styles.notesCard}>
              <Text style={styles.notesText}>{appliance.notes}</Text>
            </View>
          </View>
        ) : null}

        <View style={styles.footer} />
      </ScrollView>

      {/* Bottom bar */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        <TouchableOpacity
          style={styles.editBarBtn}
          activeOpacity={0.85}
          onPress={() => router.push(`/maintenance/appliance/${id}/edit` as never)}
        >
          <Icon.edit size={18} color={colors.ink} />
          <Text style={styles.editBarLabel}>{tc('edit')}</Text>
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
  hero: { paddingHorizontal: spacing[7], marginBottom: 14 },
  heroTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, marginBottom: 12 },
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
  warrantyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  warrantyBadgeText: { fontFamily: fontFamily.bold, fontSize: 10 },
  heroTitle: {
    fontFamily: fontFamily.extraBold,
    fontSize: 22,
    color: colors.ink,
    letterSpacing: -0.5,
  },
  heroBrand: { fontFamily: fontFamily.semiBold, fontSize: 14, color: colors.ink3, marginTop: 2 },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: colors.surface2,
    borderRadius: radius.md,
    alignSelf: 'flex-start',
  },
  priceText: { fontFamily: fontFamily.bold, fontSize: 16, color: colors.ink },
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
    paddingHorizontal: spacing[7],
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    backgroundColor: colors.white,
  },
  editBarBtn: {
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
});

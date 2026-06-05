// More — Household Library hub + App settings.

import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { router } from 'expo-router';

import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icons/Icon';
import { ScreenHeader } from '@/components/ui';
import { APP_BUILD, APP_VERSION } from '@/constants/settings';
import { getAllCategories } from '@/db/modules/categories';
import { getLocatorStats } from '@/db/modules/locator';
import { getAllMembers } from '@/db/modules/members';
import { getAllUnits } from '@/db/modules/units';
import { useFocusRefresh } from '@/hooks';
import { colors, fontFamily, fontSize, radius, spacing } from '@/theme';

export default function MoreScreen() {
  const { t } = useTranslation('settings');
  const insets = useSafeAreaInsets();
  const [memberCount, setMemberCount] = useState(0);
  const [categoryCount, setCategoryCount] = useState(0);
  const [unitCount, setUnitCount] = useState(0);
  const [locatorItems, setLocatorItems] = useState(0);

  const load = useCallback(async () => {
    const [members, cats, units, locStats] = await Promise.all([
      getAllMembers(),
      getAllCategories(),
      getAllUnits(),
      getLocatorStats(),
    ]);
    setMemberCount(members.length);
    setCategoryCount(cats.length);
    setUnitCount(units.length);
    setLocatorItems(locStats.items);
  }, []);

  useFocusRefresh(load, load);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader title={t('more_title')} showBack={false} />

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Library info card */}
        <View style={styles.infoBanner}>
          <View style={styles.infoBannerIcon}>
            <Icon.shield size={18} color="#2F8A5E" />
          </View>
          <View style={styles.infoBannerText}>
            <Text style={styles.infoBannerTitle}>{t('library_subtitle')}</Text>
            <Text style={styles.infoBannerBody}>{t('library_body')}</Text>
          </View>
        </View>

        {/* Section: Household Library */}
        <LibrarySection label={t('library_title')}>
          <LibraryRow
            icon={<Icon.users size={18} color="#6A50A0" />}
            iconBg={colors.lilacSoft}
            label={t('members_title')}
            value={t('n_people', { n: memberCount })}
            subtitle={t('members_subtitle')}
            onPress={() => router.push('/settings/members' as never)}
          />
          <LibraryRow
            icon={<Icon.tasks size={18} color="#4AADD1" />}
            iconBg={colors.skySoft}
            label={t('categories_title')}
            value={t('n_categories', { n: categoryCount })}
            subtitle={t('categories_subtitle')}
            onPress={() => router.push('/settings/categories' as never)}
          />
          <LibraryRow
            icon={<Text style={styles.halfIcon}>½</Text>}
            iconBg={colors.mintSoft}
            label={t('units_title')}
            value={t('n_units', { n: unitCount })}
            subtitle={t('units_subtitle')}
            onPress={() => router.push('/settings/units' as never)}
          />
          <LibraryRow
            icon={<Text style={styles.emojiIcon}>📦</Text>}
            iconBg={colors.butterSoft}
            label="Item Locator"
            value={`${locatorItems} items`}
            subtitle="Find anything in your home instantly"
            onPress={() => router.push('/locator' as never)}
            isLast
          />
        </LibrarySection>

        {/* Section: Features */}
        <LibrarySection label="Features">
          <LibraryRow
            icon={<Icon.wallet size={18} color={colors.primary} />}
            iconBg={colors.primarySoft}
            label="Bills & Expenses"
            value=""
            subtitle="Track bills, split expenses, settle up"
            onPress={() => router.push('/money' as never)}
            isLast
          />
        </LibrarySection>

        {/* Section: App */}
        <LibrarySection label={t('app_section')}>
          <LibraryRow
            icon={<Text style={styles.emojiIcon}>🌐</Text>}
            iconBg={colors.surface2}
            label={t('language_region')}
            value=""
            onPress={() => router.push('/settings/language' as never)}
          />
          <LibraryRow
            icon={<Icon.sparkle size={18} color={colors.primary} />}
            iconBg={colors.primarySoft}
            label={t('about_section')}
            value={`v${APP_VERSION}`}
            onPress={() => router.push('/settings/about' as never)}
            isLast
          />
        </LibrarySection>

        <Text style={styles.versionText}>
          {t('version', { version: APP_VERSION, build: APP_BUILD })}
        </Text>

        <View style={styles.footer} />
      </ScrollView>
    </View>
  );
}

function LibrarySection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{label.toUpperCase()}</Text>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );
}

interface LibraryRowProps {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: string;
  subtitle?: string;
  onPress: () => void;
  isLast?: boolean;
}

function LibraryRow({ icon, iconBg, label, value, subtitle, onPress, isLast }: LibraryRowProps) {
  return (
    <TouchableOpacity
      style={[styles.row, !isLast && styles.rowBorder]}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View style={[styles.rowIcon, { backgroundColor: iconBg }]}>{icon}</View>
      <View style={styles.rowContent}>
        <Text style={styles.rowLabel}>{label}</Text>
        {subtitle ? (
          <Text style={styles.rowSubtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {value ? <Text style={styles.rowValue}>{value}</Text> : null}
      <Icon.arrow size={16} color={colors.ink4} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { flex: 1 },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginHorizontal: spacing[7],
    marginBottom: 20,
    padding: 14,
    backgroundColor: colors.mintSoft,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#C0EDD8',
  },
  infoBannerIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  infoBannerText: { flex: 1 },
  infoBannerTitle: { fontFamily: fontFamily.bold, fontSize: 13, color: '#1A6040', marginBottom: 3 },
  infoBannerBody: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    color: '#2F7050',
    lineHeight: 17,
  },
  section: { paddingHorizontal: spacing[7], marginBottom: 20 },
  sectionLabel: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.caption,
    color: colors.ink3,
    letterSpacing: 0.66,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  sectionCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: 'hidden',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, paddingHorizontal: 14 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.line2 },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.xs,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  rowContent: { flex: 1, minWidth: 0 },
  rowLabel: { fontFamily: fontFamily.bold, fontSize: fontSize.body, color: colors.ink },
  rowSubtitle: { fontFamily: fontFamily.regular, fontSize: 11.5, color: colors.ink3, marginTop: 1 },
  rowValue: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.meta,
    color: colors.ink3,
    flexShrink: 0,
  },
  halfIcon: { fontFamily: fontFamily.extraBold, fontSize: 16, color: '#2F8A5E' },
  emojiIcon: { fontSize: 18 },
  versionText: {
    textAlign: 'center',
    fontFamily: fontFamily.semiBold,
    fontSize: 11,
    color: colors.ink4,
    marginTop: 8,
  },
  footer: { height: 80 },
});

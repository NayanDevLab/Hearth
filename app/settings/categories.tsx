// Categories list — grouped by area with edit and add support.

import { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { router } from 'expo-router';

import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icons/Icon';
import { EmptyState, ErrorState } from '@/components/shared';
import { FAB, ScreenHeader } from '@/components/ui';
import { AREA_DISPLAY } from '@/constants/settings';
import { type Category, getAllCategories, groupCategoriesByArea } from '@/db/modules/categories';
import { useFocusRefresh } from '@/hooks';
import { colors, fontFamily, fontSize, radius, spacing } from '@/theme';

const AREA_ORDER = ['tasks', 'money', 'meals', 'maintenance', 'calendar'];

export default function CategoriesScreen() {
  const { t } = useTranslation('settings');
  const { t: tc } = useTranslation('common');
  const insets = useSafeAreaInsets();

  const [grouped, setGrouped] = useState<Record<string, Category[]>>({});
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  async function loadCategories(isRefresh = false) {
    if (isRefresh) setRefreshing(true);
    setError(null);
    try {
      const all = await getAllCategories();
      setGrouped(groupCategoriesByArea(all));
      setTotalCount(all.length);
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Error'));
    } finally {
      setRefreshing(false);
    }
  }

  const load = useCallback(() => loadCategories(false), []);
  const refresh = useCallback(() => loadCategories(true), []);
  useFocusRefresh(load, refresh);

  const orderedAreas = AREA_ORDER.filter((a) => grouped[a]?.length);

  if (error) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ScreenHeader title={t('categories_screen_title')} onBack={() => router.back()} />
        <ErrorState title={t('error_title')} retryLabel={t('error_retry')} onRetry={load} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader title={t('categories_screen_title')} onBack={() => router.back()} />

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
        <Text style={styles.bodyText}>{t('categories_body')}</Text>

        {totalCount === 0 ? (
          <EmptyState
            emoji="🏷"
            title={t('empty_categories_title')}
            body={t('empty_categories_body')}
          />
        ) : (
          orderedAreas.map((area) => (
            <View key={area} style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionLabel}>{AREA_DISPLAY[area] ?? area}</Text>
                <TouchableOpacity
                  style={styles.addInlineBtn}
                  activeOpacity={0.7}
                  onPress={() =>
                    router.push({ pathname: '/settings/category/new', params: { area } } as never)
                  }
                >
                  <Icon.plus size={13} color={colors.primary} />
                  <Text style={styles.addInlineText}>{tc('add')}</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.listCard}>
                {grouped[area].map((cat, i) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.catRow, i < grouped[area].length - 1 && styles.catRowBorder]}
                    activeOpacity={0.75}
                    onPress={() => router.push(`/settings/category/${cat.id}/edit` as never)}
                  >
                    <View style={[styles.catIcon, { borderColor: cat.color }]}>
                      <Text style={styles.catEmoji}>{cat.emoji}</Text>
                    </View>
                    <View style={styles.catInfo}>
                      <Text style={styles.catName}>{cat.name}</Text>
                    </View>
                    <View style={[styles.colorDot, { backgroundColor: cat.color }]} />
                    <Icon.edit size={16} color={colors.ink3} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))
        )}

        <View style={styles.footer} />
      </ScrollView>

      <FAB onPress={() => router.push('/settings/category/new' as never)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { flex: 1 },
  bodyText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.body,
    color: colors.ink3,
    lineHeight: 20,
    paddingHorizontal: spacing[7],
    marginBottom: 18,
  },
  section: { paddingHorizontal: spacing[7], marginBottom: 18 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sectionLabel: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.caption,
    color: colors.ink3,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  addInlineBtn: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  addInlineText: { fontFamily: fontFamily.bold, fontSize: 12, color: colors.primary },
  listCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: 'hidden',
    padding: 4,
  },
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 11,
    paddingHorizontal: 12,
  },
  catRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.line2 },
  catIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    flexShrink: 0,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  catEmoji: { fontSize: 18 },
  catInfo: { flex: 1, minWidth: 0 },
  catName: { fontFamily: fontFamily.bold, fontSize: 14.5, color: colors.ink },
  colorDot: { width: 14, height: 14, borderRadius: 7, flexShrink: 0 },
  footer: { height: 100 },
});

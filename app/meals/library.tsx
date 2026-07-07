// Dish Library — searchable list of saved dishes.

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
import { type DishWithCount, getAllDishes } from '@/db/modules/meals';
import { useFocusRefresh } from '@/hooks';
import { colors, fontFamily, fontSize, radius, spacing } from '@/theme';

export default function DishLibraryScreen() {
  const { t } = useTranslation('meals');
  const insets = useSafeAreaInsets();

  const [dishes, setDishes] = useState<DishWithCount[]>([]);
  const [query, setQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  async function loadData(isRefresh = false) {
    if (isRefresh) setRefreshing(true);
    setError(null);
    try {
      setDishes(await getAllDishes());
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Error'));
    } finally {
      setRefreshing(false);
    }
  }

  const load = useCallback(() => loadData(false), []);
  const refresh = useCallback(() => loadData(true), []);
  useFocusRefresh(load, refresh);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return dishes;
    return dishes.filter((d) => d.name.toLowerCase().includes(q));
  }, [dishes, query]);

  if (error) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ScreenHeader title={t('library_title')} onBack={() => router.back()} />
        <ErrorState title={t('error_title')} retryLabel={t('error_retry')} onRetry={load} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader title={t('library_title')} onBack={() => router.back()} />

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
        {filtered.length === 0 && query.trim().length > 0 && (
          <EmptyState emoji="🔍" title={t('no_results', { query: query.trim() })} />
        )}
        {filtered.length === 0 && query.trim().length === 0 && (
          <EmptyState
            emoji="🍽️"
            title={t('no_dishes')}
            body={t('no_dishes_body')}
            ctaLabel={t('create_dish')}
            onCta={() => router.push('/meals/dish/new' as never)}
          />
        )}
        {filtered.length > 0 && (
          <View style={styles.list}>
            {filtered.map((dish) => (
              <TouchableOpacity
                key={dish.id}
                style={styles.card}
                activeOpacity={0.8}
                onPress={() => router.push(`/meals/dish/${dish.id}` as never)}
              >
                <Text style={styles.cardEmoji}>{dish.emoji}</Text>
                <View style={styles.cardBody}>
                  <Text style={styles.cardTitle} numberOfLines={1}>
                    {dish.name}
                  </Text>
                  <Text style={styles.cardMeta} numberOfLines={1}>
                    {t(`type_${dish.meal_type}`)}
                    {dish.prep_minutes ? ` · ${t('n_min', { n: dish.prep_minutes })}` : ''}
                    {dish.ingredient_count > 0
                      ? ` · ${t('n_ingredients', { n: dish.ingredient_count })}`
                      : ''}
                  </Text>
                </View>
                <Icon.arrow size={16} color={colors.ink4} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.footer} />
      </ScrollView>

      <FAB onPress={() => router.push('/meals/dish/new' as never)} />
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
  list: { paddingHorizontal: spacing[7], gap: 8 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 13,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
  },
  cardEmoji: { fontSize: 24 },
  cardBody: { flex: 1, minWidth: 0 },
  cardTitle: { fontFamily: fontFamily.bold, fontSize: fontSize.body, color: colors.ink },
  cardMeta: { fontFamily: fontFamily.regular, fontSize: 12, color: colors.ink3, marginTop: 2 },
  footer: { height: 100 },
});

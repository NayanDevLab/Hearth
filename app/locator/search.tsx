// Locator search — full-text search with top-match hero card.

import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
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
import { formatLastSeen, LOCATOR_CAT_MAP } from '@/constants/locator';
import { type LocatedItemWithPath, searchItems } from '@/db/modules/locator';
import { colors, fontFamily, fontSize, spacing } from '@/theme';

export default function LocatorSearchScreen() {
  const { q: initQuery } = useLocalSearchParams<{ q?: string }>();
  const { t } = useTranslation('locator');
  const insets = useSafeAreaInsets();

  const [query, setQuery] = useState(initQuery ?? '');
  const [results, setResults] = useState<LocatedItemWithPath[]>([]);
  const [loading, setLoading] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        setResults(await searchItems(query.trim()));
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const topMatch = results[0];
  const others = results.slice(1);
  const pathOf = (item: LocatedItemWithPath) =>
    [item.room_name, item.spot_name].filter(Boolean).join(' → ');

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Search header */}
      <View style={styles.searchHeader}>
        <TouchableOpacity style={styles.backBtn} activeOpacity={0.7} onPress={() => router.back()}>
          <Icon.arrowLeft size={20} color={colors.ink} />
        </TouchableOpacity>
        <View style={styles.searchBar}>
          <Icon.search size={18} color={colors.ink3} />
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder={t('search_placeholder')}
            placeholderTextColor={colors.ink4}
            autoFocus
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} activeOpacity={0.7}>
              <Icon.close size={16} color={colors.ink3} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading && (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      )}
      {!loading && results.length === 0 && query.trim().length >= 2 && (
        <View style={styles.center}>
          <Text style={styles.noResultsText}>
            {t('search_no_results', { query: query.trim() })}
          </Text>
        </View>
      )}
      {!loading && (results.length > 0 || query.trim().length < 2) && (
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Top match hero */}
          {topMatch && (
            <TouchableOpacity
              style={styles.topMatchCard}
              activeOpacity={0.9}
              onPress={() => router.push(`/locator/item/${topMatch.id}` as never)}
            >
              <Text style={styles.topMatchLabel}>{t('search_top_match')}</Text>
              <View style={styles.topMatchRow}>
                <View
                  style={[
                    styles.topMatchPhoto,
                    {
                      backgroundColor:
                        LOCATOR_CAT_MAP[topMatch.category ?? '']?.soft ?? 'rgba(255,255,255,0.15)',
                    },
                  ]}
                >
                  <Text style={styles.topMatchEmoji}>{topMatch.emoji}</Text>
                </View>
                <View style={styles.topMatchInfo}>
                  <Text style={styles.topMatchName}>{topMatch.name}</Text>
                  {topMatch.category && (
                    <Text style={styles.topMatchCat}>
                      {LOCATOR_CAT_MAP[topMatch.category]?.label}
                    </Text>
                  )}
                </View>
              </View>
              {pathOf(topMatch).length > 0 && (
                <View style={styles.pathBox}>
                  <Text style={styles.pathBoxLabel}>Path to find it</Text>
                  <Text style={styles.pathBoxText}>{pathOf(topMatch)}</Text>
                  <Text style={styles.pathBoxWhen}>
                    Last confirmed {formatLastSeen(topMatch.last_seen)}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          )}

          {/* Other matches */}
          {others.length > 0 && (
            <>
              <Text style={styles.othersLabel}>{t('search_other')}</Text>
              <View style={styles.othersList}>
                {others.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.otherCard}
                    activeOpacity={0.8}
                    onPress={() => router.push(`/locator/item/${item.id}` as never)}
                  >
                    <View
                      style={[
                        styles.otherPhoto,
                        {
                          backgroundColor:
                            LOCATOR_CAT_MAP[item.category ?? '']?.soft ?? colors.surface2,
                        },
                      ]}
                    >
                      <Text style={styles.otherEmoji}>{item.emoji}</Text>
                    </View>
                    <View style={styles.otherInfo}>
                      <Text style={styles.otherName}>{item.name}</Text>
                      <Text style={styles.otherPath}>{pathOf(item) || t('unplaced')}</Text>
                      <Text style={styles.otherWhen}>{formatLastSeen(item.last_seen)}</Text>
                    </View>
                    <Icon.arrow size={16} color={colors.ink4} />
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}
          <View style={{ height: 60 }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: spacing[5],
    paddingBottom: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.ink,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  searchInput: { flex: 1, fontFamily: fontFamily.semiBold, fontSize: 14, color: colors.ink },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  noResultsText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.body,
    color: colors.ink3,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  scroll: { flex: 1 },
  topMatchCard: {
    marginHorizontal: spacing[7],
    marginBottom: 16,
    padding: 16,
    borderRadius: 22,
    backgroundColor: colors.ink,
  },
  topMatchLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  topMatchRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 12 },
  topMatchPhoto: {
    width: 72,
    height: 72,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  topMatchEmoji: { fontSize: 40 },
  topMatchInfo: { flex: 1 },
  topMatchName: {
    fontFamily: fontFamily.extraBold,
    fontSize: 18,
    color: colors.white,
    letterSpacing: -0.015,
  },
  topMatchCat: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  pathBox: { padding: 12, backgroundColor: 'rgba(255,255,255,0.10)', borderRadius: 12 },
  pathBoxLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  pathBoxText: { fontFamily: fontFamily.bold, fontSize: 14, color: colors.white, lineHeight: 20 },
  pathBoxWhen: {
    fontFamily: fontFamily.regular,
    fontSize: 11,
    color: 'rgba(255,255,255,0.55)',
    marginTop: 4,
  },
  othersLabel: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.caption,
    color: colors.ink3,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    paddingHorizontal: spacing[7],
    marginBottom: 8,
  },
  othersList: { paddingHorizontal: spacing[7], gap: 8 },
  otherCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.line,
  },
  otherPhoto: {
    width: 52,
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  otherEmoji: { fontSize: 28 },
  otherInfo: { flex: 1, minWidth: 0 },
  otherName: { fontFamily: fontFamily.bold, fontSize: 14, color: colors.ink },
  otherPath: { fontFamily: fontFamily.medium, fontSize: 12, color: colors.ink3, marginTop: 2 },
  otherWhen: { fontFamily: fontFamily.regular, fontSize: 11, color: colors.ink4, marginTop: 1 },
});

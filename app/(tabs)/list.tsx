// Shopping lists home — multiple lists per household with progress tracking.

import { useCallback, useMemo, useState } from 'react';
import {
  Modal,
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
import { EmptyState, ErrorState, ShimmerRow } from '@/components/shared';
import { ShoppingListCard } from '@/components/shopping';
import { FAB, ScreenHeader, TutorialSheet, type TutorialStep } from '@/components/ui';
import { LIST_ICON_OPTIONS } from '@/constants/shopping';
import { getAllLists, getListStats, insertList, type ShoppingList } from '@/db/modules/shopping';
import { useFocusRefresh } from '@/hooks';
import { colors, fontFamily, fontSize, radius, spacing } from '@/theme';

interface ListWithStats extends ShoppingList {
  total: number;
  done: number;
}

// ─── New list bottom sheet ─────────────────────────────────────

function NewListSheet({
  visible,
  onClose,
  onCreated,
}: {
  visible: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const { t } = useTranslation('shopping');
  const { t: tc } = useTranslation('common');
  const [name, setName] = useState('');
  const [store, setStore] = useState('');
  const [iconIdx, setIconIdx] = useState(0);
  const [saving, setSaving] = useState(false);

  const icon = LIST_ICON_OPTIONS[iconIdx];
  const isValid = name.trim().length > 0;

  async function handleCreate() {
    if (!isValid || saving) return;
    setSaving(true);
    try {
      await insertList({
        id: `list_${Date.now()}`,
        name: name.trim(),
        store: store.trim() || undefined,
        emoji: icon.emoji,
        icon_color: icon.color,
      });
      setName('');
      setStore('');
      onCreated();
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={ns.backdrop}>
        <TouchableOpacity style={ns.backdropPress} onPress={onClose} />
        <View style={ns.sheet}>
          <View style={ns.grabber} />
          <Text style={ns.title}>{t('new_list')}</Text>

          {/* Icon picker */}
          <View style={ns.iconRow}>
            {LIST_ICON_OPTIONS.map((opt, i) => (
              <TouchableOpacity
                key={i}
                style={[
                  ns.iconOpt,
                  { backgroundColor: opt.soft },
                  iconIdx === i && { borderWidth: 2, borderColor: opt.color },
                ]}
                onPress={() => setIconIdx(i)}
                activeOpacity={0.75}
              >
                <Text style={ns.iconEmoji}>{opt.emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            style={ns.input}
            placeholder={t('list_name_placeholder')}
            placeholderTextColor={colors.ink4}
            value={name}
            onChangeText={setName}
            autoFocus
            autoCapitalize="words"
          />
          <TextInput
            style={[ns.input, { marginBottom: 20 }]}
            placeholder={t('store_placeholder')}
            placeholderTextColor={colors.ink4}
            value={store}
            onChangeText={setStore}
            autoCapitalize="words"
          />

          <View style={ns.btnRow}>
            <TouchableOpacity style={ns.cancelBtn} onPress={onClose} activeOpacity={0.8}>
              <Text style={ns.cancelLbl}>{tc('cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[ns.createBtn, !isValid && ns.createBtnDisabled]}
              onPress={handleCreate}
              activeOpacity={0.85}
              disabled={!isValid || saving}
            >
              <Text style={ns.createLbl}>{saving ? tc('loading_short') : tc('add')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const ns = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end' },
  backdropPress: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(20,22,30,0.4)' },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing[7],
    paddingBottom: 36,
  },
  grabber: {
    width: 36,
    height: 5,
    backgroundColor: colors.ink4,
    opacity: 0.4,
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontFamily: fontFamily.bold,
    fontSize: 19,
    color: colors.ink,
    marginBottom: 16,
    textAlign: 'center',
  },
  iconRow: { flexDirection: 'row', gap: 10, marginBottom: 16, justifyContent: 'center' },
  iconOpt: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEmoji: { fontSize: 22 },
  input: {
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: radius.sm,
    paddingVertical: 13,
    paddingHorizontal: 14,
    marginBottom: 10,
    fontFamily: fontFamily.semiBold,
    fontSize: 15,
    color: colors.ink,
  },
  btnRow: { flexDirection: 'row', gap: 10 },
  cancelBtn: {
    flex: 1,
    height: 50,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelLbl: { fontFamily: fontFamily.semiBold, fontSize: fontSize.cardTitle, color: colors.ink },
  createBtn: {
    flex: 1.5,
    height: 50,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createBtnDisabled: { opacity: 0.5 },
  createLbl: { fontFamily: fontFamily.semiBold, fontSize: fontSize.cardTitle, color: colors.white },
});

// ─── Main screen ──────────────────────────────────────────────

export default function ListScreen() {
  const { t } = useTranslation('shopping');
  const insets = useSafeAreaInsets();

  const [lists, setLists] = useState<ListWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [tutorialVisible, setTutorialVisible] = useState(false);
  const [newListVisible, setNewListVisible] = useState(false);

  async function loadLists(isRefresh = false) {
    if (!isRefresh) setLoading(true);
    else setRefreshing(true);
    setError(null);
    try {
      const raw = await getAllLists();
      const withStats = await Promise.all(
        raw.map(async (list) => {
          const stats = await getListStats(list.id);
          return { ...list, ...stats };
        })
      );
      setLists(withStats);
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Unknown error'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  const load = useCallback(() => loadLists(false), []);
  const refresh = useCallback(() => loadLists(true), []);

  useFocusRefresh(load, refresh);

  const tutorialSteps = useMemo<TutorialStep[]>(
    () => [
      {
        title: t('tutorial_step1_title'),
        body: t('tutorial_step1_body'),
        example: (
          <View style={eg.row}>
            {[
              { emoji: '🛒', label: 'Groceries' },
              { emoji: '📦', label: 'Costco' },
              { emoji: '🔧', label: 'Hardware' },
            ].map((x) => (
              <View key={x.label} style={eg.card}>
                <Text style={eg.emoji}>{x.emoji}</Text>
                <Text style={eg.cardLabel}>{x.label}</Text>
              </View>
            ))}
          </View>
        ),
      },
      {
        title: t('tutorial_step2_title'),
        body: t('tutorial_step2_body'),
        example: (
          <View style={eg.checkRow}>
            <View style={eg.doneCheck}>
              <Icon.check size={13} color={colors.white} stroke={2.5} />
            </View>
            <Text style={eg.doneText}>
              Baby spinach <Text style={eg.crossedOut}>· 1 bag</Text>
            </Text>
          </View>
        ),
      },
      {
        title: t('tutorial_step3_title'),
        body: t('tutorial_step3_body'),
        example: (
          <View style={eg.quickAdd}>
            <Icon.plus size={16} color={colors.primary} />
            <Text style={eg.quickAddText}>{t('quick_add_placeholder')}</Text>
          </View>
        ),
      },
    ],
    [t]
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader
        title={t('screen_title')}
        showBack={false}
        onTutorial={() => setTutorialVisible(true)}
      />

      {loading && (
        <View style={styles.shimmerWrap}>
          {[1, 2, 3].map((i) => (
            <ShimmerRow key={i} />
          ))}
        </View>
      )}
      {!loading && error && (
        <ErrorState
          title={t('error_title')}
          retryLabel={t('error_retry')}
          onRetry={() => loadLists(false)}
        />
      )}
      {!loading && !error && (
        <ScrollView
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadLists(true)}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        >
          {/* Section header */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {t('your_lists')}{' '}
              {lists.length > 0 && <Text style={styles.sectionCount}>{lists.length}</Text>}
            </Text>
          </View>

          {lists.length === 0 ? (
            <EmptyState
              emoji="🛒"
              title={t('empty_lists_title')}
              body={t('empty_lists_body')}
              ctaLabel={t('new_list')}
              onCta={() => setNewListVisible(true)}
            />
          ) : (
            <>
              {lists.map((list) => (
                <ShoppingListCard
                  key={list.id}
                  id={list.id}
                  name={list.name}
                  store={list.store}
                  emoji={list.emoji}
                  iconColor={list.icon_color}
                  total={list.total}
                  done={list.done}
                  onPress={() => router.push(`/shopping/${list.id}` as never)}
                />
              ))}

              {/* New list dashed button */}
              <TouchableOpacity
                style={styles.newListRow}
                activeOpacity={0.7}
                onPress={() => setNewListVisible(true)}
              >
                <Icon.plus size={18} color={colors.ink3} />
                <Text style={styles.newListLabel}>{t('new_list')}</Text>
              </TouchableOpacity>
            </>
          )}

          <View style={styles.footer} />
        </ScrollView>
      )}

      <FAB label={t('add_item')} onPress={() => router.push('/shopping/item/new' as never)} />

      <TutorialSheet
        steps={tutorialSteps}
        visible={tutorialVisible}
        onClose={() => setTutorialVisible(false)}
      />

      <NewListSheet
        visible={newListVisible}
        onClose={() => setNewListVisible(false)}
        onCreated={() => loadLists(true)}
      />
    </View>
  );
}

const eg = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10 },
  card: {
    flex: 1,
    padding: 10,
    borderRadius: 12,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    gap: 4,
  },
  emoji: { fontSize: 20 },
  cardLabel: { fontFamily: fontFamily.semiBold, fontSize: 11, color: colors.ink2 },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  doneCheck: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: colors.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneText: {
    fontFamily: fontFamily.semiBold,
    fontSize: 14,
    color: colors.ink,
    opacity: 0.5,
    textDecorationLine: 'line-through',
  },
  crossedOut: { color: colors.ink3 },
  quickAdd: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
  },
  quickAddText: { fontFamily: fontFamily.regular, fontSize: fontSize.body, color: colors.ink4 },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  shimmerWrap: { paddingTop: 8 },
  scroll: { flex: 1 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[7],
    paddingVertical: 12,
  },
  sectionTitle: { fontFamily: fontFamily.bold, fontSize: fontSize.cardTitle, color: colors.ink },
  sectionCount: { fontFamily: fontFamily.semiBold, fontSize: fontSize.meta, color: colors.ink3 },
  newListRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: spacing[7],
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: colors.line2,
  },
  newListLabel: { fontFamily: fontFamily.semiBold, fontSize: fontSize.body, color: colors.ink3 },
  footer: { height: 100 },
});

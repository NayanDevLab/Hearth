// Tasks list — SectionList grouped by time of day, filter chips, shimmer loading,
// empty/error states, optimistic toggle, pull-to-refresh, paginated loading.

import { useCallback, useMemo, useRef, useState } from 'react';
import {
  RefreshControl,
  SectionList,
  type SectionListData,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { router } from 'expo-router';

import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icons/Icon';
import { EmptyState, ErrorState } from '@/components/shared';
import {
  BigTaskRow,
  TaskFilterRow,
  TaskGroupHeader,
  TaskListSkeleton,
  WeekSummaryCard,
} from '@/components/tasks';
import { FAB, ScreenHeader, TutorialSheet, type TutorialStep } from '@/components/ui';
import { MEMBER_CONFIG } from '@/constants/tasks';
import {
  getTasksByFilter,
  getWeekStats,
  type Task,
  type TaskFilter,
  type TaskGroup,
  type TimeGroup,
  toggleTaskDone,
} from '@/db/modules/tasks';
import { useFocusRefresh } from '@/hooks';
import { prefs } from '@/storage/prefs';
import { colors, fontFamily, fontSize } from '@/theme';

const PAGE_SIZE = 20;

// ─── useTasks hook ───────────────────────────────────────────

interface UseTasksState {
  groups: TaskGroup[];
  loading: boolean;
  refreshing: boolean;
  error: Error | null;
  hasMore: boolean;
  weekTotal: number;
  weekDone: number;
  weekByPerson: { assignee: string; total: number; done: number; color: string }[];
}

function useTasks(filter: TaskFilter) {
  const [state, setState] = useState<UseTasksState>({
    groups: [],
    loading: true,
    refreshing: false,
    error: null,
    hasMore: false,
    weekTotal: 0,
    weekDone: 0,
    weekByPerson: [],
  });
  const pageRef = useRef(0);
  const currentUser = useRef<string>('');

  const loadTasks = useCallback(
    async (reset: boolean, isRefresh = false) => {
      if (reset) {
        pageRef.current = 0;
        setState((s) => ({ ...s, loading: !isRefresh, refreshing: isRefresh, error: null }));
      }
      try {
        const user = await prefs.getUserName();
        currentUser.current = user ? user.charAt(0).toUpperCase() : '';

        const [tasksResult, stats] = await Promise.all([
          getTasksByFilter(filter, currentUser.current, pageRef.current, PAGE_SIZE),
          reset ? getWeekStats() : Promise.resolve(null),
        ]);

        const byPersonWithColor = (stats?.byPerson ?? []).map((p) => ({
          ...p,
          color: MEMBER_CONFIG[p.assignee]?.color ?? colors.ink3,
        }));

        setState((s) => ({
          groups: reset ? tasksResult.groups : mergeGroups(s.groups, tasksResult.groups),
          loading: false,
          refreshing: false,
          error: null,
          hasMore: tasksResult.hasMore,
          weekTotal: stats?.total ?? s.weekTotal,
          weekDone: stats?.done ?? s.weekDone,
          weekByPerson: stats ? byPersonWithColor : s.weekByPerson,
        }));
      } catch (e) {
        setState((s) => ({
          ...s,
          loading: false,
          refreshing: false,
          error: e instanceof Error ? e : new Error('Unknown error'),
        }));
      }
    },
    [filter]
  );

  const load = useCallback(() => loadTasks(true, false), [loadTasks]); // shimmer
  const refresh = useCallback(() => loadTasks(true, true), [loadTasks]); // RefreshControl
  const loadMore = useCallback(() => {
    if (!state.hasMore || state.loading) return;
    pageRef.current += 1;
    loadTasks(false);
  }, [state.hasMore, state.loading, loadTasks]);

  const toggleTask = useCallback(async (id: string, done: boolean) => {
    // Optimistic update
    setState((s) => ({ ...s, groups: toggleInGroups(s.groups, id, done) }));
    try {
      await toggleTaskDone(id, done, currentUser.current || undefined);
    } catch {
      // Revert on failure
      setState((s) => ({ ...s, groups: toggleInGroups(s.groups, id, !done) }));
    }
  }, []);

  return { ...state, load, refresh, loadMore, toggleTask };
}

// ─── Helpers ─────────────────────────────────────────────────

function toggleInGroups(groups: TaskGroup[], id: string, done: boolean): TaskGroup[] {
  return groups.map((g) => ({
    ...g,
    data: g.data.map((t) => (t.id === id ? { ...t, done } : t)),
  }));
}

function mergeGroups(existing: TaskGroup[], incoming: TaskGroup[]): TaskGroup[] {
  const map = new Map<TimeGroup, Task[]>(existing.map((g) => [g.key, g.data]));
  for (const g of incoming) {
    const prev = map.get(g.key) ?? [];
    const newIds = new Set(g.data.map((t) => t.id));
    map.set(g.key, [...prev.filter((t) => !newIds.has(t.id)), ...g.data]);
  }
  return Array.from(map.entries()).map(([key, data]) => ({ key, data }));
}

// ─── Main screen ──────────────────────────────────────────────

export default function TasksScreen() {
  const { t } = useTranslation('tasks');
  const { t: tc } = useTranslation('common');
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<TaskFilter>('today');
  const [tutorialVisible, setTutorialVisible] = useState(false);

  const {
    groups,
    loading,
    refreshing,
    error,
    hasMore,
    weekTotal,
    weekDone,
    weekByPerson,
    load,
    refresh,
    loadMore,
    toggleTask,
  } = useTasks(filter);

  useFocusRefresh(load, refresh);

  const totalTasks = groups.reduce((n, g) => n + g.data.length, 0);

  // ─── Tutorial steps ────────────────────────────────────────
  const tutorialSteps = useMemo<TutorialStep[]>(
    () => [
      {
        title: t('tutorial_step1_title'),
        body: t('tutorial_step1_body'),
        example: (
          <View style={eg.row}>
            {(['today', 'week', 'mine'] as const).map((f, i) => (
              <View key={f} style={[eg.chip, i === 0 && eg.chipActive]}>
                <Text style={[eg.chipText, i === 0 && eg.chipTextActive]}>{t(`filter_${f}`)}</Text>
              </View>
            ))}
          </View>
        ),
      },
      {
        title: t('tutorial_step2_title'),
        body: t('tutorial_step2_body'),
        example: (
          <View style={eg.doneRow}>
            <View style={eg.doneCheck}>
              <Icon.check size={14} color={colors.white} stroke={2.5} />
            </View>
            <View>
              <Text style={eg.doneTitle}>{t('filter_today')}</Text>
              <Text style={eg.doneSub}>{t('returns_tomorrow')}</Text>
            </View>
          </View>
        ),
      },
      {
        title: t('tutorial_step3_title'),
        body: t('tutorial_step3_body'),
        example: (
          <View style={eg.fabWrap}>
            <View style={eg.fakeFab}>
              <Icon.plus size={20} color={colors.white} />
              <Text style={eg.fabLabel}>{t('new_task')}</Text>
            </View>
          </View>
        ),
      },
    ],
    [t]
  );

  // ─── Section list data ─────────────────────────────────────
  const sections: SectionListData<Task, { key: TimeGroup; title: TimeGroup }>[] = groups.map(
    (g) => ({
      key: g.key,
      title: g.key,
      data: g.data,
    })
  );

  // ─── Empty state ───────────────────────────────────────────
  function renderEmpty() {
    if (loading) return null;
    if (error) {
      return (
        <ErrorState
          title={t('error_title')}
          body={t('error_body')}
          retryLabel={t('error_retry')}
          onRetry={refresh}
        />
      );
    }
    return (
      <EmptyState
        emoji="✅"
        title={filter === 'today' ? t('empty_today_title') : t('empty_all_title')}
        body={filter === 'today' ? t('empty_today_body') : t('empty_all_body')}
        ctaLabel={t('new_task')}
        onCta={() => router.push('/task/new' as never)}
      />
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader
        title={t('screen_title')}
        showBack={false}
        onTutorial={() => setTutorialVisible(true)}
      />

      {loading ? (
        <View style={styles.loadingWrap}>
          <TaskListSkeleton rows={6} />
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          onEndReached={hasMore ? loadMore : undefined}
          onEndReachedThreshold={0.4}
          ListHeaderComponent={
            <>
              <WeekSummaryCard total={weekTotal} done={weekDone} byPerson={weekByPerson} />
              <TaskFilterRow active={filter} onChange={setFilter} />
            </>
          }
          renderSectionHeader={({ section }) => (
            <TaskGroupHeader group={section.title} first={section.key === sections[0]?.key} />
          )}
          renderItem={({ item }) => (
            <BigTaskRow
              task={item}
              onToggle={toggleTask}
              onPress={(id) => router.push(`/task/${id}` as never)}
            />
          )}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={
            hasMore ? (
              <View style={styles.loadingMore}>
                <Text style={styles.loadingMoreText}>{tc('loading_short')}</Text>
              </View>
            ) : (
              <View style={styles.footer} />
            )
          }
          contentContainerStyle={totalTasks === 0 ? styles.emptyContainer : undefined}
        />
      )}

      <FAB label={t('new_task')} onPress={() => router.push('/task/new' as never)} />

      <TutorialSheet
        steps={tutorialSteps}
        visible={tutorialVisible}
        onClose={() => setTutorialVisible(false)}
      />
    </View>
  );
}

// ─── Tutorial example styles ───────────────────────────────────

const eg = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
  },
  chipActive: { backgroundColor: colors.ink, borderColor: colors.ink },
  chipText: { fontFamily: fontFamily.semiBold, fontSize: fontSize.meta, color: colors.ink2 },
  chipTextActive: { color: colors.white },
  doneRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  doneCheck: {
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: colors.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneTitle: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.body,
    color: colors.ink,
    textDecorationLine: 'line-through',
    opacity: 0.5,
  },
  doneSub: { fontFamily: fontFamily.regular, fontSize: 11, color: colors.ink3 },
  fabWrap: { alignItems: 'flex-end' },
  fakeFab: {
    height: 52,
    paddingHorizontal: 18,
    paddingLeft: 14,
    borderRadius: 28,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fabLabel: { fontFamily: fontFamily.bold, fontSize: 14, color: colors.white },
});

// ─── Screen styles ─────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  loadingWrap: { paddingTop: 8 },
  emptyContainer: { flex: 1 },
  footer: { height: 100 },
  loadingMore: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  loadingMoreText: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.meta,
    color: colors.ink3,
  },
});

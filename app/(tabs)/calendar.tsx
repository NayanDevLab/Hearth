// Calendar — monthly grid + day agenda + person filter.
// Data: events from SQLite, dot map pre-computed per month.

import { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { router } from 'expo-router';

import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  type CalendarPerson,
  DayAgendaList,
  MonthGrid,
  PersonFilter,
  ViewToggle,
} from '@/components/calendar';
import { Icon } from '@/components/icons/Icon';
import { EmptyState, ErrorState } from '@/components/shared';
import { FAB, ScreenHeader, TutorialSheet, type TutorialStep } from '@/components/ui';
import { type CalendarView, formatDateKey, formatDisplayDate } from '@/constants/calendar';
import {
  type CalendarEvent,
  getEventsForDay,
  getMonthDots,
  getUpcomingEvents,
} from '@/db/modules/events';
import { useFocusRefresh, useMembers } from '@/hooks';
import { colors, fontFamily, fontSize, spacing } from '@/theme';

export default function CalendarScreen() {
  const { t } = useTranslation('calendar');
  const insets = useSafeAreaInsets();
  const members = useMembers();
  const memberColorMap = useMemo(
    () => Object.fromEntries(members.map((m) => [m.initial, m.color])),
    [members]
  );

  const today = new Date();

  // ── Navigation (year + month always move together) ────────────
  const [nav, setNav] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const { year, month } = nav;

  // ── Independent UI state ──────────────────────────────────────
  const [selectedDate, setSelectedDate] = useState(formatDateKey(today));
  const [view, setView] = useState<CalendarView>('month');
  const [person, setPerson] = useState<CalendarPerson>('everyone');
  const [tutorialVisible, setTutorialVisible] = useState(false);

  // ── Loaded data (all update atomically during a fetch) ────────
  const [calData, setCalData] = useState<{
    dotMap: Record<string, string[]>;
    dayEvents: CalendarEvent[];
    scheduleEvents: CalendarEvent[];
    refreshing: boolean;
    error: Error | null;
  }>({ dotMap: {}, dayEvents: [], scheduleEvents: [], refreshing: false, error: null });

  const { dotMap, dayEvents, scheduleEvents, refreshing, error } = calData;

  const yearMonth = `${year}-${String(month + 1).padStart(2, '0')}`;

  // `setCalData` is stable (useState), so loadCalendar's only true deps are the query params.
  const loadCalendar = useCallback(
    async (isRefresh: boolean) => {
      setCalData((d) => ({ ...d, refreshing: isRefresh, error: null }));
      try {
        const [dots, day, schedule] = await Promise.all([
          getMonthDots(yearMonth, memberColorMap),
          getEventsForDay(selectedDate),
          getUpcomingEvents(50),
        ]);
        setCalData((d) => ({
          ...d,
          dotMap: dots,
          dayEvents: day, // TODO: filter by person once attendee join is wired
          scheduleEvents: schedule,
          refreshing: false,
        }));
      } catch (e) {
        setCalData((d) => ({
          ...d,
          error: e instanceof Error ? e : new Error('Error'),
          refreshing: false,
        }));
      }
    },
    [yearMonth, selectedDate, memberColorMap]
  );

  const load = useCallback(() => loadCalendar(false), [loadCalendar]);
  const refresh = useCallback(() => loadCalendar(true), [loadCalendar]);

  useFocusRefresh(load, refresh);

  // Reload day events when selectedDate changes (separate from full month refresh).
  // setCalData is stable — all setState here is after await, not synchronous.
  useEffect(() => {
    getEventsForDay(selectedDate).then((evs) => {
      setCalData((d) => ({ ...d, dayEvents: evs }));
    });
  }, [selectedDate]);

  const monthLabel = new Date(year, month, 1).toLocaleDateString([], {
    month: 'long',
    year: 'numeric',
  });

  function prevMonth() {
    setNav((n) => (n.month === 0 ? { year: n.year - 1, month: 11 } : { ...n, month: n.month - 1 }));
  }
  function nextMonth() {
    setNav((n) => (n.month === 11 ? { year: n.year + 1, month: 0 } : { ...n, month: n.month + 1 }));
  }

  const tutorialSteps = useMemo<TutorialStep[]>(
    () => [
      {
        title: t('tutorial_step1_title'),
        body: t('tutorial_step1_body'),
        example: (
          <View style={eg.memberRow}>
            {members.map((m) => (
              <View key={m.initial} style={eg.memberItem}>
                <View style={[eg.memberDot, { backgroundColor: m.color }]} />
                <Text style={eg.memberName}>{m.name}</Text>
              </View>
            ))}
          </View>
        ),
      },
      {
        title: t('tutorial_step2_title'),
        body: t('tutorial_step2_body'),
        example: (
          <View style={eg.filterRow}>
            {['Everyone', 'Aarav', 'Maya'].map((label, i) => (
              <View key={label} style={[eg.filterChip, i === 0 && eg.filterChipActive]}>
                <Text style={[eg.filterChipText, i === 0 && eg.filterChipTextActive]}>{label}</Text>
              </View>
            ))}
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
              <Text style={eg.fabLabel}>{t('new_event')}</Text>
            </View>
          </View>
        ),
      },
    ],
    [t, members]
  );

  if (error) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ScreenHeader
          title={t('screen_title')}
          showBack={false}
          onTutorial={() => setTutorialVisible(true)}
        />
        <ErrorState title={t('error_title')} retryLabel={t('error_retry')} onRetry={load} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader
        title=""
        showBack={false}
        onTutorial={() => setTutorialVisible(true)}
        right={
          <TouchableOpacity style={styles.searchBtn} activeOpacity={0.7}>
            <Icon.search size={20} color={colors.ink} />
          </TouchableOpacity>
        }
      />

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
        {/* Month navigator */}
        <View style={styles.monthNav}>
          <TouchableOpacity onPress={prevMonth} activeOpacity={0.7} style={styles.navBtn}>
            <Icon.arrowLeft size={20} color={colors.ink} />
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.monthLabel}>{monthLabel} →</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={nextMonth} activeOpacity={0.7} style={styles.navBtn}>
            <Icon.arrow size={20} color={colors.ink} />
          </TouchableOpacity>
        </View>

        {/* View toggle */}
        <ViewToggle active={view} onChange={setView} />

        {/* Person filter */}
        <PersonFilter selected={person} onChange={setPerson} />

        {view === 'month' && (
          <>
            <MonthGrid
              year={year}
              month={month}
              selectedDate={selectedDate}
              dotMap={dotMap}
              onSelectDay={setSelectedDate}
            />
            <DayAgendaList
              date={selectedDate}
              events={dayEvents}
              attendeeMap={{}}
              onEventPress={(id) => router.push(`/event/${id}` as never)}
              onAddEvent={() => router.push('/event/new' as never)}
            />
          </>
        )}

        {view === 'schedule' &&
          (scheduleEvents.length === 0 ? (
            <EmptyState
              emoji="🗓️"
              title={t('schedule_empty_title')}
              body={t('schedule_empty_body')}
              ctaLabel={t('new_event')}
              onCta={() => router.push('/event/new' as never)}
            />
          ) : (
            <>
              {scheduleEvents.map((event) => (
                <View key={event.id}>
                  {/* Schedule view groups by date */}
                  <View style={styles.scheduleRow}>
                    <Text style={styles.scheduleDate}>{formatDisplayDate(event.date)}</Text>
                    <View style={styles.scheduleDivider} />
                  </View>
                </View>
              ))}
            </>
          ))}

        <View style={styles.footer} />
      </ScrollView>

      <FAB label={t('new_event')} onPress={() => router.push('/event/new' as never)} />

      <TutorialSheet
        steps={tutorialSteps}
        visible={tutorialVisible}
        onClose={() => setTutorialVisible(false)}
      />
    </View>
  );
}

const eg = StyleSheet.create({
  memberRow: { flexDirection: 'row', gap: 14, flexWrap: 'wrap' },
  memberItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  memberDot: { width: 10, height: 10, borderRadius: 5 },
  memberName: { fontFamily: fontFamily.semiBold, fontSize: 13, color: colors.ink },
  filterRow: { flexDirection: 'row', gap: 8 },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
  },
  filterChipActive: { backgroundColor: colors.ink, borderColor: colors.ink },
  filterChipText: { fontFamily: fontFamily.semiBold, fontSize: 12, color: colors.ink2 },
  filterChipTextActive: { color: colors.white },
  fabWrap: { alignItems: 'flex-end' },
  fakeFab: {
    height: 50,
    paddingHorizontal: 18,
    borderRadius: 25,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fabLabel: { fontFamily: fontFamily.bold, fontSize: 14, color: colors.white },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { flex: 1 },
  searchBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[7],
    paddingBottom: 12,
  },
  navBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  monthLabel: {
    flex: 1,
    fontFamily: fontFamily.extraBold,
    fontSize: 22,
    letterSpacing: -0.44,
    color: colors.ink,
    textAlign: 'center',
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: spacing[7],
    paddingVertical: 8,
  },
  scheduleDate: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.meta,
    color: colors.ink3,
    flexShrink: 0,
  },
  scheduleDivider: { flex: 1, height: 1, backgroundColor: colors.line2 },
  footer: { height: 100 },
});

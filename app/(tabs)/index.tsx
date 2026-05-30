// Dashboard — glanceable home base: today summary, quick actions, 4 section previews.
// Shows first-run tutorial on mount; accessible any time via the lightbulb.

import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  BillRow,
  DashHeader,
  MealCard,
  QuickActions,
  ShopPreview,
  TaskRow,
  TodayCard,
} from '@/components/dashboard';
import { Icon } from '@/components/icons/Icon';
import { SectionTitle, TutorialSheet, type TutorialStep } from '@/components/ui';
import { colors, fontFamily, fontSize, spacing } from '@/theme';

// ─── Static data (replaced with real data in future phases) ──

const TASKS = [
  {
    id: '1',
    title: 'Take out the trash',
    assigneeInitial: 'A',
    assigneeColor: colors.primary,
    time: 'By 8 PM',
    tag: 'Weekly',
    done: false,
  },
  {
    id: '2',
    title: 'Water the plants',
    assigneeInitial: 'M',
    assigneeColor: colors.sky,
    time: 'Anytime today',
    done: true,
  },
  {
    id: '3',
    title: 'Pick up dry cleaning',
    assigneeInitial: 'L',
    assigneeColor: colors.butter,
    time: 'Before 6 PM',
    done: false,
  },
];

const BILLS = [
  {
    id: '1',
    name: 'Electricity',
    amount: '$84.20',
    dueLabel: 'Due in 2 days',
    iconColor: colors.sky,
    paid: false,
  },
  {
    id: '2',
    name: 'Internet',
    amount: '$65.00',
    dueLabel: 'Paid · Mar 8',
    iconColor: colors.mint,
    paid: true,
  },
];

// ─── Dashboard screen ─────────────────────────────────────────

export default function DashboardScreen() {
  const { t } = useTranslation('dashboard');
  const { t: tc } = useTranslation('common');
  const [tutorialVisible, setTutorialVisible] = useState(true);
  const insets = useSafeAreaInsets();

  const doneTasks = TASKS.filter((task) => task.done).length;

  // Tutorial steps — built with translations so they update on language switch
  const tutorialSteps = useMemo<TutorialStep[]>(() => {
    const TILE_DEFS = [
      { icon: Icon.tasks, bg: colors.mintSoft, ink: '#2F8A5E', l: t('quick_actions.task_short') },
      { icon: Icon.cart, bg: colors.butterSoft, ink: '#8A6220', l: t('quick_actions.item_short') },
      {
        icon: Icon.wallet,
        bg: colors.primarySoft,
        ink: colors.primaryInk,
        l: t('quick_actions.bill_short'),
      },
      { icon: Icon.meal, bg: colors.lilacSoft, ink: '#6A50A0', l: t('quick_actions.meal_short') },
    ];
    return [
      {
        title: t('tutorial.step1_title'),
        body: t('tutorial.step1_body'),
        example: (
          <View style={eg.row}>
            <View style={eg.darkIcon}>
              <Icon.home size={20} color={colors.white} />
            </View>
            <View style={eg.textBlock}>
              <Text style={eg.bold}>{t('tutorial.example1_today')}</Text>
              <Text style={eg.sub}>{t('tutorial.example1_sub')}</Text>
            </View>
          </View>
        ),
      },
      {
        title: t('tutorial.step2_title'),
        body: t('tutorial.step2_body'),
        example: (
          <View style={eg.tileRow}>
            {TILE_DEFS.map((tile) => {
              const IconComp = tile.icon;
              return (
                <View key={tile.l} style={[eg.tile, { backgroundColor: tile.bg }]}>
                  <IconComp size={18} color={tile.ink} />
                  <Text style={[eg.tileLabel, { color: tile.ink }]}>{tile.l}</Text>
                </View>
              );
            })}
          </View>
        ),
      },
      {
        title: t('tutorial.step3_title'),
        body: t('tutorial.step3_body'),
        example: (
          <View style={eg.row}>
            <View style={[eg.bulbIcon, { backgroundColor: colors.primarySoft }]}>
              <Icon.bulb size={18} color={colors.primaryInk} />
            </View>
            <Text style={[eg.sub, { flex: 1 }]}>
              {t('tutorial.example3_tap')} <Text style={eg.bold}>{t('tutorial.lightbulb')}</Text>{' '}
              {t('tutorial.example3_suffix')}
            </Text>
          </View>
        ),
      },
    ];
  }, [t]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <DashHeader onBellPress={() => setTutorialVisible(true)} />
        <TodayCard totalTasks={TASKS.length} doneTasks={doneTasks} amountDue="$84" />
        <QuickActions />

        {/* Today's chores */}
        <SectionTitle
          title={t('sections.todays_chores')}
          count={t('sections.left', { n: TASKS.length - doneTasks })}
          hint={tc('see_all')}
        />
        <View style={styles.section}>
          {TASKS.map((task) => (
            <TaskRow key={task.id} {...task} />
          ))}
        </View>

        {/* Bills coming up */}
        <SectionTitle title={t('sections.bills_coming')} hint={tc('see_all')} />
        <View style={styles.section}>
          {BILLS.map((bill) => (
            <BillRow key={bill.id} {...bill} />
          ))}
        </View>

        {/* Tonight's meal */}
        <SectionTitle title={t('sections.tonights_meal')} />
        <View style={styles.section}>
          <MealCard />
        </View>

        {/* Shopping list */}
        <SectionTitle title={t('sections.shopping')} hint={tc('open')} />
        <View style={[styles.section, styles.lastSection]}>
          <ShopPreview />
        </View>
      </ScrollView>

      <TutorialSheet
        steps={tutorialSteps}
        visible={tutorialVisible}
        onClose={() => setTutorialVisible(false)}
      />
    </View>
  );
}

// Tutorial example component styles
const eg = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  darkIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bulbIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: { flex: 1 },
  bold: { fontFamily: fontFamily.bold, fontSize: fontSize.body, color: colors.ink },
  sub: { fontFamily: fontFamily.regular, fontSize: 13, color: colors.ink2, marginTop: 2 },
  tileRow: { flexDirection: 'row', gap: 8 },
  tile: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 4,
  },
  tileLabel: { fontFamily: fontFamily.bold, fontSize: 10 },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: 24,
  },
  section: {
    paddingHorizontal: spacing[7],
    paddingBottom: 10,
  },
  lastSection: {
    paddingBottom: 0,
  },
});

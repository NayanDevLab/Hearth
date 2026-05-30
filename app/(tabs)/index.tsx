// Dashboard — glanceable home base: today summary, quick actions, 4 section previews.
// Shows first-run tutorial on mount; accessible any time via the lightbulb.

import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

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

// ─── Tutorial step examples ───────────────────────────────────

function TutorialExample1() {
  return (
    <View style={eg.row}>
      <View style={eg.darkIcon}>
        <Icon.home size={20} color={colors.white} />
      </View>
      <View style={eg.textBlock}>
        <Text style={eg.bold}>Today · 60% done</Text>
        <Text style={eg.sub}>See the day at a glance, every morning.</Text>
      </View>
    </View>
  );
}

function TutorialExample2() {
  const tiles = [
    { icon: Icon.tasks, bg: colors.mintSoft, ink: '#2F8A5E', l: 'Task' },
    { icon: Icon.cart, bg: colors.butterSoft, ink: '#8A6220', l: 'Item' },
    { icon: Icon.wallet, bg: colors.primarySoft, ink: colors.primaryInk, l: 'Bill' },
    { icon: Icon.meal, bg: colors.lilacSoft, ink: '#6A50A0', l: 'Meal' },
  ];
  return (
    <View style={eg.tileRow}>
      {tiles.map((t) => {
        const IconComp = t.icon;
        return (
          <View key={t.l} style={[eg.tile, { backgroundColor: t.bg }]}>
            <IconComp size={18} color={t.ink} />
            <Text style={[eg.tileLabel, { color: t.ink }]}>{t.l}</Text>
          </View>
        );
      })}
    </View>
  );
}

function TutorialExample3() {
  return (
    <View style={eg.row}>
      <View style={[eg.bulbIcon, { backgroundColor: colors.primarySoft }]}>
        <Icon.bulb size={18} color={colors.primaryInk} />
      </View>
      <Text style={[eg.sub, { flex: 1 }]}>
        Tap the <Text style={eg.bold}>lightbulb</Text> any time you&apos;re not sure what something
        does.
      </Text>
    </View>
  );
}

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

// ─── Dashboard screen ─────────────────────────────────────────

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    title: 'This is your home base',
    body: 'A snapshot of what your household has going on today — chores, bills, meals, and the shopping list.',
    example: <TutorialExample1 />,
  },
  {
    title: 'Tap the quick actions',
    body: 'Add a task, log a bill, plan a meal — all from one row. No menus to dig through.',
    example: <TutorialExample2 />,
  },
  {
    title: 'Get help on every screen',
    body: 'Look for the lightbulb in the top corner of any feature. It explains the screen with a quick example.',
    example: <TutorialExample3 />,
  },
];

export default function DashboardScreen() {
  const [tutorialVisible, setTutorialVisible] = useState(true);
  const insets = useSafeAreaInsets();

  const doneTasks = TASKS.filter((t) => t.done).length;

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
          title="Today's chores"
          count={`${TASKS.length - doneTasks} left`}
          hint="See all"
        />
        <View style={styles.section}>
          {TASKS.map((task) => (
            <TaskRow key={task.id} {...task} />
          ))}
        </View>

        {/* Bills coming up */}
        <SectionTitle title="Bills coming up" hint="See all" />
        <View style={styles.section}>
          {BILLS.map((bill) => (
            <BillRow key={bill.id} {...bill} />
          ))}
        </View>

        {/* Tonight's meal */}
        <SectionTitle title="Tonight's meal" />
        <View style={styles.section}>
          <MealCard />
        </View>

        {/* Shopping list */}
        <SectionTitle title="Shopping list" hint="Open" />
        <View style={[styles.section, styles.lastSection]}>
          <ShopPreview />
        </View>
      </ScrollView>

      <TutorialSheet
        steps={TUTORIAL_STEPS}
        visible={tutorialVisible}
        onClose={() => setTutorialVisible(false)}
      />
    </View>
  );
}

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

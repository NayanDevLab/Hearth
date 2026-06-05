// Money overview — dark hero card, member balances, tabbed activity feed.

import { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { router } from 'expo-router';

import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icons/Icon';
import { EmptyState, ErrorState } from '@/components/shared';
import { Avatar, FAB, ScreenHeader } from '@/components/ui';
import { dueDateLabel, formatAmount, MONEY_CAT_MAP } from '@/constants/money';
import {
  type Bill,
  type BillFilter,
  getAllBills,
  getBalances,
  getMonthStats,
  markBillPaid,
  type MemberBalance,
  type MonthStats,
  settleAllSplitsForMember,
} from '@/db/modules/bills';
import { getAllMembers, type HouseholdMember } from '@/db/modules/members';
import { useFocusRefresh } from '@/hooks';
import { colors, fontFamily, fontSize, spacing } from '@/theme';

export default function MoneyOverviewScreen() {
  const { t } = useTranslation('money');
  const insets = useSafeAreaInsets();

  const [bills, setBills] = useState<Bill[]>([]);
  const [balances, setBalances] = useState<MemberBalance[]>([]);
  const [stats, setStats] = useState<MonthStats>({
    bills_total: 0,
    expenses_total: 0,
    upcoming_count: 0,
  });
  const [youInitial, setYouInitial] = useState('');
  const [members, setMembers] = useState<HouseholdMember[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [activeTab, setActiveTab] = useState<BillFilter>('all');

  const loadData = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      setError(null);
      try {
        const allMembers = await getAllMembers();
        setMembers(allMembers);
        const adminInitial =
          allMembers.find((m) => m.role === 'admin')?.initial ?? allMembers[0]?.initial ?? 'A';
        setYouInitial(adminInitial);
        const [allBills, bals, monthStats] = await Promise.all([
          getAllBills(activeTab),
          getBalances(adminInitial),
          getMonthStats(),
        ]);
        setBills(allBills);
        setBalances(bals);
        setStats(monthStats);
      } catch (e) {
        setError(e instanceof Error ? e : new Error('Error'));
      } finally {
        setRefreshing(false);
      }
    },
    [activeTab]
  );

  const load = useCallback(() => {
    loadData(false);
  }, [loadData]);
  const refresh = useCallback(() => {
    loadData(true);
  }, [loadData]);
  useFocusRefresh(load, refresh);

  const totalOwedToYou = balances.filter((b) => b.net > 0).reduce((s, b) => s + b.net, 0);
  const totalYouOwe = balances.filter((b) => b.net < 0).reduce((s, b) => s + Math.abs(b.net), 0);
  const netAmount = totalOwedToYou - totalYouOwe;

  // Group bills into sections
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = bills.filter((b) => !b.paid && b.due_date && b.due_date >= today);
  const recent = bills.filter((b) => !b.paid && (!b.due_date || b.due_date < today));
  const settled = bills.filter((b) => b.paid);

  if (error) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ScreenHeader title={t('screen_title')} showBack={false} />
        <ErrorState title={t('error_title')} retryLabel={t('error_retry')} onRetry={load} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader title={t('screen_title')} showBack={false} />

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
        {/* Dark hero card */}
        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>{netAmount >= 0 ? t('you_are_owed') : t('you_owe')}</Text>
          <Text style={styles.heroAmount}>{formatAmount(Math.abs(netAmount))}</Text>
          <Text style={styles.heroSub}>{t('across_housemates', { n: balances.length })}</Text>

          <View style={styles.heroStats}>
            <HeroStat label={t('bills_this_month')} value={formatAmount(stats.bills_total)} />
            <View style={styles.heroDivider} />
            <HeroStat label={t('expenses')} value={formatAmount(stats.expenses_total)} />
            <View style={styles.heroDivider} />
            <HeroStat label={t('upcoming')} value={String(stats.upcoming_count)} highlight />
          </View>

          <TouchableOpacity style={styles.settleAllBtn} activeOpacity={0.85} onPress={() => {}}>
            <Icon.sparkle size={16} color={colors.ink} />
            <Text style={styles.settleAllLabel}>{t('settle_up_everyone')}</Text>
          </TouchableOpacity>
        </View>

        {/* Balances */}
        {balances.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>{t('who_owes_what')}</Text>
            <View style={styles.balanceList}>
              {balances.map((b) => (
                <BalancePill
                  key={b.initial}
                  balance={b}
                  memberName={members.find((m) => m.initial === b.initial)?.name ?? b.initial}
                  currency="INR"
                  onSettle={async () => {
                    if (b.owes_you > 0) {
                      const all = await getAllBills('all');
                      for (const bill of all.filter((bi) => bi.paid_by === youInitial)) {
                        await settleAllSplitsForMember(bill.id, b.initial);
                      }
                    }
                    loadData(false);
                  }}
                />
              ))}
            </View>
          </>
        )}

        {/* Tabs */}
        <View style={styles.tabs}>
          {(['all', 'bills', 'expenses', 'settled'] as BillFilter[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              activeOpacity={0.75}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabLabel, activeTab === tab && styles.tabLabelActive]}>
                {t(`tab_${tab}`)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Activity feed */}
        {bills.length === 0 ? (
          <EmptyState emoji="💰" title={t('no_bills_title')} body={t('no_bills_body')} />
        ) : (
          <>
            {upcoming.length > 0 && (
              <BillSection
                label={t('section_upcoming')}
                bills={upcoming}
                onPress={(id) => router.push(`/money/${id}` as never)}
                onPaid={async (id) => {
                  await markBillPaid(id, true);
                  loadData(false);
                }}
              />
            )}
            {recent.length > 0 && (
              <BillSection
                label={t('section_earlier')}
                bills={recent}
                onPress={(id) => router.push(`/money/${id}` as never)}
                onPaid={async (id) => {
                  await markBillPaid(id, true);
                  loadData(false);
                }}
              />
            )}
            {settled.length > 0 && (
              <BillSection
                label={t('section_settled')}
                bills={settled}
                onPress={(id) => router.push(`/money/${id}` as never)}
                onPaid={async (id) => {
                  await markBillPaid(id, false);
                  loadData(false);
                }}
              />
            )}
          </>
        )}

        <View style={styles.footer} />
      </ScrollView>

      <FAB onPress={() => router.push('/money/new' as never)} />
    </View>
  );
}

function HeroStat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <View style={styles.heroStatItem}>
      <Text style={styles.heroStatLabel}>{label}</Text>
      <Text style={[styles.heroStatValue, highlight && styles.heroStatHighlight]}>{value}</Text>
    </View>
  );
}

function BalancePill({
  balance,
  memberName,
  currency,
  onSettle,
}: {
  balance: MemberBalance;
  memberName: string;
  currency: string;
  onSettle: () => void;
}) {
  const { t } = useTranslation('money');
  const owes = balance.net < 0;
  const settled = balance.net === 0;

  let subLabel = t('owes_you');
  if (settled) subLabel = t('settled');
  else if (owes) subLabel = t('you_owe_them');

  let amtStyle: object = styles.amtCredit;
  if (settled) {
    amtStyle = styles.amtSettled;
  } else if (owes) {
    amtStyle = styles.amtOwed;
  }

  const amtText = settled
    ? formatAmount(0, currency)
    : `${owes ? '−' : '+'}${formatAmount(Math.abs(balance.net), currency)}`;

  return (
    <View style={styles.balancePill}>
      <Avatar initial={balance.initial} color={colors.primary} size={32} />
      <View style={styles.balanceInfo}>
        <Text style={styles.balanceName}>{memberName}</Text>
        <Text style={styles.balanceSub}>{subLabel}</Text>
      </View>
      <View style={styles.balanceRight}>
        <Text style={[styles.balanceAmount, amtStyle]}>{amtText}</Text>
        {!settled && (
          <TouchableOpacity onPress={onSettle} activeOpacity={0.7}>
            <Text style={styles.balanceAction}>{owes ? t('remind') : t('settle_up')}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

function BillSection({
  label,
  bills,
  onPress,
  onPaid,
}: {
  label: string;
  bills: Bill[];
  onPress: (id: string) => void;
  onPaid: (id: string) => void;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{label}</Text>
      {bills.map((bill) => (
        <ActivityRow
          key={bill.id}
          bill={bill}
          onPress={() => onPress(bill.id)}
          onPaid={() => onPaid(bill.id)}
        />
      ))}
    </View>
  );
}

function ActivityRow({
  bill,
  onPress,
  onPaid,
}: {
  bill: Bill;
  onPress: () => void;
  onPaid: () => void;
}) {
  const { t } = useTranslation('money');
  const cat = MONEY_CAT_MAP[bill.category ?? 'other'] ?? MONEY_CAT_MAP['other'];
  let recLabel: string | null = null;
  if (bill.recurrence === 'monthly') {
    recLabel = t('monthly_badge');
  } else if (bill.recurrence === 'weekly') {
    recLabel = t('weekly_badge');
  } else if (bill.recurrence === 'yearly') {
    recLabel = t('yearly_badge');
  }
  return (
    <TouchableOpacity style={styles.activityRow} activeOpacity={0.8} onPress={onPress}>
      <View style={[styles.activityIcon, { backgroundColor: cat.soft }]}>
        <Text style={styles.activityEmoji}>{cat.emoji}</Text>
      </View>
      <View style={styles.activityInfo}>
        <View style={styles.activityTitleRow}>
          <Text style={styles.activityTitle} numberOfLines={1}>
            {bill.name}
          </Text>
          {recLabel && (
            <View style={styles.recBadge}>
              <Text style={styles.recBadgeText}>{recLabel}</Text>
            </View>
          )}
        </View>
        <Text style={styles.activitySub}>
          {bill.paid_by ? `${bill.paid_by} · ` : ''}
          {bill.due_date ? dueDateLabel(bill.due_date) : t('section_earlier')}
        </Text>
      </View>
      <View style={styles.activityRight}>
        <Text style={styles.activityAmount}>{formatAmount(bill.amount)}</Text>
        <TouchableOpacity style={styles.paidBtn} activeOpacity={0.75} onPress={onPaid}>
          <Text style={[styles.paidBtnText, bill.paid && styles.paidBtnPaid]}>
            {bill.paid ? t('mark_unpaid') : t('mark_paid')}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { flex: 1 },
  heroCard: {
    marginHorizontal: spacing[7],
    marginBottom: 18,
    padding: 18,
    borderRadius: 24,
    backgroundColor: colors.ink,
    overflow: 'hidden',
  },
  heroLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  heroAmount: {
    fontFamily: fontFamily.extraBold,
    fontSize: 40,
    color: colors.white,
    letterSpacing: -1.2,
    marginVertical: 4,
    lineHeight: 44,
  },
  heroSub: { fontFamily: fontFamily.regular, fontSize: 13, color: 'rgba(255,255,255,0.65)' },
  heroStats: {
    flexDirection: 'row',
    marginTop: 16,
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 14,
    gap: 0,
  },
  heroStatItem: { flex: 1 },
  heroDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.18)' },
  heroStatLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 9.5,
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  heroStatValue: { fontFamily: fontFamily.extraBold, fontSize: 17, color: colors.white },
  heroStatHighlight: { color: colors.butter },
  settleAllBtn: {
    marginTop: 14,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.butter,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  settleAllLabel: { fontFamily: fontFamily.bold, fontSize: 14, color: colors.ink },
  sectionTitle: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.cardTitle,
    color: colors.ink,
    paddingHorizontal: spacing[7],
    marginBottom: 10,
  },
  balanceList: { paddingHorizontal: spacing[7], marginBottom: 18, gap: 8 },
  balancePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: '10px 12px' as unknown as number,
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  balanceInfo: { flex: 1 },
  balanceName: { fontFamily: fontFamily.bold, fontSize: 14, color: colors.ink },
  balanceSub: { fontFamily: fontFamily.regular, fontSize: 11, color: colors.ink3, marginTop: 1 },
  balanceRight: { alignItems: 'flex-end' },
  balanceAmount: { fontFamily: fontFamily.extraBold, fontSize: 16, letterSpacing: -0.3 },
  amtSettled: { color: colors.ink3 },
  amtOwed: { color: colors.rose },
  amtCredit: { color: colors.mint },
  balanceAction: { fontFamily: fontFamily.bold, fontSize: 11, color: colors.primary, marginTop: 2 },
  tabs: {
    flexDirection: 'row',
    marginHorizontal: spacing[7],
    marginBottom: 14,
    padding: 4,
    borderRadius: 14,
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.line,
  },
  tab: { flex: 1, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  tabActive: {
    backgroundColor: colors.white,
    ...{ shadowColor: colors.ink, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  },
  tabLabel: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.ink3 },
  tabLabelActive: { color: colors.ink },
  section: { marginBottom: 8 },
  sectionLabel: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.caption,
    color: colors.ink3,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    paddingHorizontal: spacing[7],
    marginBottom: 8,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: spacing[7],
    marginBottom: 6,
    padding: 12,
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.line,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  activityEmoji: { fontSize: 20 },
  activityInfo: { flex: 1, minWidth: 0 },
  activityTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  activityTitle: { fontFamily: fontFamily.bold, fontSize: 14.5, color: colors.ink },
  recBadge: {
    paddingHorizontal: 7,
    paddingVertical: 1,
    borderRadius: 999,
    backgroundColor: colors.surface2,
  },
  recBadgeText: { fontFamily: fontFamily.bold, fontSize: 10, color: colors.ink2 },
  activitySub: { fontFamily: fontFamily.regular, fontSize: 11.5, color: colors.ink3, marginTop: 2 },
  activityRight: { alignItems: 'flex-end', flexShrink: 0 },
  activityAmount: {
    fontFamily: fontFamily.extraBold,
    fontSize: 15,
    color: colors.ink,
    letterSpacing: -0.3,
  },
  paidBtn: { marginTop: 3 },
  paidBtnText: { fontFamily: fontFamily.bold, fontSize: 11, color: colors.primary },
  paidBtnPaid: { color: colors.ink4 },
  footer: { height: 100 },
});

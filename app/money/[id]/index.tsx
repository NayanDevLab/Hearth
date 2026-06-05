// Bill/Expense detail — hero, split breakdown, payment history, mark paid.

import { useCallback, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { router, useLocalSearchParams } from 'expo-router';

import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icons/Icon';
import { ErrorState } from '@/components/shared';
import { Avatar, ScreenHeader } from '@/components/ui';
import { dueDateLabel, formatAmount, MONEY_CAT_MAP } from '@/constants/money';
import {
  type BillWithSplits,
  deleteBill,
  getBillById,
  markBillPaid,
  settleAllSplitsForMember,
} from '@/db/modules/bills';
import { getAllMembers, type HouseholdMember } from '@/db/modules/members';
import { useFocusRefresh } from '@/hooks';
import { colors, fontFamily, fontSize, radius, shadows, spacing } from '@/theme';

function recurrenceLabel(rec: string | null, t: (k: string) => string): string | null {
  if (rec === 'monthly') return t('monthly_badge');
  if (rec === 'weekly') return t('weekly_badge');
  if (rec === 'yearly') return t('yearly_badge');
  return null;
}

export default function BillDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation('money');
  const { t: tc } = useTranslation('common');
  const insets = useSafeAreaInsets();

  const [bill, setBill] = useState<BillWithSplits | null>(null);
  const [members, setMembers] = useState<HouseholdMember[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [deleteVisible, setDeleteVisible] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const [b, mems] = await Promise.all([getBillById(id), getAllMembers()]);
      setBill(b);
      setMembers(mems);
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Error'));
    }
  }, [id]);

  useFocusRefresh(load, load);

  async function handleDelete() {
    if (!id) return;
    setDeleteVisible(false);
    await deleteBill(id);
    router.back();
  }

  async function handleTogglePaid() {
    if (!bill || !id) return;
    await markBillPaid(id, !bill.paid);
    load();
  }

  if (error) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ScreenHeader title={t('screen_title')} onBack={() => router.back()} />
        <ErrorState title={t('error_title')} retryLabel={t('error_retry')} onRetry={load} />
      </View>
    );
  }

  const cat = MONEY_CAT_MAP[bill?.category ?? 'other'] ?? MONEY_CAT_MAP['other'];
  const recLabel = recurrenceLabel(bill?.recurrence ?? null, t);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader
        title=""
        onBack={() => router.back()}
        right={
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerBtn}
              activeOpacity={0.7}
              onPress={() => router.push(`/money/${id}/edit` as never)}
            >
              <Icon.edit size={18} color={colors.ink} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerBtn}
              activeOpacity={0.7}
              onPress={() => setDeleteVisible(true)}
            >
              <Icon.trash size={18} color={colors.rose} />
            </TouchableOpacity>
          </View>
        }
      />

      {bill && (
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Hero */}
          <View style={styles.heroSection}>
            <View style={styles.heroTop}>
              <View style={[styles.heroIcon, { backgroundColor: cat.soft }]}>
                <Text style={styles.heroEmoji}>{cat.emoji}</Text>
              </View>
              <View style={styles.heroMeta}>
                <View style={styles.heroBadges}>
                  <View style={[styles.catBadge, { backgroundColor: cat.soft }]}>
                    <Text style={[styles.catBadgeText, { color: cat.color }]}>{cat.label}</Text>
                  </View>
                  {recLabel && (
                    <View style={styles.recBadge}>
                      <Text style={styles.recBadgeText}>{recLabel}</Text>
                    </View>
                  )}
                  {bill.paid && (
                    <View style={styles.paidBadge}>
                      <Text style={styles.paidBadgeText}>{t('paid_badge')}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.heroTitle}>{bill.name}</Text>
              </View>
            </View>

            <View style={styles.amountBox}>
              <Text style={styles.amountLarge}>{formatAmount(bill.amount)}</Text>
              <View style={styles.amountRight}>
                <Text style={styles.amountSub}>
                  {t('total_amount')} · {t('split_ways', { n: bill.splits.length + 1 })}
                </Text>
                {bill.splits.length > 0 && (
                  <Text style={styles.amountEach}>
                    {formatAmount(bill.amount / (bill.splits.length + 1))} {t('each_amount')}
                  </Text>
                )}
              </View>
              {bill.due_date && !bill.paid && (
                <View style={styles.dueBadge}>
                  <Text style={styles.dueBadgeText}>{dueDateLabel(bill.due_date)}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Meta rows */}
          <View style={styles.metaCard}>
            {bill.due_date && (
              <MetaRow icon="calendar" label={t('due_label')} value={bill.due_date} />
            )}
            {bill.paid_by && (
              <MetaRow icon="users" label={t('paid_by_label')} value={bill.paid_by} />
            )}
            {bill.recurrence && (
              <MetaRow icon="sparkle" label={t('repeats_label')} value={recLabel ?? ''} />
            )}
            {bill.reminder && (
              <MetaRow icon="bell" label={t('reminder_label')} value={bill.reminder} />
            )}
          </View>

          {/* Split breakdown */}
          {bill.splits.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>{t('split_breakdown')}</Text>
              <View style={styles.splitCard}>
                {bill.splits.map((s, i) => {
                  const member = members.find((m) => m.initial === s.member_initial);
                  return (
                    <View
                      key={s.id}
                      style={[styles.splitRow, i < bill.splits.length - 1 && styles.splitRowBorder]}
                    >
                      <Avatar
                        initial={s.member_initial}
                        color={member?.color ?? colors.ink3}
                        size={32}
                      />
                      <View style={styles.splitInfo}>
                        <Text style={styles.splitName}>{member?.name ?? s.member_initial}</Text>
                        <Text
                          style={[
                            styles.splitStatus,
                            s.settled ? styles.splitSettled : styles.splitOwes,
                          ]}
                        >
                          {s.settled ? `✓ ${t('settled_check')}` : t('owes_you')}
                        </Text>
                      </View>
                      <View style={styles.splitRight}>
                        <Text style={styles.splitAmount}>{formatAmount(s.amount)}</Text>
                        {!s.settled && (
                          <TouchableOpacity
                            onPress={async () => {
                              await settleAllSplitsForMember(bill.id, s.member_initial);
                              load();
                            }}
                            activeOpacity={0.7}
                          >
                            <Text style={styles.settleBtn}>{t('settle_up')}</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {/* Notes */}
          {bill.notes && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>{t('note_label')}</Text>
              <View style={styles.notesCard}>
                <Text style={styles.notesText}>{bill.notes}</Text>
              </View>
            </View>
          )}

          <View style={styles.footer} />
        </ScrollView>
      )}

      {/* Bottom bar */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        <TouchableOpacity
          style={styles.editBarBtn}
          activeOpacity={0.8}
          onPress={() => router.push(`/money/${id}/edit` as never)}
        >
          <Icon.edit size={18} color={colors.ink} />
          <Text style={styles.editBarLabel}>{t('edit')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.paidBarBtn, bill?.paid && styles.paidBarBtnUnpaid]}
          activeOpacity={0.85}
          onPress={handleTogglePaid}
        >
          <Icon.check size={18} color={colors.white} stroke={2.5} />
          <Text style={styles.paidBarLabel}>{bill?.paid ? t('mark_unpaid') : t('mark_paid')}</Text>
        </TouchableOpacity>
      </View>

      {/* Delete confirm */}
      <Modal
        transparent
        visible={deleteVisible}
        animationType="slide"
        onRequestClose={() => setDeleteVisible(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setDeleteVisible(false)} />
        <View style={styles.sheet}>
          <View style={styles.grabber} />
          <View style={styles.deleteIcon}>
            <Icon.trash size={24} color={colors.rose} />
          </View>
          <Text style={styles.deleteTitle}>{t('delete_title')}</Text>
          <Text style={styles.deleteBody}>{t('delete_body')}</Text>
          <TouchableOpacity
            style={styles.deleteConfirmBtn}
            activeOpacity={0.85}
            onPress={handleDelete}
          >
            <Text style={styles.deleteConfirmLabel}>{t('delete_confirm')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cancelBtn}
            activeOpacity={0.8}
            onPress={() => setDeleteVisible(false)}
          >
            <Text style={styles.cancelLabel}>{tc('cancel')}</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

function MetaRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  const IconComp = (Icon as Record<string, React.ComponentType<{ size: number; color: string }>>)[
    icon
  ];
  return (
    <View style={styles.metaRow}>
      {IconComp ? <IconComp size={18} color={colors.ink3} /> : null}
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  headerActions: { flexDirection: 'row', gap: 8 },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: { flex: 1 },
  heroSection: { paddingHorizontal: spacing[7], marginBottom: 14 },
  heroTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, marginBottom: 14 },
  heroIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  heroEmoji: { fontSize: 28 },
  heroMeta: { flex: 1, paddingTop: 2 },
  heroBadges: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 6 },
  catBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  catBadgeText: { fontFamily: fontFamily.bold, fontSize: 10 },
  recBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: colors.surface2,
  },
  recBadgeText: { fontFamily: fontFamily.bold, fontSize: 10, color: colors.ink2 },
  paidBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: colors.mintSoft,
  },
  paidBadgeText: { fontFamily: fontFamily.bold, fontSize: 10, color: colors.mint },
  heroTitle: {
    fontFamily: fontFamily.extraBold,
    fontSize: 22,
    color: colors.ink,
    letterSpacing: -0.5,
  },
  amountBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 18,
    borderRadius: 18,
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.line,
  },
  amountLarge: {
    fontFamily: fontFamily.extraBold,
    fontSize: 34,
    color: colors.ink,
    letterSpacing: -1,
  },
  amountRight: { flex: 1 },
  amountSub: { fontFamily: fontFamily.regular, fontSize: 12, color: colors.ink3 },
  amountEach: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.ink2, marginTop: 1 },
  dueBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: colors.roseSoft,
  },
  dueBadgeText: { fontFamily: fontFamily.bold, fontSize: 11, color: colors.rose },
  metaCard: {
    marginHorizontal: spacing[7],
    marginBottom: 14,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 13,
    borderBottomWidth: 1,
    borderBottomColor: colors.line2,
  },
  metaLabel: {
    flex: 1,
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.body,
    color: colors.ink3,
  },
  metaValue: { fontFamily: fontFamily.semiBold, fontSize: fontSize.body, color: colors.ink },
  section: { paddingHorizontal: spacing[7], marginBottom: 14 },
  sectionLabel: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.caption,
    color: colors.ink3,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  splitCard: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: 'hidden',
    padding: 4,
  },
  splitRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10 },
  splitRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.line2 },
  splitInfo: { flex: 1 },
  splitName: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.ink },
  splitStatus: { fontFamily: fontFamily.bold, fontSize: 11, marginTop: 1 },
  splitSettled: { color: colors.mint },
  splitOwes: { color: colors.rose },
  splitRight: { alignItems: 'flex-end' },
  splitAmount: { fontFamily: fontFamily.extraBold, fontSize: 14, color: colors.ink },
  settleBtn: { fontFamily: fontFamily.bold, fontSize: 11, color: colors.primary, marginTop: 2 },
  notesCard: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 14,
  },
  notesText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.body,
    color: colors.ink2,
    lineHeight: 22,
  },
  footer: { height: 80 },
  bottomBar: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: spacing[7],
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    backgroundColor: colors.white,
  },
  editBarBtn: {
    flex: 1,
    height: 52,
    borderRadius: radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderWidth: 1,
    borderColor: colors.line,
  },
  editBarLabel: { fontFamily: fontFamily.bold, fontSize: fontSize.cardTitle, color: colors.ink },
  paidBarBtn: {
    flex: 1.6,
    height: 52,
    borderRadius: radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    backgroundColor: colors.mint,
  },
  paidBarBtnUnpaid: { backgroundColor: colors.surface2 },
  paidBarLabel: { fontFamily: fontFamily.bold, fontSize: fontSize.cardTitle, color: colors.white },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(20,22,30,0.45)' },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing[7],
    paddingTop: spacing[5],
    paddingBottom: 32,
    alignItems: 'center',
    ...shadows.sh3,
  },
  grabber: {
    width: 36,
    height: 5,
    backgroundColor: colors.ink4,
    opacity: 0.4,
    borderRadius: 3,
    marginBottom: 16,
  },
  deleteIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.roseSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  deleteTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 19,
    color: colors.ink,
    textAlign: 'center',
    marginBottom: 6,
  },
  deleteBody: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.body,
    color: colors.ink2,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 20,
  },
  deleteConfirmBtn: {
    width: '100%',
    height: 52,
    borderRadius: radius.pill,
    backgroundColor: colors.rose,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  deleteConfirmLabel: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.cardTitle,
    color: colors.white,
  },
  cancelBtn: { height: 48, width: '100%', alignItems: 'center', justifyContent: 'center' },
  cancelLabel: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.cardTitle,
    color: colors.ink3,
  },
});

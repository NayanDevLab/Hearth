// Members list — LB1 design. Shows stats, member rows, Add a member CTA.

import { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { router } from 'expo-router';

import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icons/Icon';
import { EmptyState, ErrorState } from '@/components/shared';
import { Avatar, FAB, ScreenHeader } from '@/components/ui';
import { MEMBER_ROLES } from '@/constants/settings';
import { getAllMembers, getMemberStats, type HouseholdMember } from '@/db/modules/members';
import { useFocusRefresh } from '@/hooks';
import { colors, fontFamily, fontSize, radius, spacing } from '@/theme';

export default function MembersScreen() {
  const { t } = useTranslation('settings');
  const insets = useSafeAreaInsets();

  const [members, setMembers] = useState<HouseholdMember[]>([]);
  const [stats, setStats] = useState({ total: 0, admin: 0, kid: 0 });
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  async function loadMembers(isRefresh = false) {
    if (isRefresh) setRefreshing(true);
    setError(null);
    try {
      const [all, s] = await Promise.all([getAllMembers(), getMemberStats()]);
      setMembers(all);
      setStats(s);
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Error'));
    } finally {
      setRefreshing(false);
    }
  }

  const load = useCallback(() => loadMembers(false), []);
  const refresh = useCallback(() => loadMembers(true), []);
  useFocusRefresh(load, refresh);

  const roleLabel = (m: HouseholdMember) =>
    MEMBER_ROLES.find((r) => r.value === m.role)?.label ?? m.role;

  function memberCaption(role: string): string {
    if (role === 'admin') return 'You · created the household';
    if (role === 'adult') return 'Can edit everything';
    if (role === 'teen') return 'Can edit, no money access';
    return 'Can view tasks only';
  }

  const roleBadgeColor = (role: string) => {
    if (role === 'admin') return { bg: colors.primarySoft, text: colors.primaryInk };
    if (role === 'teen') return { bg: colors.butterSoft, text: '#8A6220' };
    if (role === 'kid') return { bg: colors.skySoft, text: '#4AADD1' };
    return { bg: colors.surface2, text: colors.ink3 };
  };

  if (error) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ScreenHeader title={t('members_title')} onBack={() => router.back()} />
        <ErrorState title={t('error_title')} retryLabel={t('error_retry')} onRetry={load} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader title={t('members_title')} onBack={() => router.back()} />

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
        {/* Stats row */}
        {stats.total > 0 && (
          <View style={styles.statsRow}>
            <StatCard value={stats.total} label="people" />
            <StatCard value={stats.admin} label="admin" />
            <StatCard value={stats.kid} label="kid" />
          </View>
        )}

        {/* Member list */}
        <View style={styles.listCard}>
          <Text style={styles.listLabel}>{t('in_household').toUpperCase()}</Text>

          {members.length === 0 ? (
            <EmptyState
              emoji="👨‍👩‍👧"
              title={t('empty_members_title')}
              body={t('empty_members_body')}
            />
          ) : (
            members.map((m, i) => {
              const badge = roleBadgeColor(m.role);
              return (
                <View
                  key={m.id}
                  style={[styles.memberRow, i < members.length - 1 && styles.memberRowBorder]}
                >
                  <Avatar initial={m.initial} color={m.color} size={40} />
                  <View style={styles.memberInfo}>
                    <View style={styles.memberNameRow}>
                      <Text style={styles.memberName}>{m.name}</Text>
                      {m.role === 'admin' && (
                        <View style={styles.youBadge}>
                          <Text style={styles.youBadgeText}>{t('you_badge')}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.memberCaption}>{memberCaption(m.role)}</Text>
                  </View>
                  <View style={[styles.roleBadge, { backgroundColor: badge.bg }]}>
                    <Text style={[styles.roleBadgeText, { color: badge.text }]}>
                      {roleLabel(m)}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.editBtn}
                    activeOpacity={0.7}
                    onPress={() => router.push(`/settings/member/${m.id}/edit` as never)}
                  >
                    <Icon.edit size={16} color={colors.ink3} />
                  </TouchableOpacity>
                </View>
              );
            })
          )}
        </View>

        {/* Add a member dashed button */}
        <TouchableOpacity
          style={styles.addBtn}
          activeOpacity={0.7}
          onPress={() => router.push('/settings/member/new' as never)}
        >
          <Icon.plus size={18} color={colors.ink3} />
          <Text style={styles.addBtnText}>{t('add_member')}</Text>
        </TouchableOpacity>

        {/* Sync note */}
        <Text style={styles.note}>{t('members_note')}</Text>

        <View style={styles.footer} />
      </ScrollView>

      <FAB onPress={() => router.push('/settings/member/new' as never)} />
    </View>
  );
}

function StatCard({ value, label }: { value: number; label: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { flex: 1 },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: spacing[7],
    marginBottom: 18,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 14,
    alignItems: 'center',
  },
  statValue: {
    fontFamily: fontFamily.extraBold,
    fontSize: 24,
    color: colors.ink,
    letterSpacing: -0.5,
  },
  statLabel: { fontFamily: fontFamily.medium, fontSize: 12, color: colors.ink3, marginTop: 2 },
  listCard: {
    marginHorizontal: spacing[7],
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: 'hidden',
    marginBottom: 10,
  },
  listLabel: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.caption,
    color: colors.ink3,
    letterSpacing: 0.66,
    padding: 14,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.line2,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
  },
  memberRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.line2 },
  memberInfo: { flex: 1, minWidth: 0 },
  memberNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  memberName: { fontFamily: fontFamily.bold, fontSize: fontSize.body, color: colors.ink },
  youBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  youBadgeText: { fontFamily: fontFamily.bold, fontSize: 10, color: colors.white },
  memberCaption: { fontFamily: fontFamily.regular, fontSize: 12, color: colors.ink3, marginTop: 1 },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    flexShrink: 0,
  },
  roleBadgeText: { fontFamily: fontFamily.bold, fontSize: 11 },
  editBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: spacing[7],
    paddingVertical: 16,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderStyle: 'dashed',
  },
  addBtnText: { fontFamily: fontFamily.semiBold, fontSize: fontSize.body, color: colors.ink3 },
  note: {
    textAlign: 'center',
    fontFamily: fontFamily.regular,
    fontSize: 12,
    color: colors.ink4,
    lineHeight: 17,
    paddingHorizontal: spacing[7],
    marginTop: 12,
  },
  footer: { height: 100 },
});

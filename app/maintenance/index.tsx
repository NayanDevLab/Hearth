// Maintenance hub — Issues / Appliances / Vendors tabs.

import { useCallback, useState } from 'react';
import {
  Linking,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { router } from 'expo-router';

import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icons/Icon';
import { EmptyState, ErrorState } from '@/components/shared';
import { FAB, ScreenHeader } from '@/components/ui';
import { PRIORITY_MAP, STATUS_MAP, TRADE_MAP, warrantyLabel } from '@/constants/maintenance';
import {
  type Appliance,
  deleteAppliance,
  deleteIssue,
  deleteVendor,
  getAllAppliances,
  getAllIssues,
  getAllVendors,
  getMaintenanceStats,
  type MaintenanceIssue,
  type MaintenanceStats,
  type Vendor,
} from '@/db/modules/maintenance';
import { useFocusRefresh } from '@/hooks';
import { colors, fontFamily, fontSize, radius, shadows, spacing } from '@/theme';

type Tab = 'issues' | 'appliances' | 'vendors';

export default function MaintenanceScreen() {
  const { t } = useTranslation('maintenance');
  const { t: tc } = useTranslation('common');
  const insets = useSafeAreaInsets();

  const [tab, setTab] = useState<Tab>('issues');
  const [issues, setIssues] = useState<MaintenanceIssue[]>([]);
  const [appliances, setAppliances] = useState<Appliance[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [stats, setStats] = useState<MaintenanceStats>({
    open: 0,
    in_progress: 0,
    done: 0,
    appliances: 0,
    vendors: 0,
  });
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: Tab;
    id: string;
    label: string;
  } | null>(null);

  async function loadData(isRefresh = false) {
    if (isRefresh) setRefreshing(true);
    setError(null);
    try {
      const [allIssues, allAppliances, allVendors, s] = await Promise.all([
        getAllIssues(),
        getAllAppliances(),
        getAllVendors(),
        getMaintenanceStats(),
      ]);
      setIssues(allIssues);
      setAppliances(allAppliances);
      setVendors(allVendors);
      setStats(s);
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Error'));
    } finally {
      setRefreshing(false);
    }
  }

  const load = useCallback(() => loadData(false), []);
  const refresh = useCallback(() => loadData(true), []);
  useFocusRefresh(load, refresh);

  async function handleDelete() {
    if (!deleteTarget) return;
    const { type, id } = deleteTarget;
    setDeleteTarget(null);
    if (type === 'issues') await deleteIssue(id);
    else if (type === 'appliances') await deleteAppliance(id);
    else await deleteVendor(id);
    load();
  }

  function handleFAB() {
    if (tab === 'issues') router.push('/maintenance/issue/new' as never);
    else if (tab === 'appliances') router.push('/maintenance/appliance/new' as never);
    else router.push('/maintenance/vendor/new' as never);
  }

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

      {/* Stat strip */}
      <View style={styles.statsRow}>
        <StatPill label={t('stat_open')} value={stats.open} color={colors.rose} />
        <StatPill label={t('stat_progress')} value={stats.in_progress} color="#8A6220" />
        <StatPill label={t('stat_done')} value={stats.done} color={colors.mint} />
      </View>

      {/* Tab bar */}
      <View style={styles.tabBar}>
        {(['issues', 'appliances', 'vendors'] as Tab[]).map((id) => {
          const labels: Record<Tab, string> = {
            issues: t('tab_issues'),
            appliances: t('tab_appliances'),
            vendors: t('tab_vendors'),
          };
          return (
            <TouchableOpacity
              key={id}
              style={[styles.tabBtn, tab === id && styles.tabBtnActive]}
              onPress={() => setTab(id)}
              activeOpacity={0.75}
            >
              <Text style={[styles.tabLabel, tab === id && styles.tabLabelActive]}>
                {labels[id]}
              </Text>
            </TouchableOpacity>
          );
        })}
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
        {tab === 'issues' && (
          <>
            {issues.length === 0 ? (
              <EmptyState emoji="🛠" title={t('no_issues')} body={t('no_issues_body')} />
            ) : (
              <View style={styles.list}>
                {issues.map((issue) => (
                  <IssueCard
                    key={issue.id}
                    issue={issue}
                    onPress={() => router.push(`/maintenance/issue/${issue.id}` as never)}
                    onDelete={() =>
                      setDeleteTarget({ type: 'issues', id: issue.id, label: issue.title })
                    }
                  />
                ))}
              </View>
            )}
          </>
        )}

        {tab === 'appliances' && (
          <>
            {appliances.length === 0 ? (
              <EmptyState emoji="🔌" title={t('no_appliances')} body={t('no_appliances_body')} />
            ) : (
              <View style={styles.list}>
                {appliances.map((a) => (
                  <ApplianceCard
                    key={a.id}
                    appliance={a}
                    onPress={() => router.push(`/maintenance/appliance/${a.id}` as never)}
                    onDelete={() =>
                      setDeleteTarget({ type: 'appliances', id: a.id, label: a.name })
                    }
                  />
                ))}
              </View>
            )}
          </>
        )}

        {tab === 'vendors' && (
          <>
            {vendors.length === 0 ? (
              <EmptyState emoji="📞" title={t('no_vendors')} body={t('no_vendors_body')} />
            ) : (
              <View style={styles.list}>
                {vendors.map((v) => (
                  <VendorCard
                    key={v.id}
                    vendor={v}
                    onPress={() => router.push(`/maintenance/vendor/${v.id}` as never)}
                    onDelete={() => setDeleteTarget({ type: 'vendors', id: v.id, label: v.name })}
                  />
                ))}
              </View>
            )}
          </>
        )}

        <View style={styles.footer} />
      </ScrollView>

      <FAB onPress={handleFAB} />

      {/* Delete confirm */}
      <Modal
        transparent
        visible={!!deleteTarget}
        animationType="slide"
        onRequestClose={() => setDeleteTarget(null)}
      >
        <Pressable style={styles.backdrop} onPress={() => setDeleteTarget(null)} />
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
            onPress={() => setDeleteTarget(null)}
          >
            <Text style={styles.cancelLabel}>{tc('cancel')}</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

function StatPill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={styles.statPill}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function IssueCard({
  issue,
  onPress,
  onDelete,
}: {
  issue: MaintenanceIssue;
  onPress: () => void;
  onDelete: () => void;
}) {
  const priority = PRIORITY_MAP[issue.priority ?? 'medium'];
  const status = STATUS_MAP[issue.status];
  const dateStr = issue.created_at.slice(0, 10);

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={onPress}>
      <View style={[styles.priorityDot, { backgroundColor: priority.color }]} />
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {issue.title}
        </Text>
        <Text style={styles.cardMeta}>
          {dateStr}
          {issue.cost ? ` · ₹${issue.cost}` : ''}
        </Text>
      </View>
      <View style={[styles.statusBadge, { backgroundColor: status.soft }]}>
        <Text style={[styles.statusBadgeText, { color: status.color }]}>{status.label}</Text>
      </View>
      <TouchableOpacity onPress={onDelete} activeOpacity={0.7} style={styles.deleteBtn}>
        <Icon.trash size={14} color={colors.ink4} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

function ApplianceCard({
  appliance,
  onPress,
  onDelete,
}: {
  appliance: Appliance;
  onPress: () => void;
  onDelete: () => void;
}) {
  const wl = warrantyLabel(appliance.warranty_until);
  let warrantyColor: string = colors.ink3;
  if (wl.status === 'active') warrantyColor = colors.mint;
  if (wl.status === 'expired') warrantyColor = colors.rose;

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={onPress}>
      <View style={styles.applianceIcon}>
        <Text style={styles.applianceEmoji}>🔌</Text>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {appliance.name}
        </Text>
        <Text style={styles.cardMeta} numberOfLines={1}>
          {appliance.brand ?? '—'}
          {appliance.price ? ` · ₹${appliance.price.toLocaleString('en-IN')}` : ''}
        </Text>
      </View>
      <Text style={[styles.warrantyText, { color: warrantyColor }]} numberOfLines={1}>
        {wl.text}
      </Text>
      <TouchableOpacity onPress={onDelete} activeOpacity={0.7} style={styles.deleteBtn}>
        <Icon.trash size={14} color={colors.ink4} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

function VendorCard({
  vendor,
  onPress,
  onDelete,
}: {
  vendor: Vendor;
  onPress: () => void;
  onDelete: () => void;
}) {
  const trade = vendor.trade ? TRADE_MAP[vendor.trade] : null;
  const stars = vendor.rating ? '★'.repeat(vendor.rating) + '☆'.repeat(5 - vendor.rating) : null;

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={onPress}>
      <View style={styles.tradeIcon}>
        <Text style={styles.tradeEmoji}>{trade?.emoji ?? '🛠'}</Text>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {vendor.name}
        </Text>
        <Text style={styles.cardMeta} numberOfLines={1}>
          {trade?.label ?? '—'}
          {vendor.phone ? ` · ${vendor.phone}` : ''}
        </Text>
      </View>
      {stars ? <Text style={styles.stars}>{stars}</Text> : null}
      {vendor.phone ? (
        <TouchableOpacity
          onPress={() => Linking.openURL(`tel:${vendor.phone}`)}
          activeOpacity={0.7}
          style={styles.callBtn}
        >
          <Icon.bell size={14} color={colors.primary} />
        </TouchableOpacity>
      ) : null}
      <TouchableOpacity onPress={onDelete} activeOpacity={0.7} style={styles.deleteBtn}>
        <Icon.trash size={14} color={colors.ink4} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: spacing[7],
    marginBottom: 12,
    gap: 8,
  },
  statPill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
  },
  statValue: { fontFamily: fontFamily.extraBold, fontSize: 20 },
  statLabel: { fontFamily: fontFamily.semiBold, fontSize: 10, color: colors.ink3, marginTop: 1 },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: spacing[7],
    marginBottom: 14,
    backgroundColor: colors.surface2,
    borderRadius: radius.md,
    padding: 3,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: radius.sm,
    alignItems: 'center',
  },
  tabBtnActive: { backgroundColor: colors.white, ...shadows.sh1 },
  tabLabel: { fontFamily: fontFamily.semiBold, fontSize: 12, color: colors.ink3 },
  tabLabelActive: { color: colors.ink, fontFamily: fontFamily.bold },
  scroll: { flex: 1 },
  list: { paddingHorizontal: spacing[7], gap: 8 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
  },
  priorityDot: { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
  cardBody: { flex: 1, minWidth: 0 },
  cardTitle: { fontFamily: fontFamily.bold, fontSize: fontSize.body, color: colors.ink },
  cardMeta: { fontFamily: fontFamily.regular, fontSize: 12, color: colors.ink3, marginTop: 1 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  statusBadgeText: { fontFamily: fontFamily.bold, fontSize: 10 },
  deleteBtn: { padding: 6 },
  applianceIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  applianceEmoji: { fontSize: 18 },
  warrantyText: { fontFamily: fontFamily.bold, fontSize: 11, flexShrink: 0, maxWidth: 90 },
  tradeIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  tradeEmoji: { fontSize: 18 },
  stars: { fontFamily: fontFamily.regular, fontSize: 11, color: '#F5A623', flexShrink: 0 },
  callBtn: { padding: 6 },
  footer: { height: 80 },
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

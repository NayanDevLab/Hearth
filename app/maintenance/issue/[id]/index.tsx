// Issue detail — status, priority, vendor, cost, notes, mark done.

import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { router, useLocalSearchParams } from 'expo-router';

import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icons/Icon';
import { ErrorState } from '@/components/shared';
import { ScreenHeader } from '@/components/ui';
import { PRIORITY_MAP, STATUS_MAP } from '@/constants/maintenance';
import {
  getIssueById,
  getVendorById,
  type MaintenanceIssue,
  updateIssue,
  type Vendor,
} from '@/db/modules/maintenance';
import { useFocusRefresh } from '@/hooks';
import { colors, fontFamily, fontSize, radius, spacing } from '@/theme';

export default function IssueDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation('maintenance');
  const { t: tc } = useTranslation('common');
  const insets = useSafeAreaInsets();

  const [issue, setIssue] = useState<MaintenanceIssue | null>(null);
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const iss = await getIssueById(id);
      setIssue(iss);
      if (iss?.vendor_id) {
        const v = await getVendorById(iss.vendor_id);
        setVendor(v);
      } else {
        setVendor(null);
      }
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Error'));
    }
  }, [id]);

  useFocusRefresh(load, load);

  async function handleToggleDone() {
    if (!issue || !id) return;
    const newStatus = issue.status === 'done' ? 'open' : 'done';
    const resolvedAt = newStatus === 'done' ? new Date().toISOString().slice(0, 10) : null;
    await updateIssue(id, { status: newStatus, resolved_at: resolvedAt });
    load();
  }

  if (error) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ScreenHeader title={t('detail_title')} onBack={() => router.back()} />
        <ErrorState title={t('error_title')} retryLabel={t('error_retry')} onRetry={load} />
      </View>
    );
  }

  if (!issue) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ScreenHeader title={t('detail_title')} onBack={() => router.back()} />
      </View>
    );
  }

  const priority = PRIORITY_MAP[issue.priority ?? 'medium'];
  const status = STATUS_MAP[issue.status];
  const isDone = issue.status === 'done';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader
        title=""
        onBack={() => router.back()}
        right={
          <TouchableOpacity
            style={styles.editBtn}
            activeOpacity={0.7}
            onPress={() => router.push(`/maintenance/issue/${id}/edit` as never)}
          >
            <Icon.edit size={18} color={colors.ink} />
          </TouchableOpacity>
        }
      />

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroTop}>
            <View style={[styles.priorityBubble, { backgroundColor: priority.soft }]}>
              <Icon.tools size={22} color={priority.color} />
            </View>
            <View style={styles.heroMeta}>
              <View style={styles.badges}>
                <View style={[styles.badge, { backgroundColor: priority.soft }]}>
                  <Text style={[styles.badgeText, { color: priority.color }]}>
                    {priority.label}
                  </Text>
                </View>
                <View style={[styles.badge, { backgroundColor: status.soft }]}>
                  <Text style={[styles.badgeText, { color: status.color }]}>{status.label}</Text>
                </View>
              </View>
              <Text style={styles.heroTitle}>{issue.title}</Text>
            </View>
          </View>

          {issue.cost ? (
            <View style={styles.costRow}>
              <Icon.wallet size={16} color={colors.ink3} />
              <Text style={styles.costText}>₹{issue.cost.toLocaleString('en-IN')}</Text>
            </View>
          ) : null}
        </View>

        {/* Meta card */}
        <View style={styles.metaCard}>
          <MetaRow icon="calendar" label={t('created_on')} value={issue.created_at.slice(0, 10)} />
          {vendor ? <MetaRow icon="users" label={t('vendor_label')} value={vendor.name} /> : null}
          {issue.resolved_at ? (
            <MetaRow icon="check" label={t('resolved_on')} value={issue.resolved_at} />
          ) : null}
        </View>

        {/* Notes */}
        {issue.notes ? (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>{t('notes_label')}</Text>
            <View style={styles.notesCard}>
              <Text style={styles.notesText}>{issue.notes}</Text>
            </View>
          </View>
        ) : null}

        <View style={styles.footer} />
      </ScrollView>

      {/* Bottom bar */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        <TouchableOpacity
          style={styles.editBarBtn}
          activeOpacity={0.8}
          onPress={() => router.push(`/maintenance/issue/${id}/edit` as never)}
        >
          <Icon.edit size={18} color={colors.ink} />
          <Text style={styles.editBarLabel}>{tc('edit')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.doneBarBtn, isDone && styles.doneBarBtnUndo]}
          activeOpacity={0.85}
          onPress={handleToggleDone}
        >
          <Icon.check size={18} color={colors.white} stroke={2.5} />
          <Text style={styles.doneBarLabel}>{isDone ? t('mark_open') : t('mark_done')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function MetaRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  const iconMap: Record<string, React.ReactNode> = {
    calendar: <Icon.calendar size={16} color={colors.ink3} />,
    users: <Icon.users size={16} color={colors.ink3} />,
    check: <Icon.check size={16} color={colors.ink3} />,
  };
  return (
    <View style={styles.metaRow}>
      {iconMap[icon] ?? null}
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  editBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: { flex: 1 },
  hero: { paddingHorizontal: spacing[7], marginBottom: 14 },
  heroTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, marginBottom: 12 },
  priorityBubble: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  heroMeta: { flex: 1, paddingTop: 2 },
  badges: { flexDirection: 'row', gap: 6, marginBottom: 6, flexWrap: 'wrap' },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  badgeText: { fontFamily: fontFamily.bold, fontSize: 10 },
  heroTitle: {
    fontFamily: fontFamily.extraBold,
    fontSize: 22,
    color: colors.ink,
    letterSpacing: -0.5,
  },
  costRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: colors.surface2,
    borderRadius: radius.md,
    alignSelf: 'flex-start',
  },
  costText: { fontFamily: fontFamily.bold, fontSize: 16, color: colors.ink },
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
  doneBarBtn: {
    flex: 1.6,
    height: 52,
    borderRadius: radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    backgroundColor: colors.mint,
  },
  doneBarBtnUndo: { backgroundColor: colors.surface2 },
  doneBarLabel: { fontFamily: fontFamily.bold, fontSize: fontSize.cardTitle, color: colors.white },
});

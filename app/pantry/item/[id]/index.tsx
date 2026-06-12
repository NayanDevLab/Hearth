// Pantry item detail — hero card, qty stepper, meta rows, edit/delete.

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
import { ScreenHeader } from '@/components/ui';
import { expiryLabel, getItemStatus, type ItemStatus, LOCATION_MAP } from '@/constants/pantry';
import { deleteItem, getItemById, type PantryItem, updateQty } from '@/db/modules/pantry';
import { useFocusRefresh } from '@/hooks';
import { colors, fontFamily, fontSize, radius, shadows, spacing } from '@/theme';

const TODAY = new Date().toISOString().slice(0, 10);

const STATUS_STYLE: Record<ItemStatus, { bg: string; color: string }> = {
  ok: { bg: colors.mintSoft, color: colors.mint },
  low: { bg: colors.butterSoft, color: '#8A6220' },
  out: { bg: colors.roseSoft, color: colors.rose },
  expiring: { bg: colors.butterSoft, color: '#8A6220' },
  expired: { bg: colors.roseSoft, color: colors.rose },
};

function formatQty(qty: number): string {
  return Number.isInteger(qty) ? String(qty) : qty.toFixed(2);
}

export default function PantryItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation('pantry');
  const insets = useSafeAreaInsets();

  const [item, setItem] = useState<PantryItem | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [showDelete, setShowDelete] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      setItem(await getItemById(id));
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Error'));
    }
  }, [id]);

  useFocusRefresh(load, load);

  async function handleQtyChange(delta: number) {
    if (!item) return;
    const next = Math.max(0, item.qty + delta);
    setItem({ ...item, qty: next });
    await updateQty(item.id, next);
  }

  async function handleDelete(removeForever: boolean) {
    if (!item) return;
    setShowDelete(false);
    if (removeForever) {
      await deleteItem(item.id);
      router.back();
    } else {
      await updateQty(item.id, 0);
      load();
    }
  }

  if (error) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ScreenHeader title="" onBack={() => router.back()} />
        <ErrorState title={t('error_title')} retryLabel={t('error_retry')} onRetry={load} />
      </View>
    );
  }

  if (!item) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ScreenHeader title="" onBack={() => router.back()} />
      </View>
    );
  }

  const status = getItemStatus(
    item.qty,
    item.low_threshold,
    item.expiry_date,
    item.warn_days,
    TODAY
  );
  const statusStyle = STATUS_STYLE[status];
  const location = LOCATION_MAP[item.location_id];

  let badgeText: string | null = null;
  if (status === 'expiring' || status === 'expired') {
    badgeText = item.expiry_date ? expiryLabel(item.expiry_date, TODAY) : null;
  } else if (status === 'low' || status === 'out') {
    badgeText = t('below_threshold', { threshold: item.low_threshold, unit: item.unit });
  } else {
    badgeText = t('in_stock');
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader
        title=""
        onBack={() => router.back()}
        right={
          <TouchableOpacity
            style={styles.editBtn}
            activeOpacity={0.7}
            onPress={() => router.push(`/pantry/item/${id}/edit` as never)}
          >
            <Icon.edit size={18} color={colors.ink} />
          </TouchableOpacity>
        }
      />

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.heroTop}>
            <View style={styles.heroIcon}>
              <Text style={styles.heroEmoji}>{item.emoji}</Text>
            </View>
            <View style={styles.heroMeta}>
              {badgeText ? (
                <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                  <Text style={[styles.statusBadgeText, { color: statusStyle.color }]}>
                    {badgeText}
                  </Text>
                </View>
              ) : null}
              <Text style={styles.heroTitle}>{item.name}</Text>
              {item.brand ? <Text style={styles.heroBrand}>{item.brand}</Text> : null}
            </View>
          </View>

          <View style={styles.stepper}>
            <TouchableOpacity
              style={styles.stepperBtn}
              activeOpacity={0.7}
              onPress={() => handleQtyChange(-1)}
            >
              <Text style={styles.stepperBtnText}>−</Text>
            </TouchableOpacity>
            <View style={styles.stepperValueBox}>
              <Text style={styles.stepperValue}>{formatQty(item.qty)}</Text>
              <Text style={styles.stepperUnit}>{item.unit}</Text>
            </View>
            <TouchableOpacity
              style={styles.stepperBtn}
              activeOpacity={0.7}
              onPress={() => handleQtyChange(1)}
            >
              <Text style={styles.stepperBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.metaCard}>
          <MetaRow
            label={t('field_location')}
            value={location ? t(`loc_${location.id}`) : item.location_id}
          />
          <MetaRow
            label={t('field_low_threshold')}
            value={`${formatQty(item.low_threshold)} ${item.unit}`}
          />
          {item.expiry_date ? (
            <MetaRow label={t('field_expires')} value={item.expiry_date.slice(0, 10)} />
          ) : null}
          <MetaRow
            label={t('warn_days_label')}
            value={t('warn_days_value', { n: item.warn_days })}
          />
          <MetaRow label={t('auto_add_label')} value={item.auto_add ? t('on') : t('off')} />
        </View>

        {item.notes ? (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>{t('notes_label')}</Text>
            <View style={styles.notesCard}>
              <Text style={styles.notesText}>{item.notes}</Text>
            </View>
          </View>
        ) : null}

        <View style={styles.footer} />
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        <TouchableOpacity
          style={styles.editBarBtn}
          activeOpacity={0.85}
          onPress={() => router.push(`/pantry/item/${id}/edit` as never)}
        >
          <Icon.edit size={18} color={colors.ink} />
          <Text style={styles.editBarLabel}>{t('edit')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteBarBtn}
          activeOpacity={0.85}
          onPress={() => setShowDelete(true)}
        >
          <Icon.trash size={18} color={colors.rose} />
        </TouchableOpacity>
      </View>

      <Modal
        transparent
        visible={showDelete}
        animationType="slide"
        onRequestClose={() => setShowDelete(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setShowDelete(false)} />
        <View style={styles.sheet}>
          <View style={styles.grabber} />
          <View style={styles.deleteIcon}>
            <Icon.trash size={24} color={colors.rose} />
          </View>
          <Text style={styles.deleteTitle}>{t('delete_title', { name: item.name })}</Text>
          <Text style={styles.deleteBody}>{t('delete_body')}</Text>
          <TouchableOpacity
            style={styles.deleteConfirmBtn}
            activeOpacity={0.85}
            onPress={() => handleDelete(true)}
          >
            <Text style={styles.deleteConfirmLabel}>{t('remove_forever')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.setZeroBtn}
            activeOpacity={0.85}
            onPress={() => handleDelete(false)}
          >
            <Text style={styles.setZeroLabel}>{t('set_zero_instead')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cancelBtn}
            activeOpacity={0.8}
            onPress={() => setShowDelete(false)}
          >
            <Text style={styles.cancelLabel}>{t('cancel')}</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metaRow}>
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
  heroTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, marginBottom: 16 },
  heroIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  heroEmoji: { fontSize: 28 },
  heroMeta: { flex: 1, paddingTop: 2 },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  statusBadgeText: { fontFamily: fontFamily.bold, fontSize: 10 },
  heroTitle: {
    fontFamily: fontFamily.extraBold,
    fontSize: 22,
    color: colors.ink,
    letterSpacing: -0.5,
  },
  heroBrand: { fontFamily: fontFamily.semiBold, fontSize: 14, color: colors.ink3, marginTop: 2 },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    paddingVertical: 16,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
  },
  stepperBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBtnText: { fontFamily: fontFamily.bold, fontSize: 24, color: colors.ink2, lineHeight: 26 },
  stepperValueBox: { alignItems: 'center', minWidth: 80 },
  stepperValue: { fontFamily: fontFamily.extraBold, fontSize: 28, color: colors.ink },
  stepperUnit: { fontFamily: fontFamily.semiBold, fontSize: 13, color: colors.ink3, marginTop: 2 },
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
  deleteBarBtn: {
    width: 52,
    height: 52,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.line,
  },
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
  setZeroBtn: {
    width: '100%',
    height: 52,
    borderRadius: radius.pill,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  setZeroLabel: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.cardTitle,
    color: colors.ink,
  },
  cancelBtn: { height: 48, width: '100%', alignItems: 'center', justifyContent: 'center' },
  cancelLabel: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.cardTitle,
    color: colors.ink3,
  },
});

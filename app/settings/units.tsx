// Units & measures screen — grouped list + inline add-unit sheet.

import React, { useCallback, useState } from 'react';
import {
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { router } from 'expo-router';

import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icons/Icon';
import { ErrorState } from '@/components/shared';
import { FAB, ScreenHeader } from '@/components/ui';
import { UNIT_GROUP_COLORS, UNIT_GROUPS } from '@/constants/settings';
import {
  deleteUnit,
  getAllUnits,
  groupUnitsByGroup,
  insertUnit,
  type Unit,
} from '@/db/modules/units';
import { useFocusRefresh } from '@/hooks';
import { colors, fontFamily, fontSize, radius, shadows, spacing } from '@/theme';

export default function UnitsScreen() {
  const { t } = useTranslation('settings');
  const insets = useSafeAreaInsets();

  const [grouped, setGrouped] = useState<Record<string, Unit[]>>({});
  const [totalCount, setTotalCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Add sheet state
  const [sheetVisible, setSheetVisible] = useState(false);
  const [unitName, setUnitName] = useState('');
  const [unitAbbr, setUnitAbbr] = useState('');
  const [unitGroup, setUnitGroup] = useState<string>(UNIT_GROUPS[0]);
  const [saving, setSaving] = useState(false);

  async function loadUnits(isRefresh = false) {
    if (isRefresh) setRefreshing(true);
    setError(null);
    try {
      const all = await getAllUnits();
      setGrouped(groupUnitsByGroup(all));
      setTotalCount(all.length);
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Error'));
    } finally {
      setRefreshing(false);
    }
  }

  const load = useCallback(() => loadUnits(false), []);
  const refresh = useCallback(() => loadUnits(true), []);
  useFocusRefresh(load, refresh);

  async function handleRemoveUnit(id: string) {
    await deleteUnit(id);
    loadUnits(false);
  }

  function openSheet() {
    setUnitName('');
    setUnitAbbr('');
    setUnitGroup(UNIT_GROUPS[0]);
    setSheetVisible(true);
  }

  async function handleAddUnit() {
    if (!unitName.trim() || !unitAbbr.trim() || saving) return;
    setSaving(true);
    try {
      await insertUnit({
        id: `unit_${Date.now()}`,
        name: unitName.trim(),
        abbr: unitAbbr.trim(),
        group_name: unitGroup,
      });
      setSheetVisible(false);
      loadUnits(false);
    } finally {
      setSaving(false);
    }
  }

  const isAddValid = unitName.trim().length > 0 && unitAbbr.trim().length > 0;

  if (error) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ScreenHeader title={t('units_screen_title')} onBack={() => router.back()} />
        <ErrorState title={t('error_title')} retryLabel={t('error_retry')} onRetry={load} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader title={t('units_screen_title')} onBack={() => router.back()} />

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
        <Text style={styles.bodyText}>{t('units_body', { total: totalCount })}</Text>

        {/* Milk example card */}
        <View style={styles.exampleCard}>
          <Text style={styles.exampleEmoji}>🥛</Text>
          <View style={styles.exampleInfo}>
            <Text style={styles.exampleName}>Milk</Text>
            <Text style={styles.exampleSub}>Quantity uses a unit ↓</Text>
          </View>
          <View style={styles.exampleBadge}>
            <Text style={styles.exampleQty}>0.5</Text>
            <View style={styles.exampleUnit}>
              <Text style={styles.exampleUnitText}>gal</Text>
            </View>
          </View>
        </View>

        {/* Groups */}
        {UNIT_GROUPS.filter((g) => grouped[g]?.length).map((group) => {
          const groupColor = UNIT_GROUP_COLORS[group];
          return (
            <View key={group} style={styles.section}>
              <Text style={styles.sectionLabel}>{group}</Text>
              <View style={styles.groupCard}>
                {grouped[group].map((u, i) => (
                  <View
                    key={u.id}
                    style={[styles.unitRow, i < grouped[group].length - 1 && styles.unitRowBorder]}
                  >
                    <View style={[styles.abbrBadge, { borderColor: groupColor }]}>
                      <Text style={[styles.abbrText, { color: groupColor }]}>{u.abbr}</Text>
                    </View>
                    <Text style={styles.unitName}>{u.name}</Text>
                    {u.is_system ? (
                      <View style={styles.builtinBadge}>
                        <Text style={styles.builtinText}>{t('unit_builtin_badge')}</Text>
                      </View>
                    ) : (
                      <>
                        <View style={styles.customBadge}>
                          <Text style={styles.customText}>{t('unit_custom_badge')}</Text>
                        </View>
                        <TouchableOpacity
                          style={styles.trashBtn}
                          activeOpacity={0.7}
                          onPress={() => handleRemoveUnit(u.id)}
                        >
                          <Icon.trash size={16} color={colors.ink4} />
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                ))}
              </View>
            </View>
          );
        })}

        <Text style={styles.footer}>{t('units_footer')}</Text>
        <View style={styles.footerSpace} />
      </ScrollView>

      <FAB onPress={openSheet} />

      {/* Add unit sheet */}
      <Modal
        transparent
        visible={sheetVisible}
        animationType="slide"
        onRequestClose={() => setSheetVisible(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setSheetVisible(false)} />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.grabber} />
          <Text style={styles.sheetTitle}>{t('add_unit_title')}</Text>

          <View style={styles.nameRow}>
            <View style={styles.nameField}>
              <Text style={styles.fieldLabel}>{t('unit_name_label')}</Text>
              <TextInput
                style={[styles.input, unitName.length > 0 && styles.inputFilled]}
                placeholder={t('unit_name_placeholder')}
                placeholderTextColor={colors.ink4}
                value={unitName}
                onChangeText={setUnitName}
                autoFocus
                autoCapitalize="none"
              />
            </View>
            <View style={styles.abbrField}>
              <Text style={styles.fieldLabel}>{t('unit_abbr_label')}</Text>
              <TextInput
                style={[styles.input, unitAbbr.length > 0 && styles.inputFilled]}
                placeholder={t('unit_abbr_placeholder')}
                placeholderTextColor={colors.ink4}
                value={unitAbbr}
                onChangeText={(v) => setUnitAbbr(v.slice(0, 6))}
                autoCapitalize="none"
                maxLength={6}
              />
            </View>
          </View>

          <Text style={styles.fieldLabel}>{t('unit_group_label')}</Text>
          <View style={styles.groupChips}>
            {UNIT_GROUPS.map((g) => {
              const active = unitGroup === g;
              return (
                <TouchableOpacity
                  key={g}
                  style={[styles.chip, active && styles.chipActive]}
                  activeOpacity={0.75}
                  onPress={() => setUnitGroup(g)}
                >
                  <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>{g}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            style={[styles.addBtn, !isAddValid && styles.addBtnDisabled]}
            activeOpacity={0.85}
            onPress={handleAddUnit}
            disabled={!isAddValid || saving}
          >
            <Icon.plus size={18} color={colors.white} />
            <Text style={styles.addBtnLabel}>
              {unitName.trim() ? `${t('add_unit')} "${unitName.trim()}"` : t('add_unit')}
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { flex: 1 },
  bodyText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.body,
    color: colors.ink3,
    lineHeight: 20,
    paddingHorizontal: spacing[7],
    marginBottom: 14,
  },
  exampleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: spacing[7],
    marginBottom: 20,
    padding: '11px 13px' as unknown as number,
    backgroundColor: colors.surface2,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.line,
    paddingVertical: 11,
    paddingHorizontal: 13,
  },
  exampleEmoji: { fontSize: 22 },
  exampleInfo: { flex: 1 },
  exampleName: { fontFamily: fontFamily.bold, fontSize: 13.5, color: colors.ink },
  exampleSub: { fontFamily: fontFamily.regular, fontSize: 11.5, color: colors.ink3 },
  exampleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  exampleQty: { fontFamily: fontFamily.extraBold, fontSize: 15, color: colors.ink },
  exampleUnit: {
    backgroundColor: colors.primarySoft,
    borderRadius: 7,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  exampleUnitText: { fontFamily: fontFamily.bold, fontSize: 11, color: colors.primary },
  section: { paddingHorizontal: spacing[7], marginBottom: 16 },
  sectionLabel: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.caption,
    color: colors.ink3,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  groupCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: 'hidden',
    padding: 4,
  },
  unitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  unitRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.line2 },
  abbrBadge: {
    width: 40,
    height: 32,
    borderRadius: 9,
    flexShrink: 0,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  abbrText: { fontFamily: fontFamily.extraBold, fontSize: 12.5 },
  unitName: { flex: 1, fontFamily: fontFamily.semiBold, fontSize: 14, color: colors.ink },
  builtinBadge: {
    backgroundColor: colors.surface2,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  builtinText: { fontFamily: fontFamily.bold, fontSize: 10.5, color: colors.ink4 },
  customBadge: {
    backgroundColor: colors.mintSoft,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  customText: { fontFamily: fontFamily.bold, fontSize: 10.5, color: colors.mint },
  trashBtn: {
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    textAlign: 'center',
    fontFamily: fontFamily.regular,
    fontSize: 11.5,
    color: colors.ink4,
    paddingHorizontal: spacing[7],
    lineHeight: 16,
  },
  footerSpace: { height: 100 },
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
    ...shadows.sh3,
  },
  grabber: {
    width: 36,
    height: 5,
    backgroundColor: colors.ink4,
    opacity: 0.4,
    borderRadius: 3,
    marginBottom: 18,
  },
  sheetTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 18,
    color: colors.ink,
    marginBottom: 16,
    letterSpacing: -0.015,
  },
  nameRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  nameField: { flex: 2 },
  abbrField: { flex: 1 },
  fieldLabel: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.caption,
    color: colors.ink3,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: radius.sm,
    paddingVertical: 13,
    paddingHorizontal: 14,
    fontFamily: fontFamily.semiBold,
    fontSize: 15,
    color: colors.ink,
    backgroundColor: colors.white,
  },
  inputFilled: { borderColor: colors.primary },
  groupChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 18 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
  },
  chipActive: { borderColor: colors.ink, backgroundColor: colors.surface2 },
  chipLabel: { fontFamily: fontFamily.semiBold, fontSize: 13, color: colors.ink2 },
  chipLabelActive: { color: colors.ink, fontFamily: fontFamily.bold },
  addBtn: {
    height: 52,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 8,
  },
  addBtnDisabled: { opacity: 0.45 },
  addBtnLabel: { fontFamily: fontFamily.bold, fontSize: fontSize.cardTitle, color: colors.white },
});

// Edit member — LB3 design. Pre-filled form + Remove from household button.

import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { router, useLocalSearchParams } from 'expo-router';

import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FormBottomBar, FormField } from '@/components/forms';
import { Icon } from '@/components/icons/Icon';
import { Avatar } from '@/components/ui';
import { MEMBER_COLORS, MEMBER_ROLES, nameToInitial } from '@/constants/settings';
import {
  deleteMember,
  getMemberById,
  type HouseholdMember,
  updateMember,
} from '@/db/modules/members';
import { colors, fontFamily, fontSize, radius, shadows, spacing } from '@/theme';

export default function EditMemberScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation('settings');
  const { t: tc } = useTranslation('common');
  const insets = useSafeAreaInsets();

  const [original, setOriginal] = useState<HouseholdMember | null>(null);
  const [loadingMember, setLoadingMember] = useState(true);
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [role, setRole] = useState<HouseholdMember['role']>('adult');
  const [color, setColor] = useState<string>(MEMBER_COLORS[0]);
  const [showInTasks, setShowInTasks] = useState(true);
  const [showInBills, setShowInBills] = useState(true);
  const [showInCalendar, setShowInCalendar] = useState(true);
  const [showInMeals, setShowInMeals] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);

  useEffect(() => {
    if (!id) return;
    getMemberById(id).then((m) => {
      if (!m) return;
      setOriginal(m);
      setName(m.name);
      setNickname(m.nickname ?? '');
      setRole(m.role);
      setColor(m.color);
      setShowInTasks(m.show_in_tasks);
      setShowInBills(m.show_in_bills);
      setShowInCalendar(m.show_in_calendar);
      setShowInMeals(m.show_in_meals);
      setLoadingMember(false);
    });
  }, [id]);

  const initial = name.trim() ? nameToInitial(name) : (original?.initial ?? 'N');
  const isValid = name.trim().length > 0;

  async function handleSave() {
    if (!isValid || saving || !id) return;
    setSaving(true);
    try {
      await updateMember(id, {
        name: name.trim(),
        nickname: nickname.trim() || undefined,
        role,
        color,
        show_in_tasks: showInTasks,
        show_in_bills: showInBills,
        show_in_calendar: showInCalendar,
        show_in_meals: showInMeals,
      });
      router.back();
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove() {
    if (!id) return;
    setDeleteVisible(false);
    await deleteMember(id);
    router.back();
  }

  if (loadingMember) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
            style={styles.backBtn}
          >
            <Icon.arrowLeft size={20} color={colors.ink} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('edit_member_title')}</Text>
          <View style={styles.backBtn} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Avatar preview */}
          <View style={styles.avatarSection}>
            <Avatar initial={initial} color={color} size={92} />
            <View style={styles.colorRow}>
              {MEMBER_COLORS.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[
                    styles.colorSwatch,
                    { backgroundColor: c },
                    color === c && styles.colorSwatchSelected,
                  ]}
                  activeOpacity={0.75}
                  onPress={() => setColor(c)}
                />
              ))}
            </View>
          </View>

          <FormField label={t('name_label')}>
            <TextInput
              style={[styles.input, name.length > 0 && styles.inputFilled]}
              placeholderTextColor={colors.ink4}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </FormField>

          <FormField label={t('nickname_label')}>
            <TextInput
              style={[styles.input, nickname.length > 0 && styles.inputFilled]}
              placeholder={t('nickname_placeholder')}
              placeholderTextColor={colors.ink4}
              value={nickname}
              onChangeText={setNickname}
              autoCapitalize="words"
            />
          </FormField>

          <FormField label={t('role_label')}>
            <View style={styles.roleRow}>
              {MEMBER_ROLES.map((r) => {
                const active = role === r.value;
                return (
                  <TouchableOpacity
                    key={r.value}
                    style={[styles.roleBtn, active && styles.roleBtnActive]}
                    activeOpacity={0.75}
                    onPress={() => setRole(r.value)}
                  >
                    <Text style={[styles.roleBtnLabel, active && styles.roleBtnLabelActive]}>
                      {r.label}
                    </Text>
                    <Text style={[styles.roleBtnSub, active && styles.roleBtnSubActive]}>
                      {r.subtitle}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </FormField>

          <FormField label={t('show_in_label')}>
            <View style={styles.toggleCard}>
              <ToggleRow label={t('show_in_tasks')} value={showInTasks} onChange={setShowInTasks} />
              <ToggleRow label={t('show_in_bills')} value={showInBills} onChange={setShowInBills} />
              <ToggleRow
                label={t('show_in_calendar')}
                value={showInCalendar}
                onChange={setShowInCalendar}
              />
              <ToggleRow
                label={t('show_in_meals')}
                value={showInMeals}
                onChange={setShowInMeals}
                isLast
              />
            </View>
          </FormField>

          {/* Remove button */}
          <TouchableOpacity
            style={styles.removeBtn}
            activeOpacity={0.8}
            onPress={() => setDeleteVisible(true)}
          >
            <Icon.trash size={18} color={colors.rose} />
            <Text style={styles.removeBtnLabel}>{t('remove_member')}</Text>
          </TouchableOpacity>
        </ScrollView>

        <FormBottomBar
          onCancel={() => router.back()}
          onSubmit={handleSave}
          submitLabel={tc('save')}
          cancelLabel={tc('cancel')}
          loading={saving}
          disabled={!isValid}
        />
      </View>

      {/* Remove confirm sheet */}
      <Modal
        transparent
        visible={deleteVisible}
        animationType="slide"
        onRequestClose={() => setDeleteVisible(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setDeleteVisible(false)} />
        <View style={styles.sheet}>
          <View style={styles.grabber} />
          <View style={styles.sheetIcon}>
            <Icon.trash size={24} color={colors.rose} />
          </View>
          <Text style={styles.sheetTitle}>{t('remove_member_title')}</Text>
          <Text style={styles.sheetBody}>
            {t('remove_member_body', { name: original?.name ?? '' })}
          </Text>
          <View style={styles.sheetActions}>
            <TouchableOpacity
              style={styles.removeConfirmBtn}
              activeOpacity={0.85}
              onPress={handleRemove}
            >
              <Text style={styles.removeConfirmLabel}>{t('remove_confirm')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelBtn}
              activeOpacity={0.8}
              onPress={() => setDeleteVisible(false)}
            >
              <Text style={styles.cancelLabel}>{tc('cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

function ToggleRow({
  label,
  value,
  onChange,
  isLast,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  isLast?: boolean;
}) {
  return (
    <View style={[styles.toggleRow, !isLast && styles.toggleRowBorder]}>
      <Text style={styles.toggleLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: colors.line, true: colors.primary }}
        thumbColor={colors.white}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[5],
    paddingBottom: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: fontFamily.bold,
    fontSize: 19,
    color: colors.ink,
  },
  scroll: { flex: 1 },
  content: { paddingHorizontal: spacing[7], paddingBottom: 20 },
  avatarSection: { alignItems: 'center', marginBottom: 24, gap: 16 },
  colorRow: { flexDirection: 'row', gap: 10 },
  colorSwatch: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorSwatchSelected: { borderColor: colors.ink, transform: [{ scale: 1.15 }] },
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
  roleRow: { flexDirection: 'row', gap: 8 },
  roleBtn: {
    flex: 1,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    alignItems: 'center',
    gap: 2,
  },
  roleBtnActive: { borderWidth: 1.5, borderColor: colors.ink, backgroundColor: colors.surface2 },
  roleBtnLabel: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.ink2 },
  roleBtnLabelActive: { color: colors.ink },
  roleBtnSub: { fontFamily: fontFamily.regular, fontSize: 9, color: colors.ink4 },
  roleBtnSubActive: { color: colors.ink3 },
  toggleCard: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: 'hidden',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  toggleRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.line2 },
  toggleLabel: {
    flex: 1,
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.body,
    color: colors.ink,
  },
  removeBtn: {
    height: 52,
    borderRadius: radius.pill,
    backgroundColor: colors.roseSoft,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 8,
  },
  removeBtnLabel: { fontFamily: fontFamily.bold, fontSize: fontSize.cardTitle, color: colors.rose },
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
    paddingBottom: 32,
    paddingTop: spacing[5],
    alignItems: 'center',
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
  sheetIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.roseSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  sheetTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 19,
    color: colors.ink,
    textAlign: 'center',
    marginBottom: 6,
  },
  sheetBody: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.body,
    color: colors.ink2,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  sheetActions: { width: '100%', gap: 8 },
  removeConfirmBtn: {
    height: 52,
    borderRadius: radius.pill,
    backgroundColor: colors.rose,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeConfirmLabel: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.cardTitle,
    color: colors.white,
  },
  cancelBtn: { height: 48, alignItems: 'center', justifyContent: 'center' },
  cancelLabel: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.cardTitle,
    color: colors.ink3,
  },
});

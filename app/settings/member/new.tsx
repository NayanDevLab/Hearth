// Add member — LB2 design. Color picker, name, nickname, role, visibility toggles.

import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { router } from 'expo-router';

import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FormBottomBar, FormField } from '@/components/forms';
import { Icon } from '@/components/icons/Icon';
import { Avatar } from '@/components/ui';
import { MEMBER_COLORS, MEMBER_ROLES, nameToInitial, uniqueInitial } from '@/constants/settings';
import { getAllMembers, insertMember } from '@/db/modules/members';
import { colors, fontFamily, fontSize, radius, spacing } from '@/theme';

interface MemberForm {
  name: string;
  nickname: string;
  role: 'admin' | 'adult' | 'teen' | 'kid';
  color: string;
  show_in_tasks: boolean;
  show_in_bills: boolean;
  show_in_calendar: boolean;
  show_in_meals: boolean;
}

const INITIAL_FORM: MemberForm = {
  name: '',
  nickname: '',
  role: 'adult',
  color: MEMBER_COLORS[0],
  show_in_tasks: true,
  show_in_bills: true,
  show_in_calendar: true,
  show_in_meals: true,
};

export default function NewMemberScreen() {
  const { t } = useTranslation('settings');
  const { t: tc } = useTranslation('common');
  const insets = useSafeAreaInsets();

  const [form, setForm] = useState<MemberForm>(INITIAL_FORM);
  const [saving, setSaving] = useState(false);

  function update<K extends keyof MemberForm>(key: K, val: MemberForm[K]) {
    setForm((prev) => ({ ...prev, [key]: val }));
  }

  const initial = form.name.trim() ? nameToInitial(form.name) : 'N';
  const isValid = form.name.trim().length > 0;

  async function handleAdd() {
    if (!isValid || saving) return;
    setSaving(true);
    try {
      const existing = await getAllMembers();
      const existingInitials = existing.map((m) => m.initial);
      const init = uniqueInitial(form.name, existingInitials);
      await insertMember({
        id: `member_${Date.now()}`,
        name: form.name.trim(),
        nickname: form.nickname.trim() || undefined,
        role: form.role,
        color: form.color,
        initial: init,
        show_in_tasks: form.show_in_tasks,
        show_in_bills: form.show_in_bills,
        show_in_calendar: form.show_in_calendar,
        show_in_meals: form.show_in_meals,
      });
      router.back();
    } finally {
      setSaving(false);
    }
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
          <Text style={styles.headerTitle}>{t('add_member_title')}</Text>
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
            <Avatar initial={initial} color={form.color} size={92} />
            {/* Color swatches */}
            <View style={styles.colorRow}>
              {MEMBER_COLORS.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[
                    styles.colorSwatch,
                    { backgroundColor: c },
                    form.color === c && styles.colorSwatchSelected,
                  ]}
                  activeOpacity={0.75}
                  onPress={() => update('color', c)}
                />
              ))}
            </View>
          </View>

          {/* Name */}
          <FormField label={t('name_label')}>
            <TextInput
              style={[styles.input, form.name.length > 0 && styles.inputFilled]}
              placeholder={t('name_placeholder')}
              placeholderTextColor={colors.ink4}
              value={form.name}
              onChangeText={(v) => update('name', v)}
              autoFocus
              autoCapitalize="words"
            />
          </FormField>

          {/* Nickname */}
          <FormField label={t('nickname_label')}>
            <TextInput
              style={[styles.input, form.nickname.length > 0 && styles.inputFilled]}
              placeholder={t('nickname_placeholder')}
              placeholderTextColor={colors.ink4}
              value={form.nickname}
              onChangeText={(v) => update('nickname', v)}
              autoCapitalize="words"
            />
          </FormField>

          {/* Role */}
          <FormField label={t('role_label')}>
            <View style={styles.roleRow}>
              {MEMBER_ROLES.map((r) => {
                const active = form.role === r.value;
                return (
                  <TouchableOpacity
                    key={r.value}
                    style={[styles.roleBtn, active && styles.roleBtnActive]}
                    activeOpacity={0.75}
                    onPress={() => update('role', r.value)}
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

          {/* Show in */}
          <FormField label={t('show_in_label')}>
            <View style={styles.toggleCard}>
              <ToggleRow
                label={t('show_in_tasks')}
                value={form.show_in_tasks}
                onChange={(v) => update('show_in_tasks', v)}
              />
              <ToggleRow
                label={t('show_in_bills')}
                value={form.show_in_bills}
                onChange={(v) => update('show_in_bills', v)}
              />
              <ToggleRow
                label={t('show_in_calendar')}
                value={form.show_in_calendar}
                onChange={(v) => update('show_in_calendar', v)}
              />
              <ToggleRow
                label={t('show_in_meals')}
                value={form.show_in_meals}
                onChange={(v) => update('show_in_meals', v)}
                isLast
              />
            </View>
          </FormField>
        </ScrollView>

        <FormBottomBar
          onCancel={() => router.back()}
          onSubmit={handleAdd}
          submitLabel={t('add_member')}
          cancelLabel={tc('cancel')}
          loading={saving}
          disabled={!isValid}
        />
      </View>
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
});

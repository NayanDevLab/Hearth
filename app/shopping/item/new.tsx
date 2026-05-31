// Add item form — uses shared FormBottomBar, FormField, MemberSelector, and ShoppingFormFields.

import React, { useEffect, useMemo, useState } from 'react';
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

import { router, useLocalSearchParams } from 'expo-router';

import { useTranslation } from 'react-i18next';

import { FormBottomBar, FormField } from '@/components/forms';
import { Icon } from '@/components/icons/Icon';
import { MemberSelector, ScreenHeader } from '@/components/ui';
import {
  detectCategory,
  INITIAL_SHOPPING_FORM,
  SHOPPING_CATEGORIES,
  SHOPPING_UNITS,
  type ShoppingFormFields,
} from '@/constants/shopping';
import { getAllLists, insertItem, insertList, type ShoppingList } from '@/db/modules/shopping';
import { colors, fontFamily, fontSize, radius, spacing } from '@/theme';

export default function NewItemScreen() {
  const { listId } = useLocalSearchParams<{ listId?: string }>();
  const { t } = useTranslation('shopping');
  const { t: tc } = useTranslation('common');

  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [selectedListId, setSelectedListId] = useState<string>(listId ?? '');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ShoppingFormFields>(INITIAL_SHOPPING_FORM);

  function update<K extends keyof ShoppingFormFields>(key: K, value: ShoppingFormFields[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const effectiveCategory = form.category || (form.name.trim() ? detectCategory(form.name) : '');
  const isValid = form.name.trim().length > 0 && selectedListId.length > 0;

  useEffect(() => {
    async function init() {
      let all = await getAllLists();
      if (all.length === 0) {
        await insertList({
          id: `list_${Date.now()}`,
          name: 'Shopping list',
          emoji: '🛒',
          icon_color: '#2F8A5E',
        });
        all = await getAllLists();
      }
      setLists(all);
      if (!listId) setSelectedListId(all[0]?.id ?? '');
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedList = useMemo(
    () => lists.find((l) => l.id === selectedListId),
    [lists, selectedListId]
  );

  async function handleAdd() {
    if (!isValid || saving) return;
    setSaving(true);
    try {
      await insertItem({
        id: `item_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        list_id: selectedListId,
        name: form.name.trim(),
        quantity: form.quantity,
        unit: form.unit,
        category: effectiveCategory || 'other',
        brand: form.brand.trim() || undefined,
        note: form.note.trim() || undefined,
        assignee: form.assignee ?? undefined,
        urgent: form.urgent,
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
      <View style={styles.container}>
        <ScreenHeader title={t('add_item')} onBack={() => router.back()} />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {selectedList && (
            <View style={styles.addingBanner}>
              <Icon.cart size={18} color="#2F8A5E" />
              <View style={styles.addingText}>
                <Text style={styles.addingLabel}>{t('adding_to').toUpperCase()}</Text>
                <Text style={styles.addingName}>{selectedList.name}</Text>
              </View>
              {lists.length > 1 && (
                <TouchableOpacity style={styles.changeBtn} activeOpacity={0.7}>
                  <Text style={styles.changeLbl}>{t('change')}</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          <FormField label={t('item_label')}>
            <TextInput
              style={[styles.input, form.name.length > 0 && styles.inputFilled]}
              placeholder={t('item_placeholder')}
              placeholderTextColor={colors.ink4}
              value={form.name}
              onChangeText={(v) => update('name', v)}
              autoFocus
              autoCapitalize="sentences"
            />
            {form.name.length > 2 && <Text style={styles.autoHint}>{t('auto_category_hint')}</Text>}
          </FormField>

          <FormField label={t('quantity_label')}>
            <View style={styles.qtyRow}>
              <View style={styles.stepper}>
                <TouchableOpacity
                  style={styles.stepBtn}
                  onPress={() => update('quantity', Math.max(1, form.quantity - 1))}
                  activeOpacity={0.7}
                >
                  <Text style={styles.stepBtnText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.stepValue}>{form.quantity}</Text>
                <TouchableOpacity
                  style={styles.stepBtn}
                  onPress={() => update('quantity', form.quantity + 1)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.stepBtnText}>+</Text>
                </TouchableOpacity>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.unitScroll}
              >
                <View style={styles.unitRow}>
                  {SHOPPING_UNITS.map((u) => (
                    <TouchableOpacity
                      key={u}
                      style={[styles.unitChip, form.unit === u && styles.unitChipActive]}
                      onPress={() => update('unit', u)}
                      activeOpacity={0.75}
                    >
                      <Text style={[styles.unitText, form.unit === u && styles.unitTextActive]}>
                        {u}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          </FormField>

          <FormField label={t('category_label')}>
            <View style={styles.catGrid}>
              {SHOPPING_CATEGORIES.map((cat) => {
                const active = effectiveCategory === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.catTile, { backgroundColor: active ? cat.color : cat.soft }]}
                    activeOpacity={0.75}
                    onPress={() => update('category', cat.id)}
                  >
                    <Text style={styles.catEmoji}>{cat.emoji}</Text>
                    <Text style={[styles.catLabel, { color: active ? colors.white : cat.color }]}>
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </FormField>

          <FormField label={t('picked_up_by')}>
            <MemberSelector
              selected={form.assignee}
              onChange={(v) => update('assignee', v)}
              anyoneLabel={t('anyone')}
            />
          </FormField>

          <FormField label={t('brand_label')}>
            <TextInput
              style={[styles.input, form.brand.length > 0 && styles.inputFilled]}
              placeholder={t('brand_placeholder')}
              placeholderTextColor={colors.ink4}
              value={form.brand}
              onChangeText={(v) => update('brand', v)}
            />
          </FormField>

          <FormField label={t('note_label')}>
            <TextInput
              style={[styles.noteInput, form.note.length > 0 && styles.inputFilled]}
              placeholder={t('note_placeholder')}
              placeholderTextColor={colors.ink4}
              value={form.note}
              onChangeText={(v) => update('note', v)}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </FormField>

          <View style={styles.urgentRow}>
            <View style={styles.urgentText}>
              <Text style={styles.urgentLabel}>{t('urgent_toggle')}</Text>
              <Text style={styles.urgentHint}>{t('urgent_hint')}</Text>
            </View>
            <Switch
              value={form.urgent}
              onValueChange={(v) => update('urgent', v)}
              trackColor={{ false: colors.line, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>
        </ScrollView>

        <FormBottomBar
          onCancel={() => router.back()}
          onSubmit={handleAdd}
          submitLabel={t('add_to_list')}
          cancelLabel={tc('cancel')}
          loading={saving}
          disabled={!isValid}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { flex: 1 },
  content: { paddingHorizontal: spacing[7], paddingBottom: 20 },
  addingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    backgroundColor: colors.mintSoft,
    borderRadius: radius.md,
    marginBottom: 20,
  },
  addingText: { flex: 1 },
  addingLabel: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.caption,
    color: '#2F8A5E',
    letterSpacing: 0.5,
  },
  addingName: { fontFamily: fontFamily.bold, fontSize: 15, color: '#1A6040' },
  changeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#4BBE8D',
  },
  changeLbl: { fontFamily: fontFamily.semiBold, fontSize: fontSize.meta, color: '#2F8A5E' },
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
  noteInput: {
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: radius.sm,
    padding: 14,
    minHeight: 80,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.body,
    color: colors.ink,
    backgroundColor: colors.white,
  },
  inputFilled: { borderColor: colors.primary },
  autoHint: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.meta,
    color: colors.ink3,
    marginTop: 6,
  },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  stepBtn: {
    width: 40,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface2,
  },
  stepBtnText: { fontFamily: fontFamily.bold, fontSize: 20, color: colors.ink },
  stepValue: {
    width: 44,
    textAlign: 'center',
    fontFamily: fontFamily.bold,
    fontSize: 16,
    color: colors.ink,
  },
  unitScroll: { flex: 1 },
  unitRow: { flexDirection: 'row', gap: 6 },
  unitChip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: radius.sm,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
  },
  unitChipActive: { backgroundColor: colors.ink, borderColor: colors.ink },
  unitText: { fontFamily: fontFamily.semiBold, fontSize: 13, color: colors.ink2 },
  unitTextActive: { color: colors.white },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catTile: { width: '22%', paddingVertical: 12, borderRadius: 14, alignItems: 'center', gap: 5 },
  catEmoji: { fontSize: 22 },
  catLabel: { fontFamily: fontFamily.semiBold, fontSize: 11, textAlign: 'center' },
  urgentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: 8,
  },
  urgentText: { flex: 1 },
  urgentLabel: { fontFamily: fontFamily.semiBold, fontSize: fontSize.body, color: colors.ink },
  urgentHint: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.meta,
    color: colors.ink3,
    marginTop: 2,
  },
});

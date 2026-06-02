// Edit item — uses shared FormBottomBar, FormField, MemberSelector, and ShoppingFormFields.

import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
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
import { ItemDeleteSheet } from '@/components/shopping';
import { MemberSelector, ScreenHeader } from '@/components/ui';
import { INITIAL_SHOPPING_FORM, itemToForm, type ShoppingFormFields } from '@/constants/shopping';
import {
  deleteItem,
  getItemById,
  getListById,
  type ShoppingItem,
  type ShoppingList,
  toggleItem,
  updateItem,
} from '@/db/modules/shopping';
import { useCategories, useUnits } from '@/hooks';
import { colors, fontFamily, fontSize, radius, spacing } from '@/theme';

export default function EditItemScreen() {
  const { itemId } = useLocalSearchParams<{ itemId: string }>();
  const { t } = useTranslation('shopping');
  const { t: tc } = useTranslation('common');

  const [original, setOriginal] = useState<ShoppingItem | null>(null);
  const [list, setList] = useState<ShoppingList | null>(null);
  const [loadingItem, setLoadingItem] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [form, setForm] = useState<ShoppingFormFields>(INITIAL_SHOPPING_FORM);

  const categories = useCategories();
  const units = useUnits();

  function update<K extends keyof ShoppingFormFields>(key: K, value: ShoppingFormFields[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  useEffect(() => {
    if (!itemId) return;
    getItemById(itemId).then(async (item) => {
      if (!item) return;
      setOriginal(item);
      setForm(itemToForm(item));
      const listData = await getListById(item.list_id);
      setList(listData);
      setLoadingItem(false);
    });
  }, [itemId]);

  const isValid = form.name.trim().length > 0;

  async function handleSave() {
    if (!isValid || saving || !itemId) return;
    setSaving(true);
    try {
      await updateItem(itemId, {
        name: form.name.trim(),
        quantity: form.quantity,
        unit: form.unit,
        category: form.category,
        assignee: form.assignee ?? undefined,
        brand: form.brand.trim() || undefined,
        note: form.note.trim() || undefined,
        urgent: form.urgent,
      });
      router.back();
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove() {
    if (!itemId) return;
    setDeleteVisible(false);
    await deleteItem(itemId);
    router.back();
  }

  async function handleMarkDone() {
    if (!itemId) return;
    setDeleteVisible(false);
    await toggleItem(itemId, true);
    router.back();
  }

  if (loadingItem) {
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
      <View style={styles.container}>
        <ScreenHeader title={t('save_changes')} onBack={() => router.back()} />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <FormField label={t('item_label')}>
            <TextInput
              style={[styles.input, form.name.length > 0 && styles.inputFilled]}
              placeholderTextColor={colors.ink4}
              value={form.name}
              onChangeText={(v) => update('name', v)}
              autoCapitalize="sentences"
            />
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
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.unitRow}>
                  {units.map((u) => (
                    <TouchableOpacity
                      key={u.id}
                      style={[styles.unitChip, form.unit === u.abbr && styles.unitChipActive]}
                      onPress={() => update('unit', u.abbr)}
                      activeOpacity={0.75}
                    >
                      <Text
                        style={[styles.unitText, form.unit === u.abbr && styles.unitTextActive]}
                      >
                        {u.abbr}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          </FormField>

          <FormField label={t('category_label')}>
            <View style={styles.catGrid}>
              {categories.map((cat) => {
                const active = form.category === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.catTile,
                      { backgroundColor: active ? cat.color : colors.surface2 },
                    ]}
                    activeOpacity={0.75}
                    onPress={() => update('category', active ? '' : cat.id)}
                  >
                    <Text style={styles.catEmoji}>{cat.emoji}</Text>
                    <Text style={[styles.catLabel, { color: active ? colors.white : cat.color }]}>
                      {cat.name}
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

          <TouchableOpacity
            style={styles.removeBtn}
            activeOpacity={0.8}
            onPress={() => setDeleteVisible(true)}
          >
            <Icon.trash size={18} color={colors.rose} />
            <Text style={styles.removeLbl}>{t('remove_from_list')}</Text>
          </TouchableOpacity>
        </ScrollView>

        <FormBottomBar
          onCancel={() => router.back()}
          onSubmit={handleSave}
          submitLabel={t('save_changes')}
          cancelLabel={tc('cancel')}
          loading={saving}
          disabled={!isValid}
        />
      </View>

      <ItemDeleteSheet
        visible={deleteVisible}
        itemName={original?.name ?? ''}
        listName={list?.name ?? ''}
        onRemove={handleRemove}
        onMarkDone={handleMarkDone}
        onCancel={() => setDeleteVisible(false)}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { flex: 1 },
  content: { paddingHorizontal: spacing[7], paddingBottom: 20 },
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
    marginBottom: 14,
  },
  urgentText: { flex: 1 },
  urgentLabel: { fontFamily: fontFamily.semiBold, fontSize: fontSize.body, color: colors.ink },
  urgentHint: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.meta,
    color: colors.ink3,
    marginTop: 2,
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
  removeLbl: { fontFamily: fontFamily.bold, fontSize: fontSize.cardTitle, color: colors.rose },
});

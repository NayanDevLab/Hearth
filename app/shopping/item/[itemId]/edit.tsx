// Edit item — same form as new.tsx but pre-filled. Adds a "Remove from list" button.

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
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icons/Icon';
import { ItemDeleteSheet } from '@/components/shopping';
import { Avatar, Button, ScreenHeader } from '@/components/ui';
import { SHOPPING_CATEGORIES, SHOPPING_UNITS, type ShoppingUnit } from '@/constants/shopping';
import { HOUSEHOLD_MEMBERS } from '@/constants/tasks';
import {
  deleteItem,
  getItemById,
  getListById,
  type ShoppingItem,
  type ShoppingList,
  toggleItem,
  updateItem,
} from '@/db/modules/shopping';
import { colors, fontFamily, fontSize, radius, spacing } from '@/theme';

export default function EditItemScreen() {
  const { itemId } = useLocalSearchParams<{ itemId: string }>();
  const { t } = useTranslation('shopping');
  const { t: tc } = useTranslation('common');
  const insets = useSafeAreaInsets();

  const [original, setOriginal] = useState<ShoppingItem | null>(null);
  const [list, setList] = useState<ShoppingList | null>(null);
  const [loadingItem, setLoadingItem] = useState(true);

  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState<ShoppingUnit>('ea');
  const [category, setCategory] = useState('');
  const [assignee, setAssignee] = useState<string | null>(null);
  const [brand, setBrand] = useState('');
  const [note, setNote] = useState('');
  const [urgent, setUrgent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);

  useEffect(() => {
    if (!itemId) return;
    getItemById(itemId).then(async (item) => {
      if (!item) return;
      setOriginal(item);
      setName(item.name);
      setQuantity(item.quantity);
      setUnit((item.unit ?? 'ea') as ShoppingUnit);
      setCategory(item.category ?? '');
      setAssignee(item.assignee ?? null);
      setBrand(item.brand ?? '');
      setNote(item.note ?? '');
      setUrgent(item.urgent);
      const listData = await getListById(item.list_id);
      setList(listData);
      setLoadingItem(false);
    });
  }, [itemId]);

  const isValid = name.trim().length > 0;

  async function handleSave() {
    if (!isValid || saving || !itemId) return;
    setSaving(true);
    try {
      await updateItem(itemId, {
        name: name.trim(),
        quantity,
        unit,
        category,
        assignee: assignee ?? undefined,
        brand: brand.trim() || undefined,
        note: note.trim() || undefined,
        urgent,
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
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ScreenHeader title={t('save_changes')} onBack={() => router.back()} />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Item name */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>{t('item_label').toUpperCase()}</Text>
            <TextInput
              style={[styles.input, name.length > 0 && styles.inputFilled]}
              placeholderTextColor={colors.ink4}
              value={name}
              onChangeText={setName}
              autoCapitalize="sentences"
            />
          </View>

          {/* Quantity stepper + unit */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>{t('quantity_label').toUpperCase()}</Text>
            <View style={styles.qtyRow}>
              <View style={styles.stepper}>
                <TouchableOpacity
                  style={styles.stepBtn}
                  onPress={() => setQuantity(Math.max(1, quantity - 1))}
                  activeOpacity={0.7}
                >
                  <Text style={styles.stepBtnText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.stepValue}>{quantity}</Text>
                <TouchableOpacity
                  style={styles.stepBtn}
                  onPress={() => setQuantity(quantity + 1)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.stepBtnText}>+</Text>
                </TouchableOpacity>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.unitRow}>
                  {SHOPPING_UNITS.map((u) => (
                    <TouchableOpacity
                      key={u}
                      style={[styles.unitChip, unit === u && styles.unitChipActive]}
                      onPress={() => setUnit(u)}
                      activeOpacity={0.75}
                    >
                      <Text style={[styles.unitText, unit === u && styles.unitTextActive]}>
                        {u}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          </View>

          {/* Category grid */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>{t('category_label').toUpperCase()}</Text>
            <View style={styles.catGrid}>
              {SHOPPING_CATEGORIES.map((cat) => {
                const active = category === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.catTile, { backgroundColor: active ? cat.color : cat.soft }]}
                    activeOpacity={0.75}
                    onPress={() => setCategory(cat.id)}
                  >
                    <Text style={styles.catEmoji}>{cat.emoji}</Text>
                    <Text style={[styles.catLabel, { color: active ? colors.white : cat.color }]}>
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Assignee */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>{t('picked_up_by').toUpperCase()}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.memberRow}>
                <TouchableOpacity
                  style={[styles.memberTile, assignee === null && styles.memberTileSelected]}
                  activeOpacity={0.75}
                  onPress={() => setAssignee(null)}
                >
                  <View style={[styles.anyAvatar, assignee === null && styles.anyAvatarSelected]}>
                    <Text style={styles.anyText}>ANY</Text>
                  </View>
                  <Text style={[styles.memberName, assignee === null && styles.memberNameSelected]}>
                    {t('anyone')}
                  </Text>
                </TouchableOpacity>
                {HOUSEHOLD_MEMBERS.map((m) => {
                  const sel = assignee === m.initial;
                  return (
                    <TouchableOpacity
                      key={m.initial}
                      style={[styles.memberTile, sel && styles.memberTileSelected]}
                      activeOpacity={0.75}
                      onPress={() => setAssignee(m.initial)}
                    >
                      <View style={styles.avatarWrap}>
                        <Avatar initial={m.initial} color={m.color} size={44} />
                        {sel && (
                          <View style={styles.checkBadge}>
                            <Icon.check size={10} color={colors.white} stroke={3} />
                          </View>
                        )}
                      </View>
                      <Text style={[styles.memberName, sel && styles.memberNameSelected]}>
                        {m.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </View>

          {/* Brand */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>{t('brand_label').toUpperCase()}</Text>
            <TextInput
              style={[styles.input, brand.length > 0 && styles.inputFilled]}
              placeholder={t('brand_placeholder')}
              placeholderTextColor={colors.ink4}
              value={brand}
              onChangeText={setBrand}
            />
          </View>

          {/* Note */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>{t('note_label').toUpperCase()}</Text>
            <TextInput
              style={[styles.noteInput, note.length > 0 && styles.inputFilled]}
              placeholder={t('note_placeholder')}
              placeholderTextColor={colors.ink4}
              value={note}
              onChangeText={setNote}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Urgent */}
          <View style={styles.urgentRow}>
            <View style={styles.urgentText}>
              <Text style={styles.urgentLabel}>{t('urgent_toggle')}</Text>
              <Text style={styles.urgentHint}>{t('urgent_hint')}</Text>
            </View>
            <Switch
              value={urgent}
              onValueChange={setUrgent}
              trackColor={{ false: colors.line, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>

          {/* Remove from list */}
          <TouchableOpacity
            style={styles.removeBtn}
            activeOpacity={0.8}
            onPress={() => setDeleteVisible(true)}
          >
            <Icon.trash size={18} color={colors.rose} />
            <Text style={styles.removeLbl}>{t('remove_from_list')}</Text>
          </TouchableOpacity>
        </ScrollView>

        <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) + 4 }]}>
          <Button
            variant="soft"
            label={tc('cancel')}
            onPress={() => router.back()}
            fullWidth={false}
            style={styles.cancelBtn}
          />
          <Button
            variant="accent"
            label={t('save_changes')}
            loading={saving}
            disabled={!isValid}
            onPress={handleSave}
            style={styles.saveBtn}
          />
        </View>
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
  fieldGroup: { marginBottom: 20 },
  fieldLabel: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.caption,
    color: colors.ink3,
    letterSpacing: 0.66,
    marginBottom: 10,
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
  memberRow: { flexDirection: 'row', gap: 10, paddingVertical: 4 },
  memberTile: {
    alignItems: 'center',
    gap: 6,
    minWidth: 60,
    borderRadius: 14,
    paddingHorizontal: 6,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.transparent,
  },
  memberTileSelected: { backgroundColor: colors.surface2, borderColor: colors.line },
  anyAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: colors.ink4,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  anyAvatarSelected: {
    borderColor: colors.primary,
    borderStyle: 'solid',
    backgroundColor: colors.primarySoft,
  },
  anyText: { fontFamily: fontFamily.bold, fontSize: 10, color: colors.ink3 },
  avatarWrap: { position: 'relative' },
  checkBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.mint,
    borderWidth: 2,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberName: { fontFamily: fontFamily.semiBold, fontSize: 11, color: colors.ink3 },
  memberNameSelected: { color: colors.ink },
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
  bottomBar: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: spacing[7],
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    backgroundColor: colors.white,
  },
  cancelBtn: { flex: 1, height: 52 },
  saveBtn: { flex: 1.6 },
});

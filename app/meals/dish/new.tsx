// New dish — emoji, name, meal type, prep time, ingredients editor, notes.

import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
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

import { FormBottomBar, FormField, PickerRow, SimplePickerSheet } from '@/components/forms';
import { Icon } from '@/components/icons/Icon';
import { ScreenHeader } from '@/components/ui';
import { DISH_EMOJIS, PREP_MINUTES_OPTIONS } from '@/constants/meals';
import { insertDish } from '@/db/modules/meals';
import { colors, fontFamily, fontSize, radius, spacing } from '@/theme';

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'];

interface IngredientRow {
  name: string;
  qty: string;
  unit: string;
}

export default function NewDishScreen() {
  const { t } = useTranslation('meals');
  const insets = useSafeAreaInsets();

  const [emoji, setEmoji] = useState(DISH_EMOJIS[0]);
  const [name, setName] = useState('');
  const [mealType, setMealType] = useState('dinner');
  const [prepMinutes, setPrepMinutes] = useState<number | null>(null);
  const [showPrepPicker, setShowPrepPicker] = useState(false);
  const [ingredients, setIngredients] = useState<IngredientRow[]>([]);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const isValid = name.trim().length > 0;

  function updateIngredient(index: number, patch: Partial<IngredientRow>) {
    setIngredients((rows) => rows.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  }

  async function handleCreate() {
    if (!isValid || saving) return;
    setSaving(true);
    try {
      await insertDish({
        name: name.trim(),
        emoji,
        meal_type: mealType,
        prep_minutes: prepMinutes ?? undefined,
        notes: notes.trim() || undefined,
        ingredients: ingredients
          .filter((r) => r.name.trim())
          .map((r) => ({
            name: r.name.trim(),
            qty: parseFloat(r.qty) || 1,
            unit: r.unit.trim() || 'ea',
          })),
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
        <ScreenHeader title={t('new_dish_title')} onBack={() => router.back()} />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <FormField label={t('name_label')}>
            <TextInput
              style={[styles.titleInput, name.length > 0 && styles.inputFilled]}
              placeholder={t('name_placeholder')}
              placeholderTextColor={colors.ink4}
              value={name}
              onChangeText={setName}
              autoFocus
              autoCapitalize="sentences"
            />
          </FormField>

          <FormField label="Emoji">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.emojiRow}>
                {DISH_EMOJIS.map((e) => (
                  <TouchableOpacity
                    key={e}
                    style={[styles.emojiChip, emoji === e && styles.emojiChipActive]}
                    activeOpacity={0.7}
                    onPress={() => setEmoji(e)}
                  >
                    <Text style={styles.emojiText}>{e}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </FormField>

          <FormField label={t('type_label')}>
            <View style={styles.chips}>
              {MEAL_TYPES.map((type) => {
                const active = mealType === type;
                return (
                  <TouchableOpacity
                    key={type}
                    style={[styles.typeChip, active && styles.typeChipActive]}
                    activeOpacity={0.75}
                    onPress={() => setMealType(type)}
                  >
                    <Text style={[styles.typeChipText, active && styles.typeChipTextActive]}>
                      {t(`type_${type}`)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </FormField>

          <FormField label={t('prep_label')}>
            <PickerRow
              icon={<Icon.clock size={18} color={colors.ink3} />}
              label={t('prep_label')}
              value={prepMinutes ? t('n_min', { n: prepMinutes }) : t('prep_none')}
              subtle={prepMinutes === null}
              onPress={() => setShowPrepPicker(true)}
            />
          </FormField>

          <FormField label={t('ingredients_label')}>
            {ingredients.map((row, i) => (
              <View key={i} style={styles.ingredientRow}>
                <TextInput
                  style={styles.ingredientName}
                  placeholder={t('ingredient_placeholder')}
                  placeholderTextColor={colors.ink4}
                  value={row.name}
                  onChangeText={(v) => updateIngredient(i, { name: v })}
                />
                <TextInput
                  style={styles.ingredientQty}
                  placeholder="1"
                  placeholderTextColor={colors.ink4}
                  value={row.qty}
                  onChangeText={(v) => updateIngredient(i, { qty: v })}
                  keyboardType="decimal-pad"
                />
                <TextInput
                  style={styles.ingredientUnit}
                  placeholder="ea"
                  placeholderTextColor={colors.ink4}
                  value={row.unit}
                  onChangeText={(v) => updateIngredient(i, { unit: v })}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.ingredientRemove}
                  activeOpacity={0.7}
                  onPress={() => setIngredients((rows) => rows.filter((_, j) => j !== i))}
                >
                  <Icon.close size={14} color={colors.ink3} />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity
              style={styles.addIngredientBtn}
              activeOpacity={0.75}
              onPress={() => setIngredients((rows) => [...rows, { name: '', qty: '', unit: '' }])}
            >
              <Icon.plus size={14} color={colors.primary} stroke={2.5} />
              <Text style={styles.addIngredientLabel}>{t('add_ingredient')}</Text>
            </TouchableOpacity>
          </FormField>

          <FormField label={t('notes_label')} style={styles.lastField}>
            <TextInput
              style={[styles.notesInput, notes.length > 0 && styles.inputFilled]}
              placeholder={t('notes_placeholder')}
              placeholderTextColor={colors.ink4}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </FormField>
        </ScrollView>

        <FormBottomBar
          onCancel={() => router.back()}
          onSubmit={handleCreate}
          submitLabel={t('create')}
          cancelLabel={t('cancel')}
          loading={saving}
          disabled={!isValid}
        />

        {showPrepPicker && (
          <SimplePickerSheet
            title={t('prep_label')}
            options={[
              { value: null, label: t('prep_none') },
              ...PREP_MINUTES_OPTIONS.map((n) => ({
                value: String(n),
                label: t('n_min', { n }),
              })),
            ]}
            selected={prepMinutes === null ? null : String(prepMinutes)}
            onSelect={(v) => {
              setPrepMinutes(v === null ? null : Number(v));
              setShowPrepPicker(false);
            }}
            onClose={() => setShowPrepPicker(false)}
            cancelLabel={t('cancel')}
          />
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { flex: 1 },
  content: { paddingHorizontal: spacing[7], paddingBottom: 20 },
  lastField: { marginBottom: 8 },
  titleInput: {
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: radius.sm,
    paddingVertical: 14,
    paddingHorizontal: 14,
    fontFamily: fontFamily.semiBold,
    fontSize: 16,
    color: colors.ink,
  },
  inputFilled: { borderColor: colors.primary },
  emojiRow: { flexDirection: 'row', gap: 8 },
  emojiChip: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiChipActive: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  emojiText: { fontSize: 20 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typeChip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
  },
  typeChipActive: { backgroundColor: colors.ink, borderColor: colors.ink },
  typeChipText: { fontFamily: fontFamily.semiBold, fontSize: 13, color: colors.ink2 },
  typeChipTextActive: { color: colors.white },
  ingredientRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  ingredientName: {
    flex: 1,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.sm,
    paddingVertical: 11,
    paddingHorizontal: 12,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.body,
    color: colors.ink,
  },
  ingredientQty: {
    width: 56,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.sm,
    paddingVertical: 11,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.body,
    color: colors.ink,
    textAlign: 'center',
  },
  ingredientUnit: {
    width: 56,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.sm,
    paddingVertical: 11,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.body,
    color: colors.ink,
    textAlign: 'center',
  },
  ingredientRemove: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addIngredientBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 42,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
  },
  addIngredientLabel: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.primaryInk },
  notesInput: {
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: radius.sm,
    padding: 14,
    minHeight: 90,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.body,
    color: colors.ink,
  },
});

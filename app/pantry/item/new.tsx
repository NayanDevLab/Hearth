// Add a new pantry/inventory item.

import { useState } from 'react';
import {
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

import { FormBottomBar, FormField, SimplePickerSheet } from '@/components/forms';
import { ScreenHeader } from '@/components/ui';
import { PANTRY_EMOJIS, PANTRY_LOCATIONS, PANTRY_UNITS } from '@/constants/pantry';
import { insertItem } from '@/db/modules/pantry';
import { colors, fontFamily, fontSize, radius, spacing } from '@/theme';

const WARN_DAYS_OPTIONS = [1, 2, 3, 5, 7, 10, 14, 30];

interface ItemForm {
  emoji: string;
  name: string;
  brand: string;
  location_id: string;
  qty: string;
  unit: string;
  low_threshold: string;
  expiry_date: string;
  warn_days: number;
  auto_add: boolean;
  notes: string;
}

export default function NewPantryItemScreen() {
  const { location: initLocation } = useLocalSearchParams<{ location?: string }>();
  const { t } = useTranslation('pantry');
  const { t: tc } = useTranslation('common');
  const insets = useSafeAreaInsets();

  const [form, setForm] = useState<ItemForm>({
    emoji: PANTRY_EMOJIS[0],
    name: '',
    brand: '',
    location_id: initLocation ?? PANTRY_LOCATIONS[0].id,
    qty: '1',
    unit: PANTRY_UNITS[0],
    low_threshold: '',
    expiry_date: '',
    warn_days: 3,
    auto_add: false,
    notes: '',
  });
  const [saving, setSaving] = useState(false);
  const [showLocation, setShowLocation] = useState(false);
  const [showUnit, setShowUnit] = useState(false);
  const [showWarnDays, setShowWarnDays] = useState(false);

  function update<K extends keyof ItemForm>(key: K, val: ItemForm[K]) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  const locationOptions = PANTRY_LOCATIONS.map((l) => ({ value: l.id, label: t(`loc_${l.id}`) }));
  const unitOptions = PANTRY_UNITS.map((u) => ({ value: u, label: u }));
  const warnDaysOptions = WARN_DAYS_OPTIONS.map((n) => ({
    value: String(n),
    label: t('warn_days_value', { n }),
  }));

  const selectedLocationLabel =
    locationOptions.find((o) => o.value === form.location_id)?.label ?? form.location_id;

  async function handleSave() {
    if (!form.name.trim() || saving) return;
    setSaving(true);
    try {
      await insertItem({
        name: form.name.trim(),
        brand: form.brand.trim() || undefined,
        emoji: form.emoji,
        location_id: form.location_id,
        qty: parseFloat(form.qty) || 0,
        unit: form.unit,
        low_threshold: form.low_threshold ? parseFloat(form.low_threshold) : 0,
        expiry_date: form.expiry_date.trim() || undefined,
        warn_days: form.warn_days,
        auto_add: form.auto_add ? 1 : 0,
        notes: form.notes.trim() || undefined,
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
        <ScreenHeader title={t('new_item_title')} onBack={() => router.back()} />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <FormField label="Emoji">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.emojiRow}>
                {PANTRY_EMOJIS.map((e) => (
                  <TouchableOpacity
                    key={e}
                    style={[styles.emojiCell, form.emoji === e && styles.emojiCellActive]}
                    activeOpacity={0.75}
                    onPress={() => update('emoji', e)}
                  >
                    <Text style={styles.emojiText}>{e}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </FormField>

          <FormField label={t('name_label')}>
            <TextInput
              style={[styles.input, form.name.length > 0 && styles.inputFilled]}
              placeholder={t('name_placeholder')}
              placeholderTextColor={colors.ink4}
              value={form.name}
              onChangeText={(v) => update('name', v)}
              autoCapitalize="sentences"
              autoFocus
            />
          </FormField>

          <FormField label={t('brand_label')}>
            <TextInput
              style={[styles.input, form.brand.length > 0 && styles.inputFilled]}
              placeholder={t('brand_placeholder')}
              placeholderTextColor={colors.ink4}
              value={form.brand}
              onChangeText={(v) => update('brand', v)}
              autoCapitalize="words"
            />
          </FormField>

          <FormField label={t('location_label')}>
            <TouchableOpacity
              style={styles.pickerRow}
              onPress={() => setShowLocation(true)}
              activeOpacity={0.75}
            >
              <Text style={styles.pickerValue}>{selectedLocationLabel}</Text>
              <Text style={styles.pickerChevron}>›</Text>
            </TouchableOpacity>
          </FormField>

          <View style={styles.row}>
            <FormField label={t('qty_label')} style={styles.flexField}>
              <TextInput
                style={[styles.input, form.qty.length > 0 && styles.inputFilled]}
                value={form.qty}
                onChangeText={(v) => update('qty', v)}
                keyboardType="decimal-pad"
              />
            </FormField>

            <FormField label={t('unit_label')} style={styles.flexField}>
              <TouchableOpacity
                style={styles.pickerRow}
                onPress={() => setShowUnit(true)}
                activeOpacity={0.75}
              >
                <Text style={styles.pickerValue}>{form.unit}</Text>
                <Text style={styles.pickerChevron}>›</Text>
              </TouchableOpacity>
            </FormField>
          </View>

          <FormField label={t('low_threshold_label')}>
            <TextInput
              style={[styles.input, form.low_threshold.length > 0 && styles.inputFilled]}
              placeholder="0"
              placeholderTextColor={colors.ink4}
              value={form.low_threshold}
              onChangeText={(v) => update('low_threshold', v)}
              keyboardType="decimal-pad"
            />
          </FormField>

          <FormField label={t('expiry_label')}>
            <TextInput
              style={[styles.input, form.expiry_date.length > 0 && styles.inputFilled]}
              placeholder={t('expiry_placeholder')}
              placeholderTextColor={colors.ink4}
              value={form.expiry_date}
              onChangeText={(v) => update('expiry_date', v)}
              autoCapitalize="none"
            />
          </FormField>

          <FormField label={t('warn_days_label')}>
            <TouchableOpacity
              style={styles.pickerRow}
              onPress={() => setShowWarnDays(true)}
              activeOpacity={0.75}
            >
              <Text style={styles.pickerValue}>{t('warn_days_value', { n: form.warn_days })}</Text>
              <Text style={styles.pickerChevron}>›</Text>
            </TouchableOpacity>
          </FormField>

          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>{t('auto_add_label')}</Text>
            <Switch
              value={form.auto_add}
              onValueChange={(v) => update('auto_add', v)}
              trackColor={{ false: colors.line, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>

          <FormField label={t('notes_label')}>
            <TextInput
              style={[styles.input, styles.inputMulti, form.notes.length > 0 && styles.inputFilled]}
              placeholder={t('notes_placeholder')}
              placeholderTextColor={colors.ink4}
              value={form.notes}
              onChangeText={(v) => update('notes', v)}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </FormField>
        </ScrollView>

        <FormBottomBar
          onCancel={() => router.back()}
          onSubmit={handleSave}
          submitLabel={t('add_item')}
          cancelLabel={tc('cancel')}
          loading={saving}
          disabled={!form.name.trim()}
        />
      </View>

      {showLocation && (
        <Modal transparent animationType="slide" onRequestClose={() => setShowLocation(false)}>
          <Pressable style={styles.backdrop} onPress={() => setShowLocation(false)} />
          <SimplePickerSheet
            title={t('location_label')}
            options={locationOptions}
            selected={form.location_id}
            onSelect={(v) => {
              if (v) update('location_id', v);
              setShowLocation(false);
            }}
            onClose={() => setShowLocation(false)}
            cancelLabel={tc('cancel')}
          />
        </Modal>
      )}

      {showUnit && (
        <Modal transparent animationType="slide" onRequestClose={() => setShowUnit(false)}>
          <Pressable style={styles.backdrop} onPress={() => setShowUnit(false)} />
          <SimplePickerSheet
            title={t('unit_label')}
            options={unitOptions}
            selected={form.unit}
            onSelect={(v) => {
              if (v) update('unit', v);
              setShowUnit(false);
            }}
            onClose={() => setShowUnit(false)}
            cancelLabel={tc('cancel')}
          />
        </Modal>
      )}

      {showWarnDays && (
        <Modal transparent animationType="slide" onRequestClose={() => setShowWarnDays(false)}>
          <Pressable style={styles.backdrop} onPress={() => setShowWarnDays(false)} />
          <SimplePickerSheet
            title={t('warn_days_label')}
            options={warnDaysOptions}
            selected={String(form.warn_days)}
            onSelect={(v) => {
              if (v) update('warn_days', parseInt(v, 10));
              setShowWarnDays(false);
            }}
            onClose={() => setShowWarnDays(false)}
            cancelLabel={tc('cancel')}
          />
        </Modal>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { flex: 1 },
  content: { paddingHorizontal: spacing[7], paddingBottom: 20 },
  emojiRow: { flexDirection: 'row', gap: 8 },
  emojiCell: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiCellActive: { borderWidth: 2, borderColor: colors.ink, backgroundColor: colors.surface2 },
  emojiText: { fontSize: 26 },
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
  inputMulti: { height: 88, paddingTop: 13 },
  row: { flexDirection: 'row', gap: 10 },
  flexField: { flex: 1 },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: radius.sm,
    paddingVertical: 13,
    paddingHorizontal: 14,
    backgroundColor: colors.white,
  },
  pickerValue: {
    flex: 1,
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.body,
    color: colors.ink,
  },
  pickerChevron: { fontSize: 20, color: colors.ink3 },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
    padding: 14,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: 20,
  },
  toggleLabel: {
    flex: 1,
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.body,
    color: colors.ink,
  },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(20,22,30,0.45)' },
});

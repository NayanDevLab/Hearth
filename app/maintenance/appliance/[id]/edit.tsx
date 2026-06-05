// Edit appliance details.

import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { router, useLocalSearchParams } from 'expo-router';

import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FormBottomBar, FormField } from '@/components/forms';
import { ScreenHeader } from '@/components/ui';
import { getApplianceById, updateAppliance } from '@/db/modules/maintenance';
import { colors, fontFamily, radius, spacing } from '@/theme';

export default function EditApplianceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation('maintenance');
  const { t: tc } = useTranslation('common');
  const insets = useSafeAreaInsets();

  const [form, setForm] = useState({
    name: '',
    brand: '',
    purchase_date: '',
    warranty_until: '',
    price: '',
    serial_no: '',
    notes: '',
  });
  function update<K extends keyof typeof form>(key: K, val: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    void getApplianceById(id).then((a) => {
      if (!a) return;
      setForm({
        name: a.name,
        brand: a.brand ?? '',
        purchase_date: a.purchase_date ?? '',
        warranty_until: a.warranty_until ?? '',
        price: a.price != null ? String(a.price) : '',
        serial_no: a.serial_no ?? '',
        notes: a.notes ?? '',
      });
    });
  }, [id]);

  async function handleSave() {
    if (!form.name.trim() || saving || !id) return;
    setSaving(true);
    try {
      await updateAppliance(id, {
        name: form.name.trim(),
        brand: form.brand.trim() || null,
        purchase_date: form.purchase_date.trim() || null,
        warranty_until: form.warranty_until.trim() || null,
        price: form.price ? parseFloat(form.price) : null,
        serial_no: form.serial_no.trim() || null,
        notes: form.notes.trim() || null,
      });
      router.back();
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader title={t('edit_appliance_title')} onBack={() => router.back()} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <FormField label={t('appliance_name_label')}>
          <TextInput
            style={[styles.input, form.name.length > 0 && styles.inputFilled]}
            placeholder={t('appliance_name_placeholder')}
            placeholderTextColor={colors.ink4}
            value={form.name}
            onChangeText={(v) => update('name', v)}
            autoCapitalize="words"
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

        <FormField label={t('price_label')}>
          <TextInput
            style={[styles.input, form.price.length > 0 && styles.inputFilled]}
            placeholder="0"
            placeholderTextColor={colors.ink4}
            value={form.price}
            onChangeText={(v) => update('price', v)}
            keyboardType="numeric"
          />
        </FormField>

        <FormField label={t('purchase_date_label')}>
          <TextInput
            style={[styles.input, form.purchase_date.length > 0 && styles.inputFilled]}
            placeholder={t('purchase_date_placeholder')}
            placeholderTextColor={colors.ink4}
            value={form.purchase_date}
            onChangeText={(v) => update('purchase_date', v)}
          />
        </FormField>

        <FormField label={t('warranty_until_label')}>
          <TextInput
            style={[styles.input, form.warranty_until.length > 0 && styles.inputFilled]}
            placeholder={t('warranty_until_placeholder')}
            placeholderTextColor={colors.ink4}
            value={form.warranty_until}
            onChangeText={(v) => update('warranty_until', v)}
          />
        </FormField>

        <FormField label={t('serial_no_label')}>
          <TextInput
            style={[styles.input, form.serial_no.length > 0 && styles.inputFilled]}
            placeholder={t('serial_no_placeholder')}
            placeholderTextColor={colors.ink4}
            value={form.serial_no}
            onChangeText={(v) => update('serial_no', v)}
            autoCapitalize="characters"
          />
        </FormField>

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
        submitLabel={tc('save')}
        cancelLabel={tc('cancel')}
        loading={saving}
        disabled={!form.name.trim()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
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
  inputFilled: { borderColor: colors.primary },
  inputMulti: { height: 88, paddingTop: 13 },
});

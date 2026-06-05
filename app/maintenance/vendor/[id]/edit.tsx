// Edit vendor details.

import { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
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
import { VENDOR_TRADES } from '@/constants/maintenance';
import { getVendorById, updateVendor } from '@/db/modules/maintenance';
import { colors, fontFamily, fontSize, radius, spacing } from '@/theme';

const TRADE_OPTIONS = VENDOR_TRADES.map((tr) => ({
  value: tr.id,
  label: `${tr.emoji} ${tr.label}`,
}));
const RATING_OPTIONS = [1, 2, 3, 4, 5].map((n) => ({
  value: String(n),
  label: '★'.repeat(n) + '☆'.repeat(5 - n),
}));

export default function EditVendorScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation('maintenance');
  const { t: tc } = useTranslation('common');
  const insets = useSafeAreaInsets();

  const [form, setForm] = useState({
    name: '',
    trade: '',
    phone: '',
    rating: '',
    notes: '',
  });
  function update<K extends keyof typeof form>(key: K, val: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  const [showTrade, setShowTrade] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    void getVendorById(id).then((v) => {
      if (!v) return;
      setForm({
        name: v.name,
        trade: v.trade ?? '',
        phone: v.phone ?? '',
        rating: v.rating != null ? String(v.rating) : '',
        notes: v.notes ?? '',
      });
    });
  }, [id]);

  const selectedTrade = VENDOR_TRADES.find((tr) => tr.id === form.trade);
  const selectedTradeLabel = selectedTrade
    ? `${selectedTrade.emoji} ${selectedTrade.label}`
    : t('trade_other');

  async function handleSave() {
    if (!form.name.trim() || saving || !id) return;
    setSaving(true);
    try {
      await updateVendor(id, {
        name: form.name.trim(),
        trade: form.trade || null,
        phone: form.phone.trim() || null,
        rating: form.rating ? parseInt(form.rating, 10) : null,
        notes: form.notes.trim() || null,
      });
      router.back();
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader title={t('edit_vendor_title')} onBack={() => router.back()} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <FormField label={t('vendor_name_label')}>
          <TextInput
            style={[styles.input, form.name.length > 0 && styles.inputFilled]}
            placeholder={t('vendor_name_placeholder')}
            placeholderTextColor={colors.ink4}
            value={form.name}
            onChangeText={(v) => update('name', v)}
            autoCapitalize="words"
          />
        </FormField>

        <FormField label={t('trade_label')}>
          <TouchableOpacity
            style={styles.pickerRow}
            onPress={() => setShowTrade(true)}
            activeOpacity={0.75}
          >
            <Text style={styles.pickerValue}>{selectedTradeLabel}</Text>
            <Text style={styles.pickerChevron}>›</Text>
          </TouchableOpacity>
        </FormField>

        <FormField label={t('phone_label')}>
          <TextInput
            style={[styles.input, form.phone.length > 0 && styles.inputFilled]}
            placeholder={t('phone_placeholder')}
            placeholderTextColor={colors.ink4}
            value={form.phone}
            onChangeText={(v) => update('phone', v)}
            keyboardType="phone-pad"
          />
        </FormField>

        <FormField label={t('rating_label')}>
          <TouchableOpacity
            style={styles.pickerRow}
            onPress={() => setShowRating(true)}
            activeOpacity={0.75}
          >
            <Text style={styles.pickerValue}>
              {form.rating ? '★'.repeat(parseInt(form.rating, 10)) : '—'}
            </Text>
            <Text style={styles.pickerChevron}>›</Text>
          </TouchableOpacity>
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

      {showTrade && (
        <Modal transparent animationType="slide" onRequestClose={() => setShowTrade(false)}>
          <Pressable style={styles.backdrop} onPress={() => setShowTrade(false)} />
          <SimplePickerSheet
            title={t('trade_label')}
            options={TRADE_OPTIONS}
            selected={form.trade || null}
            onSelect={(v) => {
              update('trade', v ?? '');
              setShowTrade(false);
            }}
            onClose={() => setShowTrade(false)}
            cancelLabel={tc('cancel')}
          />
        </Modal>
      )}

      {showRating && (
        <Modal transparent animationType="slide" onRequestClose={() => setShowRating(false)}>
          <Pressable style={styles.backdrop} onPress={() => setShowRating(false)} />
          <SimplePickerSheet
            title={t('rating_label')}
            options={RATING_OPTIONS}
            selected={form.rating || null}
            onSelect={(v) => {
              update('rating', v ?? '');
              setShowRating(false);
            }}
            onClose={() => setShowRating(false)}
            cancelLabel={tc('cancel')}
          />
        </Modal>
      )}
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
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(20,22,30,0.45)' },
});

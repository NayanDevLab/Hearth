// Edit maintenance issue.

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
import { ISSUE_PRIORITIES, ISSUE_STATUSES } from '@/constants/maintenance';
import { getAllVendors, getIssueById, updateIssue, type Vendor } from '@/db/modules/maintenance';
import { colors, fontFamily, fontSize, radius, spacing } from '@/theme';

const STATUS_OPTIONS = ISSUE_STATUSES.map((s) => ({ value: s.id, label: s.label }));
const PRIORITY_OPTIONS = ISSUE_PRIORITIES.map((p) => ({ value: p.id, label: p.label }));

export default function EditIssueScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation('maintenance');
  const { t: tc } = useTranslation('common');
  const insets = useSafeAreaInsets();

  const [form, setForm] = useState({
    title: '',
    status: 'open',
    priority: 'medium',
    vendor_id: '',
    cost: '',
    notes: '',
  });
  function update<K extends keyof typeof form>(key: K, val: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [showStatus, setShowStatus] = useState(false);
  const [showPriority, setShowPriority] = useState(false);
  const [showVendor, setShowVendor] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    void Promise.all([getIssueById(id), getAllVendors()]).then(([iss, allVendors]) => {
      setVendors(allVendors);
      if (iss) {
        setForm({
          title: iss.title,
          status: iss.status,
          priority: iss.priority ?? 'medium',
          vendor_id: iss.vendor_id ?? '',
          cost: iss.cost != null ? String(iss.cost) : '',
          notes: iss.notes ?? '',
        });
      }
    });
  }, [id]);

  const vendorOptions = [
    { value: null, label: t('no_vendor') },
    ...vendors.map((v) => ({ value: v.id, label: v.name })),
  ];

  async function handleSave() {
    if (!form.title.trim() || saving || !id) return;
    setSaving(true);
    try {
      await updateIssue(id, {
        title: form.title.trim(),
        status: form.status as 'open' | 'in_progress' | 'done',
        priority: form.priority as 'high' | 'medium' | 'low',
        vendor_id: form.vendor_id || null,
        cost: form.cost ? parseFloat(form.cost) : null,
        notes: form.notes.trim() || null,
      });
      router.back();
    } finally {
      setSaving(false);
    }
  }

  const selectedVendorName = vendors.find((v) => v.id === form.vendor_id)?.name ?? t('no_vendor');
  const selectedStatus = ISSUE_STATUSES.find((s) => s.id === form.status)?.label ?? form.status;
  const selectedPriority =
    ISSUE_PRIORITIES.find((p) => p.id === form.priority)?.label ?? form.priority;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader title={t('edit_issue_title')} onBack={() => router.back()} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <FormField label={t('issue_title_label')}>
          <TextInput
            style={[styles.input, form.title.length > 0 && styles.inputFilled]}
            placeholder={t('issue_title_placeholder')}
            placeholderTextColor={colors.ink4}
            value={form.title}
            onChangeText={(v) => update('title', v)}
            autoCapitalize="sentences"
          />
        </FormField>

        <FormField label={t('priority_label')}>
          <TouchableOpacity
            style={styles.pickerRow}
            onPress={() => setShowPriority(true)}
            activeOpacity={0.75}
          >
            <Text style={styles.pickerValue}>{selectedPriority}</Text>
            <Text style={styles.pickerChevron}>›</Text>
          </TouchableOpacity>
        </FormField>

        <FormField label={t('status_label')}>
          <TouchableOpacity
            style={styles.pickerRow}
            onPress={() => setShowStatus(true)}
            activeOpacity={0.75}
          >
            <Text style={styles.pickerValue}>{selectedStatus}</Text>
            <Text style={styles.pickerChevron}>›</Text>
          </TouchableOpacity>
        </FormField>

        <FormField label={t('vendor_label')}>
          <TouchableOpacity
            style={styles.pickerRow}
            onPress={() => setShowVendor(true)}
            activeOpacity={0.75}
          >
            <Text style={styles.pickerValue}>{selectedVendorName}</Text>
            <Text style={styles.pickerChevron}>›</Text>
          </TouchableOpacity>
        </FormField>

        <FormField label={t('cost_label')}>
          <TextInput
            style={[styles.input, form.cost.length > 0 && styles.inputFilled]}
            placeholder={t('cost_placeholder')}
            placeholderTextColor={colors.ink4}
            value={form.cost}
            onChangeText={(v) => update('cost', v)}
            keyboardType="numeric"
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
        disabled={!form.title.trim()}
      />

      {showPriority && (
        <Modal transparent animationType="slide" onRequestClose={() => setShowPriority(false)}>
          <Pressable style={styles.backdrop} onPress={() => setShowPriority(false)} />
          <SimplePickerSheet
            title={t('priority_label')}
            options={PRIORITY_OPTIONS}
            selected={form.priority}
            onSelect={(v) => {
              update('priority', v ?? 'medium');
              setShowPriority(false);
            }}
            onClose={() => setShowPriority(false)}
            cancelLabel={tc('cancel')}
          />
        </Modal>
      )}

      {showStatus && (
        <Modal transparent animationType="slide" onRequestClose={() => setShowStatus(false)}>
          <Pressable style={styles.backdrop} onPress={() => setShowStatus(false)} />
          <SimplePickerSheet
            title={t('status_label')}
            options={STATUS_OPTIONS}
            selected={form.status}
            onSelect={(v) => {
              update('status', v ?? 'open');
              setShowStatus(false);
            }}
            onClose={() => setShowStatus(false)}
            cancelLabel={tc('cancel')}
          />
        </Modal>
      )}

      {showVendor && (
        <Modal transparent animationType="slide" onRequestClose={() => setShowVendor(false)}>
          <Pressable style={styles.backdrop} onPress={() => setShowVendor(false)} />
          <SimplePickerSheet
            title={t('vendor_label')}
            options={vendorOptions}
            selected={form.vendor_id || null}
            onSelect={(v) => {
              update('vendor_id', v ?? '');
              setShowVendor(false);
            }}
            onClose={() => setShowVendor(false)}
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

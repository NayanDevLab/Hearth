// Edit bill/expense — pre-filled form.

import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
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
import { Icon } from '@/components/icons/Icon';
import { Avatar } from '@/components/ui';
import {
  DEFAULT_CURRENCY,
  MONEY_CATEGORIES,
  RECURRENCE_OPTIONS,
  REMINDER_OPTIONS,
} from '@/constants/money';
import { type BillType, type BillWithSplits, getBillById, updateBill } from '@/db/modules/bills';
import { getAllMembers, type HouseholdMember } from '@/db/modules/members';
import { colors, fontFamily, radius, spacing } from '@/theme';

export default function EditBillScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation('money');
  const { t: tc } = useTranslation('common');
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [_original, setOriginal] = useState<BillWithSplits | null>(null);
  const [type, setType] = useState<BillType>('bill');
  const [amount, setAmount] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('other');
  const [paidBy, setPaidBy] = useState('');
  const [recurrence, setRecurrence] = useState<string | null>(null);
  const [reminder, setReminder] = useState<string | null>(null);
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [members, setMembers] = useState<HouseholdMember[]>([]);
  const [showRecurrence, setShowRecurrence] = useState(false);
  const [showReminder, setShowReminder] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([getBillById(id), getAllMembers()]).then(([bill, mems]) => {
      if (!bill) return;
      setOriginal(bill);
      setType(bill.type);
      setAmount(String(bill.amount));
      setName(bill.name);
      setCategory(bill.category ?? 'other');
      setPaidBy(bill.paid_by ?? '');
      setRecurrence(bill.recurrence ?? null);
      setReminder(bill.reminder ?? null);
      setDueDate(bill.due_date ?? '');
      setNotes(bill.notes ?? '');
      setMembers(mems);
      setLoading(false);
    });
  }, [id]);

  const numAmount = parseFloat(amount.replace(',', '.')) || 0;
  const isValid = name.trim().length > 0 && numAmount > 0;

  async function handleSave() {
    if (!isValid || saving || !id) return;
    setSaving(true);
    try {
      await updateBill(id, {
        name: name.trim(),
        amount: numAmount,
        type,
        paid_by: paidBy || null,
        category,
        due_date: dueDate || null,
        recurrence: recurrence ?? null,
        reminder: reminder ?? null,
        notes: notes.trim() || null,
      });
      router.back();
    } finally {
      setSaving(false);
    }
  }

  const recLabel =
    RECURRENCE_OPTIONS.find((r) => r.value === recurrence)?.label ?? t('recurrence_once');
  const remLabel = REMINDER_OPTIONS.find((r) => r.value === reminder)?.label ?? t('reminder_none');

  if (loading) {
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
            style={styles.backBtn}
            activeOpacity={0.7}
          >
            <Icon.arrowLeft size={20} color={colors.ink} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('edit_bill_title')}</Text>
          <View style={styles.backBtn} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Amount */}
          <FormField label={t('amount_label')}>
            <View style={styles.amountRow}>
              <Text style={styles.currencySymbol}>₹</Text>
              <TextInput
                style={styles.amountInput}
                placeholderTextColor={colors.ink4}
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
              />
              <Text style={styles.currencyCode}>{DEFAULT_CURRENCY}</Text>
            </View>
          </FormField>

          <FormField label={t('description_label')}>
            <TextInput
              style={[styles.input, name.length > 0 && styles.inputFilled]}
              placeholderTextColor={colors.ink4}
              value={name}
              onChangeText={setName}
              autoCapitalize="sentences"
            />
          </FormField>

          <FormField label={t('category_label')}>
            <View style={styles.catGrid}>
              {MONEY_CATEGORIES.map((c) => {
                const active = category === c.id;
                return (
                  <TouchableOpacity
                    key={c.id}
                    style={[
                      styles.catBtn,
                      {
                        backgroundColor: active ? c.color : c.soft,
                        borderColor: active ? c.color : 'transparent',
                      },
                    ]}
                    activeOpacity={0.75}
                    onPress={() => setCategory(c.id)}
                  >
                    <Text style={styles.catEmoji}>{c.emoji}</Text>
                    <Text
                      style={[styles.catLabel, { color: active ? colors.white : c.color }]}
                      numberOfLines={1}
                    >
                      {c.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </FormField>

          <FormField label={t('paid_by_label')}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.memberRow}>
                {members.map((m) => {
                  const sel = paidBy === m.initial;
                  return (
                    <TouchableOpacity
                      key={m.initial}
                      style={[styles.memberTile, sel && styles.memberTileSel]}
                      activeOpacity={0.75}
                      onPress={() => setPaidBy(m.initial)}
                    >
                      <View style={styles.memberAvatarWrap}>
                        <Avatar initial={m.initial} color={m.color} size={44} />
                        {sel && (
                          <View style={styles.memberCheck}>
                            <Icon.check size={10} color={colors.white} stroke={3} />
                          </View>
                        )}
                      </View>
                      <Text style={[styles.memberName, sel && styles.memberNameSel]}>
                        {m.name.split(' ')[0]}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </FormField>

          {type === 'bill' && (
            <FormField label={t('due_label')}>
              <TextInput
                style={[styles.input, dueDate.length > 0 && styles.inputFilled]}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.ink4}
                value={dueDate}
                onChangeText={setDueDate}
                keyboardType="numbers-and-punctuation"
              />
            </FormField>
          )}

          <FormField label={t('repeats_label')}>
            <TouchableOpacity
              style={styles.pickerRow}
              activeOpacity={0.8}
              onPress={() => setShowRecurrence(true)}
            >
              <Icon.sparkle size={18} color={colors.ink3} />
              <Text style={[styles.pickerValue, !recurrence && styles.pickerPlaceholder]}>
                {recLabel}
              </Text>
              <Icon.arrow size={16} color={colors.ink4} />
            </TouchableOpacity>
          </FormField>

          <FormField label={t('reminder_label')}>
            <TouchableOpacity
              style={styles.pickerRow}
              activeOpacity={0.8}
              onPress={() => setShowReminder(true)}
            >
              <Icon.bell size={18} color={colors.ink3} />
              <Text style={[styles.pickerValue, !reminder && styles.pickerPlaceholder]}>
                {remLabel}
              </Text>
              <Icon.arrow size={16} color={colors.ink4} />
            </TouchableOpacity>
          </FormField>

          <FormField label={t('note_label')}>
            <TextInput
              style={[styles.input, styles.notesInput, notes.length > 0 && styles.inputFilled]}
              placeholder={t('note_placeholder')}
              placeholderTextColor={colors.ink4}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
              autoCapitalize="sentences"
            />
          </FormField>
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

      {showRecurrence && (
        <SimplePickerSheet
          title={t('repeats_label')}
          options={RECURRENCE_OPTIONS.map((r) => ({ label: r.label, value: r.value ?? '' }))}
          selected={recurrence ?? ''}
          onSelect={(v) => {
            setRecurrence(v || null);
            setShowRecurrence(false);
          }}
          onClose={() => setShowRecurrence(false)}
        />
      )}
      {showReminder && (
        <SimplePickerSheet
          title={t('reminder_label')}
          options={REMINDER_OPTIONS.map((r) => ({ label: r.label, value: r.value ?? '' }))}
          selected={reminder ?? ''}
          onSelect={(v) => {
            setReminder(v || null);
            setShowReminder(false);
          }}
          onClose={() => setShowReminder(false)}
        />
      )}
    </KeyboardAvoidingView>
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
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 18,
  },
  currencySymbol: { fontFamily: fontFamily.extraBold, fontSize: 28, color: colors.ink3 },
  amountInput: {
    flex: 1,
    fontFamily: fontFamily.extraBold,
    fontSize: 32,
    color: colors.ink,
    letterSpacing: -0.8,
    backgroundColor: 'transparent',
    minWidth: 0,
  },
  currencyCode: { fontFamily: fontFamily.semiBold, fontSize: 14, color: colors.ink3 },
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
  notesInput: { height: 80, textAlignVertical: 'top' },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  catBtn: {
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  catEmoji: { fontSize: 13 },
  catLabel: { fontFamily: fontFamily.semiBold, fontSize: 12 },
  memberRow: { flexDirection: 'row', gap: 10 },
  memberTile: {
    alignItems: 'center',
    gap: 6,
    minWidth: 60,
    padding: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  memberTileSel: { backgroundColor: colors.surface2, borderColor: colors.line },
  memberAvatarWrap: { position: 'relative' },
  memberCheck: {
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
  memberNameSel: { color: colors.ink },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.white,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.line,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  pickerValue: { flex: 1, fontFamily: fontFamily.semiBold, fontSize: 15, color: colors.ink },
  pickerPlaceholder: { color: colors.ink4 },
});

// Add bill/expense — type toggle, amount, description, category, paid-by, split, due, repeat.

import { useEffect, useState } from 'react';
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

import { FormBottomBar, FormField, SimplePickerSheet } from '@/components/forms';
import { Icon } from '@/components/icons/Icon';
import { Avatar } from '@/components/ui';
import {
  DEFAULT_CURRENCY,
  formatAmount,
  MONEY_CATEGORIES,
  RECURRENCE_OPTIONS,
  REMINDER_OPTIONS,
} from '@/constants/money';
import { type BillType, insertBill } from '@/db/modules/bills';
import { getAllMembers, type HouseholdMember } from '@/db/modules/members';
import { colors, fontFamily, radius, spacing } from '@/theme';

interface SplitEntry {
  initial: string;
  amount: number;
  included: boolean;
}

export default function NewBillScreen() {
  const { t } = useTranslation('money');
  const { t: tc } = useTranslation('common');
  const insets = useSafeAreaInsets();

  const [type, setType] = useState<BillType>('bill');
  const [amount, setAmount] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('other');
  const [paidBy, setPaidBy] = useState('');
  const [splits, setSplits] = useState<SplitEntry[]>([]);
  const [recurrence, setRecurrence] = useState<string | null>(null);
  const [reminder, setReminder] = useState<string | null>(null);
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [members, setMembers] = useState<HouseholdMember[]>([]);
  const [showRecurrence, setShowRecurrence] = useState(false);
  const [showReminder, setShowReminder] = useState(false);

  useEffect(() => {
    getAllMembers().then((all) => {
      setMembers(all);
      const admin = all.find((m) => m.role === 'admin') ?? all[0];
      if (admin) {
        setPaidBy(admin.initial);
        setSplits(all.map((m) => ({ initial: m.initial, amount: 0, included: true })));
      }
    });
  }, []);

  const numAmount = parseFloat(amount.replace(',', '.')) || 0;
  const includedSplits = splits.filter((s) => s.included);
  const perPerson = includedSplits.length > 0 ? numAmount / includedSplits.length : 0;

  function toggleSplit(initial: string) {
    setSplits((prev) =>
      prev.map((s) => (s.initial === initial ? { ...s, included: !s.included } : s))
    );
  }

  const isValid = name.trim().length > 0 && numAmount > 0 && paidBy.length > 0;

  async function handleCreate() {
    if (!isValid || saving) return;
    setSaving(true);
    try {
      const splitData = includedSplits
        .filter((s) => s.initial !== paidBy)
        .map((s) => ({ member_initial: s.initial, amount: perPerson }));
      await insertBill({
        id: `bill_${Date.now()}`,
        name: name.trim(),
        amount: numAmount,
        type,
        paid_by: paidBy,
        category,
        due_date: dueDate || undefined,
        recurrence: recurrence ?? undefined,
        reminder: reminder ?? undefined,
        notes: notes.trim() || undefined,
        currency: DEFAULT_CURRENCY,
        splits: splitData,
      });
      router.back();
    } finally {
      setSaving(false);
    }
  }

  const recLabel =
    RECURRENCE_OPTIONS.find((r) => r.value === recurrence)?.label ?? t('recurrence_once');
  const remLabel = REMINDER_OPTIONS.find((r) => r.value === reminder)?.label ?? t('reminder_none');

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
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('add_bill')}</Text>
          <View style={styles.backBtn} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Type toggle */}
          <View style={styles.typeToggle}>
            {(['bill', 'expense'] as BillType[]).map((tp) => {
              const active = type === tp;
              return (
                <TouchableOpacity
                  key={tp}
                  style={[styles.typeBtn, active && styles.typeBtnActive]}
                  activeOpacity={0.75}
                  onPress={() => setType(tp)}
                >
                  <Text style={styles.typeIcon}>{tp === 'bill' ? '🔁' : '💸'}</Text>
                  <Text style={[styles.typeBtnLabel, active && styles.typeBtnLabelActive]}>
                    {t(`type_${tp}`)}
                  </Text>
                  <Text style={[styles.typeBtnSub, active && styles.typeBtnSubActive]}>
                    {t(`type_${tp}_sub`)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Amount */}
          <FormField label={t('amount_label')}>
            <View style={styles.amountRow}>
              <Text style={styles.currencySymbol}>₹</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="0.00"
                placeholderTextColor={colors.ink4}
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                autoFocus
              />
              <Text style={styles.currencyCode}>{DEFAULT_CURRENCY}</Text>
            </View>
          </FormField>

          {/* Description */}
          <FormField label={t('description_label')}>
            <TextInput
              style={[styles.input, name.length > 0 && styles.inputFilled]}
              placeholder={type === 'bill' ? t('bill_placeholder') : t('expense_placeholder')}
              placeholderTextColor={colors.ink4}
              value={name}
              onChangeText={setName}
              autoCapitalize="sentences"
            />
          </FormField>

          {/* Category */}
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

          {/* Paid by */}
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

          {/* Split */}
          <FormField label={t('split_label')}>
            <View style={styles.splitCard}>
              {splits.map((s, i) => {
                const member = members.find((m) => m.initial === s.initial);
                return (
                  <View
                    key={s.initial}
                    style={[styles.splitRow, i < splits.length - 1 && styles.splitRowBorder]}
                  >
                    <TouchableOpacity
                      style={[styles.splitCheck, s.included && styles.splitCheckActive]}
                      activeOpacity={0.75}
                      onPress={() => toggleSplit(s.initial)}
                    >
                      {s.included && <Icon.check size={12} color={colors.white} stroke={3} />}
                    </TouchableOpacity>
                    <Avatar initial={s.initial} color={member?.color ?? colors.ink3} size={28} />
                    <Text style={styles.splitName} numberOfLines={1}>
                      {member?.name ?? s.initial}
                      {s.initial === paidBy ? ' (payer)' : ''}
                    </Text>
                    <Text style={styles.splitAmount}>
                      {s.included && perPerson > 0 ? formatAmount(perPerson) : '—'}
                    </Text>
                  </View>
                );
              })}
            </View>
            {perPerson > 0 && (
              <Text style={styles.splitSummary}>
                {formatAmount(numAmount)} · {t('split_ways', { n: includedSplits.length })} ={' '}
                {formatAmount(perPerson)} {t('each_amount')}
              </Text>
            )}
          </FormField>

          {/* Due + Recurrence (bills only) */}
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

          {/* Notes */}
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
          onSubmit={handleCreate}
          submitLabel={type === 'bill' ? t('create_bill') : t('add_expense')}
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
  backIcon: { fontSize: 18, color: colors.ink },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: fontFamily.bold,
    fontSize: 19,
    color: colors.ink,
  },
  scroll: { flex: 1 },
  content: { paddingHorizontal: spacing[7], paddingBottom: 20 },
  typeToggle: {
    flexDirection: 'row',
    gap: 8,
    padding: 4,
    borderRadius: 14,
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: 16,
  },
  typeBtn: { flex: 1, padding: 10, borderRadius: 10, alignItems: 'center', gap: 2 },
  typeBtnActive: { backgroundColor: colors.white },
  typeIcon: { fontSize: 20 },
  typeBtnLabel: { fontFamily: fontFamily.bold, fontSize: 14, color: colors.ink2 },
  typeBtnLabelActive: { color: colors.ink },
  typeBtnSub: { fontFamily: fontFamily.regular, fontSize: 11, color: colors.ink4 },
  typeBtnSubActive: { color: colors.ink3 },
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
  currencySymbol: {
    fontFamily: fontFamily.extraBold,
    fontSize: 28,
    color: colors.ink3,
    letterSpacing: -0.5,
  },
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
    padding: '8px 6px' as unknown as number,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'transparent',
    paddingHorizontal: 6,
    paddingVertical: 8,
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
  splitCard: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: 'hidden',
  },
  splitRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12 },
  splitRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.line2 },
  splitCheck: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  splitCheckActive: { backgroundColor: colors.ink, borderColor: colors.ink },
  splitName: { flex: 1, fontFamily: fontFamily.semiBold, fontSize: 13, color: colors.ink },
  splitAmount: { fontFamily: fontFamily.bold, fontSize: 14, color: colors.ink },
  splitSummary: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    color: colors.ink3,
    textAlign: 'right',
    marginTop: 6,
  },
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

// Edit category form — pre-filled, with delete button.

import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
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

import { FormBottomBar, FormField } from '@/components/forms';
import { Icon } from '@/components/icons/Icon';
import { CATEGORY_AREAS, CATEGORY_COLORS, CATEGORY_EMOJIS } from '@/constants/settings';
import {
  type Category,
  deleteCategory,
  getCategoryById,
  updateCategory,
} from '@/db/modules/categories';
import { colors, fontFamily, fontSize, radius, shadows, spacing } from '@/theme';

export default function EditCategoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation('settings');
  const { t: tc } = useTranslation('common');
  const insets = useSafeAreaInsets();

  const [original, setOriginal] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState<string>(CATEGORY_EMOJIS[0]);
  const [selColor, setSelColor] = useState<string>(CATEGORY_COLORS[0]);
  const [selectedAreas, setSelectedAreas] = useState<Set<string>>(new Set(['tasks']));
  const [saving, setSaving] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);

  useEffect(() => {
    if (!id) return;
    getCategoryById(id).then((cat) => {
      if (!cat) return;
      setOriginal(cat);
      setName(cat.name);
      setEmoji(cat.emoji);
      setSelColor(cat.color);
      setSelectedAreas(new Set(cat.areas.split(',').map((a) => a.trim())));
      setLoading(false);
    });
  }, [id]);

  const isValid = name.trim().length > 0 && selectedAreas.size > 0;

  function toggleArea(areaId: string) {
    setSelectedAreas((prev) => {
      const next = new Set(prev);
      if (next.has(areaId)) {
        if (next.size > 1) next.delete(areaId);
      } else next.add(areaId);
      return next;
    });
  }

  async function handleSave() {
    if (!isValid || saving || !id) return;
    setSaving(true);
    try {
      await updateCategory(id, {
        name: name.trim(),
        emoji,
        color: selColor,
        areas: [...selectedAreas].join(','),
      });
      router.back();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!id) return;
    setDeleteVisible(false);
    await deleteCategory(id);
    router.back();
  }

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
          <Text style={styles.headerTitle}>{t('edit_category_title')}</Text>
          <View style={styles.backBtn} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Live preview */}
          <View style={styles.previewRow}>
            <View style={[styles.previewChip, { borderColor: selColor }]}>
              <Text style={styles.previewEmoji}>{emoji}</Text>
              <Text style={styles.previewName}>{name.trim() || t('edit_category_title')}</Text>
            </View>
          </View>

          <FormField label={t('category_name_label')}>
            <TextInput
              style={[styles.input, name.length > 0 && styles.inputFilled]}
              placeholderTextColor={colors.ink4}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </FormField>

          <FormField label={t('used_in_label')}>
            <View style={styles.chipRow}>
              {CATEGORY_AREAS.map((a) => {
                const active = selectedAreas.has(a.id);
                return (
                  <TouchableOpacity
                    key={a.id}
                    style={[styles.chip, active && styles.chipActive]}
                    activeOpacity={0.75}
                    onPress={() => toggleArea(a.id)}
                  >
                    <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>
                      {a.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </FormField>

          <FormField label={t('icon_label')}>
            <View style={styles.emojiGrid}>
              {CATEGORY_EMOJIS.map((e) => (
                <TouchableOpacity
                  key={e}
                  style={[styles.emojiCell, emoji === e && styles.emojiCellActive]}
                  activeOpacity={0.75}
                  onPress={() => setEmoji(e)}
                >
                  <Text style={styles.emojiCellText}>{e}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </FormField>

          <FormField label={t('color_label')}>
            <View style={styles.colorRow}>
              {CATEGORY_COLORS.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[
                    styles.colorSwatch,
                    { backgroundColor: c },
                    selColor === c && styles.colorSwatchSelected,
                  ]}
                  activeOpacity={0.75}
                  onPress={() => setSelColor(c)}
                />
              ))}
            </View>
          </FormField>

          {original && !original.is_system && (
            <TouchableOpacity
              style={styles.deleteBtn}
              activeOpacity={0.8}
              onPress={() => setDeleteVisible(true)}
            >
              <Icon.trash size={18} color={colors.rose} />
              <Text style={styles.deleteBtnLabel}>{t('delete_category')}</Text>
            </TouchableOpacity>
          )}
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

      <Modal
        transparent
        visible={deleteVisible}
        animationType="slide"
        onRequestClose={() => setDeleteVisible(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setDeleteVisible(false)} />
        <View style={styles.sheet}>
          <View style={styles.grabber} />
          <View style={styles.sheetIcon}>
            <Icon.trash size={24} color={colors.rose} />
          </View>
          <Text style={styles.sheetTitle}>{t('delete_category_title')}</Text>
          <Text style={styles.sheetBody}>
            {t('delete_category_body', { name: original?.name ?? '' })}
          </Text>
          <View style={styles.sheetActions}>
            <TouchableOpacity
              style={styles.deleteConfirmBtn}
              activeOpacity={0.85}
              onPress={handleDelete}
            >
              <Text style={styles.deleteConfirmLabel}>{t('delete_category_confirm')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelBtn}
              activeOpacity={0.8}
              onPress={() => setDeleteVisible(false)}
            >
              <Text style={styles.cancelLabel}>{tc('cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  previewRow: { alignItems: 'center', marginBottom: 20 },
  previewChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: 1.5,
    backgroundColor: colors.white,
  },
  previewEmoji: { fontSize: 18 },
  previewName: { fontFamily: fontFamily.bold, fontSize: 15, color: colors.ink },
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
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
  },
  chipActive: { borderColor: colors.ink, backgroundColor: colors.surface2 },
  chipLabel: { fontFamily: fontFamily.semiBold, fontSize: 13, color: colors.ink2 },
  chipLabelActive: { color: colors.ink, fontFamily: fontFamily.bold },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 12,
  },
  emojiCell: {
    width: 46,
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.line2,
  },
  emojiCellActive: { borderWidth: 1.5, borderColor: colors.ink, backgroundColor: colors.surface2 },
  emojiCellText: { fontSize: 22 },
  colorRow: { flexDirection: 'row', gap: 12 },
  colorSwatch: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2.5,
    borderColor: 'transparent',
  },
  colorSwatchSelected: { borderColor: colors.ink, transform: [{ scale: 1.1 }] },
  deleteBtn: {
    height: 52,
    borderRadius: radius.pill,
    backgroundColor: colors.roseSoft,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  deleteBtnLabel: { fontFamily: fontFamily.bold, fontSize: fontSize.cardTitle, color: colors.rose },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(20,22,30,0.45)' },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing[7],
    paddingBottom: 32,
    paddingTop: spacing[5],
    alignItems: 'center',
    ...shadows.sh3,
  },
  grabber: {
    width: 36,
    height: 5,
    backgroundColor: colors.ink4,
    opacity: 0.4,
    borderRadius: 3,
    marginBottom: 18,
  },
  sheetIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.roseSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  sheetTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 19,
    color: colors.ink,
    textAlign: 'center',
    marginBottom: 6,
  },
  sheetBody: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.body,
    color: colors.ink2,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  sheetActions: { width: '100%', gap: 8 },
  deleteConfirmBtn: {
    height: 52,
    borderRadius: radius.pill,
    backgroundColor: colors.rose,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteConfirmLabel: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.cardTitle,
    color: colors.white,
  },
  cancelBtn: { height: 48, alignItems: 'center', justifyContent: 'center' },
  cancelLabel: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.cardTitle,
    color: colors.ink3,
  },
});

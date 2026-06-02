// New category form — emoji picker, name, areas, color picker.

import React, { useState } from 'react';
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

import { router, useLocalSearchParams } from 'expo-router';

import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FormBottomBar, FormField } from '@/components/forms';
import { CATEGORY_AREAS, CATEGORY_COLORS, CATEGORY_EMOJIS } from '@/constants/settings';
import { insertCategory } from '@/db/modules/categories';
import { colors, fontFamily, radius, spacing } from '@/theme';

export default function NewCategoryScreen() {
  const { t } = useTranslation('settings');
  const { t: tc } = useTranslation('common');
  const insets = useSafeAreaInsets();
  const { area } = useLocalSearchParams<{ area?: string }>();

  const defaultArea = area ?? 'tasks';
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState<string>(CATEGORY_EMOJIS[0]);
  const [selColor, setSelColor] = useState<string>(CATEGORY_COLORS[0]);
  const [selectedAreas, setSelectedAreas] = useState<Set<string>>(new Set([defaultArea]));
  const [saving, setSaving] = useState(false);

  const isValid = name.trim().length > 0 && selectedAreas.size > 0;

  function toggleArea(id: string) {
    setSelectedAreas((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        if (next.size > 1) next.delete(id);
      } else next.add(id);
      return next;
    });
  }

  async function handleCreate() {
    if (!isValid || saving) return;
    setSaving(true);
    try {
      await insertCategory({
        id: `cat_${Date.now()}`,
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
          <Text style={styles.headerTitle}>{t('new_category_title')}</Text>
          <View style={styles.backBtn} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Live preview chip */}
          <View style={styles.previewRow}>
            <View style={[styles.previewChip, { borderColor: selColor }]}>
              <Text style={styles.previewEmoji}>{emoji}</Text>
              <Text style={styles.previewName}>{name.trim() || t('new_category_title')}</Text>
            </View>
          </View>

          <FormField label={t('category_name_label')}>
            <TextInput
              style={[styles.input, name.length > 0 && styles.inputFilled]}
              placeholder={t('category_name_placeholder')}
              placeholderTextColor={colors.ink4}
              value={name}
              onChangeText={setName}
              autoFocus
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
        </ScrollView>

        <FormBottomBar
          onCancel={() => router.back()}
          onSubmit={handleCreate}
          submitLabel={t('create_category')}
          cancelLabel={tc('cancel')}
          loading={saving}
          disabled={!isValid}
        />
      </View>
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
});

// Language settings — LB4 design. In-app language switcher.

import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { router } from 'expo-router';

import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icons/Icon';
import { i18next } from '@/i18n';
import { type AppLanguage, prefs } from '@/storage/prefs';
import { colors, fontFamily, fontSize, radius, spacing } from '@/theme';

interface LanguageOption {
  code: AppLanguage;
  label: string;
  native: string;
  flag: string;
}

const LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English', native: 'English', flag: '🇬🇧' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' },
  { code: 'gu', label: 'Gujarati', native: 'ગુજરાતી', flag: '🇮🇳' },
];

export default function LanguageScreen() {
  const { t } = useTranslation('settings');
  const insets = useSafeAreaInsets();
  const currentLang = (i18next.language ?? 'en') as AppLanguage;
  const [selected, setSelected] = useState<AppLanguage>(currentLang);
  const [applying, setApplying] = useState(false);

  const isDirty = selected !== currentLang;

  async function handleApply() {
    if (!isDirty || applying) return;
    setApplying(true);
    await i18next.changeLanguage(selected);
    await prefs.setLanguage(selected);
    setApplying(false);
    router.back();
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} style={styles.backBtn}>
          <Icon.arrowLeft size={20} color={colors.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('language_title')}</Text>
        <View style={styles.backBtn} />
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionLabel}>{t('language_current')}</Text>
        <View style={styles.optionList}>
          {LANGUAGES.map((lang, idx) => {
            const active = selected === lang.code;
            const isLast = idx === LANGUAGES.length - 1;
            return (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.optionRow,
                  !isLast && styles.optionRowBorder,
                  active && styles.optionRowActive,
                ]}
                activeOpacity={0.75}
                onPress={() => setSelected(lang.code)}
              >
                <Text style={styles.flag}>{lang.flag}</Text>
                <View style={styles.optionText}>
                  <Text style={[styles.optionLabel, active && styles.optionLabelActive]}>
                    {lang.native}
                  </Text>
                  {lang.code !== 'en' && <Text style={styles.optionSub}>{lang.label}</Text>}
                </View>
                {active && <Icon.check size={18} color={colors.primary} />}
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.noteText}>{t('language_note')}</Text>
      </View>

      {/* Apply button */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <TouchableOpacity
          style={[styles.applyBtn, (!isDirty || applying) && styles.applyBtnDisabled]}
          activeOpacity={0.85}
          onPress={handleApply}
          disabled={!isDirty || applying}
        >
          <Text style={[styles.applyLabel, (!isDirty || applying) && styles.applyLabelDisabled]}>
            {t('apply_language')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
  content: { flex: 1, paddingHorizontal: spacing[7], paddingTop: 8 },
  sectionLabel: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.caption,
    color: colors.ink3,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  optionList: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: 'hidden',
    marginBottom: 16,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 14,
    backgroundColor: colors.white,
  },
  optionRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.line2 },
  optionRowActive: { backgroundColor: colors.surface },
  flag: { fontSize: 24 },
  optionText: { flex: 1 },
  optionLabel: { fontFamily: fontFamily.semiBold, fontSize: fontSize.body, color: colors.ink },
  optionLabelActive: { color: colors.primary, fontFamily: fontFamily.bold },
  optionSub: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.caption,
    color: colors.ink3,
    marginTop: 1,
  },
  noteText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.caption,
    color: colors.ink3,
    lineHeight: 18,
    paddingHorizontal: 2,
  },
  footer: { paddingHorizontal: spacing[7], paddingTop: 12 },
  applyBtn: {
    height: 54,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyBtnDisabled: { backgroundColor: colors.line },
  applyLabel: { fontFamily: fontFamily.bold, fontSize: fontSize.cardTitle, color: colors.white },
  applyLabelDisabled: { color: colors.ink4 },
});

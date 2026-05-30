// Language picker — first-launch pre-onboarding screen.
// Saves selected language to prefs and initialises i18next before proceeding.

import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icons/Icon';
import { Logo } from '@/components/illustrations';
import { initI18n, LANGUAGE_META, SUPPORTED_LANGUAGES } from '@/i18n';
import { type AppLanguage, prefs } from '@/storage/prefs';
import { colors, fontFamily, fontSize, radius, spacing } from '@/theme';

export default function LanguageScreen() {
  const { t: tc } = useTranslation('common');
  const { t } = useTranslation('onboarding');
  const [selected, setSelected] = useState<AppLanguage>('en');
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();

  const handleContinue = async () => {
    setLoading(true);
    await prefs.setLanguage(selected);
    await initI18n(selected);
    router.replace('/onboard');
  };

  return (
    <LinearGradient colors={['#FAF0EB', colors.bg]} locations={[0, 0.3]} style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 12 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Branded header */}
        <View style={styles.header}>
          <Logo size={64} />
          <Text style={styles.title}>{t('language.title')}</Text>
          <Text style={styles.subtitle}>{t('language.subtitle')}</Text>
        </View>

        {/* Language rows */}
        <View style={styles.listArea}>
          {SUPPORTED_LANGUAGES.map((code) => {
            const meta = LANGUAGE_META[code];
            const isSelected = selected === code;
            return (
              <TouchableOpacity
                key={code}
                style={[styles.row, isSelected && styles.rowSelected]}
                activeOpacity={0.7}
                onPress={() => setSelected(code)}
              >
                {/* Flag tile */}
                <View style={styles.flagTile}>
                  <Text style={styles.flag}>{meta.flag}</Text>
                </View>

                {/* Name + region */}
                <View style={styles.rowText}>
                  <Text style={[styles.nativeName, isSelected && styles.nativeNameSelected]}>
                    {meta.native}
                  </Text>
                  <Text style={styles.regionText}>
                    {meta.name} · {meta.region}
                  </Text>
                </View>

                {/* Radio check */}
                <View style={[styles.radio, isSelected && styles.radioSelected]}>
                  {isSelected && <Icon.check size={14} color={colors.white} stroke={3} />}
                </View>
              </TouchableOpacity>
            );
          })}

          {/* Hint */}
          <Text style={styles.hint}>{t('language.hint')}</Text>
        </View>
      </ScrollView>

      {/* Sticky CTA */}
      <View style={[styles.ctaArea, { paddingBottom: Math.max(insets.bottom, 20) + 8 }]}>
        <TouchableOpacity
          style={[styles.ctaBtn, loading && styles.ctaLoading]}
          activeOpacity={0.85}
          onPress={handleContinue}
          disabled={loading}
        >
          <Text style={styles.ctaLabel}>{loading ? tc('loading_short') : t('language.cta')}</Text>
          {!loading && <Icon.arrow size={18} color={colors.white} />}
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: spacing[7],
    paddingBottom: 120,
  },
  header: {
    alignItems: 'center',
    paddingBottom: 28,
    gap: 12,
  },
  title: {
    fontFamily: fontFamily.extraBold,
    fontSize: 26,
    letterSpacing: -0.52,
    color: colors.ink,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.body,
    color: colors.ink2,
    textAlign: 'center',
    lineHeight: 21,
  },
  listArea: { gap: 0 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    paddingHorizontal: 14,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.sm,
    marginBottom: 6,
  },
  rowSelected: {
    backgroundColor: colors.primarySoft,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  flagTile: {
    width: 40,
    height: 40,
    borderRadius: radius.xs,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  flag: { fontSize: 22 },
  rowText: { flex: 1, minWidth: 0 },
  nativeName: {
    fontFamily: fontFamily.bold,
    fontSize: 15,
    color: colors.ink,
  },
  nativeNameSelected: { color: colors.primaryInk },
  regionText: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.meta,
    color: colors.ink3,
    marginTop: 1,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.75,
    borderColor: colors.ink4,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  radioSelected: {
    backgroundColor: colors.primary,
    borderWidth: 0,
  },
  hint: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.meta,
    color: colors.ink3,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 14,
    paddingHorizontal: 8,
  },
  ctaArea: {
    paddingHorizontal: spacing[7],
    paddingTop: 14,
    backgroundColor: 'transparent',
  },
  ctaBtn: {
    height: 56,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  ctaLoading: { opacity: 0.7 },
  ctaLabel: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.cardTitle,
    color: colors.white,
  },
});

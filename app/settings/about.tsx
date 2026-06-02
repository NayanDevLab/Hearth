// About screen — app version, tagline, made with love.

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { router } from 'expo-router';

import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icons/Icon';
import { APP_BUILD, APP_VERSION } from '@/constants/settings';
import { colors, fontFamily, fontSize, radius, spacing } from '@/theme';

export default function AboutScreen() {
  const { t } = useTranslation('settings');
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} style={styles.backBtn}>
          <Icon.arrowLeft size={20} color={colors.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('about_title')}</Text>
        <View style={styles.backBtn} />
      </View>

      <View style={styles.content}>
        {/* App icon / logo */}
        <View style={styles.logoSection}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoEmoji}>🏠</Text>
          </View>
          <Text style={styles.appName}>{t('app_name')}</Text>
          <Text style={styles.tagline}>{t('app_tagline')}</Text>
          <Text style={styles.versionText}>
            {t('version', { version: APP_VERSION, build: APP_BUILD })}
          </Text>
        </View>

        {/* Made with love */}
        <View style={styles.madeCard}>
          <Text style={styles.madeText}>{t('made_with')}</Text>
        </View>

        {/* Info rows */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Icon.shield size={16} color={colors.ink3} />
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>Privacy</Text>
              <Text style={styles.infoValue}>Offline only · No tracking</Text>
            </View>
          </View>
          <View style={[styles.infoRow, styles.infoRowBorder]}>
            <Icon.sparkle size={16} color={colors.ink3} />
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>Languages</Text>
              <Text style={styles.infoValue}>English, हिन्दी, ગુજરાતી</Text>
            </View>
          </View>
        </View>
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
  content: { flex: 1, paddingHorizontal: spacing[7], paddingTop: 24, gap: 20 },
  logoSection: { alignItems: 'center', gap: 8, paddingVertical: 8 },
  logoCircle: {
    width: 88,
    height: 88,
    borderRadius: 24,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  logoEmoji: { fontSize: 44 },
  appName: {
    fontFamily: fontFamily.extraBold,
    fontSize: 28,
    color: colors.ink,
    letterSpacing: -0.5,
  },
  tagline: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.cardTitle,
    color: colors.ink2,
    textAlign: 'center',
  },
  versionText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.caption,
    color: colors.ink4,
    marginTop: 4,
  },
  madeCard: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.md,
    paddingVertical: 16,
    alignItems: 'center',
  },
  madeText: { fontFamily: fontFamily.semiBold, fontSize: fontSize.body, color: colors.primary },
  infoCard: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  infoRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.line2 },
  infoText: { flex: 1 },
  infoLabel: { fontFamily: fontFamily.semiBold, fontSize: fontSize.body, color: colors.ink },
  infoValue: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.caption,
    color: colors.ink3,
    marginTop: 1,
  },
});

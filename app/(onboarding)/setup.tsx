// Setup screen — onboarding step 5/5.
// Captures name + household name, shows offline privacy reassurance.
// Saves to prefs, marks onboarding complete, enters the app.

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

import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icons/Icon';
import { prefs } from '@/storage/prefs';
import { colors, fontFamily, fontSize, radius, spacing } from '@/theme';

const TOTAL_STEPS = 5;

export default function SetupScreen() {
  const { t: tc } = useTranslation('common');
  const { t } = useTranslation('onboarding');
  const [name, setName] = useState('');
  const [household, setHousehold] = useState('');
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();

  const firstName = name.trim().split(' ')[0] ?? '';
  const isReady = name.trim().length > 0;

  const handleEnter = async () => {
    if (!isReady || loading) return;
    setLoading(true);
    const lang = await prefs.getLanguage();
    await prefs.completeOnboarding(name.trim(), household.trim(), lang);
    router.replace('/(tabs)');
  };

  const handleSkip = async () => {
    const lang = await prefs.getLanguage();
    await prefs.completeOnboarding('', '', lang);
    router.replace('/(tabs)');
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Step dots + skip */}
        <View style={styles.topBar}>
          <View style={styles.dotsRow}>
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <View
                key={i}
                style={[styles.dot, i === TOTAL_STEPS - 1 ? styles.dotActive : styles.dotInactive]}
              />
            ))}
          </View>
          <TouchableOpacity
            onPress={handleSkip}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.skip}>{tc('skip')}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Live avatar preview */}
          <View style={styles.avatarWrap}>
            {isReady ? (
              <LinearGradient
                colors={['#C96B50', '#A8503A']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.avatar}
              >
                <Text style={styles.avatarInitial}>{firstName.charAt(0).toUpperCase()}</Text>
              </LinearGradient>
            ) : (
              <View style={[styles.avatar, styles.avatarEmpty]}>
                <Icon.users size={34} color={colors.ink4} />
              </View>
            )}
          </View>

          {/* Heading */}
          <View style={styles.headingBlock}>
            <Text style={styles.title}>{t('setup.title')}</Text>
            <Text style={styles.subtitle}>{t('setup.subtitle')}</Text>
          </View>

          {/* Name input */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>{t('setup.name_label').toUpperCase()}</Text>
            <TextInput
              style={[styles.input, isReady && styles.inputFilled]}
              placeholder={t('setup.name_placeholder')}
              placeholderTextColor={colors.ink4}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              autoCorrect={false}
              returnKeyType="next"
            />
          </View>

          {/* Household name input */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>{t('setup.household_label').toUpperCase()}</Text>
            <TextInput
              style={[styles.input, household.trim().length > 0 && styles.inputFilled]}
              placeholder={t('setup.household_placeholder')}
              placeholderTextColor={colors.ink4}
              value={household}
              onChangeText={setHousehold}
              autoCapitalize="words"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={handleEnter}
            />
          </View>

          {/* Offline privacy card */}
          <View style={styles.privacyCard}>
            <View style={styles.privacyIcon}>
              <Icon.shield size={19} color="#2F8A5E" />
            </View>
            <View style={styles.privacyText}>
              <Text style={styles.privacyTitle}>{t('setup.privacy_title')}</Text>
              <Text style={styles.privacyBody}>{t('setup.privacy_body')}</Text>
            </View>
          </View>
        </ScrollView>

        {/* CTA */}
        <View style={[styles.ctaArea, { paddingBottom: Math.max(insets.bottom, 20) + 8 }]}>
          <TouchableOpacity
            style={[styles.ctaBtn, !isReady && styles.ctaBtnDisabled]}
            activeOpacity={0.85}
            onPress={handleEnter}
            disabled={!isReady || loading}
          >
            <Text style={styles.ctaLabel}>
              {isReady ? t('setup.cta_ready', { name: firstName }) : t('setup.cta_default')}
            </Text>
            <Icon.arrow size={18} color={colors.white} />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[7],
    paddingBottom: 12,
  },
  dotsRow: { flexDirection: 'row', gap: 6 },
  dot: { height: 6, borderRadius: 3 },
  dotActive: { width: 22, backgroundColor: colors.primary },
  dotInactive: { width: 6, backgroundColor: '#D8D4CE' },
  skip: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.body,
    color: colors.ink3,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 28,
    paddingBottom: 20,
  },
  avatarWrap: {
    alignItems: 'center',
    marginBottom: 18,
  },
  avatar: {
    width: 92,
    height: 92,
    borderRadius: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmpty: {
    backgroundColor: colors.surface2,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderStyle: 'dashed',
  },
  avatarInitial: {
    fontFamily: fontFamily.extraBold,
    fontSize: 38,
    color: colors.white,
    letterSpacing: -0.76,
  },
  headingBlock: {
    alignItems: 'center',
    marginBottom: 24,
    gap: 8,
  },
  title: {
    fontFamily: fontFamily.extraBold,
    fontSize: 26,
    letterSpacing: -0.52,
    color: colors.ink,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: fontFamily.regular,
    fontSize: 14.5,
    lineHeight: 21,
    color: colors.ink3,
    textAlign: 'center',
  },
  fieldGroup: { marginBottom: 16 },
  fieldLabel: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.caption,
    letterSpacing: 0.66,
    color: colors.ink3,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  input: {
    width: '100%',
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.white,
    borderRadius: radius.sm,
    paddingVertical: 15,
    paddingHorizontal: 16,
    fontFamily: fontFamily.semiBold,
    fontSize: 16,
    color: colors.ink,
  },
  inputFilled: { borderColor: colors.primary },
  privacyCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: colors.mintSoft,
    borderRadius: 16,
    padding: 14,
    marginTop: 2,
  },
  privacyIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  privacyText: { flex: 1 },
  privacyTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 13.5,
    color: '#2A6B4A',
    marginBottom: 2,
  },
  privacyBody: {
    fontFamily: fontFamily.regular,
    fontSize: 12.5,
    lineHeight: 18,
    color: '#3A7A56',
  },
  ctaArea: {
    paddingHorizontal: spacing[7],
    paddingTop: 14,
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
  ctaBtnDisabled: { opacity: 0.5 },
  ctaLabel: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.cardTitle,
    color: colors.white,
  },
});

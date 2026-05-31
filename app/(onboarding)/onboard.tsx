// Onboarding — 4-screen horizontal paging flow.
// Step dots animate width with Reanimated. Each slide is full-height, self-contained.

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { router } from 'expo-router';

import { useTranslation } from 'react-i18next';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icons/Icon';
import { IllusFamily, IllusHome, IllusOrganize, IllusReminders } from '@/components/illustrations';
import { Button } from '@/components/ui';
import { colors, fontFamily, fontSize, spacing } from '@/theme';

const { width: SCREEN_W } = Dimensions.get('window');

// ─── Step configuration ──────────────────────────────────────

interface StepConfig {
  key: string;
  Illus: React.FC<{ width?: number; height?: number }>;
  title: string;
  body: string;
  cta: string;
  showSecondary?: boolean;
}

// STEPS is computed inside the component — see useSteps() below.

// ─── StepDot — single animated pill ─────────────────────────

function StepDot({ active }: { active: boolean }) {
  const dotWidth = useSharedValue(active ? 22 : 6);

  useEffect(() => {
    dotWidth.value = withTiming(active ? 22 : 6, { duration: 220 });
  }, [active, dotWidth]);

  const style = useAnimatedStyle(() => ({
    width: dotWidth.value,
    backgroundColor: active ? colors.primary : '#D8D4CE',
  }));

  return <Animated.View style={[styles.dot, style]} />;
}

// ─── StepDots — progress indicator row ──────────────────────

function StepDots({ total, current }: { total: number; current: number }) {
  return (
    <View style={styles.dotsRow}>
      {Array.from({ length: total }).map((_, i) => (
        <StepDot key={i} active={i === current} />
      ))}
    </View>
  );
}

// ─── OnboardSlide — single full-height screen ────────────────

interface SlideProps {
  step: StepConfig;
  totalSteps: number;
  currentStep: number;
  height: number;
  topInset: number;
  bottomInset: number;
  onNext: () => void;
  onSkip: () => void;
}

function OnboardSlide({
  step,
  totalSteps,
  currentStep,
  height,
  topInset,
  bottomInset,
  onNext,
  onSkip,
}: SlideProps) {
  const { t: tc } = useTranslation('common');
  const { t } = useTranslation('onboarding');
  const illusSize = Math.min(SCREEN_W * 0.82, 280);

  return (
    <View style={[styles.slide, { width: SCREEN_W, height }]}>
      {/* Top bar: step dots + skip */}
      <View style={[styles.topBar, { paddingTop: topInset + 12 }]}>
        <StepDots total={totalSteps} current={currentStep} />
        <TouchableOpacity
          onPress={onSkip}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.skip}>{tc('skip')}</Text>
        </TouchableOpacity>
      </View>

      {/* Illustration */}
      <View style={styles.illusArea}>
        <step.Illus width={illusSize} height={240} />
      </View>

      {/* Title + body */}
      <View style={styles.textArea}>
        <Text style={styles.title}>{step.title}</Text>
        <Text style={styles.body}>{step.body}</Text>
      </View>

      {/* CTA buttons */}
      <View style={[styles.ctaArea, { paddingBottom: Math.max(bottomInset, 20) + 12 }]}>
        <Button
          variant="accent"
          label={step.cta}
          rightIcon={<Icon.arrow size={18} color={colors.white} />}
          onPress={onNext}
        />
        {step.showSecondary && (
          <Button variant="ghost" label={t('slides.secondary_cta')} onPress={onSkip} />
        )}
      </View>
    </View>
  );
}

// ─── Main screen ─────────────────────────────────────────────

export default function OnboardingScreen() {
  const { t: tc } = useTranslation('common');
  const { t } = useTranslation('onboarding');

  // Steps built from translations so they update on language switch.
  const steps = useMemo<StepConfig[]>(
    () => [
      {
        key: 'welcome',
        Illus: IllusHome,
        title: t('slides.welcome.title'),
        body: t('slides.welcome.body'),
        cta: tc('get_started'),
      },
      {
        key: 'organize',
        Illus: IllusOrganize,
        title: t('slides.organize.title'),
        body: t('slides.organize.body'),
        cta: tc('next'),
      },
      {
        key: 'household',
        Illus: IllusFamily,
        title: t('slides.household.title'),
        body: t('slides.household.body'),
        cta: tc('next'),
      },
      {
        key: 'reminders',
        Illus: IllusReminders,
        title: t('slides.reminders.title'),
        body: t('slides.reminders.body'),
        cta: tc('next'),
      },
    ],
    [t, tc]
  );

  // Total dots = 4 slides + setup screen (step 5).
  const TOTAL_DOTS = steps.length + 1;

  const [currentStep, setCurrentStep] = useState(0);
  const [containerHeight, setContainerHeight] = useState(Dimensions.get('window').height);
  const listRef = useRef<FlatList<StepConfig>>(null);
  const insets = useSafeAreaInsets();

  const goNext = useCallback(() => {
    if (currentStep < steps.length - 1) {
      const next = currentStep + 1;
      listRef.current?.scrollToIndex({ index: next, animated: true });
      setCurrentStep(next);
    } else {
      router.push('/setup');
    }
  }, [currentStep, steps]);

  const skip = useCallback(() => {
    router.push('/setup');
  }, []);

  return (
    <View
      style={styles.container}
      onLayout={(e) => setContainerHeight(e.nativeEvent.layout.height)}
    >
      <FlatList
        ref={listRef}
        data={steps}
        keyExtractor={(item) => item.key}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        extraData={currentStep}
        getItemLayout={(_, index) => ({
          length: SCREEN_W,
          offset: SCREEN_W * index,
          index,
        })}
        renderItem={({ item }) => (
          <OnboardSlide
            step={item}
            totalSteps={TOTAL_DOTS}
            currentStep={currentStep}
            height={containerHeight}
            topInset={insets.top}
            bottomInset={insets.bottom}
            onNext={goNext}
            onSkip={skip}
          />
        )}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  slide: {
    // width + height set dynamically
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[7],
    paddingBottom: 12,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  skip: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.body,
    color: colors.ink3,
  },
  illusArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[7],
  },
  textArea: {
    paddingHorizontal: 28,
    paddingBottom: 16,
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontFamily: fontFamily.extraBold,
    fontSize: 28,
    letterSpacing: -0.7,
    color: colors.ink,
    textAlign: 'center',
  },
  body: {
    fontFamily: fontFamily.regular,
    fontSize: 15,
    lineHeight: 22.5,
    color: colors.ink2,
    textAlign: 'center',
  },
  ctaArea: {
    paddingHorizontal: spacing[7],
    paddingTop: 14,
    gap: 4,
  },
});

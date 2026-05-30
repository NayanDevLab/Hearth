// TutorialSheet — reusable 3-step bottom-sheet coach mark.
// Present on every feature screen via the lightbulb icon in ScreenHeader.
// Uses Reanimated shared values (no ref-during-render), step resets on close.

import React, { useCallback, useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Icon } from '@/components/icons/Icon';
import { colors, fontFamily, fontSize, radius, shadows, spacing } from '@/theme';

export interface TutorialStep {
  title: string;
  body: string;
  example?: React.ReactNode;
}

interface TutorialSheetProps {
  steps: TutorialStep[];
  visible: boolean;
  onClose: () => void;
  accentColor?: string;
}

export function TutorialSheet({
  steps,
  visible,
  onClose,
  accentColor = colors.primary,
}: TutorialSheetProps) {
  const [step, setStep] = useState(0);

  const slideAnim = useSharedValue(300);
  const fadeAnim = useSharedValue(0);

  const isLast = step === steps.length - 1;
  const current = steps[step];

  useEffect(() => {
    if (visible) {
      fadeAnim.value = withTiming(1, { duration: 200 });
      slideAnim.value = withSpring(0, { damping: 20, stiffness: 150 });
    } else {
      fadeAnim.value = withTiming(0, { duration: 160 });
      slideAnim.value = withTiming(300, { duration: 200 });
    }
  }, [visible, fadeAnim, slideAnim]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
  }));

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: slideAnim.value }],
  }));

  // Always reset step when closing so next open starts at step 1.
  const handleClose = useCallback(() => {
    setStep(0);
    onClose();
  }, [onClose]);

  const handleNext = useCallback(() => {
    if (isLast) {
      setStep(0);
      onClose();
    } else {
      setStep((s) => s + 1);
    }
  }, [isLast, onClose]);

  const handleBack = useCallback(() => {
    setStep((s) => Math.max(0, s - 1));
  }, []);

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={handleClose}>
      <Animated.View style={[styles.backdrop, backdropStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
      </Animated.View>

      <Animated.View style={[styles.sheet, sheetStyle]}>
        <View style={styles.grabber} />

        <View style={styles.headerRow}>
          <View style={styles.pillRow}>
            <View style={[styles.tipPill, { backgroundColor: colors.primarySoft }]}>
              <Icon.bulb size={14} color={colors.primaryInk} />
              <Text style={[styles.tipLabel, { color: colors.primaryInk }]}>Quick tip</Text>
            </View>
            <Text style={styles.stepCount}>
              {step + 1} of {steps.length}
            </Text>
          </View>
          <TouchableOpacity onPress={handleClose} style={styles.closeBtn} activeOpacity={0.7}>
            <Icon.close size={16} color={colors.ink2} />
          </TouchableOpacity>
        </View>

        {current.example && <View style={styles.exampleBlock}>{current.example}</View>}

        <Text style={styles.title}>{current.title}</Text>
        <Text style={styles.body}>{current.body}</Text>

        <View style={styles.dots}>
          {steps.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === step
                  ? { width: 18, backgroundColor: accentColor }
                  : { width: 6, backgroundColor: '#DAD5CC' },
              ]}
            />
          ))}
        </View>

        <View style={styles.btnRow}>
          {step > 0 && (
            <TouchableOpacity onPress={handleBack} style={styles.backBtn} activeOpacity={0.8}>
              <Text style={styles.backLabel}>Back</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={handleNext}
            style={[
              styles.nextBtn,
              { backgroundColor: accentColor },
              step > 0 ? styles.flex1 : styles.fullWidth,
            ]}
            activeOpacity={0.85}
          >
            <Text style={styles.nextLabel}>{isLast ? 'Got it' : 'Next'}</Text>
            {!isLast && <Icon.arrow size={16} color={colors.white} />}
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(20, 22, 30, 0.45)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing[7],
    paddingBottom: spacing[8],
    paddingTop: spacing[5],
    ...shadows.sh3,
  },
  grabber: {
    width: 36,
    height: 5,
    backgroundColor: colors.ink4,
    opacity: 0.5,
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: spacing[5],
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[5],
  },
  pillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tipPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
  tipLabel: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.meta,
  },
  stepCount: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.meta,
    color: colors.ink3,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exampleBlock: {
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    padding: spacing[5],
    marginBottom: spacing[5],
  },
  title: {
    fontFamily: fontFamily.bold,
    fontSize: 20,
    letterSpacing: -0.3,
    color: colors.ink,
    marginBottom: 6,
  },
  body: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.body,
    lineHeight: 21,
    color: colors.ink2,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginVertical: 18,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 8,
  },
  backBtn: {
    flex: 1,
    height: 52,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backLabel: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.cardTitle,
    color: colors.ink,
  },
  nextBtn: {
    height: 52,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 22,
  },
  nextLabel: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.cardTitle,
    color: colors.white,
  },
  flex1: { flex: 1 },
  fullWidth: { width: '100%' },
});

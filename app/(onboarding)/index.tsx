// Splash Screen — SP1 "Warm minimal"
// Logo pop → title rise → progress bar. Auto-navigates to onboarding after 2.8s.

import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

import { useTranslation } from 'react-i18next';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { Logo } from '@/components/illustrations';
import { colors, fontFamily, fontSize } from '@/theme';

const TIMING = {
  logoPop: 700,
  titleDelay: 350,
  barDelay: 600,
  barDuration: 2000,
  navigate: 2800,
} as const;

export default function SplashScreen() {
  const { t } = useTranslation('common');
  const [trackWidth, setTrackWidth] = useState(0);

  // Logo
  const logoScale = useSharedValue(0.6);
  const logoOpacity = useSharedValue(0);

  // Glow behind logo
  const glowOpacity = useSharedValue(0.35);
  const glowScale = useSharedValue(1);

  // Title + tagline block
  const textY = useSharedValue(14);
  const textOpacity = useSharedValue(0);

  // Progress bar + label
  const barOpacity = useSharedValue(0);
  const barWidth = useSharedValue(0);

  useEffect(() => {
    // Logo: scale 0.6 → 1.08 → 1.0, opacity 0 → 1
    logoScale.value = withSequence(
      withTiming(1.08, { duration: TIMING.logoPop * 0.6, easing: Easing.out(Easing.back(1.4)) }),
      withTiming(1.0, { duration: TIMING.logoPop * 0.4, easing: Easing.out(Easing.quad) })
    );
    logoOpacity.value = withTiming(1, { duration: TIMING.logoPop * 0.35 });

    // Glow pulse (infinite)
    glowOpacity.value = withDelay(
      200,
      withRepeat(
        withSequence(
          withTiming(0.6, { duration: 1300, easing: Easing.inOut(Easing.sin) }),
          withTiming(0.35, { duration: 1300, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      )
    );
    glowScale.value = withDelay(
      200,
      withRepeat(
        withSequence(
          withTiming(1.12, { duration: 1300, easing: Easing.inOut(Easing.sin) }),
          withTiming(1, { duration: 1300, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      )
    );

    // Title + tagline rise in
    textY.value = withDelay(
      TIMING.titleDelay,
      withTiming(0, { duration: 500, easing: Easing.out(Easing.quad) })
    );
    textOpacity.value = withDelay(TIMING.titleDelay, withTiming(1, { duration: 500 }));

    // Progress bar fade in + fill
    barOpacity.value = withDelay(TIMING.barDelay, withTiming(1, { duration: 300 }));

    // Navigate after total duration — skip onboarding for returning users
    const timer = setTimeout(async () => {
      const done = await import('@/storage/prefs').then((m) => m.prefs.getOnboardingComplete());
      if (done) {
        router.replace('/(tabs)');
      } else {
        // @ts-expect-error — typed routes regenerate on expo start
        router.replace('/language');
      }
    }, TIMING.navigate);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Kick off bar fill animation once track width is measured
  useEffect(() => {
    if (trackWidth > 0) {
      barWidth.value = withDelay(
        TIMING.barDelay,
        withTiming(trackWidth * 0.92, {
          duration: TIMING.barDuration,
          easing: Easing.out(Easing.quad),
        })
      );
    }
  }, [trackWidth, barWidth]);

  const logoAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [{ scale: glowScale.value }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: textY.value }],
    opacity: textOpacity.value,
  }));

  const barContainerStyle = useAnimatedStyle(() => ({
    opacity: barOpacity.value,
  }));

  const barFillStyle = useAnimatedStyle(() => ({
    width: barWidth.value,
  }));

  return (
    <LinearGradient colors={['#FAF0EB', '#F5E4DB']} style={styles.container}>
      {/* Center section — logo + text */}
      <View style={styles.center}>
        {/* Logo with radial glow */}
        <View style={styles.logoWrapper}>
          <Animated.View style={[styles.glow, glowStyle]} />
          <Animated.View style={logoAnimStyle}>
            <Logo size={108} />
          </Animated.View>
        </View>

        {/* Title + tagline */}
        <Animated.View style={[styles.textBlock, textStyle]}>
          <Text style={styles.title}>{t('app_name')}</Text>
          <Text style={styles.tagline}>{t('tagline')}</Text>
        </Animated.View>
      </View>

      {/* Bottom — progress bar */}
      <Animated.View style={[styles.bottomSection, barContainerStyle]}>
        <View style={styles.track} onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}>
          <Animated.View style={[styles.fill, barFillStyle]} />
        </View>
        <Text style={styles.loadingLabel}>{t('loading')}</Text>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 26,
  },
  logoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.primary,
    opacity: 0.2,
  },
  textBlock: {
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontFamily: fontFamily.extraBold,
    fontSize: fontSize.display,
    letterSpacing: -1.2,
    color: colors.ink,
  },
  tagline: {
    fontFamily: fontFamily.semiBold,
    fontSize: 15,
    color: colors.primaryInk,
  },
  bottomSection: {
    paddingHorizontal: 60,
    paddingBottom: 60,
    gap: 14,
  },
  track: {
    height: 4,
    borderRadius: 4,
    backgroundColor: `${colors.primary}2E`,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  loadingLabel: {
    textAlign: 'center',
    fontFamily: fontFamily.medium,
    fontSize: 12,
    color: colors.ink3,
    letterSpacing: 0.04,
  },
});

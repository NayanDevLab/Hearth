// Placeholder — will be replaced with the animated Splash Screen in Phase 1.

import { StyleSheet, Text, View } from 'react-native';

import { Logo } from '@/components/illustrations';
import { colors, fontFamily, fontSize } from '@/theme';

export default function SplashPlaceholder() {
  return (
    <View style={styles.container}>
      <Logo size={108} />
      <Text style={styles.title}>Hearth</Text>
      <Text style={styles.tagline}>Your home, in sync.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  title: {
    fontFamily: fontFamily.extraBold,
    fontSize: fontSize.display,
    color: colors.ink,
    letterSpacing: -1.2,
  },
  tagline: {
    fontFamily: fontFamily.semiBold,
    fontSize: 15,
    color: colors.primaryInk,
  },
});

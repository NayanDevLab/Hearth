// Placeholder — will be replaced with full Dashboard in Phase 3.

import { StyleSheet, Text, View } from 'react-native';

import { colors, fontFamily, fontSize } from '@/theme';

export default function DashboardPlaceholder() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Dashboard coming in Phase 3</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.body,
    color: colors.ink3,
  },
});

// More screen — stub. Settings and remaining features in Phase 13.

import { StyleSheet, Text, View } from 'react-native';

import { colors, fontFamily, fontSize } from '@/theme';

export default function MoreScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>More — Phase 13</Text>
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
  text: { fontFamily: fontFamily.semiBold, fontSize: fontSize.body, color: colors.ink3 },
});

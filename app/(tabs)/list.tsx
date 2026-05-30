// Shopping list screen — stub. Full implementation in Phase 5.

import { StyleSheet, Text, View } from 'react-native';

import { colors, fontFamily, fontSize } from '@/theme';

export default function ListScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Shopping List — Phase 5</Text>
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

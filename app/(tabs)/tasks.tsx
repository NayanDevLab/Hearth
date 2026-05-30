// Tasks screen — stub. Full implementation in Phase 4.

import { StyleSheet, Text, View } from 'react-native';

import { colors, fontFamily, fontSize } from '@/theme';

export default function TasksScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Tasks — Phase 4</Text>
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

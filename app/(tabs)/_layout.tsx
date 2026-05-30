// Placeholder — will be wired to custom TabBar in Phase 3 (Dashboard).

import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return <Tabs screenOptions={{ headerShown: false, tabBarStyle: { display: 'none' } }} />;
}

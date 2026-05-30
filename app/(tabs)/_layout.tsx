// Tabs layout — 5-tab bar with custom Hearth icons and brand colors.

import { Tabs } from 'expo-router';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, type IconName } from '@/components/icons/Icon';
import { colors, fontFamily } from '@/theme';

const TAB_ICONS: Record<string, IconName> = {
  index: 'home',
  tasks: 'tasks',
  list: 'cart',
  calendar: 'calendar',
  more: 'more',
};

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={({ route }) => {
        const iconName = TAB_ICONS[route.name] ?? 'home';
        const IconComp = Icon[iconName];

        return {
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.ink4,
          tabBarStyle: {
            backgroundColor: 'rgba(255,255,255,0.94)',
            borderTopColor: colors.line,
            borderTopWidth: 1,
            height: 56 + (insets.bottom || 0),
            paddingBottom: insets.bottom || 8,
            paddingTop: 8,
          },
          tabBarLabelStyle: {
            fontFamily: fontFamily.medium,
            fontSize: 10.5,
          },
          tabBarIcon: ({ color, focused }) => (
            <IconComp size={22} color={color as string} stroke={focused ? 2 : 1.75} />
          ),
        };
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="tasks" options={{ title: 'Tasks' }} />
      <Tabs.Screen name="list" options={{ title: 'List' }} />
      <Tabs.Screen name="calendar" options={{ title: 'Calendar' }} />
      <Tabs.Screen name="more" options={{ title: 'More' }} />
    </Tabs>
  );
}

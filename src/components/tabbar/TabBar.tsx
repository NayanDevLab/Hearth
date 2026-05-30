// TabBar — custom 5-tab bottom navigation bar.
// Used inside the (tabs) layout via the Expo Router `tabBar` prop.

import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, type IconName } from '@/components/icons/Icon';
import { colors, fontFamily, spacing } from '@/theme';

const TABS: { name: string; label: string; icon: IconName }[] = [
  { name: 'index', label: 'Home', icon: 'home' },
  { name: 'tasks', label: 'Tasks', icon: 'tasks' },
  { name: 'list', label: 'List', icon: 'cart' },
  { name: 'calendar', label: 'Calendar', icon: 'calendar' },
  { name: 'more', label: 'More', icon: 'more' },
];

interface TabBarProps {
  state: { index: number; routes: { key: string; name: string }[] };
  descriptors: Record<string, unknown>;
  navigation: {
    emit: (e: { type: string; target: string; canPreventDefault: boolean }) => {
      defaultPrevented: boolean;
    };
    navigate: (name: string) => void;
  };
}

export function TabBar({ state, navigation }: TabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom || spacing[6] }]}>
      {TABS.map((tab, index) => {
        const route = state.routes[index];
        const isFocused = state.index === index;
        const IconComp = Icon[tab.icon];

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route?.key ?? tab.name,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(tab.name);
          }
        };

        return (
          <TouchableOpacity
            key={tab.name}
            onPress={onPress}
            activeOpacity={0.7}
            style={styles.tab}
            accessibilityRole="button"
            accessibilityLabel={tab.label}
          >
            <IconComp
              size={22}
              color={isFocused ? colors.primary : colors.ink4}
              stroke={isFocused ? 2 : 1.75}
            />
            <Text style={[styles.label, isFocused && styles.labelActive]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingTop: 8,
    paddingHorizontal: 6,
    ...Platform.select({
      ios: {
        shadowColor: '#14161E',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.04,
        shadowRadius: 12,
      },
      android: { elevation: 8 },
    }),
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  label: {
    fontFamily: fontFamily.medium,
    fontSize: 10.5,
    color: colors.ink4,
    letterSpacing: 0,
  },
  labelActive: {
    fontFamily: fontFamily.bold,
    color: colors.primary,
  },
});

// DashHeader — time-based greeting, notification bell, user avatar, household pill.

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Icon } from '@/components/icons/Icon';
import { Avatar } from '@/components/ui';
import { colors, fontFamily, radius, spacing } from '@/theme';

const MEMBERS = [
  { initial: 'A', color: colors.primary },
  { initial: 'M', color: colors.sky },
  { initial: 'L', color: colors.butter },
  { initial: 'R', color: colors.lilac },
];

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning ☀';
  if (hour < 17) return 'Good afternoon ☀';
  return 'Good evening 🌙';
}

interface DashHeaderProps {
  userName?: string;
  householdName?: string;
  hasNotification?: boolean;
  onBellPress?: () => void;
}

export function DashHeader({
  userName = 'Sara',
  householdName = 'The Patel Household',
  hasNotification = true,
  onBellPress,
}: DashHeaderProps) {
  return (
    <View style={styles.container}>
      {/* Greeting row */}
      <View style={styles.topRow}>
        <View>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.name}>Hi, {userName}</Text>
        </View>
        <View style={styles.controls}>
          <TouchableOpacity style={styles.bellBtn} activeOpacity={0.7} onPress={onBellPress}>
            <Icon.bell size={20} color={colors.ink} />
            {hasNotification && <View style={styles.notifDot} />}
          </TouchableOpacity>
          <Avatar initial={userName} color={colors.primary} size={40} />
        </View>
      </View>

      {/* Household pill */}
      <View style={styles.pill}>
        <Icon.home size={14} color={colors.ink2} />
        <Text style={styles.pillName}>{householdName}</Text>
        <View style={styles.avatarStack}>
          {MEMBERS.map((m, i) => (
            <View key={m.initial} style={[styles.stackSlot, i === 0 ? styles.stackFirst : null]}>
              <Avatar initial={m.initial} color={m.color} size={22} ring />
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing[7],
    paddingTop: 6,
    paddingBottom: 18,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  greeting: {
    fontFamily: fontFamily.medium,
    fontSize: 13,
    color: colors.ink3,
    marginBottom: 2,
  },
  name: {
    fontFamily: fontFamily.extraBold,
    fontSize: 24,
    letterSpacing: -0.48,
    color: colors.ink,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bellBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifDot: {
    position: 'absolute',
    top: 8,
    right: 9,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.rose,
    borderWidth: 2,
    borderColor: colors.white,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    paddingVertical: 6,
    paddingLeft: 12,
    paddingRight: 6,
    borderRadius: radius.pill,
    gap: 8,
  },
  pillName: {
    fontFamily: fontFamily.semiBold,
    fontSize: 13,
    color: colors.ink,
  },
  avatarStack: {
    flexDirection: 'row',
  },
  stackSlot: {
    marginLeft: -6,
  },
  stackFirst: {
    marginLeft: 0,
  },
});

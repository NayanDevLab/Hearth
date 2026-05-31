// MemberSelector — horizontal scrollable avatar grid with "Anyone" option.
// Used in task new/edit and shopping item new/edit forms.

import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Icon } from '@/components/icons/Icon';
import { Avatar } from '@/components/ui/Avatar';
import { HOUSEHOLD_MEMBERS } from '@/constants/tasks';
import { colors, fontFamily } from '@/theme';

interface MemberSelectorProps {
  selected: string | null; // member initial, or null = Anyone
  onChange: (initial: string | null) => void;
  anyoneLabel?: string; // i18n label for the "ANY" tile
}

export function MemberSelector({
  selected,
  onChange,
  anyoneLabel = 'Anyone',
}: MemberSelectorProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={styles.row}>
        {/* Anyone tile */}
        <TouchableOpacity
          style={[styles.tile, selected === null && styles.tileSelected]}
          activeOpacity={0.75}
          onPress={() => onChange(null)}
        >
          <View style={[styles.anyAvatar, selected === null && styles.anyAvatarSelected]}>
            <Text style={styles.anyText}>ANY</Text>
          </View>
          <Text style={[styles.name, selected === null && styles.nameSelected]}>{anyoneLabel}</Text>
        </TouchableOpacity>

        {/* Household members */}
        {HOUSEHOLD_MEMBERS.map((m) => {
          const sel = selected === m.initial;
          return (
            <TouchableOpacity
              key={m.initial}
              style={[styles.tile, sel && styles.tileSelected]}
              activeOpacity={0.75}
              onPress={() => onChange(m.initial)}
            >
              <View style={styles.avatarWrap}>
                <Avatar initial={m.initial} color={m.color} size={44} />
                {sel && (
                  <View style={styles.checkBadge}>
                    <Icon.check size={10} color={colors.white} stroke={3} />
                  </View>
                )}
              </View>
              <Text style={[styles.name, sel && styles.nameSelected]}>{m.name}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10, paddingVertical: 4 },
  tile: {
    alignItems: 'center',
    gap: 6,
    minWidth: 60,
    borderRadius: 14,
    paddingHorizontal: 6,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.transparent,
  },
  tileSelected: { backgroundColor: colors.surface2, borderColor: colors.line },
  anyAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: colors.ink4,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  anyAvatarSelected: {
    borderColor: colors.primary,
    borderStyle: 'solid',
    backgroundColor: colors.primarySoft,
  },
  anyText: { fontFamily: fontFamily.bold, fontSize: 10, color: colors.ink3 },
  avatarWrap: { position: 'relative' },
  checkBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.mint,
    borderWidth: 2,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { fontFamily: fontFamily.semiBold, fontSize: 11, color: colors.ink3 },
  nameSelected: { color: colors.ink },
});

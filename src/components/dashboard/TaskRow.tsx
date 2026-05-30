// TaskRow — individual chore with checkbox, time meta, tag, and assignee avatar.

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Icon } from '@/components/icons/Icon';
import { Avatar } from '@/components/ui';
import { colors, fontFamily, fontSize, radius } from '@/theme';

export interface TaskRowProps {
  title: string;
  assigneeInitial: string;
  assigneeColor: string;
  time: string;
  tag?: string;
  done?: boolean;
  onToggle?: () => void;
}

export function TaskRow({
  title,
  assigneeInitial,
  assigneeColor,
  time,
  tag,
  done = false,
  onToggle,
}: TaskRowProps) {
  return (
    <View style={styles.row}>
      <TouchableOpacity
        onPress={onToggle}
        activeOpacity={0.7}
        style={[styles.checkbox, done && styles.checkboxDone]}
      >
        {done && <Icon.check size={14} color={colors.white} stroke={2.5} />}
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={[styles.title, done && styles.titleDone]} numberOfLines={1}>
          {title}
        </Text>
        <View style={styles.meta}>
          <Icon.clock size={12} color={colors.ink3} />
          <Text style={styles.metaText}>{time}</Text>
          {tag && (
            <View style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          )}
        </View>
      </View>

      <Avatar initial={assigneeInitial} color={assigneeColor} size={26} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 16,
    marginBottom: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: radius.xs,
    borderWidth: 1.75,
    borderColor: colors.ink4,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  checkboxDone: {
    backgroundColor: colors.mint,
    borderWidth: 0,
  },
  content: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  title: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.body,
    color: colors.ink,
  },
  titleDone: {
    textDecorationLine: 'line-through',
    opacity: 0.55,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.meta,
    color: colors.ink3,
  },
  tag: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: radius.xs,
    backgroundColor: colors.surface2,
  },
  tagText: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.microcopy,
    color: colors.ink2,
  },
});

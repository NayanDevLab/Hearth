// TaskDeleteSheet — delete confirmation bottom sheet.
// Shows 2 or 3 buttons depending on whether the task is recurring.

import React from 'react';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { Icon } from '@/components/icons/Icon';
import { colors, fontFamily, fontSize, radius, shadows, spacing } from '@/theme';

interface TaskDeleteSheetProps {
  visible: boolean;
  taskTitle: string;
  isRecurring: boolean;
  onDeleteOne: () => void;
  onDeleteSeries?: () => void;
  onCancel: () => void;
}

export function TaskDeleteSheet({
  visible,
  taskTitle,
  isRecurring,
  onDeleteOne,
  onDeleteSeries,
  onCancel,
}: TaskDeleteSheetProps) {
  const { t: tc } = useTranslation('common');
  const { t } = useTranslation('tasks');

  const recurrenceLabel = t('repeats_weekly');

  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onCancel}>
      <Pressable style={styles.backdrop} onPress={onCancel} />
      <View style={styles.sheet}>
        <View style={styles.grabber} />

        {/* Icon */}
        <View style={styles.iconCircle}>
          <Icon.trash size={26} color={colors.rose} />
        </View>

        {/* Heading */}
        <Text style={styles.title}>{t('delete_title')}</Text>
        <Text style={styles.body}>
          {isRecurring
            ? t('delete_body_recurring', { title: taskTitle, recurrence: recurrenceLabel })
            : t('delete_body_single', { title: taskTitle })}
        </Text>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.deleteOneBtn} activeOpacity={0.85} onPress={onDeleteOne}>
            <Text style={styles.deleteOneLbl}>{t('delete_one')}</Text>
          </TouchableOpacity>

          {isRecurring && onDeleteSeries && (
            <TouchableOpacity
              style={styles.deleteSeriesBtn}
              activeOpacity={0.85}
              onPress={onDeleteSeries}
            >
              <Text style={styles.deleteSeriesLbl}>{t('delete_series')}</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.cancelBtn} activeOpacity={0.8} onPress={onCancel}>
            <Text style={styles.cancelLbl}>{tc('cancel')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(20,22,30,0.45)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing[7],
    paddingBottom: 32,
    paddingTop: spacing[5],
    alignItems: 'center',
    ...shadows.sh3,
  },
  grabber: {
    width: 36,
    height: 5,
    backgroundColor: colors.ink4,
    opacity: 0.4,
    borderRadius: 3,
    marginBottom: 18,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.roseSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontFamily: fontFamily.bold,
    fontSize: 20,
    letterSpacing: -0.3,
    color: colors.ink,
    marginBottom: 6,
    textAlign: 'center',
  },
  body: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.body,
    color: colors.ink2,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 18,
    paddingHorizontal: 12,
  },
  actions: {
    width: '100%',
    gap: 8,
  },
  deleteOneBtn: {
    height: 52,
    borderRadius: radius.pill,
    backgroundColor: colors.rose,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteOneLbl: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.cardTitle,
    color: colors.white,
  },
  deleteSeriesBtn: {
    height: 52,
    borderRadius: radius.pill,
    backgroundColor: colors.roseSoft,
    borderWidth: 1,
    borderColor: '#F5C5C0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteSeriesLbl: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.cardTitle,
    color: colors.rose,
  },
  cancelBtn: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelLbl: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.cardTitle,
    color: colors.ink2,
  },
});

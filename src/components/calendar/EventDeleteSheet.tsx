// EventDeleteSheet — 3-option recurring event delete confirmation.
// Matches the design: Just this day / This and all future / The whole series.

import React from 'react';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { Icon } from '@/components/icons/Icon';
import { Avatar } from '@/components/ui';
import { MEMBER_CONFIG } from '@/constants/tasks';
import { colors, fontFamily, fontSize, radius, shadows, spacing } from '@/theme';

interface EventDeleteSheetProps {
  visible: boolean;
  eventTitle: string;
  isRecurring: boolean;
  dayLabel?: string; // "Tuesday"
  recurrenceLabel?: string; // "every 6 months"
  notifyInitials?: string[]; // member initials who will be notified
  onJustThis: () => void;
  onThisAndFuture?: () => void;
  onWholeSeries?: () => void;
  onCancel: () => void;
}

export function EventDeleteSheet({
  visible,
  eventTitle,
  isRecurring,
  dayLabel = 'day',
  recurrenceLabel = '',
  notifyInitials = [],
  onJustThis,
  onThisAndFuture,
  onWholeSeries,
  onCancel,
}: EventDeleteSheetProps) {
  const { t } = useTranslation('calendar');
  const { t: tc } = useTranslation('common');

  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onCancel}>
      <Pressable style={styles.backdrop} onPress={onCancel} />
      <View style={styles.sheet}>
        <View style={styles.grabber} />

        <View style={styles.iconCircle}>
          <Icon.trash size={24} color={colors.rose} />
        </View>

        <Text style={styles.title}>{t('delete_event_title')}</Text>
        <Text style={styles.body}>
          {isRecurring
            ? t('delete_event_body', { recurrence: recurrenceLabel, day: dayLabel })
            : t('delete_single_body', { title: eventTitle })}
        </Text>

        {notifyInitials.length > 0 && (
          <View style={styles.notifyRow}>
            <Text style={styles.notifyLabel}>{t('also_notifies')}</Text>
            <View style={styles.notifyAvatars}>
              {notifyInitials.map((init) => {
                const m = MEMBER_CONFIG[init];
                if (!m) return null;
                return <Avatar key={init} initial={init} color={m.color} size={24} />;
              })}
            </View>
          </View>
        )}

        <View style={styles.actions}>
          <TouchableOpacity style={styles.btn1} activeOpacity={0.85} onPress={onJustThis}>
            <Text style={styles.btn1Label}>
              {t(isRecurring ? 'delete_just_this' : 'delete_just_this', { day: dayLabel })}
            </Text>
          </TouchableOpacity>

          {isRecurring && onThisAndFuture && (
            <TouchableOpacity style={styles.btn2} activeOpacity={0.85} onPress={onThisAndFuture}>
              <Text style={styles.btn2Label}>{t('delete_this_and_future')}</Text>
            </TouchableOpacity>
          )}

          {isRecurring && onWholeSeries && (
            <TouchableOpacity style={styles.btn2} activeOpacity={0.85} onPress={onWholeSeries}>
              <Text style={styles.btn2Label}>{t('delete_whole_series')}</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.cancelBtn} activeOpacity={0.8} onPress={onCancel}>
            <Text style={styles.cancelLabel}>{tc('cancel')}</Text>
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
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.roseSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontFamily: fontFamily.bold,
    fontSize: 19,
    color: colors.ink,
    textAlign: 'center',
    marginBottom: 6,
  },
  body: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.body,
    color: colors.ink2,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 14,
    paddingHorizontal: 8,
  },
  notifyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 18,
  },
  notifyLabel: { fontFamily: fontFamily.semiBold, fontSize: fontSize.meta, color: colors.ink3 },
  notifyAvatars: { flexDirection: 'row', gap: 6 },
  actions: { width: '100%', gap: 8 },
  btn1: {
    height: 52,
    borderRadius: radius.pill,
    backgroundColor: colors.rose,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btn1Label: { fontFamily: fontFamily.bold, fontSize: fontSize.cardTitle, color: colors.white },
  btn2: {
    height: 52,
    borderRadius: radius.pill,
    backgroundColor: colors.roseSoft,
    borderWidth: 1.5,
    borderColor: '#F5C5C0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btn2Label: { fontFamily: fontFamily.bold, fontSize: fontSize.cardTitle, color: colors.rose },
  cancelBtn: { height: 48, alignItems: 'center', justifyContent: 'center' },
  cancelLabel: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.cardTitle,
    color: colors.ink3,
  },
});

// ItemDeleteSheet — soft delete confirmation: "Remove item" vs "Mark as done instead".

import React from 'react';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { Icon } from '@/components/icons/Icon';
import { colors, fontFamily, fontSize, radius, shadows, spacing } from '@/theme';

interface ItemDeleteSheetProps {
  visible: boolean;
  itemName: string;
  listName: string;
  onRemove: () => void;
  onMarkDone: () => void;
  onCancel: () => void;
}

export function ItemDeleteSheet({
  visible,
  itemName,
  listName,
  onRemove,
  onMarkDone,
  onCancel,
}: ItemDeleteSheetProps) {
  const { t } = useTranslation('shopping');
  const { t: tc } = useTranslation('common');

  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onCancel}>
      <Pressable style={styles.backdrop} onPress={onCancel} />
      <View style={styles.sheet}>
        <View style={styles.grabber} />

        <View style={styles.iconCircle}>
          <Icon.trash size={24} color={colors.rose} />
        </View>

        <Text style={styles.title}>{t('remove_title', { name: itemName })}</Text>
        <Text style={styles.body}>{t('remove_body', { list: listName })}</Text>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.removeBtn} activeOpacity={0.85} onPress={onRemove}>
            <Icon.trash size={18} color={colors.white} />
            <Text style={styles.removeLbl}>{t('remove_confirm')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.doneBtn} activeOpacity={0.85} onPress={onMarkDone}>
            <Icon.check size={18} color={colors.mint} stroke={2.5} />
            <Text style={styles.doneLbl}>{t('mark_done_instead')}</Text>
          </TouchableOpacity>

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
    letterSpacing: -0.3,
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
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  actions: { width: '100%', gap: 8 },
  removeBtn: {
    height: 52,
    borderRadius: radius.pill,
    backgroundColor: colors.rose,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  removeLbl: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.cardTitle,
    color: colors.white,
  },
  doneBtn: {
    height: 52,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.mint,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.mintSoft,
  },
  doneLbl: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.cardTitle,
    color: colors.mint,
  },
  cancelBtn: { height: 48, alignItems: 'center', justifyContent: 'center' },
  cancelLbl: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.cardTitle,
    color: colors.ink3,
  },
});

// QuickAddBar — inline quick-add input that parses "2 lemons" into qty + name.

import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { Icon } from '@/components/icons/Icon';
import { parseQuickAdd } from '@/constants/shopping';
import { colors, fontFamily, fontSize, radius, spacing } from '@/theme';

interface QuickAddBarProps {
  onAdd: (name: string, quantity: number, unit: string) => void;
}

export function QuickAddBar({ onAdd }: QuickAddBarProps) {
  const { t } = useTranslation('shopping');
  const [text, setText] = useState('');

  function handleSubmit() {
    const trimmed = text.trim();
    if (!trimmed) return;
    const { name, quantity, unit } = parseQuickAdd(trimmed);
    onAdd(name, quantity, unit);
    setText('');
  }

  return (
    <View style={styles.container}>
      <Icon.plus size={18} color={colors.primary} />
      <TextInput
        style={styles.input}
        placeholder={t('quick_add_placeholder')}
        placeholderTextColor={colors.ink4}
        value={text}
        onChangeText={setText}
        onSubmitEditing={handleSubmit}
        returnKeyType="done"
        autoCapitalize="sentences"
      />
      {text.trim().length > 0 && (
        <TouchableOpacity onPress={handleSubmit} activeOpacity={0.7} style={styles.sendBtn}>
          <Icon.arrow size={18} color={colors.white} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: spacing[7],
    marginBottom: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.line,
  },
  input: {
    flex: 1,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.body,
    color: colors.ink,
    padding: 0,
  },
  sendBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

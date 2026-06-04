// Add room form — name + emoji picker.

import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { router } from 'expo-router';

import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FormBottomBar, FormField } from '@/components/forms';
import { ROOM_EMOJIS } from '@/constants/locator';
import { insertRoom } from '@/db/modules/locator';
import { colors, fontFamily, radius, spacing } from '@/theme';

export default function NewRoomScreen() {
  const { t } = useTranslation('locator');
  const { t: tc } = useTranslation('common');
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState(ROOM_EMOJIS[0]);
  const [saving, setSaving] = useState(false);

  async function handleCreate() {
    if (!name.trim() || saving) return;
    setSaving(true);
    try {
      await insertRoom({ id: `room_${Date.now()}`, name: name.trim(), emoji });
      router.back();
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{t('add_room_title')}</Text>
        <View style={styles.backBtn} />
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.preview}>
          <Text style={styles.previewEmoji}>{emoji}</Text>
          <Text style={styles.previewName}>{name.trim() || t('add_room_title')}</Text>
        </View>
        <FormField label={t('room_name_label')}>
          <TextInput
            style={[styles.input, name.length > 0 && styles.inputFilled]}
            placeholder={t('room_name_placeholder')}
            placeholderTextColor={colors.ink4}
            value={name}
            onChangeText={setName}
            autoFocus
            autoCapitalize="words"
          />
        </FormField>
        <FormField label={t('room_emoji_label')}>
          <View style={styles.emojiGrid}>
            {ROOM_EMOJIS.map((e) => (
              <TouchableOpacity
                key={e}
                style={[styles.emojiCell, emoji === e && styles.emojiCellActive]}
                activeOpacity={0.75}
                onPress={() => setEmoji(e)}
              >
                <Text style={styles.emojiText}>{e}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </FormField>
      </ScrollView>
      <FormBottomBar
        onCancel={() => router.back()}
        onSubmit={handleCreate}
        submitLabel={t('add_room')}
        cancelLabel={tc('cancel')}
        loading={saving}
        disabled={!name.trim()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[5],
    paddingBottom: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: { fontSize: 18, color: colors.ink },
  title: {
    flex: 1,
    textAlign: 'center',
    fontFamily: fontFamily.bold,
    fontSize: 19,
    color: colors.ink,
  },
  scroll: { flex: 1 },
  content: { paddingHorizontal: spacing[7], paddingBottom: 20 },
  preview: { alignItems: 'center', gap: 8, marginBottom: 24 },
  previewEmoji: { fontSize: 56 },
  previewName: { fontFamily: fontFamily.bold, fontSize: 18, color: colors.ink },
  input: {
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: radius.sm,
    paddingVertical: 13,
    paddingHorizontal: 14,
    fontFamily: fontFamily.semiBold,
    fontSize: 15,
    color: colors.ink,
    backgroundColor: colors.white,
  },
  inputFilled: { borderColor: colors.primary },
  emojiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  emojiCell: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
  },
  emojiCellActive: { borderWidth: 2, borderColor: colors.ink, backgroundColor: colors.surface2 },
  emojiText: { fontSize: 28 },
});

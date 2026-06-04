// Add item to locator — name, emoji, location picker, category, visibility, notes.

import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { router, useLocalSearchParams } from 'expo-router';

import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FormBottomBar, FormField } from '@/components/forms';
import { Icon } from '@/components/icons/Icon';
import { LOCATOR_CATEGORIES } from '@/constants/locator';
import {
  getAllRooms,
  getSpotsForRoom,
  insertLocatedItem,
  type Room,
  type StorageSpot,
} from '@/db/modules/locator';
import { colors, fontFamily, radius, shadows, spacing } from '@/theme';

const ITEM_EMOJIS = ['📦', '🛂', '🔑', '💊', '🔌', '📄', '🧥', '🎁', '🔧', '💍', '📸', '🧸'];

interface ItemForm {
  name: string;
  emoji: string;
  spotId: string;
  roomId: string;
  category: string;
  notes: string;
  visibility: 'household' | 'just_me';
}

const INITIAL: ItemForm = {
  name: '',
  emoji: ITEM_EMOJIS[0],
  spotId: '',
  roomId: '',
  category: '',
  notes: '',
  visibility: 'household',
};

export default function NewItemScreen() {
  const { spotId: initSpot, roomId: initRoom } = useLocalSearchParams<{
    spotId?: string;
    roomId?: string;
  }>();
  const { t } = useTranslation('locator');
  const { t: tc } = useTranslation('common');
  const insets = useSafeAreaInsets();

  const [form, setForm] = useState<ItemForm>({
    ...INITIAL,
    spotId: initSpot ?? '',
    roomId: initRoom ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [spots, setSpots] = useState<StorageSpot[]>([]);
  const [locationSheet, setLocationSheet] = useState(false);
  const [step, setStep] = useState<'room' | 'spot'>('room');

  function update<K extends keyof ItemForm>(key: K, val: ItemForm[K]) {
    setForm((p) => ({ ...p, [key]: val }));
  }

  useEffect(() => {
    getAllRooms().then(setRooms);
  }, []);

  useEffect(() => {
    if (form.roomId) getSpotsForRoom(form.roomId).then(setSpots);
  }, [form.roomId]);

  const selectedRoom = rooms.find((r) => r.id === form.roomId);
  const selectedSpot = spots.find((s) => s.id === form.spotId);

  async function handleAdd() {
    if (!form.name.trim() || saving) return;
    setSaving(true);
    try {
      await insertLocatedItem({
        id: `item_${Date.now()}`,
        spot_id: form.spotId || undefined,
        name: form.name.trim(),
        category: form.category || undefined,
        emoji: form.emoji,
        notes: form.notes.trim() || undefined,
        visibility: form.visibility,
      });
      router.back();
    } finally {
      setSaving(false);
    }
  }

  function openRoomPicker() {
    setStep('room');
    setLocationSheet(true);
  }

  function pickRoom(r: Room) {
    update('roomId', r.id);
    update('spotId', '');
    setSpots([]);
    getSpotsForRoom(r.id).then((ss) => {
      setSpots(ss);
      setStep('spot');
    });
  }

  function pickSpot(s: StorageSpot) {
    update('spotId', s.id);
    setLocationSheet(false);
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
            activeOpacity={0.7}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('add_item')}</Text>
          <View style={styles.backBtn} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Emoji picker row */}
          <FormField label="Emoji">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.emojiRow}>
                {ITEM_EMOJIS.map((e) => (
                  <TouchableOpacity
                    key={e}
                    style={[styles.emojiCell, form.emoji === e && styles.emojiCellActive]}
                    activeOpacity={0.75}
                    onPress={() => update('emoji', e)}
                  >
                    <Text style={styles.emojiText}>{e}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </FormField>

          {/* Name */}
          <FormField label={t('item_title_label')}>
            <TextInput
              style={[styles.input, form.name.length > 0 && styles.inputFilled]}
              placeholder={t('item_placeholder')}
              placeholderTextColor={colors.ink4}
              value={form.name}
              onChangeText={(v) => update('name', v)}
              autoCapitalize="sentences"
              autoFocus
            />
          </FormField>

          {/* Location picker */}
          <FormField label={t('where_is_it')}>
            <TouchableOpacity
              style={styles.locationCard}
              activeOpacity={0.8}
              onPress={openRoomPicker}
            >
              <View style={styles.locRow}>
                <View style={styles.locIconBox}>
                  <Text style={styles.locIconEmoji}>{selectedRoom?.emoji ?? '🏠'}</Text>
                </View>
                <View style={styles.locText}>
                  <Text style={styles.locSublabel}>Room</Text>
                  <Text style={[styles.locValue, !selectedRoom && styles.locPlaceholder]}>
                    {selectedRoom?.name ?? t('pick_room')}
                  </Text>
                </View>
                <Icon.arrow size={16} color={colors.ink4} />
              </View>
              {selectedRoom && (
                <>
                  <View style={styles.locDivider} />
                  <TouchableOpacity
                    style={styles.locRow}
                    activeOpacity={0.8}
                    onPress={() => {
                      setStep('spot');
                      setLocationSheet(true);
                    }}
                  >
                    <View style={styles.locIconBox}>
                      <Text style={styles.locIconEmoji}>{selectedSpot?.emoji ?? '📦'}</Text>
                    </View>
                    <View style={styles.locText}>
                      <Text style={styles.locSublabel}>Spot</Text>
                      <Text style={[styles.locValue, !selectedSpot && styles.locPlaceholder]}>
                        {selectedSpot?.name ?? t('pick_spot')}
                      </Text>
                    </View>
                    <Icon.arrow size={16} color={colors.ink4} />
                  </TouchableOpacity>
                </>
              )}
            </TouchableOpacity>
          </FormField>

          {/* Category */}
          <FormField label={t('category_label')}>
            <View style={styles.catGrid}>
              {LOCATOR_CATEGORIES.map((c) => {
                const active = form.category === c.id;
                return (
                  <TouchableOpacity
                    key={c.id}
                    style={[
                      styles.catBtn,
                      {
                        backgroundColor: active ? c.color : c.soft,
                        borderColor: active ? c.color : 'transparent',
                      },
                    ]}
                    activeOpacity={0.75}
                    onPress={() => update('category', active ? '' : c.id)}
                  >
                    <Text style={styles.catEmoji}>{c.emoji}</Text>
                    <Text
                      style={[styles.catLabel, { color: active ? colors.white : c.color }]}
                      numberOfLines={1}
                    >
                      {c.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </FormField>

          {/* Visibility */}
          <FormField label={t('who_can_see')}>
            <View style={styles.visRow}>
              {(['household', 'just_me'] as const).map((v) => {
                const active = form.visibility === v;
                const label = v === 'household' ? t('visibility_everyone') : t('visibility_me');
                const sub =
                  v === 'household' ? t('visibility_everyone_sub') : t('visibility_me_sub');
                const icon = v === 'household' ? '🏠' : '🔒';
                return (
                  <TouchableOpacity
                    key={v}
                    style={[styles.visCard, active && styles.visCardActive]}
                    activeOpacity={0.75}
                    onPress={() => update('visibility', v)}
                  >
                    <Text style={styles.visIcon}>{icon}</Text>
                    <Text style={[styles.visLabel, active && styles.visLabelActive]}>{label}</Text>
                    <Text style={styles.visSub}>{sub}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </FormField>

          {/* Notes */}
          <FormField label={t('notes_label')}>
            <TextInput
              style={[styles.input, styles.notesInput, form.notes.length > 0 && styles.inputFilled]}
              placeholder={t('notes_placeholder')}
              placeholderTextColor={colors.ink4}
              value={form.notes}
              onChangeText={(v) => update('notes', v)}
              multiline
              numberOfLines={3}
              autoCapitalize="sentences"
            />
          </FormField>
        </ScrollView>

        <FormBottomBar
          onCancel={() => router.back()}
          onSubmit={handleAdd}
          submitLabel={t('add_to_locator')}
          cancelLabel={tc('cancel')}
          loading={saving}
          disabled={!form.name.trim()}
        />
      </View>

      {/* Location picker sheet */}
      <Modal
        transparent
        visible={locationSheet}
        animationType="slide"
        onRequestClose={() => setLocationSheet(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setLocationSheet(false)} />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.grabber} />
          <Text style={styles.sheetTitle}>{step === 'room' ? t('pick_room') : t('pick_spot')}</Text>
          <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 320 }}>
            {step === 'room'
              ? rooms.map((r) => (
                  <TouchableOpacity
                    key={r.id}
                    style={styles.pickRow}
                    activeOpacity={0.75}
                    onPress={() => pickRoom(r)}
                  >
                    <Text style={styles.pickEmoji}>{r.emoji}</Text>
                    <Text style={styles.pickLabel}>{r.name}</Text>
                    {form.roomId === r.id && <Icon.check size={18} color={colors.primary} />}
                  </TouchableOpacity>
                ))
              : spots.map((s) => (
                  <TouchableOpacity
                    key={s.id}
                    style={styles.pickRow}
                    activeOpacity={0.75}
                    onPress={() => pickSpot(s)}
                  >
                    <Text style={styles.pickEmoji}>{s.emoji}</Text>
                    <Text style={styles.pickLabel}>{s.name}</Text>
                    {form.spotId === s.id && <Icon.check size={18} color={colors.primary} />}
                  </TouchableOpacity>
                ))}
          </ScrollView>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
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
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: fontFamily.bold,
    fontSize: 19,
    color: colors.ink,
  },
  scroll: { flex: 1 },
  content: { paddingHorizontal: spacing[7], paddingBottom: 20 },
  emojiRow: { flexDirection: 'row', gap: 8 },
  emojiCell: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiCellActive: { borderWidth: 2, borderColor: colors.ink, backgroundColor: colors.surface2 },
  emojiText: { fontSize: 26 },
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
  notesInput: { height: 90, textAlignVertical: 'top' },
  locationCard: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: 'hidden',
  },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14 },
  locIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locIconEmoji: { fontSize: 16 },
  locText: { flex: 1 },
  locSublabel: {
    fontFamily: fontFamily.bold,
    fontSize: 10,
    color: colors.ink3,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  locValue: { fontFamily: fontFamily.bold, fontSize: 14, color: colors.ink, marginTop: 1 },
  locPlaceholder: { color: colors.ink4, fontFamily: fontFamily.regular },
  locDivider: { height: 1, backgroundColor: colors.line2, marginHorizontal: 14 },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  catEmoji: { fontSize: 14 },
  catLabel: { fontFamily: fontFamily.semiBold, fontSize: 12 },
  visRow: { flexDirection: 'row', gap: 10 },
  visCard: {
    flex: 1,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
  },
  visCardActive: { borderWidth: 1.5, borderColor: colors.ink, backgroundColor: colors.surface2 },
  visIcon: { fontSize: 22, marginBottom: 4 },
  visLabel: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.ink2 },
  visLabelActive: { color: colors.ink },
  visSub: { fontFamily: fontFamily.regular, fontSize: 11, color: colors.ink3, marginTop: 1 },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(20,22,30,0.45)' },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing[7],
    paddingTop: spacing[5],
    ...shadows.sh3,
  },
  grabber: {
    width: 36,
    height: 5,
    backgroundColor: colors.ink4,
    opacity: 0.4,
    borderRadius: 3,
    marginBottom: 16,
  },
  sheetTitle: { fontFamily: fontFamily.bold, fontSize: 17, color: colors.ink, marginBottom: 12 },
  pickRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: colors.line2,
  },
  pickEmoji: { fontSize: 22, width: 30, textAlign: 'center' },
  pickLabel: { flex: 1, fontFamily: fontFamily.semiBold, fontSize: 15, color: colors.ink },
});

// Edit located item — pre-filled form + delete confirm sheet.

import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
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
  deleteLocatedItem,
  getAllRooms,
  getItemById,
  getSpotsForRoom,
  type LocatedItemWithPath,
  type Room,
  type StorageSpot,
  updateLocatedItem,
} from '@/db/modules/locator';
import { colors, fontFamily, fontSize, radius, shadows, spacing } from '@/theme';

const ITEM_EMOJIS = ['📦', '🛂', '🔑', '💊', '🔌', '📄', '🧥', '🎁', '🔧', '💍', '📸', '🧸'];

export default function EditItemScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation('locator');
  const { t: tc } = useTranslation('common');
  const insets = useSafeAreaInsets();

  const [_original, setOriginal] = useState<LocatedItemWithPath | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState(ITEM_EMOJIS[0]);
  const [spotId, setSpotId] = useState('');
  const [roomId, setRoomId] = useState('');
  const [category, setCategory] = useState('');
  const [notes, setNotes] = useState('');
  const [visibility, setVisibility] = useState<'household' | 'just_me'>('household');
  const [saving, setSaving] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [spots, setSpots] = useState<StorageSpot[]>([]);
  const [locationSheet, setLocationSheet] = useState(false);
  const [step, setStep] = useState<'room' | 'spot'>('room');

  useEffect(() => {
    if (!id) return;
    Promise.all([getItemById(id), getAllRooms()]).then(([item, allRooms]) => {
      if (!item) return;
      setOriginal(item);
      setName(item.name);
      setEmoji(item.emoji);
      setCategory(item.category ?? '');
      setNotes(item.notes ?? '');
      setVisibility(item.visibility);
      setRooms(allRooms);
      if (item.spot_id) {
        setSpotId(item.spot_id);
        // find room_id from spot
        const spot = allRooms.find((r) => r.id === 'noop'); // placeholder
        void spot;
        // Load spots for the item's room using room_name is not enough; we need room_id from spot join
        // We'll derive from item's room path — need to find which room contains this spot
        allRooms.forEach((r) => {
          getSpotsForRoom(r.id).then((ss) => {
            if (ss.some((s) => s.id === item.spot_id)) {
              setRoomId(r.id);
              setSpots(ss);
            }
          });
        });
      }
      setLoading(false);
    });
  }, [id]);

  const selectedRoom = rooms.find((r) => r.id === roomId);
  const selectedSpot = spots.find((s) => s.id === spotId);

  function pickRoom(r: Room) {
    setRoomId(r.id);
    setSpotId('');
    getSpotsForRoom(r.id).then((ss) => {
      setSpots(ss);
      setStep('spot');
    });
  }
  function pickSpot(s: StorageSpot) {
    setSpotId(s.id);
    setLocationSheet(false);
  }

  async function handleSave() {
    if (!name.trim() || saving || !id) return;
    setSaving(true);
    try {
      await updateLocatedItem(id, {
        name: name.trim(),
        emoji,
        spot_id: spotId || null,
        category: category || null,
        notes: notes.trim() || null,
        visibility,
      });
      router.back();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!id) return;
    setDeleteVisible(false);
    await deleteLocatedItem(id);
    router.back();
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
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
            <Icon.arrowLeft size={20} color={colors.ink} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('edit_item')}</Text>
          <View style={styles.backBtn} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <FormField label="Emoji">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.emojiRow}>
                {ITEM_EMOJIS.map((e) => (
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
            </ScrollView>
          </FormField>

          <FormField label={t('item_title_label')}>
            <TextInput
              style={[styles.input, name.length > 0 && styles.inputFilled]}
              placeholderTextColor={colors.ink4}
              value={name}
              onChangeText={setName}
              autoCapitalize="sentences"
            />
          </FormField>

          <FormField label={t('where_is_it')}>
            <TouchableOpacity
              style={styles.locationCard}
              activeOpacity={0.8}
              onPress={() => {
                setStep('room');
                setLocationSheet(true);
              }}
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

          <FormField label={t('category_label')}>
            <View style={styles.catGrid}>
              {LOCATOR_CATEGORIES.map((c) => {
                const active = category === c.id;
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
                    onPress={() => setCategory(active ? '' : c.id)}
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

          <FormField label={t('who_can_see')}>
            <View style={styles.visRow}>
              {(['household', 'just_me'] as const).map((v) => {
                const active = visibility === v;
                return (
                  <TouchableOpacity
                    key={v}
                    style={[styles.visCard, active && styles.visCardActive]}
                    activeOpacity={0.75}
                    onPress={() => setVisibility(v)}
                  >
                    <Text style={styles.visIcon}>{v === 'household' ? '🏠' : '🔒'}</Text>
                    <Text style={[styles.visLabel, active && styles.visLabelActive]}>
                      {v === 'household' ? t('visibility_everyone') : t('visibility_me')}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </FormField>

          <FormField label={t('notes_label')}>
            <TextInput
              style={[styles.input, styles.notesInput, notes.length > 0 && styles.inputFilled]}
              placeholder={t('notes_placeholder')}
              placeholderTextColor={colors.ink4}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
              autoCapitalize="sentences"
            />
          </FormField>

          <TouchableOpacity
            style={styles.deleteBtn}
            activeOpacity={0.8}
            onPress={() => setDeleteVisible(true)}
          >
            <Icon.trash size={18} color={colors.rose} />
            <Text style={styles.deleteBtnLabel}>{t('delete_item')}</Text>
          </TouchableOpacity>
        </ScrollView>

        <FormBottomBar
          onCancel={() => router.back()}
          onSubmit={handleSave}
          submitLabel={t('save_changes')}
          cancelLabel={tc('cancel')}
          loading={saving}
          disabled={!name.trim()}
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
                    {roomId === r.id && <Icon.check size={18} color={colors.primary} />}
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
                    {spotId === s.id && <Icon.check size={18} color={colors.primary} />}
                  </TouchableOpacity>
                ))}
          </ScrollView>
        </View>
      </Modal>

      {/* Delete confirm */}
      <Modal
        transparent
        visible={deleteVisible}
        animationType="slide"
        onRequestClose={() => setDeleteVisible(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setDeleteVisible(false)} />
        <View style={styles.deleteSheet}>
          <View style={styles.grabber} />
          <View style={styles.deleteIcon}>
            <Icon.trash size={24} color={colors.rose} />
          </View>
          <Text style={styles.deleteTitle}>{t('delete_item_title')}</Text>
          <Text style={styles.deleteBody}>{t('delete_item_body')}</Text>
          <TouchableOpacity
            style={styles.deleteConfirmBtn}
            activeOpacity={0.85}
            onPress={handleDelete}
          >
            <Text style={styles.deleteConfirmLabel}>{t('delete_confirm')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cancelBtn}
            activeOpacity={0.8}
            onPress={() => setDeleteVisible(false)}
          >
            <Text style={styles.cancelLabel}>{tc('cancel')}</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
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
  deleteBtn: {
    height: 52,
    borderRadius: radius.pill,
    backgroundColor: colors.roseSoft,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  deleteBtnLabel: { fontFamily: fontFamily.bold, fontSize: fontSize.cardTitle, color: colors.rose },
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
  deleteSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing[7],
    paddingTop: spacing[5],
    paddingBottom: 32,
    alignItems: 'center',
    ...shadows.sh3,
  },
  deleteIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.roseSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  deleteTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 19,
    color: colors.ink,
    textAlign: 'center',
    marginBottom: 6,
  },
  deleteBody: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.body,
    color: colors.ink2,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  deleteConfirmBtn: {
    width: '100%',
    height: 52,
    borderRadius: radius.pill,
    backgroundColor: colors.rose,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  deleteConfirmLabel: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.cardTitle,
    color: colors.white,
  },
  cancelBtn: { height: 48, width: '100%', alignItems: 'center', justifyContent: 'center' },
  cancelLabel: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.cardTitle,
    color: colors.ink3,
  },
});

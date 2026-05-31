// Shopping list detail — items grouped by category with check-off, quick-add, filter.

import { useCallback, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, SectionList, StyleSheet, View } from 'react-native';

import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';

import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState, ErrorState } from '@/components/shared';
import {
  CategoryFilter,
  ItemCategoryHeader,
  ItemDeleteSheet,
  ListSummaryCard,
  QuickAddBar,
  ShoppingItemRow,
} from '@/components/shopping';
import { FAB, ScreenHeader } from '@/components/ui';
import { detectCategory } from '@/constants/shopping';
import {
  clearDoneItems,
  deleteItem,
  getItemsForList,
  getListById,
  groupItemsByCategory,
  insertItem,
  type ShoppingItem,
  type ShoppingList,
  toggleItem,
} from '@/db/modules/shopping';
import { colors } from '@/theme';

export default function ListDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation('shopping');
  const insets = useSafeAreaInsets();

  const [list, setList] = useState<ShoppingList | null>(null);
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [catFilter, setCatFilter] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<ShoppingItem | null>(null);

  const hasFocused = useRef(false);

  const loadData = useCallback(async () => {
    if (!id) return;
    try {
      const [listData, itemData] = await Promise.all([getListById(id), getItemsForList(id)]);
      setList(listData);
      setItems(itemData);
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      if (!hasFocused.current) {
        hasFocused.current = true;
        loadData();
      } else {
        loadData();
      }
    }, [loadData])
  );

  const handleToggle = useCallback(async (itemId: string, done: boolean) => {
    setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, done } : i)));
    try {
      await toggleItem(itemId, done);
    } catch {
      setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, done: !done } : i)));
    }
  }, []);

  const handleQuickAdd = useCallback(
    async (name: string, quantity: number, unit: string) => {
      if (!id) return;
      const newItem: ShoppingItem = {
        id: `item_${Date.now()}`,
        list_id: id,
        name,
        quantity,
        unit,
        category: detectCategory(name),
        done: false,
        urgent: false,
        created_at: new Date().toISOString(),
      };
      setItems((prev) => [...prev, newItem]);
      try {
        await insertItem({ ...newItem, urgent: false });
      } catch {
        setItems((prev) => prev.filter((i) => i.id !== newItem.id));
      }
    },
    [id]
  );

  const handleRemoveItem = async () => {
    if (!deleteTarget) return;
    setItems((prev) => prev.filter((i) => i.id !== deleteTarget.id));
    setDeleteTarget(null);
    await deleteItem(deleteTarget.id);
  };

  const handleMarkDoneInstead = async () => {
    if (!deleteTarget) return;
    const { id: itemId } = deleteTarget;
    setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, done: true } : i)));
    setDeleteTarget(null);
    await toggleItem(itemId, true);
  };

  const handleClearDone = async () => {
    if (!id) return;
    setItems((prev) => prev.filter((i) => !i.done));
    await clearDoneItems(id);
  };

  // Category counts for filter chips
  const catCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of items) {
      const cat = item.category ?? 'other';
      map.set(cat, (map.get(cat) ?? 0) + 1);
    }
    return Array.from(map.entries()).map(([category, total]) => ({ category, total }));
  }, [items]);

  // Filtered + grouped items
  const sections = useMemo(() => {
    const filtered = catFilter ? items.filter((i) => i.category === catFilter) : items;
    return groupItemsByCategory(filtered).map(({ category, data }) => ({
      key: category,
      title: category,
      data,
    }));
  }, [items, catFilter]);

  const totalItems = items.length;
  const doneItems = items.filter((i) => i.done).length;

  if (loading) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ScreenHeader title="Shopping" onBack={() => router.back()} />
        <ErrorState title={t('error_title')} retryLabel={t('error_retry')} onRetry={loadData} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader title={list?.name ?? 'Shopping'} onBack={() => router.back()} />

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
        ListHeaderComponent={
          <>
            <ListSummaryCard
              total={totalItems}
              done={doneItems}
              onClearDone={doneItems > 0 ? handleClearDone : undefined}
            />
            <QuickAddBar onAdd={handleQuickAdd} />
            {catCounts.length > 0 && (
              <CategoryFilter
                active={catFilter}
                counts={catCounts}
                totalCount={totalItems}
                onChange={setCatFilter}
              />
            )}
          </>
        }
        renderSectionHeader={({ section }) => (
          <ItemCategoryHeader category={section.title} count={section.data.length} />
        )}
        renderItem={({ item }) => (
          <ShoppingItemRow
            item={item}
            onToggle={handleToggle}
            onPress={(itemId) => router.push(`/shopping/item/${itemId}/edit` as never)}
          />
        )}
        ListEmptyComponent={
          <EmptyState emoji="🛍️" title={t('empty_items_title')} body={t('empty_items_body')} />
        }
        ListFooterComponent={<View style={styles.footer} />}
        contentContainerStyle={totalItems === 0 ? styles.emptyContainer : undefined}
      />

      <FAB
        label={t('add_item')}
        onPress={() => router.push(`/shopping/item/new?listId=${id}` as never)}
      />

      <ItemDeleteSheet
        visible={deleteTarget !== null}
        itemName={deleteTarget?.name ?? ''}
        listName={list?.name ?? ''}
        onRemove={handleRemoveItem}
        onMarkDone={handleMarkDoneInstead}
        onCancel={() => setDeleteTarget(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  emptyContainer: { flex: 1 },
  footer: { height: 100 },
});

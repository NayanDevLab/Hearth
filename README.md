# Hearth — Household Management App

> **"Your home, in sync."** A production-grade, offline-first React Native app for Indian household management. Chores, shopping, bills, meals, maintenance — one app for the whole family.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Getting Started](#getting-started)
3. [Project Architecture](#project-architecture)
4. [Folder & File Structure](#folder--file-structure)
5. [Design System & Theme](#design-system--theme)
6. [Shared Components](#shared-components)
7. [Shared Hooks & Utilities](#shared-hooks--utilities)
8. [Database (SQLite)](#database-sqlite)
9. [Internationalisation (i18n)](#internationalisation-i18n)
10. [State Management Patterns](#state-management-patterns)
11. [Code Quality — ESLint & Prettier](#code-quality--eslint--prettier)
12. [Adding a New Screen](#adding-a-new-screen)
13. [Adding a New Component](#adding-a-new-component)
14. [Feature Phase Map](#feature-phase-map)
15. [Contributing Guidelines](#contributing-guidelines)

---

## Tech Stack

| Layer       | Technology                                                                                               |
| ----------- | -------------------------------------------------------------------------------------------------------- |
| Framework   | [Expo SDK 56](https://expo.dev) + [React Native 0.85](https://reactnative.dev)                           |
| Routing     | [Expo Router v3](https://expo.github.io/router) (file-based)                                             |
| Language    | TypeScript (strict mode)                                                                                 |
| Database    | [expo-sqlite](https://docs.expo.dev/versions/latest/sdk/sqlite/) — fully offline, no backend             |
| Styling     | React Native `StyleSheet` + design tokens from `src/theme/`                                              |
| Animations  | [React Native Reanimated 4](https://docs.swmansion.com/react-native-reanimated/)                         |
| i18n        | [i18next](https://www.i18next.com/) + react-i18next                                                      |
| Preferences | [@react-native-async-storage/async-storage](https://react-native-async-storage.github.io/async-storage/) |
| Fonts       | [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans) via `@expo-google-fonts`        |

---

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server (also regenerates typed routes)
npx expo start

# 3. Open on device / emulator
# Press 'a' for Android, 'i' for iOS, 'w' for web
```

### Available Scripts

| Command                | Description                         |
| ---------------------- | ----------------------------------- |
| `npm run start`        | Start Expo dev server               |
| `npm run android`      | Run on Android emulator             |
| `npm run ios`          | Run on iOS simulator                |
| `npm run lint`         | Run ESLint across the whole project |
| `npm run lint:fix`     | Auto-fix all fixable lint issues    |
| `npm run format`       | Prettier-format all files           |
| `npm run format:check` | Check formatting without writing    |
| `npm run type-check`   | TypeScript type check (no emit)     |

---

## Project Architecture

```
┌─────────────────────────────────────────────────┐
│                   Expo Router                   │  ← File-based routing
│  app/(onboarding)/   app/(tabs)/   app/task/    │
├─────────────────────────────────────────────────┤
│              React Components                   │
│  src/components/                                │
│    ui/        → Design-system primitives        │
│    forms/     → Reusable form building blocks   │
│    shared/    → Cross-feature UX patterns       │
│    tasks/     → Task feature components         │
│    shopping/  → Shopping feature components     │
│    dashboard/ → Dashboard widgets               │
├─────────────────────────────────────────────────┤
│              Business Logic                     │
│  src/hooks/   → Custom React hooks              │
│  src/utils/   → Pure utility functions          │
│  src/constants/tasks.ts | shopping.ts           │
├─────────────────────────────────────────────────┤
│              Data Layer                         │
│  src/db/       → SQLite (expo-sqlite)           │
│  src/storage/  → AsyncStorage preferences       │
├─────────────────────────────────────────────────┤
│              Design Tokens                      │
│  src/theme/    → colors, typography, spacing    │
├─────────────────────────────────────────────────┤
│              Localisation                       │
│  src/i18n/     → i18next + en / hi / gu         │
└─────────────────────────────────────────────────┘
```

---

## Folder & File Structure

```
hearth/
├── app/                          ← All screens (Expo Router)
│   ├── _layout.tsx               ← Root: font loading, DB init, i18n init
│   ├── (onboarding)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx             ← Splash screen (SP1 warm minimal)
│   │   ├── language.tsx          ← Language picker (first launch)
│   │   ├── onboard.tsx           ← 4-screen onboarding slides
│   │   └── setup.tsx             ← Name + household setup
│   ├── (tabs)/
│   │   ├── _layout.tsx           ← Tab bar configuration
│   │   ├── index.tsx             ← Dashboard / Home
│   │   ├── tasks.tsx             ← Chores & Tasks list
│   │   ├── list.tsx              ← Shopping lists home
│   │   ├── calendar.tsx          ← Calendar (Phase 6)
│   │   └── more.tsx              ← Settings (Phase 13)
│   ├── task/
│   │   ├── _layout.tsx
│   │   ├── new.tsx               ← Create task form
│   │   └── [id]/
│   │       ├── index.tsx         ← Task detail
│   │       └── edit.tsx          ← Edit task form
│   └── shopping/
│       ├── _layout.tsx
│       ├── [id].tsx              ← Shopping list detail
│       └── item/
│           ├── _layout.tsx
│           ├── new.tsx           ← Add item form
│           └── [itemId]/
│               └── edit.tsx      ← Edit item form
│
├── src/
│   ├── theme/
│   │   ├── colors.ts             ← 25 color tokens (hex)
│   │   ├── typography.ts         ← Font family, 9-step font scale
│   │   ├── spacing.ts            ← Spacing scale, radii, shadows
│   │   └── index.ts              ← Re-exports
│   │
│   ├── components/
│   │   ├── ui/                   ← Design-system primitives
│   │   │   ├── Avatar.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Chip.tsx
│   │   │   ├── FAB.tsx
│   │   │   ├── MemberSelector.tsx ← ⭐ shared assignee picker
│   │   │   ├── ScreenHeader.tsx
│   │   │   ├── SectionTitle.tsx
│   │   │   ├── TutorialSheet.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── forms/                ← Reusable form building blocks
│   │   │   ├── FormBottomBar.tsx  ← ⭐ Cancel + CTA sticky bar
│   │   │   ├── FormField.tsx      ← ⭐ Label + content group
│   │   │   ├── PickerRow.tsx      ← ⭐ Icon + label + value + arrow
│   │   │   ├── SimplePickerSheet.tsx ← ⭐ Options bottom sheet
│   │   │   └── index.ts
│   │   │
│   │   ├── shared/               ← Cross-feature UX patterns
│   │   │   ├── EmptyState.tsx     ← ⭐ Emoji + title + CTA
│   │   │   ├── ErrorState.tsx     ← ⭐ Error + retry
│   │   │   ├── ShimmerBox.tsx     ← ⭐ Skeleton loading animation
│   │   │   └── index.ts
│   │   │
│   │   ├── icons/
│   │   │   └── Icon.tsx           ← 30 custom SVG line icons
│   │   │
│   │   ├── illustrations/         ← Onboarding SVG illustrations
│   │   │   ├── Logo.tsx
│   │   │   ├── IllusHome.tsx
│   │   │   ├── IllusOrganize.tsx
│   │   │   ├── IllusFamily.tsx
│   │   │   └── IllusReminders.tsx
│   │   │
│   │   ├── dashboard/            ← Dashboard-specific widgets
│   │   ├── tasks/                ← Task feature components
│   │   └── shopping/             ← Shopping feature components
│   │
│   ├── hooks/
│   │   ├── useFocusRefresh.ts    ← ⭐ Reload on screen focus
│   │   └── index.ts
│   │
│   ├── utils/
│   │   ├── dateFormat.ts         ← ⭐ formatFullDate, formatDateWithTime…
│   │   └── index.ts
│   │
│   ├── constants/
│   │   ├── tasks.ts              ← HOUSEHOLD_MEMBERS, CATEGORIES, getPriorityOptions()…
│   │   └── shopping.ts           ← SHOPPING_CATEGORIES, ShoppingFormFields, itemToForm()…
│   │
│   ├── db/
│   │   ├── index.ts              ← initDb(), getDb()
│   │   ├── schema.ts             ← All CREATE TABLE statements + DB_VERSION
│   │   ├── migrations/
│   │   │   ├── v1_init.ts
│   │   │   ├── v2_tasks_enhanced.ts
│   │   │   └── v3_shopping_enhanced.ts
│   │   └── modules/
│   │       ├── tasks.ts          ← Task CRUD + filter queries
│   │       ├── bills.ts
│   │       ├── shopping.ts       ← Shopping list + item CRUD
│   │       ├── pantry.ts
│   │       ├── locator.ts
│   │       ├── meals.ts
│   │       └── maintenance.ts
│   │
│   ├── storage/
│   │   ├── keys.ts               ← AsyncStorage key constants
│   │   └── prefs.ts              ← Typed preference helpers
│   │
│   ├── i18n/
│   │   ├── index.ts              ← initI18n(), LANGUAGE_META
│   │   └── locales/
│   │       ├── en/               ← English (default)
│   │       ├── hi/               ← Hindi
│   │       └── gu/               ← Gujarati
│   │           common.json | onboarding.json | dashboard.json | tasks.json | shopping.json
│   │
│   └── styles/
│       └── global.css            ← Tailwind/NativeWind base (minimal usage)
│
├── design/                       ← Source design files (HTML/JSX mockups)
├── assets/                       ← Images, fonts, icons
├── eslint.config.js
├── tailwind.config.js
├── tsconfig.json
└── app.json
```

---

## Design System & Theme

All visual tokens live in `src/theme/`. **Never hardcode colors, font sizes, or spacing** directly in components.

### Colors — `src/theme/colors.ts`

```typescript
import { colors } from '@/theme';

// Brand
colors.primary; // #C96B50  terracotta — buttons, active states
colors.primarySoft; // #F5E4DB  light peach — soft fills
colors.primaryInk; // #7A3A26  dark terracotta — text on soft surfaces

// Semantic accents (always pair color + soft variant)
colors.mint / colors.mintSoft; // success, done
colors.butter / colors.butterSoft; // warning, expiring
colors.rose / colors.roseSoft; // danger, overdue
colors.sky / colors.skySoft; // info, calendar
colors.lilac / colors.lilacSoft; // identity, social
```

### Typography — `src/theme/typography.ts`

```typescript
import { fontFamily, fontSize, letterSpacing } from '@/theme';

fontFamily.extraBold; // 800 weight — display titles
fontFamily.bold; // 700 — headings, labels
fontFamily.semiBold; // 600 — body emphasis, chips
fontFamily.medium; // 500 — meta, captions
fontFamily.regular; // 400 — body copy

fontSize.display; // 40px  hero titles
fontSize.screenTitle; // 26px  screen headings
fontSize.cardTitle; // 16px  card/section titles
fontSize.body; // 14px  default body text
fontSize.meta; // 12px  captions, timestamps
fontSize.caption; // 11px  uppercase labels
```

### Spacing & Radii — `src/theme/spacing.ts`

```typescript
import { spacing, radius, shadows } from '@/theme';

spacing[7]; // 22px — screen horizontal padding
spacing[5]; // 14px — card internal padding
spacing[4]; // 12px — row gaps

radius.pill; // 9999 — buttons, chips
radius.lg; // 20px — cards
radius.sm; // 12px — inputs, small cards

shadows.sh1; // card shadow
shadows.sh2; // floating button shadow
shadows.cta; // primary CTA glow (terracotta)
```

---

## Shared Components

### UI Primitives — `src/components/ui/`

Always import from the barrel:

```typescript
import {
  Avatar,
  Badge,
  Button,
  Chip,
  FAB,
  MemberSelector,
  ScreenHeader,
  SectionTitle,
  TutorialSheet,
} from '@/components/ui';
```

| Component                                                                    | Props                                 | Use case |
| ---------------------------------------------------------------------------- | ------------------------------------- | -------- |
| `<Button variant="accent\|primary\|soft\|ghost\|destructive" label loading>` | CTA buttons everywhere                |
| `<Avatar initial color size ring>`                                           | Member circle avatars                 |
| `<Badge label variant="success\|warning\|danger\|info">`                     | Status pills                          |
| `<Chip label active activeColor>`                                            | Filter chips                          |
| `<FAB label icon onPress>`                                                   | Floating action button                |
| `<MemberSelector selected onChange anyoneLabel>`                             | ⭐ Assignee picker (tasks + shopping) |
| `<ScreenHeader title showBack onBack onTutorial right>`                      | All feature screen headers            |
| `<SectionTitle title count hint onHint>`                                     | Section headers                       |
| `<TutorialSheet steps visible onClose>`                                      | 3-step tutorial overlay               |

### Form Building Blocks — `src/components/forms/`

```typescript
import { FormBottomBar, FormField, PickerRow, SimplePickerSheet } from '@/components/forms';
```

Use these in **every** form screen:

```tsx
// Wrap each field group
<FormField label={t('field_label')}>
  <TextInput ... />
</FormField>

// Picker row (due date, repeats, reminder)
<PickerRow
  icon={<Icon.calendar size={18} color={colors.ink3} />}
  label="Due"
  value={dueDate ? formatPickerLabel(dueDate) : 'Pick a date'}
  subtle={!dueDate}
  onPress={openDatePicker}
/>

// Options sheet (opens at bottom of screen)
{showPicker && (
  <SimplePickerSheet
    title="Repeats"
    options={[{ value: 'daily', label: 'Daily' }, ...]}
    selected={recurrence}
    onSelect={(v) => setRecurrence(v)}
    onClose={() => setShowPicker(false)}
  />
)}

// Sticky bottom bar with Cancel + CTA
<FormBottomBar
  onCancel={() => router.back()}
  onSubmit={handleSave}
  submitLabel={t('save')}
  cancelLabel={t('cancel')}
  loading={saving}
  disabled={!isValid}
/>
```

### Shared UX Patterns — `src/components/shared/`

```typescript
import { EmptyState, ErrorState, ShimmerBox, ShimmerRow } from '@/components/shared';

// Empty list
<EmptyState emoji="✅" title="All clear!" body="No tasks today." ctaLabel="Add one" onCta={...} />

// Error with retry
<ErrorState title="Couldn't load" retryLabel="Try again" onRetry={reload} />

// Shimmer skeleton while loading
{loading && <ShimmerRow />}        // full shimmer row
{loading && <ShimmerBox width={120} height={14} />}  // custom shape
```

---

## Shared Hooks & Utilities

### `useFocusRefresh` — `src/hooks/useFocusRefresh.ts`

Use on **every list/tab screen** to reload data when navigating back from a create/edit screen.

```typescript
import { useFocusRefresh } from '@/hooks';

// In your screen component:
const load = useCallback(() => loadData(false), []); // shimmer on first visit
const refresh = useCallback(() => loadData(true), []); // quiet RefreshControl on return

useFocusRefresh(load, refresh);
```

### Date Formatting — `src/utils/dateFormat.ts`

```typescript
import {
  formatFullDate,
  formatDateWithTime,
  formatPickerLabel,
  formatShortDate,
  formatTime,
} from '@/utils';

formatFullDate('2026-03-05T10:00:00Z'); // "Mar 5, 2026"
formatShortDate('2026-03-05T10:00:00Z'); // "Mar 5"
formatDateWithTime('2026-03-05T10:00:00Z'); // "Mar 5, 10:00 AM"
formatPickerLabel(new Date()); // "Mar 5 · 10:00 AM"
```

### Task & Shopping Constants

```typescript
import {
  HOUSEHOLD_MEMBERS,
  CATEGORIES,
  getPriorityOptions,
  REPEAT_OPTIONS,
  REMINDER_OPTIONS,
} from '@/constants/tasks';
import {
  SHOPPING_CATEGORIES,
  SHOPPING_UNITS,
  ShoppingFormFields,
  INITIAL_SHOPPING_FORM,
  itemToForm,
} from '@/constants/shopping';

// Priority options with translations (use in task forms)
const priorityOpts = getPriorityOptions(t); // pass the t() function from useTranslation

// Pre-built form state for shopping items
const [form, setForm] = useState<ShoppingFormFields>(INITIAL_SHOPPING_FORM);

// Convert DB row to form fields (edit screen)
setForm(itemToForm(existingItem));
```

### Form State Pattern

Use a **single state object** for all form fields (never one `useState` per field):

```typescript
interface FormFields {
  title: string;
  category: string | null;
  assignee: string | null;
  // ... all form fields
}

const [form, setForm] = useState<FormFields>(INITIAL_FORM);

// One generic updater — type-safe, works for any field
function update<K extends keyof FormFields>(key: K, value: FormFields[K]) {
  setForm(prev => ({ ...prev, [key]: value }));
}

// Usage in JSX
<TextInput value={form.title} onChangeText={(v) => update('title', v)} />
<MemberSelector selected={form.assignee} onChange={(v) => update('assignee', v)} />
```

---

## Database (SQLite)

All data lives locally on-device via `expo-sqlite`. No backend required.

### Accessing the DB

```typescript
import { getDb } from '@/db';

const db = getDb(); // always call initDb() first (done in app/_layout.tsx)
const rows = await db.getAllAsync<MyType>('SELECT * FROM table WHERE id = ?;', [id]);
```

### DB Module Pattern

Each feature has its own module in `src/db/modules/`:

```typescript
// src/db/modules/tasks.ts
export async function getAllTasks(): Promise<Task[]> { ... }
export async function insertTask(task: CreateTaskInput): Promise<void> { ... }
export async function updateTask(id: string, fields: Partial<Task>): Promise<void> { ... }
export async function deleteTask(id: string): Promise<void> { ... }
```

### Adding a Migration

1. Bump `DB_VERSION` in `src/db/schema.ts`
2. Create `src/db/migrations/vN_description.ts`
3. Register it in `src/db/index.ts`:

```typescript
if (currentVersion < N) {
  await migrateVN(db);
}
```

> **Rule:** Use `ALTER TABLE ... ADD COLUMN` with a `try/catch` (idempotent). Never drop or rename columns in a migration — add new ones instead.

### SQLite Boolean Gotcha

SQLite stores booleans as integers (0/1). Always cast when reading:

```typescript
// In your DB module query function:
function castItem(row: MyItem): MyItem {
  return { ...row, done: Boolean(row.done), urgent: Boolean(row.urgent) };
}
```

---

## Internationalisation (i18n)

The app supports **English (en)**, **Hindi (hi)**, and **Gujarati (gu)**.

### Namespaces

Each feature has its own translation file:

| Namespace    | File              | Covers                                 |
| ------------ | ----------------- | -------------------------------------- |
| `common`     | `common.json`     | Shared labels (Save, Cancel, Done…)    |
| `onboarding` | `onboarding.json` | Splash, language picker, slides, setup |
| `dashboard`  | `dashboard.json`  | Home screen strings                    |
| `tasks`      | `tasks.json`      | Chores & Tasks feature                 |
| `shopping`   | `shopping.json`   | Shopping list feature                  |

### Using Translations in a Component

```typescript
import { useTranslation } from 'react-i18next';

function MyScreen() {
  const { t } = useTranslation('tasks');      // primary namespace
  const { t: tc } = useTranslation('common'); // cross-namespace

  return (
    <Text>{t('screen_title')}</Text>
    <Button label={tc('save')} />
  );
}
```

### Interpolation

```json
// tasks.json
{ "created_by": "Created by {{name}} · {{date}}" }
```

```typescript
t('created_by', { name: 'Aarav', date: '5 Mar' });
// → "Created by Aarav · 5 Mar"
```

### Adding Translations for a New Feature

1. Create `src/i18n/locales/en/featureName.json`
2. Create matching `hi/featureName.json` and `gu/featureName.json`
3. Register in `src/i18n/index.ts`:

```typescript
import enFeature from './locales/en/featureName.json';
// ... repeat for hi, gu

// Add to resources:
en: { ..., featureName: enFeature },
hi: { ..., featureName: hiFeature },
gu: { ..., featureName: guFeature },

// Add to ns array:
ns: ['common', 'onboarding', 'dashboard', 'tasks', 'shopping', 'featureName'],
```

4. Use with `useTranslation('featureName')`.

### Rules

- **Never hardcode user-visible strings** — all text must go through `t()`
- Add strings to **all 3 languages** simultaneously
- `common.json` only for strings shared across 2+ features
- Dynamic arrays that depend on translations must be inside `useMemo` with `t` as a dependency

---

## State Management Patterns

### List Screens

```typescript
// 1. Single state object for async data
const [data, setData] = useState<Item[]>([]);
const [loading, setLoading] = useState(true);
const [refreshing, setRefreshing] = useState(false);
const [error, setError] = useState<Error | null>(null);

// 2. load() = shimmer (first visit), refresh() = RefreshControl (navigate-back)
const load = useCallback(() => fetchData(false), []);
const refresh = useCallback(() => fetchData(true), []);
useFocusRefresh(load, refresh);

// 3. Optimistic updates for toggles
function handleToggle(id: string, value: boolean) {
  setData((prev) => prev.map((i) => (i.id === id ? { ...i, field: value } : i))); // immediate
  try {
    await updateItem(id, { field: value });
  } catch {
    setData((prev) => prev.map((i) => (i.id === id ? { ...i, field: !value } : i)));
  } // revert
}
```

### Form Screens

```typescript
// Single form object (never individual useState per field)
const [form, setForm] = useState<MyFormFields>(INITIAL_FORM);
function update<K extends keyof MyFormFields>(key: K, value: MyFormFields[K]) {
  setForm((prev) => ({ ...prev, [key]: value }));
}

// Separate meta state
const [saving, setSaving] = useState(false);
const [deleteVisible, setDeleteVisible] = useState(false);
```

---

## Code Quality — ESLint & Prettier

### ESLint Rules (key ones)

| Rule                                         | What it enforces                                        |
| -------------------------------------------- | ------------------------------------------------------- |
| `@typescript-eslint/no-unused-vars`          | No unused variables (use `_` prefix to ignore)          |
| `@typescript-eslint/consistent-type-imports` | Always use `import type { }` for type-only imports      |
| `no-nested-ternary`                          | No nested ternaries — use `if/else` or helper functions |
| `react-hooks/refs`                           | Don't access `.current` during render                   |
| `react-hooks/set-state-in-effect`            | Don't call setState synchronously inside `useEffect`    |
| `simple-import-sort/imports`                 | Imports in specific order (auto-fixed by `--fix`)       |

### Import Order (auto-enforced)

```typescript
// 1. React core
import React, { useState } from 'react';
import { View, Text } from 'react-native';

// 2. Expo packages
import { router } from 'expo-router';

// 3. Other external packages
import { useTranslation } from 'react-i18next';

// 4. Internal alias imports (@/)
import { Button } from '@/components/ui';
import { colors } from '@/theme';

// 5. Relative imports
import './local-styles';
```

### Pre-commit Hook

A Husky + lint-staged hook runs automatically on `git commit`:

1. **Prettier** formats all staged `*.ts`, `*.tsx`, `*.json`, `*.css` files
2. **ESLint** with `--max-warnings=0` runs on staged `*.ts`, `*.tsx` files

> If the commit fails, check `npm run lint` output for errors. Warnings are treated as errors by the pre-commit hook.

---

## Adding a New Screen

### 1. Create the route file

Expo Router uses file-based routing. Create the file where you want the URL:

```
app/myfeature/index.tsx          → /myfeature
app/myfeature/[id].tsx           → /myfeature/:id
app/myfeature/[id]/edit.tsx      → /myfeature/:id/edit
```

For nested routes, add a `_layout.tsx`:

```typescript
// app/myfeature/_layout.tsx
import { Stack } from 'expo-router';
export default function MyFeatureLayout() {
  return <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }} />;
}
```

### 2. Standard screen template

```typescript
// app/myfeature/index.tsx
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { EmptyState, ErrorState } from '@/components/shared';
import { ScreenHeader } from '@/components/ui';
import { useFocusRefresh } from '@/hooks';
import { colors } from '@/theme';

export default function MyFeatureScreen() {
  const { t } = useTranslation('myfeature');
  const insets = useSafeAreaInsets();

  const [data, setData] = useState<MyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  async function loadData(isRefresh = false) {
    if (!isRefresh) setLoading(true);
    try { /* fetch from DB */ }
    catch (e) { setError(e instanceof Error ? e : new Error('Error')); }
    finally { setLoading(false); }
  }

  const load    = useCallback(() => loadData(false), []);
  const refresh = useCallback(() => loadData(true), []);
  useFocusRefresh(load, refresh);

  if (error) return <ErrorState title={t('error_title')} onRetry={load} />;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader title={t('screen_title')} showBack={false} />
      {/* screen content */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
});
```

### 3. Add i18n for the feature

Create `src/i18n/locales/en/myfeature.json`, `hi/myfeature.json`, `gu/myfeature.json`, then register in `src/i18n/index.ts` (see [i18n section](#internationalisation-i18n)).

### 4. Add DB module if needed

Create `src/db/modules/myfeature.ts` with typed CRUD functions.

---

## Adding a New Component

### Deciding where it lives

| Type                  | Location                      | Example                          |
| --------------------- | ----------------------------- | -------------------------------- |
| App-wide UI primitive | `src/components/ui/`          | `Avatar`, `Button`, `Chip`       |
| Form building block   | `src/components/forms/`       | `FormField`, `PickerRow`         |
| Cross-feature UX      | `src/components/shared/`      | `EmptyState`, `ShimmerBox`       |
| Feature-specific      | `src/components/featurename/` | `BigTaskRow`, `ShoppingListCard` |

### Component checklist

```typescript
// ✅ Use theme tokens — never hardcode colors/sizes
backgroundColor: colors.primary  // ✅
backgroundColor: '#C96B50'        // ❌

// ✅ Use the correct font family
fontFamily: fontFamily.semiBold   // ✅
fontFamily: 'PlusJakartaSans_600SemiBold'  // ❌

// ✅ Translate all user-visible text
<Text>{t('label')}</Text>         // ✅
<Text>Save</Text>                 // ❌

// ✅ Boolean props from SQLite need casting
{!!item.done && <Icon.check />}   // ✅  (SQLite returns 0/1, not bool)
{item.done && <Icon.check />}     // ❌  (renders "0" as text node)

// ✅ Export from the feature barrel
// src/components/ui/index.ts → add export
export { MyNewComponent } from './MyNewComponent';
```

---

## Feature Phase Map

| Phase | Feature                                       | Status     |
| ----- | --------------------------------------------- | ---------- |
| 0     | Foundation (theme, components, DB, i18n)      | ✅ Done    |
| 0.5   | Offline DB, language picker, onboarding setup | ✅ Done    |
| 1     | Splash screen                                 | ✅ Done    |
| 2     | Onboarding (5 screens)                        | ✅ Done    |
| 3     | Dashboard                                     | ✅ Done    |
| 4     | Tasks / Chores                                | ✅ Done    |
| 5     | Shopping List                                 | ✅ Done    |
| 6     | Calendar                                      | 🔲 Pending |
| 7     | Item Locator                                  | 🔲 Pending |
| 8     | Maintenance & Repair Log                      | 🔲 Pending |
| 9     | Pantry                                        | 🔲 Pending |
| 10    | Meal Planner                                  | 🔲 Pending |
| 11    | Money & Bills                                 | 🔲 Pending |
| 12    | Health                                        | 🔲 Pending |
| 13    | Settings & More                               | 🔲 Pending |
| 14    | Document Vault                                | 🔲 Pending |

---

## Contributing Guidelines

### Branch naming

```
feature/phase-6-calendar
fix/task-toggle-crash
refactor/shared-member-selector
chore/update-deps
```

### Commit message format

```
feat: Add calendar screen with weekly view
fix: Shopping item crash on boolean from SQLite
refactor: Extract MemberSelector into shared component
chore: Bump expo-sqlite to 56.0.5
```

### Code standards checklist

Before opening a PR:

- [ ] `npm run type-check` passes (zero TypeScript errors)
- [ ] `npm run lint` passes (zero errors, zero warnings)
- [ ] `npm run format:check` passes
- [ ] All user-visible strings are in the translation files for **en, hi, and gu**
- [ ] No hardcoded colors — all values from `colors.*`
- [ ] No hardcoded font names — all values from `fontFamily.*`
- [ ] SQLite boolean fields cast with `Boolean(row.done)` in DB module
- [ ] List screens use `useFocusRefresh` for data reload on navigation-back
- [ ] Form screens use single `FormFields` state object + `update()` helper
- [ ] New form uses `FormField`, `FormBottomBar` from `src/components/forms/`
- [ ] New assignee picker uses `MemberSelector` from `src/components/ui/`
- [ ] New DB columns added via migration (never edit existing migrations)

### Design system decisions

| Rule                                       | Reason                                                       |
| ------------------------------------------ | ------------------------------------------------------------ |
| Warm terracotta, not corporate blue        | Every household has a soul                                   |
| One clear action per row                   | Users always know what tapping does                          |
| Lightbulb tutorial on every feature screen | `<TutorialSheet>` opens on `ScreenHeader.onTutorial`         |
| Soft destructive actions                   | Always offer smarter alternative (mark done, archive, pause) |
| Optimistic UI for toggles                  | Instant feedback, revert if DB write fails                   |
| Offline-first, no account required         | User data never leaves the device                            |

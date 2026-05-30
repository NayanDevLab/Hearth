const expoConfig = require('eslint-config-expo/flat');
const simpleImportSort = require('eslint-plugin-simple-import-sort');
const prettierConfig = require('eslint-config-prettier');
const typescriptEslint = require('@typescript-eslint/eslint-plugin');
const { defineConfig } = require('eslint/config');

module.exports = defineConfig([
  // Ignored paths
  {
    ignores: [
      'node_modules/**',
      '.expo/**',
      'dist/**',
      'build/**',
      'android/**',
      'ios/**',
      'expo-env.d.ts',
      'nativewind-env.d.ts',
      'scripts/**',
      'design/**',
    ],
  },

  // Expo base: React, React Hooks, TypeScript, Import rules
  ...expoConfig,

  // Import sorting (applies to all JS/TS files)
  {
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            // React and React Native core
            ['^react$', '^react-native$'],
            // Expo packages
            ['^expo', '^@expo'],
            // Other external packages
            ['^@?\\w'],
            // Internal alias imports
            ['^@/'],
            // Relative imports
            ['^\\.'],
          ],
        },
      ],
      'simple-import-sort/exports': 'error',
      'import/first': 'error',
      'import/newline-after-import': 'error',
      'import/no-duplicates': 'error',
    },
  },

  // General rules (JS + TS files)
  {
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'error',
      'no-nested-ternary': 'error',
    },
  },

  // TypeScript-specific rules — plugin must be re-declared per config object in flat config
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      '@typescript-eslint': typescriptEslint,
    },
    rules: {
      // Upgrade expo's default warn → error, and allow _-prefixed intentional ignores
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
      // Prefer `import type` for type-only imports (tree-shaking benefit)
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      // Discourage any — use unknown or proper types instead
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },

  // Prettier must be last — disables all ESLint rules that conflict with formatting
  prettierConfig,
]);

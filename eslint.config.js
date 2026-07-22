import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { varsIgnorePattern: '^_$', argsIgnorePattern: '^_$' }],
    },
  },
  {
    // Hex colors belong in src/constants/colors.ts (or tailwind.config.js),
    // never hardcoded in components/pages (context/code-standards.md).
    files: ['src/**/*.tsx'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'Literal[value=/#[0-9a-fA-F]{6}([0-9a-fA-F]{2})?\\b/]',
          message: 'Hardcoded hex color — use a token from src/constants/colors.ts or a Tailwind class.',
        },
        {
          selector: 'TemplateElement[value.raw=/#[0-9a-fA-F]{6}([0-9a-fA-F]{2})?\\b/]',
          message: 'Hardcoded hex color — use a token from src/constants/colors.ts or a Tailwind class.',
        },
      ],
    },
    languageOptions: {
      globals: globals.browser,
    },
  },
])

import { defineConfig } from 'eslint/config';
import next from 'eslint-config-next';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';

export default defineConfig([
  {
    ignores: [
      '.next/**',
      'out/**',
      'build/**',
      'dist/**',
      'next-env.d.ts',
      'node_modules/**',
      'coverage/**',
    ],
  },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    extends: [
      ...next.coreWebVitals,
      'plugin:@typescript-eslint/recommended',
      'prettier',
    ],
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'off',
      'react/react-in-jsx-scope': 'off',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
]);

import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import prettierConfig from 'eslint-config-prettier';

export default tseslint.config([
  { ignores: ['dist'] },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommendedTypeChecked,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
      prettierConfig,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      // アンダースコアプレフィックス付きの未使用変数を許可（TODO実装用）
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
    },
  },
  {
    files: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      // 既存のテスト用ルール
      '@typescript-eslint/unbound-method': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',

      // 追加のテスト用ルール
      '@typescript-eslint/no-explicit-any': 'off', // テストデータやモックでanyを許可
      '@typescript-eslint/no-unsafe-call': 'off', // モック関数の呼び出しを許可
      '@typescript-eslint/no-unsafe-member-access': 'off', // モックオブジェクトのプロパティアクセスを許可
      '@typescript-eslint/no-unsafe-return': 'off', // モック関数の戻り値を許可
      '@typescript-eslint/no-unsafe-argument': 'off', // モック関数への引数を許可
    },
  },
  {
    files: ['**/test/**/*.{ts,tsx}', '**/testUtils.{ts,tsx}'],
    rules: {
      'react-refresh/only-export-components': 'off', // テストユーティリティでの複数エクスポートを許可
    },
  },
]);

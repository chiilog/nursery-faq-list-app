import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';

// カスタムコンフィグ設定
const customConfig = defineConfig({
  globalCss: {
    // モバイルでのズーム防止
    'input, textarea, select': {
      fontSize: '16px',
      minHeight: '44px', // iOS推奨の最小タッチサイズ
    },
    // タッチハイライトを削除
    '*': {
      WebkitTapHighlightColor: 'transparent',
    },
    // スムーズなスクロール
    'html, body': {
      scrollBehavior: 'smooth',
    },
  },
  theme: {
    tokens: {
      colors: {
        brand: {
          50: { value: '#e8f5e8' },
          100: { value: '#c3e6c3' },
          200: { value: '#9dd69d' },
          300: { value: '#77c677' },
          400: { value: '#51b651' },
          500: { value: '#2ba62b' }, // メインカラー（やさしい緑）
          600: { value: '#228522' },
          700: { value: '#1a641a' },
          800: { value: '#114311' },
          900: { value: '#082208' },
        },
        accent: {
          50: { value: '#fff5e6' },
          100: { value: '#ffe6cc' },
          200: { value: '#ffd6b3' },
          300: { value: '#ffc799' },
          400: { value: '#ffb780' },
          500: { value: '#ffa866' }, // アクセントカラー（温かいオレンジ）
          600: { value: '#cc8652' },
          700: { value: '#99653d' },
          800: { value: '#664329' },
          900: { value: '#332214' },
        },
        neutral: {
          50: { value: '#f7f7f7' },
          100: { value: '#e3e3e3' },
          200: { value: '#c8c8c8' },
          300: { value: '#a4a4a4' },
          400: { value: '#818181' },
          500: { value: '#666666' },
          600: { value: '#515151' },
          700: { value: '#434343' },
          800: { value: '#383838' },
          900: { value: '#000000' },
        },
      },
      fonts: {
        heading: {
          value: `'Hiragino Kaku Gothic ProN', 'Hiragino Sans', 'Meiryo', sans-serif`,
        },
        body: {
          value: `'Hiragino Kaku Gothic ProN', 'Hiragino Sans', 'Meiryo', sans-serif`,
        },
      },
      fontSizes: {
        xs: { value: '12px' },
        sm: { value: '14px' },
        md: { value: '16px' }, // モバイルでのズーム防止
        lg: { value: '18px' },
        xl: { value: '20px' },
        '2xl': { value: '24px' },
        '3xl': { value: '30px' },
        '4xl': { value: '36px' },
      },
    },
    breakpoints: {
      sm: '320px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
  },
});

// カスタムコンフィグとデフォルトコンフィグをマージしてシステムを作成
const system = createSystem(defaultConfig, customConfig);

export default system;

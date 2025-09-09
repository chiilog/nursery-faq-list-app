import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';

// カスタムコンフィグ設定
const customConfig = defineConfig({
  theme: {
    tokens: {
      colors: {
        brand: {
          50: { value: '#fff1f1' },
          100: { value: '#ffd6d6' },
          200: { value: '#ffb3b3' },
          300: { value: '#ff9999' },
          400: { value: '#ff7a7a' },
          500: { value: '#d45d5d' }, // メインカラー（コーラル系）
          600: { value: '#cc6666' },
          700: { value: '#b35a5a' },
          800: { value: '#994d4d' },
          900: { value: '#802020' },
          950: { value: '#4d1a1a' },
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
    semanticTokens: {
      colors: {
        brand: {
          solid: { value: '{colors.brand.500}' },
          contrast: { value: '{colors.white}' },
          fg: { value: '{colors.brand.700}' },
          muted: { value: '{colors.brand.100}' },
          subtle: { value: '{colors.brand.50}' },
          emphasized: { value: '{colors.brand.200}' },
          focusRing: { value: '{colors.brand.500}' },
        },
        accent: {
          solid: { value: '{colors.accent.500}' },
          contrast: { value: '{colors.white}' },
          fg: { value: '{colors.accent.700}' },
          muted: { value: '{colors.accent.100}' },
          subtle: { value: '{colors.accent.50}' },
          emphasized: { value: '{colors.accent.200}' },
          focusRing: { value: '{colors.accent.500}' },
        },
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

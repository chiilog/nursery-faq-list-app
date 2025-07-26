/**
 * テストユーティリティ
 * ChakraUIコンポーネントのテストで使用するヘルパー関数
 */

import type { ReactElement } from 'react';
import { render as rtlRender } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import system from '../theme';

// プロバイダー付きでコンポーネントをレンダリング
export const renderWithProviders = (ui: ReactElement) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <ChakraProvider value={system}>{children}</ChakraProvider>
  );

  return rtlRender(ui, { wrapper: Wrapper });
};

// テスト用のモックデータファクトリー
export const testUtils = {
  // 保育園データのモック作成
  createMockNursery: (overrides = {}) => ({
    id: 'nursery-1',
    name: 'テスト保育園',
    address: '東京都渋谷区1-1-1',
    phoneNumber: '03-1234-5678',
    website: 'https://test-nursery.example.com',
    visitSessions: [],
    notes: 'テスト用の保育園です',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    ...overrides,
  }),

  // 見学セッションデータのモック作成
  createMockVisitSession: (overrides = {}) => ({
    id: 'session-1',
    visitDate: new Date('2025-02-15'),
    status: 'planned' as const,
    questions: [],
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    ...overrides,
  }),

  // 質問データのモック作成
  createMockQuestion: (overrides = {}) => ({
    id: 'question-1',
    text: 'テスト質問',
    isAnswered: false,
    priority: 'medium' as const,
    order: 1,
    ...overrides,
  }),
};

// re-export everything
export * from '@testing-library/react';

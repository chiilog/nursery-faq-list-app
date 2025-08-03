/**
 * テストユーティリティ
 * ChakraUIコンポーネントのテストで使用するヘルパー関数
 */

import type { ReactElement } from 'react';
import { render as rtlRender } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { MemoryRouter } from 'react-router-dom';
import system from '../theme';

// プロバイダー付きでコンポーネントをレンダリング
export const renderWithProviders = (
  ui: ReactElement,
  { initialEntries = ['/'] } = {}
) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter initialEntries={initialEntries}>
      <ChakraProvider value={system}>{children}</ChakraProvider>
    </MemoryRouter>
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
    answer: '',
    isAnswered: false,
    category: '基本情報',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    ...overrides,
  }),

  // CreateQuestionInputのモック作成
  createMockCreateQuestionInput: (overrides = {}) => ({
    text: 'テスト質問',
    category: '基本情報',
    ...overrides,
  }),
};

// より簡潔な関数名のエクスポート
export const createQuestionMock = testUtils.createMockQuestion;
export const createCreateQuestionInputMock =
  testUtils.createMockCreateQuestionInput;

// re-export everything
export * from '@testing-library/react';

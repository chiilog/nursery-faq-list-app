/**
 * テストユーティリティ
 * ChakraUIコンポーネントのテストで使用するヘルパー関数
 */

import type { ReactElement, ReactNode } from 'react';
import { render as rtlRender, renderHook } from '@testing-library/react';
import type { RenderResult, RenderHookResult } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { MemoryRouter } from 'react-router-dom';
import system from '../theme';

// Chakra UI Provider Wrapper
const ChakraWrapper = ({ children }: { children: ReactNode }) => (
  <ChakraProvider value={system}>{children}</ChakraProvider>
);

export { ChakraWrapper };

// コンポーネント用のrender関数（Chakraのみ）
export function renderWithChakra(ui: React.ReactElement): RenderResult {
  return rtlRender(ui, { wrapper: ChakraWrapper });
}

// フック用のrenderHook関数
export function renderHookWithChakra<TResult, TProps>(
  hook: (props: TProps) => TResult,
  options?: { initialProps?: TProps }
): RenderHookResult<TResult, TProps> {
  return renderHook(hook, {
    wrapper: ChakraWrapper,
    ...options,
  });
}

// プロバイダー付きでコンポーネントをレンダリング（React Router対応）
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
    visitSessions: [],
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
    insights: [],
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

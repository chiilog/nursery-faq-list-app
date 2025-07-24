/**
 * テスト用ユーティリティ
 * フックテストで共通して使用するヘルパー関数
 */

import type { ReactNode } from 'react';
import { render } from '@testing-library/react';
import type { RenderResult } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { renderHook } from '@testing-library/react';
import type { RenderHookResult } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import system from '../theme/index';

// Chakra UI Provider Wrapper
const ChakraWrapper = ({ children }: { children: ReactNode }) => (
  <ChakraProvider value={system}>{children}</ChakraProvider>
);

export { ChakraWrapper };

// コンポーネント用のrender関数
export function renderWithChakra(ui: React.ReactElement): RenderResult {
  return render(ui, { wrapper: ChakraWrapper });
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

// コンポーネント用のrender関数（React Router対応）
export function renderWithProviders(
  ui: React.ReactElement,
  options?: { initialEntries?: string[] }
): RenderResult {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={options?.initialEntries}>
      <ChakraProvider value={system}>{children}</ChakraProvider>
    </MemoryRouter>
  );

  return render(ui, { wrapper: Wrapper });
}

/**
 * テスト用共通ヘルパー関数
 * DRY原則に基づき、重複するテストセットアップコードを共通化
 */

import { vi, type MockedFunction } from 'vitest';

/**
 * MockedStorage型定義
 */
interface MockedStorage {
  getItem: MockedFunction<(key: string) => string | null>;
  setItem: MockedFunction<(key: string, value: string) => void>;
  removeItem: MockedFunction<(key: string) => void>;
  clear: MockedFunction<() => void>;
  length: number;
  key: MockedFunction<(index: number) => string | null>;
}

/**
 * localStorageのモック作成
 */
export const createMockLocalStorage = (): MockedStorage => {
  const store: Record<string, string> = {};

  const mockLocalStorage: MockedStorage = {
    getItem: vi.fn((key: string): string | null =>
      Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null
    ),
    setItem: vi.fn((key: string, value: string): void => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string): void => {
      delete store[key];
    }),
    clear: vi.fn((): void => {
      Object.keys(store).forEach((key) => delete store[key]);
    }),
    get length(): number {
      return Object.keys(store).length;
    },
    key: vi.fn((index: number): string | null => {
      const keys = Object.keys(store);
      return keys[index] || null;
    }),
  };

  // グローバルオブジェクトにモックを設定
  Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
    writable: true,
  });

  return mockLocalStorage;
};

/**
 * window.scrollToのモック作成
 */
export const createMockScrollTo = (): MockedFunction<
  typeof window.scrollTo
> => {
  const mockScrollTo = vi.fn() as unknown as MockedFunction<
    typeof window.scrollTo
  >;

  Object.defineProperty(window, 'scrollTo', {
    value: mockScrollTo,
    writable: true,
    configurable: true,
  });

  return mockScrollTo;
};

/**
 * テスト用の待機ヘルパー
 */
export const waitForAsync = (ms: number = 0): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * React RouterのuseNavigateモック作成
 * 使用例: const mockNavigate = createMockNavigate();
 */
export const createMockNavigate = (): MockedFunction<
  ReturnType<typeof import('react-router-dom').useNavigate>
> => {
  return vi.fn();
};

/**
 * コンソール抑制ヘルパーの戻り値型
 */
interface ConsoleSuppress {
  setup: () => void;
  restore: () => void;
  getErrorCalls: () => unknown[][];
  getWarnCalls: () => unknown[][];
}

/**
 * コンソール出力の抑制ヘルパー
 */
export const suppressConsole = (): ConsoleSuppress => {
  const originalError = console.error;
  const originalWarn = console.warn;

  const setup = (): void => {
    console.error = vi.fn();
    console.warn = vi.fn();
  };

  const restore = (): void => {
    console.error = originalError;
    console.warn = originalWarn;
  };

  return {
    setup,
    restore,
    getErrorCalls: (): unknown[][] =>
      (console.error as MockedFunction<typeof console.error>).mock.calls,
    getWarnCalls: (): unknown[][] =>
      (console.warn as MockedFunction<typeof console.warn>).mock.calls,
  };
};

/**
 * Analytics関連のモック設定
 * GA4とClarityサービスのモックを一括設定
 */
export const setupAnalyticsMocks = (): void => {
  vi.mock('../services/ga4Service', () => ({
    ga4Service: {
      trackEvent: vi.fn(),
      trackPageView: vi.fn(),
      initialize: vi.fn(),
    },
  }));

  vi.mock('../services/clarityService', () => ({
    clarityService: {
      trackEvent: vi.fn(),
      initialize: vi.fn(),
    },
  }));

  vi.mock('../hooks/useCookieConsent', () => ({
    useCookieConsent: vi.fn(() => ({
      consent: true,
      setConsent: vi.fn(),
    })),
  }));
};

/**
 * 全体的なテスト環境セットアップ
 * 共通的に必要なモックを一括設定
 */
export const setupTestEnvironment = (): void => {
  setupAnalyticsMocks();
  createMockLocalStorage();
  createMockScrollTo();
};

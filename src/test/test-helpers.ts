/**
 * テスト用共通ヘルパー関数
 * DRY原則に基づき、重複するテストセットアップコードを共通化
 */

import { vi, type MockedFunction } from 'vitest';
import type { PrivacySettings } from '../types/privacy';

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
    getItem: vi.fn((key: string): string | null => store[key] || null),
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
export const createMockScrollTo = () => {
  const mockScrollTo = vi.fn();

  Object.defineProperty(window, 'scrollTo', {
    value: mockScrollTo,
    writable: true,
  });

  return mockScrollTo;
};

/**
 * プライバシー設定のモックデータ作成
 */
export const createMockPrivacySettings = (
  overrides: Partial<PrivacySettings> = {}
): PrivacySettings => {
  return {
    googleAnalytics: false,
    microsoftClarity: false,
    consentTimestamp: new Date('2024-01-01T00:00:00Z'),
    consentVersion: '1.0' as const,
    hasExplicitConsent: false,
    ...overrides,
  };
};

/**
 * テスト用の待機ヘルパー
 */
export const waitForAsync = (ms: number = 0): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * React RouterのuseNavigateモック作成
 */
export const createMockNavigate = () => {
  const mockNavigate = vi.fn();

  vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
      ...actual,
      useNavigate: () => mockNavigate,
    };
  });

  return mockNavigate;
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

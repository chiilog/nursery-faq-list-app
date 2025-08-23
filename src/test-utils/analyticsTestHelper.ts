// react-ga4 を明示的にモック（hoisted）
vi.mock('react-ga4', () => ({
  default: {
    initialize: vi.fn(),
    event: vi.fn(),
    send: vi.fn(),
    gtag: vi.fn(),
  },
}));

import { vi, expect } from 'vitest';
import ReactGA from 'react-ga4';
import { mockGlobalAnalytics, cleanupGlobalAnalytics } from './mockUtils';
import { resetGA4ServiceInstance } from '../services/ga4Service';

// TypeScript用の型アサーション
export const mockedReactGA = vi.mocked(ReactGA);

// テスト用定数
export const TEST_CONSTANTS = {
  MEASUREMENT_ID: 'G-TEST123456789',
  WAIT_TIME: {
    SHORT: 50,
    MEDIUM: 100,
    LONG: 150,
  },
  TIMEOUT: {
    DEFAULT: 3000,
  },
} as const;

/**
 * @description テストイベントデータを生成するファクトリー関数
 */
export const createTestEventData = (
  eventName = 'test_event',
  parameters = { test: 'parameter' }
) => ({
  eventName,
  parameters,
});

/**
 * @description テストページビューデータを生成するファクトリー関数
 */
export const createTestPageViewData = (
  title = 'Test Page',
  page = '/test'
) => ({
  hitType: 'pageview' as const,
  title,
  page,
});

/**
 * @description 非同期処理の待機用ヘルパー関数
 */
export const waitForAsyncOperation = (
  duration: number = TEST_CONSTANTS.WAIT_TIME.MEDIUM
) => new Promise((resolve) => setTimeout(resolve, duration));

/**
 * @description GA4テスト環境をセットアップする関数
 */
export const setupAnalyticsTest = (
  options: {
    doNotTrack?: string;
    measurementId?: string;
    analyticsEnabled?: boolean;
  } = {}
) => {
  mockGlobalAnalytics();
  vi.clearAllMocks();

  // テスト用の環境変数を設定
  vi.stubEnv(
    'VITE_GA4_MEASUREMENT_ID',
    options.measurementId !== undefined
      ? options.measurementId
      : TEST_CONSTANTS.MEASUREMENT_ID
  );
  vi.stubEnv(
    'VITE_ANALYTICS_ENABLED',
    String(options.analyticsEnabled !== false)
  );

  // @ts-expect-error - vi.stubEnvは環境変数を文字列として設定するため
  vi.stubEnv('DEV', 'false');
  Object.defineProperty(import.meta, 'env', {
    value: {
      DEV: false,
      MODE: 'test',
      VITE_GA4_MEASUREMENT_ID:
        options.measurementId !== undefined
          ? options.measurementId
          : TEST_CONSTANTS.MEASUREMENT_ID,
      VITE_ANALYTICS_ENABLED: String(options.analyticsEnabled !== false),
    },
    writable: true,
    configurable: true,
  });

  // Do Not Trackを設定
  Object.defineProperty(navigator, 'doNotTrack', {
    value: options.doNotTrack || '0',
    writable: true,
    configurable: true,
  });

  // react-ga4のモックをクリア
  mockedReactGA.initialize.mockClear();
  mockedReactGA.event.mockClear();
  mockedReactGA.send.mockClear();
  mockedReactGA.gtag.mockClear();

  // シングルトンインスタンスをリセット
  resetGA4ServiceInstance();

  return mockedReactGA;
};

/**
 * @description GA4テスト環境をクリーンアップする関数
 */
export const cleanupAnalyticsTest = () => {
  cleanupGlobalAnalytics();
  vi.unstubAllEnvs();
  vi.clearAllMocks();
};

/**
 * @description ReactGAのイベント送信をアサートするヘルパー関数
 */
export const expectReactGAEvent = (
  eventName: string,
  parameters?: Record<string, unknown>
) => {
  expect(mockedReactGA.event).toHaveBeenCalledWith(eventName, parameters);
};

/**
 * @description ReactGAのデータ送信をアサートするヘルパー関数
 */
export const expectReactGASend = (hitData: Record<string, unknown>) => {
  expect(mockedReactGA.send).toHaveBeenCalledWith(hitData);
};

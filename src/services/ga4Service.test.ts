import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import {
  mockGlobalAnalytics,
  cleanupGlobalAnalytics,
} from '../test-utils/mockUtils';

// setup.tsのモックを無効化
vi.unmock('../services/ga4Service');

// react-ga4をモック
vi.mock('react-ga4', () => ({
  default: {
    initialize: vi.fn(),
    event: vi.fn(),
    send: vi.fn(),
  },
}));

// environment関数をモック
vi.mock('../utils/environment', () => ({
  isDevelopment: vi.fn(() => false), // 本番環境をシミュレート
  safeExecute: vi.fn((operation) => Promise.resolve(operation())),
}));

import ReactGA from 'react-ga4';
import { useGA4Service, resetGA4ServiceInstance } from './ga4Service';

// TypeScript用の型アサーション
const mockedReactGA = vi.mocked(ReactGA);

// テスト用定数
const TEST_CONSTANTS = {
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
 * @param eventName - イベント名（デフォルト: 'test_event'）
 * @param parameters - イベントパラメータ（デフォルト: { test: 'parameter' }）
 * @returns テストイベントデータオブジェクト
 */
const createTestEventData = (
  eventName = 'test_event',
  parameters = { test: 'parameter' }
) => ({
  eventName,
  parameters,
});

/**
 * @description テストページビューデータを生成するファクトリー関数
 * @param title - ページタイトル（デフォルト: 'Test Page'）
 * @param page - ページパス（デフォルト: '/test'）
 * @returns テストページビューデータオブジェクト
 */
const createTestPageViewData = (title = 'Test Page', page = '/test') => ({
  hitType: 'pageview' as const,
  title,
  page,
});

/**
 * @description 非同期処理の待機用ヘルパー関数
 * @param duration - 待機時間（ミリ秒、デフォルト: TEST_CONSTANTS.WAIT_TIME.MEDIUM）
 * @returns 指定した時間後に解決されるPromise
 */
const waitForAsyncOperation = (
  duration: number = TEST_CONSTANTS.WAIT_TIME.MEDIUM
) => new Promise((resolve) => setTimeout(resolve, duration));

/**
 * @description GA4テスト環境をセットアップする関数
 * @param options - テスト環境のオプション設定
 * @param options.doNotTrack - Do Not Track設定値（デフォルト: '0'）
 * @param options.measurementId - GA4測定ID（デフォルト: TEST_CONSTANTS.MEASUREMENT_ID）
 * @param options.analyticsEnabled - Analytics有効フラグ（デフォルト: true）
 */
const setupGA4TestEnvironment = (
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
    options.measurementId || TEST_CONSTANTS.MEASUREMENT_ID
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
        options.measurementId || TEST_CONSTANTS.MEASUREMENT_ID,
      VITE_ANALYTICS_ENABLED: String(options.analyticsEnabled !== false),
    },
    writable: true,
    configurable: true,
  });

  // Do Not Trackを設定（既存のプロパティがある場合は削除）
  delete (navigator as any).doNotTrack;
  Object.defineProperty(navigator, 'doNotTrack', {
    value: options.doNotTrack || '0',
    writable: true,
    configurable: true,
  });

  // react-ga4のモックをクリア
  mockedReactGA.initialize.mockClear();
  mockedReactGA.event.mockClear();
  mockedReactGA.send.mockClear();

  // シングルトンインスタンスをリセット
  resetGA4ServiceInstance();
};

/**
 * @description GA4テスト環境をクリーンアップする関数
 */
const cleanupGA4TestEnvironment = () => {
  cleanupGlobalAnalytics();
  vi.unstubAllEnvs();
  vi.clearAllMocks();
};

/**
 * @description ReactGAのイベント送信をアサートするヘルパー関数
 * @param eventName - 期待するイベント名
 * @param parameters - 期待するイベントパラメータ（省略可能）
 */
const expectReactGAEvent = (
  eventName: string,
  parameters?: Record<string, unknown>
) => {
  expect(mockedReactGA.event).toHaveBeenCalledWith(eventName, parameters);
};

/**
 * @description ReactGAのデータ送信をアサートするヘルパー関数
 * @param hitData - 期待する送信データ
 */
const expectReactGASend = (hitData: Record<string, unknown>) => {
  expect(mockedReactGA.send).toHaveBeenCalledWith(hitData);
};

describe('useGA4Service', () => {
  describe('基本機能テスト', () => {
    beforeEach(() => {
      setupGA4TestEnvironment();
    });

    afterEach(() => {
      cleanupGA4TestEnvironment();
    });

    it('初期状態では無効でかつ同意なしで初期化される', () => {
      const { result } = renderHook(() => useGA4Service());

      expect(result.current.isEnabled).toBe(false);
      expect(result.current.hasConsent).toBe(false);
      expect(typeof result.current.setConsent).toBe('function');
      expect(typeof result.current.trackEvent).toBe('function');
      expect(typeof result.current.trackPageView).toBe('function');
    });

    it('同意状態を正しく設定・変更できる', async () => {
      const { result } = renderHook(() => useGA4Service());

      await act(async () => {
        result.current.setConsent(true);
        // 非同期処理の完了を待機
        await waitForAsyncOperation(TEST_CONSTANTS.WAIT_TIME.SHORT);
      });

      expect(result.current.hasConsent).toBe(true);

      await act(async () => {
        result.current.setConsent(false);
        await waitForAsyncOperation(TEST_CONSTANTS.WAIT_TIME.SHORT);
      });

      expect(result.current.hasConsent).toBe(false);
      expect(result.current.isEnabled).toBe(false);
    });

    it('ユーザー同意後にGA4サービスが正常に初期化される', async () => {
      const { result } = renderHook(() => useGA4Service());

      await act(async () => {
        result.current.setConsent(true);
        // 非同期処理の完了を待機
        await waitForAsyncOperation(TEST_CONSTANTS.WAIT_TIME.MEDIUM);
      });

      await waitFor(
        () => {
          expect(result.current.hasConsent).toBe(true);
          expect(result.current.isEnabled).toBe(true);
        },
        { timeout: TEST_CONSTANTS.TIMEOUT.DEFAULT }
      );

      // react-ga4のinitializeが呼ばれることを確認
      expect(mockedReactGA.initialize).toHaveBeenCalled();
    });

    it('Do Not Track有効時は同意があっても初期化を回避する', async () => {
      setupGA4TestEnvironment({ doNotTrack: '1' });

      const { result } = renderHook(() => useGA4Service());

      // 同意を設定した場合でもDo Not Trackのため初期化されないことを確認
      await act(async () => {
        result.current.setConsent(true);
        await waitForAsyncOperation(TEST_CONSTANTS.WAIT_TIME.MEDIUM);
      });

      // Do Not Track が有効な場合の期待される動作:
      // 1. 同意状態は正しく記録される
      expect(result.current.hasConsent).toBe(true);

      // 2. Do Not Track設定により、サービス初期化は回避される
      // (初期化処理は非同期で実行されるが、実際には何も起こらない)
      await waitForAsyncOperation(TEST_CONSTANTS.WAIT_TIME.LONG);

      // 3. no-opサービスのためisEnabledはfalseのままとなる
      expect(result.current.isEnabled).toBe(false);

      // 4. ReactGA.initialize は呼び出されない
      expect(mockedReactGA.initialize).not.toHaveBeenCalled();
    });

    it('初期化完了後にカスタムイベント送信が正常に動作する', async () => {
      const { result } = renderHook(() => useGA4Service());

      await act(async () => {
        result.current.setConsent(true);
        // 非同期処理の完了を待機
        await waitForAsyncOperation(TEST_CONSTANTS.WAIT_TIME.MEDIUM);
      });

      await waitFor(() => expect(result.current.isEnabled).toBe(true), {
        timeout: TEST_CONSTANTS.TIMEOUT.DEFAULT,
      });

      // 初期化時のコールをクリア
      mockedReactGA.event.mockClear();

      const testEvent = createTestEventData();
      await act(async () => {
        result.current.trackEvent(testEvent.eventName, testEvent.parameters);
        await waitForAsyncOperation(10);
      });

      expectReactGAEvent(testEvent.eventName, testEvent.parameters);
    });

    it('初期化完了後にページビューイベント送信が正常に動作する', async () => {
      const { result } = renderHook(() => useGA4Service());

      await act(async () => {
        result.current.setConsent(true);
        // 非同期処理の完了を待機
        await waitForAsyncOperation(TEST_CONSTANTS.WAIT_TIME.MEDIUM);
      });

      await waitFor(() => expect(result.current.isEnabled).toBe(true), {
        timeout: TEST_CONSTANTS.TIMEOUT.DEFAULT,
      });

      // 初期化時のコールをクリア
      mockedReactGA.send.mockClear();

      const testPageView = createTestPageViewData();
      await act(async () => {
        result.current.trackPageView(testPageView.title, testPageView.page);
        await waitForAsyncOperation(10);
      });

      expectReactGASend(testPageView);
    });

    it('ユーザー同意がない場合はイベント送信を行わない', async () => {
      const { result } = renderHook(() => useGA4Service());

      const testEvent = createTestEventData();
      await act(async () => {
        result.current.trackEvent(testEvent.eventName, testEvent.parameters);
        await waitForAsyncOperation(10);
      });

      expect(mockedReactGA.event).not.toHaveBeenCalled();
    });

    it('React hooksの再レンダリング時に状態が正しく保持される', async () => {
      const { result, rerender } = renderHook(() => useGA4Service());

      // 最初の同意設定
      await act(async () => {
        result.current.setConsent(true);
        // 非同期処理の完了を待機
        await waitForAsyncOperation(TEST_CONSTANTS.WAIT_TIME.MEDIUM);
      });

      await waitFor(() => expect(result.current.isEnabled).toBe(true), {
        timeout: TEST_CONSTANTS.TIMEOUT.DEFAULT,
      });

      // フックの再レンダリング
      rerender();

      // 同じ状態が維持されることを確認
      expect(result.current.isEnabled).toBe(true);
      expect(result.current.hasConsent).toBe(true);
    });

    it('コンポーネントアンマウント時にクリーンアップが正常に実行される', () => {
      const { unmount } = renderHook(() => useGA4Service());

      // アンマウント時にクリーンアップが実行される
      expect(() => unmount()).not.toThrow();
    });

    it('GA4初期化時にテストモードが正しく設定される', async () => {
      const { result } = renderHook(() => useGA4Service());

      await act(async () => {
        result.current.setConsent(true);
        await waitForAsyncOperation(TEST_CONSTANTS.WAIT_TIME.MEDIUM);
      });

      await waitFor(() => expect(result.current.isEnabled).toBe(true), {
        timeout: TEST_CONSTANTS.TIMEOUT.DEFAULT,
      });

      expect(mockedReactGA.initialize).toHaveBeenCalledWith(
        TEST_CONSTANTS.MEASUREMENT_ID,
        expect.objectContaining({
          testMode: true,
        })
      );
    });

    it('GA4初期化時にプライバシー配慮のオプションが適用される', async () => {
      const { result } = renderHook(() => useGA4Service());

      await act(async () => {
        result.current.setConsent(true);
        await waitForAsyncOperation(TEST_CONSTANTS.WAIT_TIME.MEDIUM);
      });

      await waitFor(() => expect(result.current.isEnabled).toBe(true), {
        timeout: TEST_CONSTANTS.TIMEOUT.DEFAULT,
      });

      expect(mockedReactGA.initialize).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          gaOptions: {
            anonymize_ip: true,
            cookie_expires: 60 * 60 * 24 * 30,
            send_page_view: false,
          },
        })
      );
    });
  });

  describe('エラーハンドリングテスト', () => {
    beforeEach(() => {
      setupGA4TestEnvironment();
    });

    afterEach(() => {
      cleanupGA4TestEnvironment();
    });

    it('環境変数が設定されていない場合でもサービスは動作する', async () => {
      // GA4測定IDが未設定の環境をセットアップ（react-ga4は空文字列でも初期化される）
      setupGA4TestEnvironment({ measurementId: '' });

      const { result } = renderHook(() => useGA4Service());

      await act(async () => {
        result.current.setConsent(true);
        await waitForAsyncOperation(TEST_CONSTANTS.WAIT_TIME.MEDIUM);
      });

      // 同意が正しく記録されることを確認
      expect(result.current.hasConsent).toBe(true);
      expect(result.current.isEnabled).toBe(true);

      const testEvent = createTestEventData();
      await act(async () => {
        result.current.trackEvent(testEvent.eventName, testEvent.parameters);
        await waitForAsyncOperation(10);
      });

      // react-ga4は初期化されるため、メソッド呼び出しは行われる
      // （ただし無効な測定IDのため実際のデータ送信はされない）
      expect(mockedReactGA.event).toHaveBeenCalledWith(
        testEvent.eventName,
        testEvent.parameters
      );
    });

    it('analytics無効設定時は同意があってもイベント送信を行わない', async () => {
      setupGA4TestEnvironment({ analyticsEnabled: false });

      const { result } = renderHook(() => useGA4Service());

      await act(async () => {
        result.current.setConsent(true);
        await waitForAsyncOperation(TEST_CONSTANTS.WAIT_TIME.MEDIUM);
      });

      const testEvent = createTestEventData();
      await act(async () => {
        result.current.trackEvent(testEvent.eventName, testEvent.parameters);
        await waitForAsyncOperation(10);
      });

      expect(mockedReactGA.event).not.toHaveBeenCalled();
    });

    it('不正な測定IDが設定された場合のエラーハンドリング', async () => {
      setupGA4TestEnvironment({ measurementId: 'INVALID-ID' });

      const { result } = renderHook(() => useGA4Service());

      // エラーが発生してもアプリケーションがクラッシュしないことを確認
      await expect(
        act(async () => {
          result.current.setConsent(true);
          await waitForAsyncOperation(TEST_CONSTANTS.WAIT_TIME.SHORT);
        })
      ).resolves.not.toThrow();
    });
  });
});

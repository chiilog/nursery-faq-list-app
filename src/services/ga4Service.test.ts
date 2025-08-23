import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import {
  setupAnalyticsTest,
  cleanupAnalyticsTest,
  TEST_CONSTANTS,
  createTestEventData,
  createTestPageViewData,
  waitForAsyncOperation,
  expectReactGAEvent,
  expectReactGASend,
  mockedReactGA,
} from '../test-utils/analyticsTestHelper';
import { useGA4Service } from './ga4Service';

// ga4Service の自動モックを解除
vi.unmock('./ga4Service');

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
  // 元の (operation, context) に合わせて第2引数も受け取る
  safeExecute: vi.fn(<T>(operation: () => Promise<T> | T, _context?: string) =>
    Promise.resolve(operation())
  ),
}));

describe('useGA4Service', () => {
  describe('基本機能テスト', () => {
    beforeEach(() => {
      setupAnalyticsTest();
    });

    afterEach(() => {
      cleanupAnalyticsTest();
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
  });

  describe('Do Not Track シナリオ', () => {
    beforeEach(() => {
      setupAnalyticsTest({ doNotTrack: '1' });
    });

    afterEach(() => {
      cleanupAnalyticsTest();
    });

    it('Do Not Track有効時は同意があっても初期化を回避する', async () => {
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
            allow_google_signals: false,
            allow_ad_personalization_signals: false,
            storage: 'none',
          },
        })
      );
    });
  });

  describe('エラーハンドリングテスト', () => {
    beforeEach(() => {
      setupAnalyticsTest();
    });

    afterEach(() => {
      cleanupAnalyticsTest();
    });

    it('測定ID未設定時はno-opとなりイベント送信を行わない', async () => {
      // GA4測定IDが未設定の環境をセットアップ
      setupAnalyticsTest({ measurementId: '' });

      const { result } = renderHook(() => useGA4Service());

      await act(async () => {
        result.current.setConsent(true);
        await waitForAsyncOperation(TEST_CONSTANTS.WAIT_TIME.MEDIUM);
      });

      // 同意は記録されるが、測定ID未設定のためサービスは無効のまま
      expect(result.current.hasConsent).toBe(true);
      expect(result.current.isEnabled).toBe(false);

      const testEvent = createTestEventData();
      await act(async () => {
        result.current.trackEvent(testEvent.eventName, testEvent.parameters);
        await waitForAsyncOperation(10);
      });

      // 測定ID未設定の場合はno-opとなり、ReactGAの初期化・イベント送信は行われない
      expect(mockedReactGA.initialize).not.toHaveBeenCalled();
      expect(mockedReactGA.event).not.toHaveBeenCalled();
    });

    it('analytics無効設定時は同意があってもイベント送信を行わない', async () => {
      setupAnalyticsTest({ analyticsEnabled: false });

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
      setupAnalyticsTest({ measurementId: 'INVALID-ID' });

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

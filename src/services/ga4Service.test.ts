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

const setupGA4TestEnvironment = () => {
  mockGlobalAnalytics();
  vi.clearAllMocks();

  // テスト用の環境変数を設定
  vi.stubEnv('VITE_GA4_MEASUREMENT_ID', 'G-TEST123456789');
  vi.stubEnv('VITE_ANALYTICS_ENABLED', 'true');

  // Do Not Trackを無効化
  Object.defineProperty(navigator, 'doNotTrack', {
    writable: true,
    value: '0',
  });

  // react-ga4のモックをクリア
  mockedReactGA.initialize.mockClear();
  mockedReactGA.event.mockClear();
  mockedReactGA.send.mockClear();

  // シングルトンインスタンスをリセット
  resetGA4ServiceInstance();
};

const cleanupGA4TestEnvironment = () => {
  cleanupGlobalAnalytics();
  vi.unstubAllEnvs();
  vi.clearAllMocks();
};

const expectReactGAEvent = (
  eventName: string,
  parameters?: Record<string, unknown>
) => {
  expect(mockedReactGA.event).toHaveBeenCalledWith(eventName, parameters);
};

const expectReactGASend = (hitData: Record<string, unknown>) => {
  expect(mockedReactGA.send).toHaveBeenCalledWith(hitData);
};

describe('useGA4Service', () => {
  describe('Hook Tests', () => {
    beforeEach(() => {
      setupGA4TestEnvironment();
    });

    afterEach(() => {
      cleanupGA4TestEnvironment();
    });

    it('useGA4Service が正しく初期化される', () => {
      const { result } = renderHook(() => useGA4Service());

      expect(result.current.isEnabled).toBe(false);
      expect(result.current.hasConsent).toBe(false);
      expect(typeof result.current.setConsent).toBe('function');
      expect(typeof result.current.trackEvent).toBe('function');
      expect(typeof result.current.trackPageView).toBe('function');
    });

    it('同意設定の変更が正しく動作する', () => {
      const { result } = renderHook(() => useGA4Service());

      act(() => {
        result.current.setConsent(true);
      });

      expect(result.current.hasConsent).toBe(true);

      act(() => {
        result.current.setConsent(false);
      });

      expect(result.current.hasConsent).toBe(false);
      expect(result.current.isEnabled).toBe(false);
    });

    it('同意後にサービスが初期化される', async () => {
      const { result } = renderHook(() => useGA4Service());

      act(() => {
        result.current.setConsent(true);
      });

      await waitFor(() => {
        expect(result.current.hasConsent).toBe(true);
        expect(result.current.isEnabled).toBe(true);
      });

      // react-ga4のinitializeが呼ばれることを確認
      expect(mockedReactGA.initialize).toHaveBeenCalled();
    });

    it('Do Not Track設定時は初期化されない', async () => {
      Object.defineProperty(navigator, 'doNotTrack', {
        writable: true,
        value: '1',
      });

      const { result } = renderHook(() => useGA4Service());

      act(() => {
        result.current.setConsent(true);
      });

      await waitFor(() => {
        expect(result.current.hasConsent).toBe(true);
        expect(result.current.isEnabled).toBe(false);
      });

      // react-ga4のinitializeが呼ばれないことを確認
      expect(mockedReactGA.initialize).not.toHaveBeenCalled();
    });

    it('trackEventが正しく動作する', async () => {
      const { result } = renderHook(() => useGA4Service());

      act(() => {
        result.current.setConsent(true);
      });

      await waitFor(() => expect(result.current.isEnabled).toBe(true));

      // 初期化時のコールをクリア
      mockedReactGA.event.mockClear();

      act(() => {
        result.current.trackEvent('test_event', { test: 'parameter' });
      });

      expectReactGAEvent('test_event', { test: 'parameter' });
    });

    it('trackPageViewが正しく動作する', async () => {
      const { result } = renderHook(() => useGA4Service());

      act(() => {
        result.current.setConsent(true);
      });

      await waitFor(() => expect(result.current.isEnabled).toBe(true));

      // 初期化時のコールをクリア
      mockedReactGA.send.mockClear();

      act(() => {
        result.current.trackPageView('Test Page', '/test');
      });

      expectReactGASend({
        hitType: 'pageview',
        title: 'Test Page',
        page: '/test',
      });
    });

    it('同意なしではイベント送信されない', () => {
      const { result } = renderHook(() => useGA4Service());

      act(() => {
        result.current.trackEvent('test_event', { test: 'parameter' });
      });

      expect(mockedReactGA.event).not.toHaveBeenCalled();
    });

    it('useEffect依存配列が正しく機能する', async () => {
      const { result, rerender } = renderHook(() => useGA4Service());

      // 最初の同意設定
      act(() => {
        result.current.setConsent(true);
      });

      await waitFor(() => expect(result.current.isEnabled).toBe(true));

      // フックの再レンダリング
      rerender();

      // 同じ状態が維持されることを確認
      expect(result.current.isEnabled).toBe(true);
      expect(result.current.hasConsent).toBe(true);
    });

    it('クリーンアップ関数が適切に動作する', () => {
      const { unmount } = renderHook(() => useGA4Service());

      // アンマウント時にクリーンアップが実行される
      expect(() => unmount()).not.toThrow();
    });

    it('react-ga4の初期化オプションが正しく設定される', async () => {
      const { result } = renderHook(() => useGA4Service());

      act(() => {
        result.current.setConsent(true);
      });

      await waitFor(() => expect(result.current.isEnabled).toBe(true));

      // react-ga4のinitializeが正しいオプションで呼ばれることを確認
      expect(mockedReactGA.initialize).toHaveBeenCalledWith('G-TEST123456789', {
        testMode: true, // import.meta.env.MODE === 'test'の結果
        gaOptions: {
          anonymize_ip: true,
          cookie_expires: 60 * 60 * 24 * 30,
          send_page_view: false,
        },
      });
    });
  });
});

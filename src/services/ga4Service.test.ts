import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useGA4Service } from './ga4Service';

// グローバルmocks
const mockGtag = vi.fn();

const setupGA4TestEnvironment = () => {
  vi.stubGlobal('window', {
    gtag: mockGtag,
    dataLayer: [],
  });
  vi.clearAllMocks();
};

const cleanupGA4TestEnvironment = () => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
};

const expectGA4EventCall = (
  eventName: string,
  parameters?: Record<string, unknown>
) => {
  expect(mockGtag).toHaveBeenCalledWith('event', eventName, parameters);
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
    });

    it('trackEventが正しく動作する', async () => {
      const { result } = renderHook(() => useGA4Service());

      act(() => {
        result.current.setConsent(true);
      });

      await waitFor(() => expect(result.current.isEnabled).toBe(true));

      // 初期化時に consent 'default' と config が実行されるため、モックをクリアしてから測定
      mockGtag.mockClear();

      act(() => {
        result.current.trackEvent('test_event', { test: 'parameter' });
      });

      expectGA4EventCall('test_event', { test: 'parameter' });
    });

    it('trackPageViewが正しく動作する', async () => {
      const { result } = renderHook(() => useGA4Service());

      act(() => {
        result.current.setConsent(true);
      });

      await waitFor(() => expect(result.current.isEnabled).toBe(true));

      // 初期化時のコールをクリア
      mockGtag.mockClear();

      act(() => {
        result.current.trackPageView('Test Page', '/test');
      });

      expectGA4EventCall('page_view', {
        page_title: 'Test Page',
        page_location: '/test',
      });
    });

    it('同意なしではイベント送信されない', () => {
      const { result } = renderHook(() => useGA4Service());

      act(() => {
        result.current.trackEvent('test_event', { test: 'parameter' });
      });

      expect(mockGtag).not.toHaveBeenCalled();
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
  });
});

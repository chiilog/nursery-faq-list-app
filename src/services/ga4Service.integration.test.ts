import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useGA4Service } from './ga4Service';
import { PrivacyManager } from './privacyManager';
import {
  setupGA4IntegrationTestEnvironment,
  cleanupGA4TestEnvironment,
  expectGA4ConsentCall,
  mockGtag,
} from '../test/ga4TestUtils';

describe('useGA4Service + PrivacyManager Integration', () => {
  describe('Hook Integration Tests', () => {
    let privacyManager: PrivacyManager;

    beforeEach(() => {
      setupGA4IntegrationTestEnvironment();
      privacyManager = new PrivacyManager();
    });

    afterEach(() => {
      cleanupGA4TestEnvironment();
    });

    it('useGA4Service + PrivacyManagerの連携が正しく動作する', async () => {
      const { result } = renderHook(() => useGA4Service());

      // 初期状態では両方とも無効
      expect(result.current.isEnabled).toBe(false);
      expect(result.current.hasConsent).toBe(false);
      expect(privacyManager.getSettings().googleAnalytics).toBe(false);

      // PrivacyManagerで同意を設定
      privacyManager.setGoogleAnalyticsConsent(true);
      expect(privacyManager.getSettings().googleAnalytics).toBe(true);

      // useGA4Serviceに同意を反映
      act(() => {
        result.current.setConsent(privacyManager.getSettings().googleAnalytics);
      });

      await waitFor(() => {
        expect(result.current.hasConsent).toBe(true);
        expect(result.current.isEnabled).toBe(true);
      });
    });

    it('PrivacyManagerが同意を取り消した時にuseGA4Serviceが無効化される', async () => {
      const { result } = renderHook(() => useGA4Service());

      // 最初に同意を与えて初期化
      privacyManager.setGoogleAnalyticsConsent(true);

      act(() => {
        result.current.setConsent(true);
      });

      await waitFor(() => {
        expect(result.current.isEnabled).toBe(true);
        expect(result.current.hasConsent).toBe(true);
      });

      // 同意を取り消し
      privacyManager.setGoogleAnalyticsConsent(false);

      act(() => {
        result.current.setConsent(privacyManager.getSettings().googleAnalytics);
      });

      expect(result.current.hasConsent).toBe(false);
      expect(result.current.isEnabled).toBe(false);
    });

    it('React HooksでのPrivacyManager変更リスナーとuseGA4Service連携', async () => {
      const { result } = renderHook(() => useGA4Service());
      let settingsUpdateCount = 0;

      // PrivacyManagerの変更監視を設定（Reactパターン）
      const unsubscribe = privacyManager.addChangeListener((event) => {
        settingsUpdateCount++;
        // useGA4Serviceの同意状態を更新（React act内で実行）
        act(() => {
          result.current.setConsent(event.current.googleAnalytics);
        });
      });

      // 同意を付与
      privacyManager.setGoogleAnalyticsConsent(true);
      expect(settingsUpdateCount).toBe(1);
      expect(result.current.hasConsent).toBe(true);

      // 初期化の完了を待つ
      await waitFor(() => expect(result.current.isEnabled).toBe(true));

      // 同意を取り消し
      privacyManager.setGoogleAnalyticsConsent(false);
      expect(settingsUpdateCount).toBe(2);
      expect(result.current.hasConsent).toBe(false);
      expect(result.current.isEnabled).toBe(false);

      unsubscribe();
    });

    it('useGA4ServiceでのConsent Mode v2統合', async () => {
      const { result } = renderHook(() => useGA4Service());

      // 同意を設定して初期化
      act(() => {
        result.current.setConsent(true);
      });

      await waitFor(() => expect(result.current.isEnabled).toBe(true));

      // 初期化時のコールをクリア
      mockGtag.mockClear();

      // Consent Mode更新
      act(() => {
        result.current.updateConsentMode({
          analytics_storage: 'granted',
          ad_storage: 'denied',
        });
      });

      expectGA4ConsentCall('update', {
        analytics_storage: 'granted',
        ad_storage: 'denied',
      });

      // 地域指定付きConsent Mode更新
      act(() => {
        result.current.updateConsentMode(
          {
            analytics_storage: 'denied',
            ad_storage: 'denied',
          },
          ['AT', 'BE', 'DE']
        );
      });

      expectGA4ConsentCall(
        'update',
        {
          analytics_storage: 'denied',
          ad_storage: 'denied',
          region: ['AT', 'BE', 'DE'],
        },
        1
      );
    });

    it('useGA4ServiceとPrivacyManagerの統合されたワークフロー', async () => {
      const { result } = renderHook(() => useGA4Service());

      // 1. 初期状態：すべて無効
      expect(privacyManager.getSettings().googleAnalytics).toBe(false);
      expect(result.current.hasConsent).toBe(false);
      expect(result.current.isEnabled).toBe(false);

      // 2. ユーザーがクッキーバナーで「同意する」をクリック
      privacyManager.setAllConsent(true);
      const settings = privacyManager.getSettings();

      expect(settings.googleAnalytics).toBe(true);
      expect(settings.hasExplicitConsent).toBe(true);

      // 3. useGA4Serviceに同意状態を反映
      act(() => {
        result.current.setConsent(settings.googleAnalytics);
      });

      await waitFor(() => {
        expect(result.current.hasConsent).toBe(true);
        expect(result.current.isEnabled).toBe(true);
      });

      // 4. イベント送信が可能な状態になる
      expect(() => {
        act(() => {
          result.current.trackEvent('page_view', { page_title: 'Test Page' });
        });
      }).not.toThrow();
    });

    it('プライバシー設定画面でのuseGA4Service個別設定変更', async () => {
      const { result } = renderHook(() => useGA4Service());

      // 1. 全て同意した状態から開始
      privacyManager.setAllConsent(true);

      act(() => {
        result.current.setConsent(true);
      });

      await waitFor(() => expect(result.current.isEnabled).toBe(true));

      // 2. プライバシー設定画面でGoogleAnalyticsのみ無効化
      privacyManager.setGoogleAnalyticsConsent(false);

      act(() => {
        result.current.setConsent(privacyManager.getSettings().googleAnalytics);
      });

      expect(result.current.hasConsent).toBe(false);
      expect(result.current.isEnabled).toBe(false);

      // 3. 再度有効化
      privacyManager.setGoogleAnalyticsConsent(true);

      act(() => {
        result.current.setConsent(privacyManager.getSettings().googleAnalytics);
      });

      await waitFor(() => {
        expect(result.current.hasConsent).toBe(true);
        expect(result.current.isEnabled).toBe(true);
      });
    });

    it('useGA4Serviceのメモリリーク防止とクリーンアップ', () => {
      const { unmount } = renderHook(() => useGA4Service());

      // クリーンアップが正常に動作することを確認
      expect(() => {
        unmount();
      }).not.toThrow();
    });
  });
});

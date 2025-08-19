/**
 * PrivacyManager 並行処理テスト
 *
 * 複数の設定変更操作が同時に実行された場合の
 * データ整合性とパフォーマンスを検証します
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PrivacyManager } from './privacyManager';

describe('PrivacyManager 並行処理テスト', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      },
      writable: true,
    });
  });

  describe('並行処理性能', () => {
    it('高速連続設定変更のデータ整合性', () => {
      const manager = new PrivacyManager();

      manager.setGoogleAnalyticsConsent(true);
      manager.setGoogleAnalyticsConsent(false);
      manager.setMicrosoftClarityConsent(true);
      manager.setGoogleAnalyticsConsent(true);
      manager.setMicrosoftClarityConsent(false);

      const settings = manager.getSettings();
      expect(settings.googleAnalytics).toBe(true);
      expect(settings.microsoftClarity).toBe(false);
      expect(localStorage.setItem).toHaveBeenCalled();
    });

    it('同時設定変更の安全性', async () => {
      const manager = new PrivacyManager();

      const promises = [
        Promise.resolve(manager.setGoogleAnalyticsConsent(true)),
        Promise.resolve(manager.setMicrosoftClarityConsent(true)),
        Promise.resolve(
          manager.updateSettings({
            googleAnalytics: false,
            microsoftClarity: false,
          })
        ),
      ];

      await Promise.all(promises);

      expect(() => {
        const settings = manager.getSettings();
        expect(typeof settings.googleAnalytics).toBe('boolean');
        expect(typeof settings.microsoftClarity).toBe('boolean');
      }).not.toThrow();
    });

    it('大量操作のパフォーマンス', () => {
      const manager = new PrivacyManager();
      const startTime = performance.now();

      for (let i = 0; i < 1000; i++) {
        manager.setGoogleAnalyticsConsent(i % 2 === 0);
        manager.setMicrosoftClarityConsent(i % 3 === 0);
      }

      const endTime = performance.now();
      const executionTime = endTime - startTime;

      expect(executionTime).toBeLessThan(2000);

      const settings = manager.getSettings();
      expect(typeof settings.googleAnalytics).toBe('boolean');
      expect(typeof settings.microsoftClarity).toBe('boolean');
    });
  });
});

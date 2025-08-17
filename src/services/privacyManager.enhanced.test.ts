/**
 * PrivacyManager セキュリティ・品質テスト
 *
 * データ保護、エラー耐性、パフォーマンスの観点から
 * プライバシー管理機能の堅牢性を検証します
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PrivacyManager } from './privacyManager';

describe('PrivacyManager 拡張テスト', () => {
  let privacyManager: PrivacyManager;

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

    vi.spyOn(console, 'warn').mockImplementation(() => {});
    privacyManager = new PrivacyManager();
  });

  describe('セキュリティテスト', () => {
    it('プライバシー設定データが適切に保存される', () => {
      privacyManager.setGoogleAnalyticsConsent(true);
      privacyManager.setMicrosoftClarityConsent(true);

      const setItemCalls = vi.mocked(localStorage.setItem).mock.calls;
      const lastCall = setItemCalls[setItemCalls.length - 1];
      const storedData = lastCall[1];

      expect(storedData).toBeDefined();
      expect(typeof storedData).toBe('string');
      expect(() => JSON.parse(storedData)).not.toThrow();

      const parsedData = JSON.parse(storedData);
      expect(parsedData).toHaveProperty('googleAnalytics');
      expect(parsedData).toHaveProperty('microsoftClarity');
      expect(parsedData).toHaveProperty('consentTimestamp');
      expect(parsedData).toHaveProperty('consentVersion');
    });

    it('不正なデータ形式に対する耐性', () => {
      vi.mocked(localStorage.getItem).mockReturnValue('invalid json data');

      expect(() => {
        const manager = new PrivacyManager();
        const settings = manager.getSettings();

        expect(settings.googleAnalytics).toBe(false);
        expect(settings.microsoftClarity).toBe(false);
      }).not.toThrow();
    });

    it('データ型検証', () => {
      const invalidTypeData = {
        googleAnalytics: 'invalid_boolean',
        microsoftClarity: 123,
        consentTimestamp: 'invalid_date',
        consentVersion: null,
      };

      vi.mocked(localStorage.getItem).mockReturnValue(
        JSON.stringify(invalidTypeData)
      );

      expect(() => {
        const manager = new PrivacyManager();
        const settings = manager.getSettings();

        expect(typeof settings.googleAnalytics).toBe('boolean');
        expect(typeof settings.microsoftClarity).toBe('boolean');
        expect(settings.consentTimestamp).toBeInstanceOf(Date);
        expect(typeof settings.consentVersion).toBe('string');
      }).not.toThrow();
    });
  });

  describe('境界値テスト', () => {
    it('現在時刻（有効期限内）', () => {
      const now = new Date();

      privacyManager.updateSettings({
        consentTimestamp: now,
      });

      expect(privacyManager.isConsentValid()).toBe(true);
    });

    it('未来の日付（有効期限内）', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 2);

      privacyManager.updateSettings({
        consentTimestamp: futureDate,
      });

      expect(privacyManager.isConsentValid()).toBe(true);
    });

    it('極端に古い日付（有効期限切れ）', () => {
      const veryOldDate = new Date('1900-01-01');

      privacyManager.updateSettings({
        consentTimestamp: veryOldDate,
      });

      expect(privacyManager.isConsentValid()).toBe(false);
    });
  });

  describe('エラーハンドリング', () => {
    it('LocalStorage読み込みエラー処理', () => {
      vi.mocked(localStorage.getItem).mockImplementation(() => {
        throw new Error('Storage access denied');
      });

      expect(() => {
        const manager = new PrivacyManager();
        const settings = manager.getSettings();

        expect(settings.googleAnalytics).toBe(false);
        expect(settings.microsoftClarity).toBe(false);
      }).not.toThrow();
    });

    it('LocalStorage書き込みエラー処理', () => {
      vi.mocked(localStorage.setItem).mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      expect(() => {
        privacyManager.setGoogleAnalyticsConsent(true);
      }).not.toThrow();
    });

    it('JSON.parse エラー処理', () => {
      vi.mocked(localStorage.getItem).mockReturnValue('{"invalid": json}');

      expect(() => {
        const manager = new PrivacyManager();
        const settings = manager.getSettings();

        expect(settings.googleAnalytics).toBe(false);
        expect(settings.microsoftClarity).toBe(false);
      }).not.toThrow();
    });
  });

  describe('パフォーマンステスト', () => {
    it('大量の設定変更が短時間で処理される', () => {
      const startTime = performance.now();

      for (let i = 0; i < 1000; i++) {
        privacyManager.setGoogleAnalyticsConsent(i % 2 === 0);
        privacyManager.setMicrosoftClarityConsent(i % 3 === 0);
      }

      const endTime = performance.now();
      const executionTime = endTime - startTime;

      expect(executionTime).toBeLessThan(1000);

      const settings = privacyManager.getSettings();
      expect(typeof settings.googleAnalytics).toBe('boolean');
      expect(typeof settings.microsoftClarity).toBe('boolean');
    });

    it('高速な連続設定変更の処理', () => {
      privacyManager.setGoogleAnalyticsConsent(true);
      privacyManager.setGoogleAnalyticsConsent(false);
      privacyManager.setMicrosoftClarityConsent(true);
      privacyManager.setGoogleAnalyticsConsent(true);
      privacyManager.setMicrosoftClarityConsent(false);

      const settings = privacyManager.getSettings();
      expect(settings.googleAnalytics).toBe(true);
      expect(settings.microsoftClarity).toBe(false);

      expect(localStorage.setItem).toHaveBeenCalled();
    });
  });
});

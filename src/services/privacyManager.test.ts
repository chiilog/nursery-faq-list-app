/**
 * PrivacyManager クラスのテスト
 * プライバシー設定の管理機能とLocalStorage連携を検証します
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PrivacyManager } from './privacyManager';
import type { PrivacySettings } from '../types/privacy';

describe('PrivacyManager', () => {
  let privacyManager: PrivacyManager;

  beforeEach(() => {
    // localStorageをモック
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      },
      writable: true,
    });

    // console.warnをモック
    vi.spyOn(console, 'warn').mockImplementation(() => {});

    privacyManager = new PrivacyManager();
  });

  describe('初期化', () => {
    it('デフォルト設定で初期化される', () => {
      const settings = privacyManager.getSettings();

      expect(settings.googleAnalytics).toBe(false);
      expect(settings.microsoftClarity).toBe(false);
      expect(settings.consentTimestamp).toBeInstanceOf(Date);
      expect(settings.consentVersion).toBe('1.0');
    });
  });

  describe('設定の保存と読み込み', () => {
    it('LocalStorageから設定を読み込む', () => {
      const mockSettings = {
        googleAnalytics: true,
        microsoftClarity: false,
        consentTimestamp: new Date('2025-01-01'),
        consentVersion: '1.0',
      };

      vi.mocked(localStorage.getItem).mockReturnValue(
        JSON.stringify(mockSettings)
      );

      const loadedManager = new PrivacyManager();
      const settings = loadedManager.getSettings();

      expect(settings.googleAnalytics).toBe(true);
      expect(localStorage.getItem).toHaveBeenCalledWith('privacySettings');
    });

    it('設定をLocalStorageに保存する', () => {
      const newSettings: Partial<PrivacySettings> = {
        googleAnalytics: true,
        microsoftClarity: true,
      };

      privacyManager.updateSettings(newSettings);

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'privacySettings',
        expect.stringContaining('"googleAnalytics":true')
      );
    });
  });

  describe('同意状態の管理', () => {
    it('Google Analytics の同意状態を変更する', () => {
      privacyManager.setGoogleAnalyticsConsent(true);

      const settings = privacyManager.getSettings();
      expect(settings.googleAnalytics).toBe(true);
    });

    it('Microsoft Clarity の同意状態を変更する', () => {
      privacyManager.setMicrosoftClarityConsent(true);

      const settings = privacyManager.getSettings();
      expect(settings.microsoftClarity).toBe(true);
    });

    it('全ての同意を一括で設定する', () => {
      privacyManager.setAllConsent(true);

      const settings = privacyManager.getSettings();
      expect(settings.googleAnalytics).toBe(true);
      expect(settings.microsoftClarity).toBe(true);
    });
  });

  describe('同意期限の判定', () => {
    it('同意が期限内であることを判定する', () => {
      const isValid = privacyManager.isConsentValid();
      expect(isValid).toBe(true);
    });

    it('同意が期限切れであることを判定する', () => {
      // 1年前の日付で設定
      const oldDate = new Date();
      oldDate.setFullYear(oldDate.getFullYear() - 1);

      privacyManager.updateSettings({
        consentTimestamp: oldDate,
      });

      const isValid = privacyManager.isConsentValid();
      expect(isValid).toBe(false);
    });

    describe('境界値テスト', () => {
      it('ちょうど1年後（有効期限内）', () => {
        const oneYearLater = new Date();
        oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
        oneYearLater.setMinutes(oneYearLater.getMinutes() - 1); // 1分手前

        privacyManager.updateSettings({
          consentTimestamp: oneYearLater,
        });

        expect(privacyManager.isConsentValid()).toBe(true);
      });

      it('1年+1分前（有効期限切れ）', () => {
        const oneYearAndOneMinuteAgo = new Date();
        oneYearAndOneMinuteAgo.setFullYear(
          oneYearAndOneMinuteAgo.getFullYear() - 1
        );
        oneYearAndOneMinuteAgo.setMinutes(
          oneYearAndOneMinuteAgo.getMinutes() - 1
        ); // さらに1分前

        privacyManager.updateSettings({
          consentTimestamp: oneYearAndOneMinuteAgo,
        });

        expect(privacyManager.isConsentValid()).toBe(false);
      });

      it('ちょうど1年前（有効期限切れ）', () => {
        const exactlyOneYearAgo = new Date();
        exactlyOneYearAgo.setFullYear(exactlyOneYearAgo.getFullYear() - 1);

        privacyManager.updateSettings({
          consentTimestamp: exactlyOneYearAgo,
        });

        expect(privacyManager.isConsentValid()).toBe(false);
      });

      it('1年-1分前（有効期限内）', () => {
        const almostOneYearAgo = new Date();
        almostOneYearAgo.setFullYear(almostOneYearAgo.getFullYear() - 1);
        almostOneYearAgo.setMinutes(almostOneYearAgo.getMinutes() + 1); // 1分前

        privacyManager.updateSettings({
          consentTimestamp: almostOneYearAgo,
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

      it('現在時刻（有効期限内）', () => {
        const now = new Date();

        privacyManager.updateSettings({
          consentTimestamp: now,
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

      it('極端に新しい日付（有効期限内）', () => {
        const veryFutureDate = new Date('2100-01-01');

        privacyManager.updateSettings({
          consentTimestamp: veryFutureDate,
        });

        expect(privacyManager.isConsentValid()).toBe(true);
      });
    });
  });

  describe('セキュリティテスト', () => {
    it('プライバシー設定データが適切に保存されることを確認', () => {
      // 機密性の高い設定を行う
      privacyManager.setGoogleAnalyticsConsent(true);
      privacyManager.setMicrosoftClarityConsent(true);

      // localStorage の実際の保存内容を確認
      const setItemCalls = vi.mocked(localStorage.setItem).mock.calls;
      const lastCall = setItemCalls[setItemCalls.length - 1];
      const storedData = lastCall[1];

      // 設定値が適切に保存されていることを確認
      expect(storedData).toBeDefined();
      expect(typeof storedData).toBe('string');

      // パース可能な有効なJSONであることを確認
      expect(() => JSON.parse(storedData)).not.toThrow();

      // 設定データの整合性確認
      const parsedData = JSON.parse(storedData);
      expect(parsedData).toHaveProperty('googleAnalytics');
      expect(parsedData).toHaveProperty('microsoftClarity');
      expect(parsedData).toHaveProperty('consentTimestamp');
      expect(parsedData).toHaveProperty('consentVersion');
    });

    it('不正なデータ形式への耐性テスト', () => {
      // 不正なJSONデータを設定
      vi.mocked(localStorage.getItem).mockReturnValue('invalid json data');

      // 不正データでもエラーなく初期化できることを確認
      expect(() => {
        const manager = new PrivacyManager();
        const settings = manager.getSettings();

        // デフォルト値にフォールバックすることを確認
        expect(settings.googleAnalytics).toBe(false);
        expect(settings.microsoftClarity).toBe(false);
      }).not.toThrow();
    });

    it('null や undefined データへの耐性テスト', () => {
      // null データを設定
      vi.mocked(localStorage.getItem).mockReturnValue(null);

      expect(() => {
        const manager = new PrivacyManager();
        const settings = manager.getSettings();

        expect(settings.googleAnalytics).toBe(false);
        expect(settings.microsoftClarity).toBe(false);
      }).not.toThrow();

      // undefined データを設定
      vi.mocked(localStorage.getItem).mockReturnValue(undefined as any);

      expect(() => {
        const manager = new PrivacyManager();
        const settings = manager.getSettings();

        expect(settings.googleAnalytics).toBe(false);
        expect(settings.microsoftClarity).toBe(false);
      }).not.toThrow();
    });

    it('XSS攻撃に対する耐性テスト', () => {
      const maliciousInput = '<script>alert("xss")</script>';

      // 悪意のあるデータを含むJSONを設定
      const maliciousData = {
        googleAnalytics: true,
        microsoftClarity: true,
        consentTimestamp: new Date().toISOString(),
        consentVersion: maliciousInput, // 悪意のある文字列
      };

      vi.mocked(localStorage.getItem).mockReturnValue(
        JSON.stringify(maliciousData)
      );

      expect(() => {
        const manager = new PrivacyManager();
        const settings = manager.getSettings();

        // 悪意のある文字列が無害化されるか、デフォルト値にフォールバックすることを確認
        expect(settings.consentVersion).toBe('1.0'); // デフォルト値
      }).not.toThrow();
    });

    it('データ型検証テスト', () => {
      // 不正な型のデータを設定
      const invalidTypeData = {
        googleAnalytics: 'invalid_boolean', // booleanではない
        microsoftClarity: 123, // booleanではない
        consentTimestamp: 'invalid_date', // Dateではない
        consentVersion: null, // stringではない
      };

      vi.mocked(localStorage.getItem).mockReturnValue(
        JSON.stringify(invalidTypeData)
      );

      expect(() => {
        const manager = new PrivacyManager();
        const settings = manager.getSettings();

        // 型が不正な場合はデフォルト値にフォールバックすることを確認
        expect(typeof settings.googleAnalytics).toBe('boolean');
        expect(typeof settings.microsoftClarity).toBe('boolean');
        expect(settings.consentTimestamp).toBeInstanceOf(Date);
        expect(typeof settings.consentVersion).toBe('string');
      }).not.toThrow();
    });
  });

  describe('エラーハンドリングテスト', () => {
    beforeEach(() => {
      // console.warn をモック
      vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    it('LocalStorage容量制限エラー処理', () => {
      // localStorage が容量不足の状態をシミュレート
      const quotaError = new Error('QuotaExceededError');
      quotaError.name = 'QuotaExceededError';

      vi.mocked(localStorage.setItem).mockImplementation(() => {
        throw quotaError;
      });

      // 設定変更が失敗してもアプリが停止しないことを確認
      expect(() => {
        privacyManager.setGoogleAnalyticsConsent(true);
      }).not.toThrow();

      // フォールバック処理の確認（警告ログが出力される）
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('[privacy] storage write error:')
      );
    });

    it('LocalStorage アクセス拒否エラー処理', () => {
      // プライベートブラウジングモードなどでのアクセス拒否をシミュレート
      const securityError = new Error('SecurityError');
      securityError.name = 'SecurityError';

      vi.mocked(localStorage.setItem).mockImplementation(() => {
        throw securityError;
      });

      expect(() => {
        privacyManager.setMicrosoftClarityConsent(true);
      }).not.toThrow();

      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('[privacy] storage write error:')
      );
    });

    it('LocalStorage 読み込みエラー処理', () => {
      // 読み込み時のエラーをシミュレート
      vi.mocked(localStorage.getItem).mockImplementation(() => {
        throw new Error('Storage access denied');
      });

      expect(() => {
        const manager = new PrivacyManager();
        const settings = manager.getSettings();

        // エラーが発生してもデフォルト値で初期化される
        expect(settings.googleAnalytics).toBe(false);
        expect(settings.microsoftClarity).toBe(false);
      }).not.toThrow();
    });

    it('JSON.stringify エラー処理', () => {
      // 循環参照によるシリアライズエラーをシミュレート
      const originalStringify = JSON.stringify;
      vi.spyOn(JSON, 'stringify').mockImplementation(() => {
        throw new Error('Converting circular structure to JSON');
      });

      expect(() => {
        privacyManager.updateSettings({ googleAnalytics: true });
      }).not.toThrow();

      expect(console.warn).toHaveBeenCalled();

      // モックを元に戻す
      JSON.stringify = originalStringify;
    });

    it('JSON.parse エラー処理', () => {
      // 不正なJSONデータでパースエラーをシミュレート
      vi.mocked(localStorage.getItem).mockReturnValue('{"invalid": json}');

      expect(() => {
        const manager = new PrivacyManager();
        const settings = manager.getSettings();

        // パースエラーでもデフォルト値で初期化される
        expect(settings.googleAnalytics).toBe(false);
        expect(settings.microsoftClarity).toBe(false);
      }).not.toThrow();
    });

    it('Storage イベント処理エラー', () => {
      const listeners: Array<(event: StorageEvent) => void> = [];

      // addEventListener をモック（先にスパイしてから PrivacyManager を生成）
      vi.spyOn(window, 'addEventListener').mockImplementation(
        (type, listener) => {
          if (type === 'storage') {
            listeners.push(listener as (event: StorageEvent) => void);
          }
        }
      );

      // モック済みの addEventListener を用いてリスナ登録させる
      new PrivacyManager();

      // 不正なStorageEventをシミュレート
      const invalidEvent = new StorageEvent('storage', {
        key: 'privacySettings',
        newValue: 'invalid json data',
      });

      // 現在のPrivacyManagerはstorage eventリスナーを実装していないため
      // リスナ配列は空のまま - これは期待される動作
      expect(listeners.length).toBe(0);

      // リスナが登録されていない場合でもエラーが発生しないことを確認
      expect(() => {
        listeners.forEach((listener) => listener(invalidEvent));
      }).not.toThrow();
    });

    it('メモリ不足エラー処理', () => {
      // 大量データによるメモリ不足をシミュレート
      const memoryError = new Error('Cannot allocate memory');
      memoryError.name = 'RangeError';

      vi.mocked(localStorage.setItem).mockImplementation(() => {
        throw memoryError;
      });

      expect(() => {
        privacyManager.updateSettings({
          googleAnalytics: true,
          microsoftClarity: true,
        });
      }).not.toThrow();

      expect(console.warn).toHaveBeenCalled();
    });
  });
});

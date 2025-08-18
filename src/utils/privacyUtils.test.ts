/**
 * プライバシーユーティリティ関数のテスト
 */

import { describe, it, expect } from 'vitest';
import {
  sanitizeConsentVersion,
  createDefaultPrivacySettings,
} from './privacyUtils';

describe('privacyUtils', () => {
  describe('sanitizeConsentVersion', () => {
    it('有効なバージョンをそのまま返す', () => {
      expect(sanitizeConsentVersion('1.0')).toBe('1.0');
      expect(sanitizeConsentVersion('1.1')).toBe('1.1');
      expect(sanitizeConsentVersion('2.0')).toBe('2.0');
    });

    it('無効なバージョン文字列はデフォルトバージョンにフォールバック', () => {
      expect(sanitizeConsentVersion('99.9')).toBe('1.0');
      expect(sanitizeConsentVersion('invalid')).toBe('1.0');
      expect(sanitizeConsentVersion('')).toBe('1.0');
    });

    it('XSS攻撃を含む悪意ある入力をブロック', () => {
      expect(sanitizeConsentVersion('<script>alert("xss")</script>')).toBe(
        '1.0'
      );
      expect(sanitizeConsentVersion('javascript:alert(1)')).toBe('1.0');
      expect(sanitizeConsentVersion('"><script>alert(1)</script>')).toBe('1.0');
    });

    it('非文字列型の入力はデフォルトバージョンにフォールバック', () => {
      expect(sanitizeConsentVersion(null)).toBe('1.0');
      expect(sanitizeConsentVersion(undefined)).toBe('1.0');
      expect(sanitizeConsentVersion(123)).toBe('1.0');
      expect(sanitizeConsentVersion({})).toBe('1.0');
      expect(sanitizeConsentVersion([])).toBe('1.0');
      expect(sanitizeConsentVersion(true)).toBe('1.0');
    });

    it('エッジケース', () => {
      expect(sanitizeConsentVersion('1.0\0')).toBe('1.0'); // null文字
      expect(sanitizeConsentVersion('1.0\n')).toBe('1.0'); // 改行文字
      expect(sanitizeConsentVersion(' 1.0 ')).toBe('1.0'); // 前後の空白
    });
  });

  describe('createDefaultPrivacySettings', () => {
    it('デフォルト設定を正しく作成する', () => {
      const settings = createDefaultPrivacySettings();

      expect(settings.googleAnalytics).toBe(false);
      expect(settings.microsoftClarity).toBe(false);
      expect(settings.consentTimestamp).toBeNull();
      expect(settings.consentVersion).toBe('1.0');
      expect(settings.hasExplicitConsent).toBe(false);
    });

    it('初期状態では consentTimestamp は null を設定する', () => {
      const settings = createDefaultPrivacySettings();

      expect(settings.consentTimestamp).toBeNull();
    });
  });
});

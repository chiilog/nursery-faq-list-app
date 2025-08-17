/**
 * usePrivacySettings カスタムフックのテスト
 * React との統合機能とプライバシー設定管理を検証します
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePrivacySettings } from './usePrivacySettings';

describe('usePrivacySettings', () => {
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
  });

  describe('基本機能', () => {
    it('初期状態でデフォルト設定を返す', () => {
      const { result } = renderHook(() => usePrivacySettings());

      expect(result.current.settings.googleAnalytics).toBe(false);
      expect(result.current.settings.microsoftClarity).toBe(false);
      expect(result.current.settings.consentTimestamp).toBeInstanceOf(Date);
      expect(result.current.settings.consentVersion).toBe('1.0');
    });

    it('設定更新機能を提供する', () => {
      const { result } = renderHook(() => usePrivacySettings());

      expect(typeof result.current.updateSettings).toBe('function');
      expect(typeof result.current.setGoogleAnalyticsConsent).toBe('function');
      expect(typeof result.current.setMicrosoftClarityConsent).toBe('function');
      expect(typeof result.current.setAllConsent).toBe('function');
    });
  });

  describe('設定変更', () => {
    it('Google Analytics の同意状態を変更できる', () => {
      const { result } = renderHook(() => usePrivacySettings());

      act(() => {
        result.current.setGoogleAnalyticsConsent(true);
      });

      expect(result.current.settings.googleAnalytics).toBe(true);
    });

    it('Microsoft Clarity の同意状態を変更できる', () => {
      const { result } = renderHook(() => usePrivacySettings());

      act(() => {
        result.current.setMicrosoftClarityConsent(true);
      });

      expect(result.current.settings.microsoftClarity).toBe(true);
    });

    it('全ての同意を一括で設定できる', () => {
      const { result } = renderHook(() => usePrivacySettings());

      act(() => {
        result.current.setAllConsent(true);
      });

      expect(result.current.settings.googleAnalytics).toBe(true);
      expect(result.current.settings.microsoftClarity).toBe(true);
    });
  });

  describe('リアクティブ更新', () => {
    it('設定変更時にコンポーネントが再レンダリングされる', () => {
      const { result } = renderHook(() => usePrivacySettings());

      // 初期状態を確実にfalseに設定
      act(() => {
        result.current.updateSettings({ googleAnalytics: false });
      });

      const initialGoogleAnalytics = result.current.settings.googleAnalytics;
      expect(initialGoogleAnalytics).toBe(false);

      // 設定を変更
      act(() => {
        result.current.updateSettings({ googleAnalytics: true });
      });

      // 設定値が変更されることを確認（React の再レンダリングが機能している証拠）
      expect(result.current.settings.googleAnalytics).toBe(true);
      expect(result.current.settings.googleAnalytics).not.toBe(
        initialGoogleAnalytics
      );
    });
  });

  describe('同意期限判定', () => {
    it('同意の有効性を判定できる', () => {
      const { result } = renderHook(() => usePrivacySettings());

      expect(typeof result.current.isConsentValid).toBe('function');
      expect(result.current.isConsentValid()).toBe(true);
    });
  });
});

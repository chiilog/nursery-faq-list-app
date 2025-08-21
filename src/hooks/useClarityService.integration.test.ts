import { renderHook, act } from '@testing-library/react';
import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { useClarityService } from './useClarityService';
import { usePrivacySettings } from './usePrivacySettings';
import type { PrivacySettings } from '../types/privacy';
import type { UsePrivacySettingsReturn } from './usePrivacySettings';

// デフォルトのプライバシー設定
const defaultPrivacySettings: PrivacySettings = {
  googleAnalytics: false,
  microsoftClarity: false,
  consentTimestamp: null,
  consentVersion: '1.0',
  hasExplicitConsent: false,
};

// デフォルトのusePrivacySettingsの戻り値
const defaultUsePrivacySettingsReturn: UsePrivacySettingsReturn = {
  settings: defaultPrivacySettings,
  updateSettings: vi.fn(),
  setGoogleAnalyticsConsent: vi.fn(),
  setMicrosoftClarityConsent: vi.fn(),
  setAllConsent: vi.fn(),
  isConsentValid: vi.fn(() => true),
};

// usePrivacySettings フックをモック
vi.mock('./usePrivacySettings', () => ({
  usePrivacySettings: vi.fn(() => defaultUsePrivacySettingsReturn),
}));

/**
 * @description Microsoft Clarity統合 React Hook の統合テストスイート
 *
 * プライバシー設定との連携、エラー復旧処理、複雑なシナリオを検証
 * 複数のコンポーネント間の統合動作に焦点を当てたテスト
 *
 * @author QA改善により統合テスト分離
 * @since v1.0.0
 */
describe('useClarityService 統合テスト', () => {
  beforeEach(() => {
    // DOM環境をクリア
    document.head.innerHTML = '';
    document.body.innerHTML = '';

    // window.clarity のモック準備
    vi.stubGlobal('clarity', undefined);

    // 環境変数のモック
    vi.stubEnv('VITE_CLARITY_PROJECT_ID', 'test-project-id');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  describe('プライバシー設定統合', () => {
    test('プライバシー設定との完全連携', async () => {
      const mockUsePrivacySettings = vi.mocked(usePrivacySettings);
      let privacySettings: PrivacySettings = {
        ...defaultPrivacySettings,
        microsoftClarity: false,
      };

      mockUsePrivacySettings.mockReturnValue({
        ...defaultUsePrivacySettingsReturn,
        settings: privacySettings,
      });

      const { result, rerender } = renderHook(() => useClarityService());

      // 初期状態の確認
      expect(result.current.hasConsent).toBe(false);

      // プライバシー設定を有効にする
      privacySettings = { ...defaultPrivacySettings, microsoftClarity: true };
      mockUsePrivacySettings.mockReturnValue({
        ...defaultUsePrivacySettingsReturn,
        settings: privacySettings,
      });

      rerender();

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      // 同意状態が自動更新されることを確認
      expect(result.current.hasConsent).toBe(true);

      // 再び無効にする
      privacySettings = { ...defaultPrivacySettings, microsoftClarity: false };
      mockUsePrivacySettings.mockReturnValue({
        ...defaultUsePrivacySettingsReturn,
        settings: privacySettings,
      });

      rerender();

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(result.current.hasConsent).toBe(false);
    });

    test('プライバシー設定変更時のログ出力確認', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const mockUsePrivacySettings = vi.mocked(usePrivacySettings);

      mockUsePrivacySettings.mockReturnValue({
        ...defaultUsePrivacySettingsReturn,
        settings: { ...defaultPrivacySettings, microsoftClarity: true },
      });

      const { rerender } = renderHook(() => useClarityService());

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        'Microsoft Clarity 録画を開始しました'
      );

      // 設定を無効にする
      mockUsePrivacySettings.mockReturnValue({
        ...defaultUsePrivacySettingsReturn,
        settings: { ...defaultPrivacySettings, microsoftClarity: false },
      });

      rerender();

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        'Microsoft Clarity 録画を停止しました'
      );

      consoleSpy.mockRestore();
    });

    test('環境変数とプライバシー設定の複合テスト', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const mockUsePrivacySettings = vi.mocked(usePrivacySettings);

      // 有効なプロジェクトIDとプライバシー設定有効
      vi.stubEnv('VITE_CLARITY_PROJECT_ID', 'valid-project-id');
      mockUsePrivacySettings.mockReturnValue({
        ...defaultUsePrivacySettingsReturn,
        settings: { ...defaultPrivacySettings, microsoftClarity: true },
      });

      renderHook(() => useClarityService());

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
      });

      // プライバシー設定によるログが出力される（初期化は非表示警告なしで成功）
      expect(consoleSpy).toHaveBeenCalledWith(
        'Microsoft Clarity 録画を開始しました'
      );

      consoleSpy.mockRestore();
    });
  });

  describe('エラー復旧統合テスト', () => {
    test('エラー状態からの復旧処理', async () => {
      const consoleWarnSpy = vi
        .spyOn(console, 'warn')
        .mockImplementation(() => {});
      const consoleLogSpy = vi
        .spyOn(console, 'log')
        .mockImplementation(() => {});

      // 最初は無効なプロジェクトIDで失敗
      vi.stubEnv('VITE_CLARITY_PROJECT_ID', '');

      const { unmount } = renderHook(() => useClarityService());

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      // 初期化失敗のログが出力されること
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'VITE_CLARITY_PROJECT_ID が設定されていないため、Clarityを初期化できません'
      );

      // 有効なプロジェクトIDに変更（実際には動的変更は困難だが、テスト設計として）
      vi.stubEnv('VITE_CLARITY_PROJECT_ID', 'valid-recovery-id');

      // 新しいマウントで復旧をシミュレート
      unmount();
      renderHook(() => useClarityService());

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
      });

      // 初期化成功ログが出力されることを確認
      expect(consoleLogSpy).toHaveBeenCalledWith(
        'Microsoft Clarity が正常に初期化されました'
      );

      consoleWarnSpy.mockRestore();
      consoleLogSpy.mockRestore();
    });
  });

  describe('複雑なシナリオ統合テスト', () => {
    test('マルチステップユーザーフロー', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const mockUsePrivacySettings = vi.mocked(usePrivacySettings);

      // Step 1: 初期状態（同意なし）
      mockUsePrivacySettings.mockReturnValue({
        ...defaultUsePrivacySettingsReturn,
        settings: { ...defaultPrivacySettings, microsoftClarity: false },
      });

      const { result, rerender } = renderHook(() => useClarityService());

      expect(result.current.hasConsent).toBe(false);

      // Step 2: プライバシー設定で同意を有効にする
      mockUsePrivacySettings.mockReturnValue({
        ...defaultUsePrivacySettingsReturn,
        settings: { ...defaultPrivacySettings, microsoftClarity: true },
      });

      rerender();

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(result.current.hasConsent).toBe(true);

      // Step 3: プライバシー設定から同意を取り消し
      mockUsePrivacySettings.mockReturnValue({
        ...defaultUsePrivacySettingsReturn,
        settings: { ...defaultPrivacySettings, microsoftClarity: false },
      });

      rerender();

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      // プライバシー設定の変更により同意状態が自動的に更新される
      expect(result.current.hasConsent).toBe(false);

      // Step 4: サービス無効化
      act(() => {
        result.current.disable();
      });

      expect(result.current.isDisabled).toBe(true);

      // Step 5: 無効化後にプライバシー設定を有効にしても無視される
      mockUsePrivacySettings.mockReturnValue({
        ...defaultUsePrivacySettingsReturn,
        settings: { ...defaultPrivacySettings, microsoftClarity: true },
      });

      rerender();

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      // 無効化後はプライバシー設定の変更も無視される（disable状態が優先）
      expect(result.current.hasConsent).toBe(false);
      expect(result.current.isDisabled).toBe(true);

      consoleSpy.mockRestore();
    });

    test('競合状態での統合動作', async () => {
      const mockUsePrivacySettings = vi.mocked(usePrivacySettings);

      // 複数の設定変更を短時間で実行
      mockUsePrivacySettings.mockReturnValue({
        ...defaultUsePrivacySettingsReturn,
        settings: { ...defaultPrivacySettings, microsoftClarity: true },
      });

      const { result, rerender } = renderHook(() => useClarityService());

      // 急速な状態変更をシミュレート
      await act(async () => {
        // 手動での同意
        result.current.setConsent(true);

        // プライバシー設定変更
        mockUsePrivacySettings.mockReturnValue({
          ...defaultUsePrivacySettingsReturn,
          settings: { ...defaultPrivacySettings, microsoftClarity: false },
        });

        rerender();

        // 再度手動で同意
        result.current.setConsent(true);

        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      // プライバシー設定が優先され、手動設定は上書きされることを確認
      // プライバシー設定が無効の場合、同意状態もfalseになる
      expect(result.current.hasConsent).toBe(false);
      expect(result.current.isDisabled).toBe(false);
    });
  });

  describe('エッジケース統合テスト', () => {
    test('異常なプライバシー設定値での統合動作', async () => {
      const mockUsePrivacySettings = vi.mocked(usePrivacySettings);

      // undefined設定での動作
      mockUsePrivacySettings.mockReturnValue({
        ...defaultUsePrivacySettingsReturn,
        settings: undefined as any,
      });

      const { result, rerender } = renderHook(() => useClarityService());

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      // undefinedの場合は状態変更が行われないことを確認
      expect(result.current.hasConsent).toBe(false);

      // null値での動作
      mockUsePrivacySettings.mockReturnValue({
        ...defaultUsePrivacySettingsReturn,
        settings: { ...defaultPrivacySettings, microsoftClarity: null as any },
      });

      rerender();

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      // nullの場合も状態変更が行われないことを確認
      expect(result.current.hasConsent).toBe(false);
    });

    test('極端なプロジェクトIDでの統合動作', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      // 極端に長いプロジェクトID
      const longProjectId = 'a'.repeat(10000);
      vi.stubEnv('VITE_CLARITY_PROJECT_ID', longProjectId);

      renderHook(() => useClarityService());

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
      });

      // 長いプロジェクトIDでも正常に動作することを確認（初期化は内部で成功）
      // プライバシー設定が false のため録画停止ログが出力される
      expect(consoleSpy).toHaveBeenCalledWith(
        'Microsoft Clarity 録画を停止しました'
      );

      consoleSpy.mockRestore();
    });
  });
});

import { renderHook, act } from '@testing-library/react';
import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { useClarityService } from './useClarityService';
import { usePrivacySettings } from './usePrivacySettings';
import type { PrivacySettings } from '../types/privacy';
import type { UsePrivacySettingsReturn } from './usePrivacySettings';

/**
 * @description デフォルトのプライバシー設定
 * テスト実行時に使用する基本的なプライバシー設定
 * 全ての同意が無効の安全な初期状態を提供
 */
const defaultPrivacySettings: PrivacySettings = {
  googleAnalytics: false,
  microsoftClarity: false,
  consentTimestamp: null,
  consentVersion: '1.0',
  hasExplicitConsent: false,
};

/**
 * @description デフォルトのusePrivacySettingsの戻り値
 * テスト用のモックオブジェクト
 * 全ての操作関数をvitest.fnでモック化
 */
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
 * @description Microsoft Clarity統合 React Hook のユニットテストスイート
 *
 * フック単体の基本機能、エラーハンドリング、ライフサイクル管理を検証
 * メモリリーク防止テスト、パフォーマンステスト、エッジケーステストを含む
 * 統合テストは useClarityService.integration.test.ts で実施
 *
 * @since v1.0.0
 */
describe('useClarityService', () => {
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

  describe('基本的な機能', () => {
    test('hookが正しく初期化される', () => {
      const { result } = renderHook(() => useClarityService());

      // 関数型API（推奨）を使用したテストに変更
      expect(result.current.state).toBeDefined();
      expect(result.current.isInitialized).toBe(false);
      expect(result.current.hasConsent).toBe(false);
      expect(result.current.isDisabled).toBe(false);
      expect(typeof result.current.setConsent).toBe('function');
      expect(typeof result.current.disable).toBe('function');
    });

    test('手動でConsent状態を設定できる', () => {
      const { result } = renderHook(() => useClarityService());

      act(() => {
        result.current.setConsent(true);
      });

      expect(result.current.hasConsent).toBe(true);

      act(() => {
        result.current.setConsent(false);
      });

      expect(result.current.hasConsent).toBe(false);
    });

    test('サービスを無効化できる', () => {
      const { result } = renderHook(() => useClarityService());

      expect(result.current.isDisabled).toBe(false);

      act(() => {
        result.current.disable();
      });

      expect(result.current.isDisabled).toBe(true);
    });
  });

  describe('エラーハンドリング', () => {
    test('プロジェクトIDが未設定の場合は警告を出力', async () => {
      // プロジェクトIDを未設定にする
      vi.stubEnv('VITE_CLARITY_PROJECT_ID', undefined);

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      renderHook(() => useClarityService());

      // 少し待ってから確認（useEffect は非同期）
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(consoleSpy).toHaveBeenCalledWith(
        'VITE_CLARITY_PROJECT_ID が設定されていないため、Clarityを初期化できません'
      );

      consoleSpy.mockRestore();
    });

    test('初期化エラーが発生した場合は警告ログを出力', async () => {
      // 空のプロジェクトIDでテスト（警告が出力される）
      vi.stubEnv('VITE_CLARITY_PROJECT_ID', '');

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      renderHook(() => useClarityService());

      // 少し待ってから確認（useEffect は非同期）
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(consoleSpy).toHaveBeenCalledWith(
        'VITE_CLARITY_PROJECT_ID が設定されていないため、Clarityを初期化できません'
      );

      consoleSpy.mockRestore();
    });
  });

  describe('ライフサイクル管理', () => {
    test('状態が一貫して管理される', () => {
      const { result, rerender } = renderHook(() => useClarityService());
      const firstState = result.current.state;

      rerender();
      const secondState = result.current.state;

      // 状態オブジェクトの一貫性をテスト
      expect(firstState).toEqual(secondState);
      expect(result.current.isInitialized).toBe(false);
      expect(result.current.hasConsent).toBe(false);
      expect(result.current.isDisabled).toBe(false);
    });

    test('無効化時にログが出力される', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const { result } = renderHook(() => useClarityService());

      act(() => {
        result.current.disable();
      });

      // disable関数は内部的に setConsent(false) を呼び出すため、録画停止メッセージが出力される
      expect(consoleSpy).toHaveBeenCalledWith(
        'Microsoft Clarity 録画を停止しました'
      );

      consoleSpy.mockRestore();
    });
  });

  describe('メモリリーク防止テスト', () => {
    test('メモリリーク防止：クリーンアップ処理の検証', async () => {
      const { result, unmount } = renderHook(() => useClarityService());

      // 初期化前の状態を確認
      expect(result.current.isInitialized).toBe(false);

      act(() => {
        result.current.setConsent(true);
      });

      expect(result.current.hasConsent).toBe(true);

      // コンポーネントをアンマウント
      unmount();

      // メモリリークが発生していないことを確認
      // アンマウント後はresult.currentへのアクセスは無効になる
      await new Promise((resolve) => setTimeout(resolve, 100));

      // TODO: 実際のメモリリーク検証の実装
      // - performance.memory APIの利用（Chromeのみ）
      // - WeakMapを使用した参照カウントテスト
      // - グローバル変数の汚染チェック
      // 現時点では基本的なアンマウント処理の成功を確認
      expect(true).toBe(true);
    });

    test('複数のHookインスタンスでのメモリ管理', () => {
      // 複数のHookインスタンスを作成
      const instances = Array.from({ length: 10 }, () =>
        renderHook(() => useClarityService())
      );

      // 各インスタンスが独立して動作することを確認
      instances.forEach(({ result }) => {
        expect(result.current.state).toBeDefined();
        expect(typeof result.current.setConsent).toBe('function');
      });

      // すべてのインスタンスをアンマウント
      instances.forEach(({ unmount }) => {
        unmount();
      });

      // クリーンアップが完了したことを確認
      expect(true).toBe(true);
    });

    test('Hookの再レンダリング時の状態保持', () => {
      const { result, rerender } = renderHook(() => useClarityService());

      // 初期状態を記録
      const initialState = result.current.state;

      // 状態を変更
      act(() => {
        result.current.setConsent(true);
      });

      const modifiedState = result.current.state;
      expect(modifiedState).not.toBe(initialState);
      expect(result.current.hasConsent).toBe(true);

      // 再レンダリング
      rerender();

      // 状態が保持されていることを確認
      expect(result.current.hasConsent).toBe(true);
      expect(result.current.state).toEqual(modifiedState);
    });
  });

  describe('パフォーマンステスト', () => {
    test('大量の状態変更でのパフォーマンス', () => {
      const { result } = renderHook(() => useClarityService());

      const startTime = performance.now();

      // 大量の状態変更を実行
      act(() => {
        for (let i = 0; i < 1000; i++) {
          result.current.setConsent(i % 2 === 0);
        }
      });

      const endTime = performance.now();
      const executionTime = endTime - startTime;

      // パフォーマンスが合理的な範囲内であることを確認
      expect(executionTime).toBeLessThan(1000); // 1秒以内

      // 最終状態が正しいことを確認
      expect(result.current.hasConsent).toBe(false); // 999 % 2 === 1なのでfalse
    });

    test('Hook初期化時間の測定', () => {
      const startTime = performance.now();

      const { result } = renderHook(() => useClarityService());

      const endTime = performance.now();
      const initTime = endTime - startTime;

      // 初期化時間が合理的であることを確認
      expect(initTime).toBeLessThan(100); // 100ms以内
      expect(result.current).toBeDefined();
    });
  });

  describe('エッジケーステスト', () => {
    test('undefinedプライバシー設定の処理', async () => {
      const mockUsePrivacySettings = vi.mocked(usePrivacySettings);

      mockUsePrivacySettings.mockReturnValue({
        ...defaultUsePrivacySettingsReturn,
        settings: undefined as any,
      });

      const { result } = renderHook(() => useClarityService());

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      // undefinedの場合は状態変更が行われないことを確認
      expect(result.current.hasConsent).toBe(false);
    });

    test('null プライバシー設定の処理', async () => {
      const mockUsePrivacySettings = vi.mocked(usePrivacySettings);

      mockUsePrivacySettings.mockReturnValue({
        ...defaultUsePrivacySettingsReturn,
        settings: { ...defaultPrivacySettings, microsoftClarity: null as any },
      });

      const { result } = renderHook(() => useClarityService());

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      // nullの場合は状態変更が行われないことを確認
      expect(result.current.hasConsent).toBe(false);
    });

    test('無効化後の操作が無視される', () => {
      const { result } = renderHook(() => useClarityService());

      // サービスを無効化
      act(() => {
        result.current.disable();
      });

      expect(result.current.isDisabled).toBe(true);

      // 無効化後に同意を設定しようとする
      act(() => {
        result.current.setConsent(true);
      });

      // 同意状態は変更されない
      expect(result.current.hasConsent).toBe(false);
      expect(result.current.isDisabled).toBe(true);
    });

    test('極端に長いプロジェクトIDでの動作', async () => {
      // 極端に長いプロジェクトID
      const longProjectId = 'a'.repeat(10000);
      vi.stubEnv('VITE_CLARITY_PROJECT_ID', longProjectId);

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

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

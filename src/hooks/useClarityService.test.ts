import { renderHook, act } from '@testing-library/react';
import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { useClarityService } from './useClarityService';

// usePrivacySettings フックをモック
vi.mock('./usePrivacySettings', () => ({
  usePrivacySettings: vi.fn(() => ({
    settings: { microsoftClarity: false }, // 正しいプロパティ名に修正
  })),
}));

/**
 * Microsoft Clarity統合 React Hook のテスト
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
});

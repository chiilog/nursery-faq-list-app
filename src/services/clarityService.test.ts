import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  createInitialState,
  initializeClarity,
  setConsent,
  disableService,
  selectors,
  type ClarityServiceState,
} from './clarityService';

/**
 * Microsoft Clarity統合サービスのテスト（関数型API）
 */
describe('Clarityサービス関数型API', () => {
  let initialState: ClarityServiceState;

  beforeEach(() => {
    // 初期状態を作成
    initialState = createInitialState();

    // DOM環境をクリア
    document.head.innerHTML = '';
    document.body.innerHTML = '';

    // window.clarity のモック準備
    vi.stubGlobal('clarity', undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  describe('状態管理機能', () => {
    test('初期状態が正しく作成される', () => {
      expect(selectors.isInitialized(initialState)).toBe(false);
      expect(selectors.hasConsent(initialState)).toBe(false);
      expect(selectors.isDisabled(initialState)).toBe(false);
      expect(selectors.getProjectId(initialState)).toBeNull();
    });

    test('同意状態を正しく設定できる', () => {
      let state = initialState;

      // 同意を有効にする
      state = setConsent(state, true);
      expect(selectors.hasConsent(state)).toBe(true);

      // 同意を無効にする
      state = setConsent(state, false);
      expect(selectors.hasConsent(state)).toBe(false);
    });

    test('サービスを無効化できる', () => {
      let state = initialState;

      // サービスを無効化
      state = disableService(state);
      expect(selectors.isDisabled(state)).toBe(true);
    });

    test('無効化後は同意状態の変更が無視される', () => {
      let state = initialState;

      // サービスを無効化
      state = disableService(state);

      // 無効化後に同意を設定しても変更されない
      const disabledState = setConsent(state, true);
      expect(selectors.hasConsent(disabledState)).toBe(false);
      expect(selectors.isDisabled(disabledState)).toBe(true);
    });
  });

  describe('初期化機能', () => {
    test('プロジェクトIDが未設定の場合はエラーが発生する', async () => {
      // 空のプロジェクトIDで初期化
      const result = await initializeClarity(initialState, '');

      // 空文字は無効なプロジェクトIDなのでエラー
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
      }
    });

    test('有効なプロジェクトIDで初期化できる', async () => {
      const projectId = 'test-project-id';

      // 初期化実行
      const result = await initializeClarity(initialState, projectId);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(selectors.isInitialized(result.data)).toBe(true);
        expect(selectors.getProjectId(result.data)).toBe(projectId);
      }
    });

    test('重複初期化は無視される', async () => {
      const projectId = 'test-project-id';

      // 最初の初期化
      const firstResult = await initializeClarity(initialState, projectId);
      expect(firstResult.success).toBe(true);

      if (firstResult.success) {
        // 同じプロジェクトIDで再初期化
        const secondResult = await initializeClarity(
          firstResult.data,
          projectId
        );
        expect(secondResult.success).toBe(true);

        // 状態は変わらない
        if (secondResult.success) {
          expect(secondResult.data).toEqual(firstResult.data);
        }
      }
    });
  });

  describe('エラーハンドリング', () => {
    test('無効なプロジェクトIDでエラーが発生する', async () => {
      const invalidProjectId = '   '; // 空白文字のみの無効なID

      const result = await initializeClarity(initialState, invalidProjectId);

      // 空白文字は無効なプロジェクトIDなのでエラー
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
      }
    });

    test('例外処理が適切に動作する', () => {
      // エラーハンドリングのテストは実際の例外ケースでのみ実行
      expect(() => setConsent(initialState, true)).not.toThrow();
      expect(() => disableService(initialState)).not.toThrow();
    });
  });
});

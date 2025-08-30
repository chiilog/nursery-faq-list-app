import { describe, test, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSystemTemplates } from './useSystemTemplates';
import { TemplateService } from '../../services/template/templateService';
import { handleError } from '../../utils/errorHandler';
import type { Template } from '../../types/entities';

// モックの設定
vi.mock('../../services/template/templateService');
vi.mock('../../utils/errorHandler');

describe('useSystemTemplates', () => {
  // テスト用のモックテンプレート
  const mockSystemTemplates: Template[] = [
    {
      id: 'default-nursery-visit',
      name: '保育園見学 基本質問セット',
      questions: ['質問1', '質問2', '質問3'],
      isSystem: true,
      createdAt: '2025-08-30T10:00:00.000Z',
      updatedAt: '2025-08-30T10:00:00.000Z',
    },
    {
      id: 'nursery-facilities',
      name: '保育園設備チェック',
      questions: ['設備質問1', '設備質問2'],
      isSystem: true,
      createdAt: '2025-08-30T10:00:00.000Z',
      updatedAt: '2025-08-30T10:00:00.000Z',
    },
  ];

  // 型安全なモック関数の作成
  const mockGetSystemTemplates =
    vi.fn<typeof TemplateService.getSystemTemplates>();
  const mockHandleError = vi.fn<typeof handleError>();

  beforeEach(() => {
    vi.clearAllMocks();

    // TemplateServiceのモック設定
    vi.mocked(TemplateService).getSystemTemplates = mockGetSystemTemplates;
    vi.mocked(handleError).mockImplementation(mockHandleError);
  });

  describe('初期状態', () => {
    test('templatesは空配列で初期化される', () => {
      // When: フックをレンダー
      const { result } = renderHook(() => useSystemTemplates());

      // Then: 初期状態が正しく設定される
      expect(result.current.templates).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe('loadTemplates 正常系', () => {
    test('システムテンプレートを正常に読み込める', async () => {
      // Given: 成功するサービスモック
      mockGetSystemTemplates.mockResolvedValue(mockSystemTemplates);

      const { result } = renderHook(() => useSystemTemplates());

      // When: loadTemplatesを実行
      await act(async () => {
        await result.current.loadTemplates();
      });

      // Then: 状態が正しく更新される
      expect(result.current.templates).toEqual(mockSystemTemplates);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(mockGetSystemTemplates).toHaveBeenCalledTimes(1);
    });

    test('ローディング状態が適切に管理される', async () => {
      // Given: 少し時間のかかるサービスモック
      let resolvePromise: (value: Template[]) => void;
      const loadPromise = new Promise<Template[]>((resolve) => {
        resolvePromise = resolve;
      });
      mockGetSystemTemplates.mockReturnValue(loadPromise);

      const { result } = renderHook(() => useSystemTemplates());

      // When: loadTemplatesを実行（まだ完了していない）
      act(() => {
        void result.current.loadTemplates();
      });

      // Then: ローディング中の状態
      expect(result.current.loading).toBe(true);
      expect(result.current.error).toBeNull();

      // When: 処理が完了
      await act(async () => {
        resolvePromise!(mockSystemTemplates);
        await loadPromise;
      });

      // Then: ローディングが終了
      expect(result.current.loading).toBe(false);
      expect(result.current.templates).toEqual(mockSystemTemplates);
    });

    test('既存のエラー状態をクリアできる', async () => {
      // Given: 初期状態でエラーを設定
      mockGetSystemTemplates.mockRejectedValueOnce(new Error('初期エラー'));
      const { result } = renderHook(() => useSystemTemplates());

      // 最初にエラーを発生させる
      await act(async () => {
        await result.current.loadTemplates();
      });
      expect(result.current.error).toBe(
        'システムテンプレートの読み込みに失敗しました'
      );

      // Given: 今度は成功するモック
      mockGetSystemTemplates.mockResolvedValue(mockSystemTemplates);

      // When: 再度loadTemplatesを実行
      await act(async () => {
        await result.current.loadTemplates();
      });

      // Then: エラー状態がクリアされる
      expect(result.current.error).toBeNull();
      expect(result.current.templates).toEqual(mockSystemTemplates);
    });
  });

  describe('loadTemplates 異常系', () => {
    test('読み込みエラー時は適切にエラーハンドリングされる', async () => {
      // Given: エラーを投げるモック
      const loadError = new Error('サーバーエラー');
      mockGetSystemTemplates.mockRejectedValue(loadError);

      const { result } = renderHook(() => useSystemTemplates());

      // When: loadTemplatesを実行
      await act(async () => {
        await result.current.loadTemplates();
      });

      // Then: エラー状態が設定される
      expect(result.current.error).toBe(
        'システムテンプレートの読み込みに失敗しました'
      );
      expect(result.current.loading).toBe(false);
      expect(result.current.templates).toEqual([]); // 初期状態のまま

      // handleErrorが呼ばれる
      expect(mockHandleError).toHaveBeenCalledWith(
        'システムテンプレートの読み込みに失敗しました',
        loadError
      );
    });

    test('エラー時もローディング状態は最終的にfalseになる', async () => {
      // Given: エラーを投げるモック
      let rejectPromise: (error: Error) => void;
      const loadPromise = new Promise<Template[]>((_, reject) => {
        rejectPromise = reject;
      });
      mockGetSystemTemplates.mockReturnValue(loadPromise);

      const { result } = renderHook(() => useSystemTemplates());

      // When: loadTemplatesを実行（まだエラーになっていない）
      act(() => {
        void result.current.loadTemplates();
      });

      // Then: ローディング中
      expect(result.current.loading).toBe(true);

      // When: エラーが発生
      await act(async () => {
        rejectPromise!(new Error('テストエラー'));
        try {
          await loadPromise;
        } catch {
          // エラーを無視
        }
      });

      // Then: ローディングが終了している
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(
        'システムテンプレートの読み込みに失敗しました'
      );
    });
  });

  describe('連続呼び出しのテスト', () => {
    test('複数回呼び出し時の状態管理が正しく動作する', async () => {
      // Given: 成功するモック
      mockGetSystemTemplates.mockResolvedValue(mockSystemTemplates);

      const { result } = renderHook(() => useSystemTemplates());

      // When: 複数回呼び出し
      await act(async () => {
        await result.current.loadTemplates();
      });

      expect(result.current.templates).toEqual(mockSystemTemplates);

      // 2回目の呼び出し
      await act(async () => {
        await result.current.loadTemplates();
      });

      // Then: 状態は正常
      expect(result.current.templates).toEqual(mockSystemTemplates);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(mockGetSystemTemplates).toHaveBeenCalledTimes(2);
    });
  });

  describe('関数の参照安定性', () => {
    test('loadTemplates関数の参照は安定している', () => {
      // Given: 複数回レンダー
      const { result, rerender } = renderHook(() => useSystemTemplates());

      const initialLoadTemplates = result.current.loadTemplates;

      // When: 再レンダー
      rerender();

      // Then: 関数の参照が同じである
      expect(result.current.loadTemplates).toBe(initialLoadTemplates);
    });
  });
});

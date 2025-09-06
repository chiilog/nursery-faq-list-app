import { describe, test, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSystemTemplates } from './useSystemTemplates';
import { getSystemTemplates } from '../../services/template/templateService';
import { handleError } from '../../utils/errorHandler';
import type { Template } from '../../types/entities';

// モックの設定
vi.mock('../../services/template/templateService', () => ({
  getSystemTemplates: vi.fn(),
}));
vi.mock('../../utils/errorHandler');

describe('useSystemTemplates', () => {
  // テスト用のモックテンプレート
  const mockSystemTemplates: Template[] = [
    {
      id: 'default-nursery-visit',
      name: '保育園見学 基本質問セット',
      questions: ['質問1', '質問2', '質問3'],
      isSystem: true,
      createdAt: new Date('2025-08-30T10:00:00.000Z'),
      updatedAt: new Date('2025-08-30T10:00:00.000Z'),
    },
    {
      id: 'nursery-facilities',
      name: '保育園設備チェック',
      questions: ['設備質問1', '設備質問2'],
      isSystem: true,
      createdAt: new Date('2025-08-30T10:00:00.000Z'),
      updatedAt: new Date('2025-08-30T10:00:00.000Z'),
    },
  ];

  const mockGetSystemTemplates = vi.mocked(getSystemTemplates);
  const mockHandleError = vi.mocked(handleError);

  beforeEach(() => {
    vi.clearAllMocks();
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
    test('システムテンプレートを正常に読み込める', () => {
      // Given: 成功するサービスモック
      mockGetSystemTemplates.mockReturnValue(mockSystemTemplates);

      const { result } = renderHook(() => useSystemTemplates());

      // When: loadTemplatesを実行
      act(() => {
        void result.current.loadTemplates();
      });

      // Then: 状態が正しく更新される
      expect(result.current.templates).toEqual(mockSystemTemplates);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(mockGetSystemTemplates).toHaveBeenCalledTimes(1);
    });

    test('ローディング状態が適切に管理される', () => {
      // Given: 正常なモック
      mockGetSystemTemplates.mockReturnValue(mockSystemTemplates);

      const { result } = renderHook(() => useSystemTemplates());

      // When: loadTemplatesを実行
      act(() => {
        void result.current.loadTemplates();
      });

      // Then: 同期処理なので即座に完了
      expect(result.current.loading).toBe(false);
      expect(result.current.templates).toEqual(mockSystemTemplates);
    });

    test('既存のエラー状態をクリアできる', () => {
      // Given: 初期状態でエラーを設定
      mockGetSystemTemplates.mockImplementationOnce(() => {
        throw new Error('初期エラー');
      });
      const { result } = renderHook(() => useSystemTemplates());

      // 最初にエラーを発生させる
      act(() => {
        void result.current.loadTemplates();
      });
      expect(result.current.error).toBe(
        'システムテンプレートの読み込みに失敗しました'
      );

      // Given: 今度は成功するモック
      mockGetSystemTemplates.mockReturnValue(mockSystemTemplates);

      // When: 再度loadTemplatesを実行
      act(() => {
        void result.current.loadTemplates();
      });

      // Then: エラー状態がクリアされる
      expect(result.current.error).toBeNull();
      expect(result.current.templates).toEqual(mockSystemTemplates);
    });
  });

  describe('loadTemplates 異常系', () => {
    test('読み込みエラー時は適切にエラーハンドリングされる', () => {
      // Given: エラーを投げるモック
      const loadError = new Error('サーバーエラー');
      mockGetSystemTemplates.mockImplementation(() => {
        throw loadError;
      });

      const { result } = renderHook(() => useSystemTemplates());

      // When: loadTemplatesを実行
      act(() => {
        void result.current.loadTemplates();
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

    test('エラー時もローディング状態は最終的にfalseになる', () => {
      // Given: エラーを投げるモック
      mockGetSystemTemplates.mockImplementation(() => {
        throw new Error('テストエラー');
      });

      const { result } = renderHook(() => useSystemTemplates());

      // When: loadTemplatesを実行
      act(() => {
        void result.current.loadTemplates();
      });

      // Then: 同期処理なのでローディングは即座に終了
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(
        'システムテンプレートの読み込みに失敗しました'
      );
    });
  });

  describe('連続呼び出しのテスト', () => {
    test('複数回呼び出し時の状態管理が正しく動作する', () => {
      // Given: 成功するモック
      mockGetSystemTemplates.mockReturnValue(mockSystemTemplates);

      const { result } = renderHook(() => useSystemTemplates());

      // When: 複数回呼び出し
      act(() => {
        void result.current.loadTemplates();
      });

      expect(result.current.templates).toEqual(mockSystemTemplates);

      // 2回目の呼び出し
      act(() => {
        void result.current.loadTemplates();
      });

      // Then: 状態は正常
      expect(result.current.templates).toEqual(mockSystemTemplates);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(mockGetSystemTemplates).toHaveBeenCalledTimes(2);
    });
  });

  describe('関数の参照安定性', () => {
    test('loadTemplates関数の参照が安定している', () => {
      const { result, rerender } = renderHook(() => useSystemTemplates());

      const initialLoadTemplates = result.current.loadTemplates;

      // When: 再レンダー
      rerender();

      // Then: 関数の参照が同じである
      expect(result.current.loadTemplates).toBe(initialLoadTemplates);
    });
  });
});

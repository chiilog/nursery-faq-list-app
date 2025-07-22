/**
 * useQuestionListOperations フックのテスト
 * TDD思想に基づく振る舞い駆動テスト
 */

import { describe, test, expect, vi, beforeEach } from 'vitest';
import { act } from '@testing-library/react';
import { renderHookWithChakra } from '../test/testUtils';
import { mockQuestionList, mockErrorHandler } from '../test/testData';
import { useQuestionListOperations } from './useQuestionListOperations';

// ストアのモック
let mockStore: {
  createQuestionList: ReturnType<typeof vi.fn>;
  updateQuestionList: ReturnType<typeof vi.fn>;
  deleteQuestionList: ReturnType<typeof vi.fn>;
  setCurrentList: ReturnType<typeof vi.fn>;
} = {
  createQuestionList: vi.fn(),
  updateQuestionList: vi.fn(),
  deleteQuestionList: vi.fn(),
  setCurrentList: vi.fn(),
};

// モジュールのモック - セレクター対応
vi.mock('../stores/questionListStore', () => ({
  useQuestionListStore: <T>(selector?: (state: typeof mockStore) => T) => {
    if (!selector) return mockStore;
    return selector(mockStore);
  },
}));

vi.mock('./useErrorHandler', () => ({
  useErrorHandler: () => mockErrorHandler,
}));

describe('質問リスト操作管理', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockErrorHandler.handleAsyncOperation.mockImplementation(
      async <T>(fn: () => Promise<T>) => await fn()
    );
    mockStore = {
      createQuestionList: vi.fn(),
      updateQuestionList: vi.fn(),
      deleteQuestionList: vi.fn(),
      setCurrentList: vi.fn(),
    };
  });

  describe('CRUD操作', () => {
    test('新しい保育園の見学リストを作成している', async () => {
      const newList = {
        id: 'new-list',
        title: '新しい保育園見学リスト',
        nurseryName: '新しい保育園',
        createdAt: new Date(),
        updatedAt: new Date(),
        questions: [],
        isTemplate: false,
      };

      mockStore.createQuestionList.mockResolvedValue(newList);

      const { result } = renderHookWithChakra(() =>
        useQuestionListOperations()
      );

      await act(async () => {
        await result.current.createList({
          title: '新しい保育園見学リスト',
          nurseryName: '新しい保育園',
        });
      });

      expect(mockStore.createQuestionList).toHaveBeenCalledWith({
        title: '新しい保育園見学リスト',
        nurseryName: '新しい保育園',
      });
    });

    test('質問リストのタイトルを変更できる', async () => {
      const { result } = renderHookWithChakra(() =>
        useQuestionListOperations()
      );

      await act(async () => {
        await result.current.updateList(mockQuestionList.id, {
          title: '更新された保育園見学リスト',
        });
      });

      expect(mockStore.updateQuestionList).toHaveBeenCalledWith(
        mockQuestionList.id,
        { title: '更新された保育園見学リスト' }
      );
    });

    test('不要な質問リストを削除できる', async () => {
      const { result } = renderHookWithChakra(() =>
        useQuestionListOperations()
      );

      await act(async () => {
        await result.current.deleteList(mockQuestionList.id);
      });

      expect(mockStore.deleteQuestionList).toHaveBeenCalledWith(
        mockQuestionList.id
      );
    });

    test('別の質問リストを選択できる', async () => {
      const { result } = renderHookWithChakra(() =>
        useQuestionListOperations()
      );

      await act(async () => {
        await result.current.selectList('another-list');
      });

      expect(mockStore.setCurrentList).toHaveBeenCalledWith('another-list');
    });
  });
});

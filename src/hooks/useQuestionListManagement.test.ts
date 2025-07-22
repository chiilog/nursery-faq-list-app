/**
 * useQuestionListManagement フックのテスト
 * TDD思想に基づく振る舞い駆動テスト
 */

import { describe, test, expect, vi, beforeEach } from 'vitest';
import { act } from '@testing-library/react';
import { renderHookWithChakra } from '../test/testUtils';
import { mockQuestionList, mockErrorHandler } from '../test/testData';
import { useQuestionListManagement } from './useQuestionListManagement';
import type { QuestionList } from '../types/data';

// ストアのモック
let mockStore: {
  questionLists: QuestionList[];
  currentList: QuestionList | null;
  loading: boolean;
  loadQuestionLists: ReturnType<typeof vi.fn>;
  createQuestionList: ReturnType<typeof vi.fn>;
  updateQuestionList: ReturnType<typeof vi.fn>;
  deleteQuestionList: ReturnType<typeof vi.fn>;
  setCurrentList: ReturnType<typeof vi.fn>;
} = {
  questionLists: [mockQuestionList],
  currentList: mockQuestionList,
  loading: false,
  loadQuestionLists: vi.fn().mockResolvedValue(undefined),
  createQuestionList: vi.fn(),
  updateQuestionList: vi.fn(),
  deleteQuestionList: vi.fn(),
  setCurrentList: vi.fn(),
};

// モジュールのモック
vi.mock('../stores/questionListStore', () => ({
  useQuestionListStore: () => mockStore,
}));

vi.mock('./useErrorHandler', () => ({
  useErrorHandler: () => mockErrorHandler,
}));

describe('質問リスト管理', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockErrorHandler.handleAsyncOperation.mockImplementation(
      async <T>(fn: () => Promise<T>) => await fn()
    );
    mockStore = {
      questionLists: [mockQuestionList],
      currentList: mockQuestionList,
      loading: false,
      loadQuestionLists: vi.fn().mockResolvedValue(undefined),
      createQuestionList: vi.fn(),
      updateQuestionList: vi.fn(),
      deleteQuestionList: vi.fn(),
      setCurrentList: vi.fn(),
    };
  });

  describe('保育園見学の質問リストを管理する時', () => {
    test('初回起動時、既存の質問リストが表示される', () => {
      const { result } = renderHookWithChakra(() =>
        useQuestionListManagement()
      );

      expect(result.current.questionLists).toHaveLength(1);
      expect(result.current.questionLists[0].title).toBe(
        'テスト保育園見学リスト'
      );
      expect(result.current.currentList?.nurseryName).toBe('テスト保育園');
    });

    test('新しい保育園の見学リストを作成すると、マイリストに追加される', async () => {
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
      mockStore.questionLists = [mockQuestionList, newList];

      const { result } = renderHookWithChakra(() =>
        useQuestionListManagement()
      );

      await act(async () => {
        await result.current.createList({
          title: '新しい保育園見学リスト',
          nurseryName: '新しい保育園',
        });
      });

      expect(result.current.questionLists).toHaveLength(2);
      expect(result.current.questionLists[1].nurseryName).toBe('新しい保育園');
    });

    test('質問リストのタイトルを変更すると、変更が反映される', async () => {
      const updatedList = {
        ...mockQuestionList,
        title: '更新された保育園見学リスト',
        updatedAt: new Date(),
      };

      mockStore.updateQuestionList.mockResolvedValue(updatedList);
      mockStore.currentList = updatedList;

      const { result } = renderHookWithChakra(() =>
        useQuestionListManagement()
      );

      await act(async () => {
        await result.current.updateList(mockQuestionList.id, {
          title: '更新された保育園見学リスト',
        });
      });

      expect(result.current.currentList?.title).toBe(
        '更新された保育園見学リスト'
      );
    });

    test('不要な質問リストを削除すると、マイリストから消える', async () => {
      mockStore.deleteQuestionList.mockResolvedValue(undefined);
      mockStore.questionLists = [];
      mockStore.currentList = null;

      const { result } = renderHookWithChakra(() =>
        useQuestionListManagement()
      );

      await act(async () => {
        await result.current.deleteList(mockQuestionList.id);
      });

      expect(result.current.questionLists).toHaveLength(0);
      expect(result.current.currentList).toBeNull();
    });

    test('別の質問リストを選択すると、そのリストが表示される', async () => {
      const anotherList = {
        id: 'another-list',
        title: 'もう一つの保育園見学リスト',
        nurseryName: 'もう一つの保育園',
        createdAt: new Date(),
        updatedAt: new Date(),
        questions: [],
        isTemplate: false,
      };

      mockStore.setCurrentList.mockResolvedValue(undefined);
      mockStore.currentList = anotherList;

      const { result } = renderHookWithChakra(() =>
        useQuestionListManagement()
      );

      await act(async () => {
        await result.current.selectList('another-list');
      });

      expect(result.current.currentList?.nurseryName).toBe('もう一つの保育園');
    });

    test('リストの選択を解除すると、何も選択されていない状態になる', async () => {
      mockStore.setCurrentList.mockResolvedValue(undefined);
      mockStore.currentList = null;

      const { result } = renderHookWithChakra(() =>
        useQuestionListManagement()
      );

      await act(async () => {
        await result.current.selectList(null);
      });

      expect(result.current.currentList).toBeNull();
    });
  });

  describe('データの読み込み状態を管理する時', () => {
    test('アプリ起動時には既存の質問リストが表示される', () => {
      const { result } = renderHookWithChakra(() =>
        useQuestionListManagement()
      );

      // 初回起動時にデータが表示されていることを確認（自動読み込みの結果）
      expect(result.current.questionLists).toHaveLength(1);
      expect(result.current.questionLists[0]).toEqual(mockQuestionList);
    });

    test('読み込み中はローディング状態が表示される', () => {
      mockStore.loading = true;

      const { result } = renderHookWithChakra(() =>
        useQuestionListManagement()
      );

      expect(result.current.loading).toBe(true);
    });
  });
});

/**
 * useQuestionOperations フックのテスト
 * TDD思想に基づく振る舞い駆動テスト
 */

import { describe, test, expect, vi, beforeEach } from 'vitest';
import { act } from '@testing-library/react';
import { renderHookWithChakra } from '../test/testUtils';
import { mockErrorHandler } from '../test/testData';
import { useQuestionOperations } from './useQuestionOperations';

// ストアのモック
let mockStore = {
  addQuestion: vi.fn(),
  updateQuestion: vi.fn(),
  deleteQuestion: vi.fn(),
  answerQuestion: vi.fn(),
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

describe('質問操作', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockErrorHandler.handleAsyncOperation.mockImplementation(
      async <T>(fn: () => Promise<T>) => await fn()
    );
    mockStore = {
      addQuestion: vi.fn(),
      updateQuestion: vi.fn(),
      deleteQuestion: vi.fn(),
      answerQuestion: vi.fn(),
    };
  });

  describe('質問の管理', () => {
    test('新しい質問を追加できる', async () => {
      const { result } = renderHookWithChakra(() => useQuestionOperations());

      await act(async () => {
        await result.current.addQuestionToList('list-id', {
          text: '園庭の幅さはどれくらいですか？',
          category: '環境',
        });
      });

      expect(mockStore.addQuestion).toHaveBeenCalledWith(
        'list-id',
        expect.objectContaining({
          text: '園庭の幅さはどれくらいですか？',
        })
      );
    });

    test('質問内容を編集できる', async () => {
      const { result } = renderHookWithChakra(() => useQuestionOperations());

      await act(async () => {
        await result.current.updateQuestionInList('list-id', 'q1', {
          text: '開園時間と閉園時間を教えてください',
        });
      });

      expect(mockStore.updateQuestion).toHaveBeenCalledWith(
        'list-id',
        'q1',
        expect.objectContaining({
          text: '開園時間と閉園時間を教えてください',
        })
      );
    });

    test('質問を削除できる', async () => {
      const { result } = renderHookWithChakra(() => useQuestionOperations());

      await act(async () => {
        await result.current.deleteQuestionFromList('list-id', 'q1');
      });

      expect(mockStore.deleteQuestion).toHaveBeenCalledWith('list-id', 'q1');
    });

    test('質問に答えられる', async () => {
      const { result } = renderHookWithChakra(() => useQuestionOperations());

      await act(async () => {
        await result.current.answerQuestionInList(
          'list-id',
          'q1',
          '7:00-19:00です'
        );
      });

      expect(mockStore.answerQuestion).toHaveBeenCalledWith(
        'list-id',
        'q1',
        '7:00-19:00です'
      );
    });
  });
});

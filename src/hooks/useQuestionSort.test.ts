/**
 * useQuestionSort フックのテスト
 * TDD思想に基づく振る舞い駆動テスト
 */

import { describe, test, expect, vi, beforeEach } from 'vitest';
import { act } from '@testing-library/react';
import { renderHookWithChakra } from '../test/testUtils';
import { mockErrorHandler } from '../test/testData';
import { useQuestionSort } from './useQuestionSort';

// ストアのモック
let mockStore = {
  reorderQuestions: vi.fn(),
  sortCurrentListByAnswerStatus: vi.fn(),
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

describe('質問ソート操作', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockErrorHandler.handleAsyncOperation.mockImplementation(
      async <T>(fn: () => Promise<T>) => await fn()
    );
    mockStore = {
      reorderQuestions: vi.fn(),
      sortCurrentListByAnswerStatus: vi.fn(),
    };
  });

  describe('質問の順番整理', () => {
    test('重要な質問を上に移動できる', async () => {
      const { result } = renderHookWithChakra(() => useQuestionSort());

      await act(async () => {
        await result.current.reorderQuestionsInList('list-id', 1, 0); // 2番目を1番目に
      });

      expect(mockStore.reorderQuestions).toHaveBeenCalledWith('list-id', 1, 0);
    });

    test('未回答の質問を上部に整理できる', async () => {
      const { result } = renderHookWithChakra(() => useQuestionSort());

      await act(async () => {
        await result.current.sortByAnswerStatus();
      });

      expect(mockStore.sortCurrentListByAnswerStatus).toHaveBeenCalled();
    });
  });
});

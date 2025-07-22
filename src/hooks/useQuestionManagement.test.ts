/**
 * useQuestionManagement フックのテスト
 * TDD思想に基づく振る舞い駆動テスト
 */

import { describe, test, expect, vi, beforeEach } from 'vitest';
import { act } from '@testing-library/react';
import { renderHookWithChakra } from '../test/testUtils';
import { mockErrorHandler, mockQuestionList } from '../test/testData';
import { useQuestionManagement } from './useQuestionManagement';

// 質問データ
const baseQuestions = [
  {
    id: 'q1',
    text: '保育時間を教えてください',
    answer: '',
    category: '基本情報',
  },
  { id: 'q2', text: '給食はありますか？', answer: '', category: '食事' },
];

// ストアのモック
let mockStore = {
  addQuestion: vi.fn(),
  updateQuestion: vi.fn(),
  deleteQuestion: vi.fn(),
  answerQuestion: vi.fn(),
  reorderQuestions: vi.fn(),
  sortCurrentListByAnswerStatus: vi.fn(),
  // 状態変更を確認するため
  currentList: { ...mockQuestionList, questions: [...baseQuestions] },
};

// モジュールのモック
vi.mock('../stores/questionListStore', () => ({
  useQuestionListStore: () => mockStore,
}));

vi.mock('./useErrorHandler', () => ({
  useErrorHandler: () => mockErrorHandler,
}));

describe('保育園見学の質問を管理する時', () => {
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
      reorderQuestions: vi.fn(),
      sortCurrentListByAnswerStatus: vi.fn(),
      currentList: { ...mockQuestionList, questions: [...baseQuestions] },
    };
  });

  describe('新しい質問を追加する時', () => {
    test('聞きたい質問を追加すると、リストに質問が増える', async () => {
      const newQuestion = {
        id: 'q3',
        text: '園庭の広さはどれくらいですか？',
        answer: '',
        category: '環境',
      };

      mockStore.addQuestion.mockResolvedValue(newQuestion);
      const updatedQuestions = [...baseQuestions, newQuestion];
      mockStore.currentList = {
        ...mockQuestionList,
        questions: updatedQuestions,
      };

      const { result, rerender } = renderHookWithChakra(() =>
        useQuestionManagement()
      );

      await act(async () => {
        await result.current.addQuestionToList('list-id', {
          text: '園庭の広さはどれくらいですか？',
          category: '環境',
        });
      });

      rerender();
      expect(mockStore.addQuestion).toHaveBeenCalledWith(
        'list-id',
        expect.objectContaining({
          text: '園庭の広さはどれくらいですか？',
        })
      );
    });
  });

  describe('質問内容を編集する時', () => {
    test('質問文を修正すると、内容が更新される', async () => {
      const { result } = renderHookWithChakra(() => useQuestionManagement());

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
  });

  describe('不要な質問を削除する時', () => {
    test('質問を削除すると、リストから消える', async () => {
      const { result } = renderHookWithChakra(() => useQuestionManagement());

      await act(async () => {
        await result.current.deleteQuestionFromList('list-id', 'q1');
      });

      expect(mockStore.deleteQuestion).toHaveBeenCalledWith('list-id', 'q1');
    });
  });

  describe('見学時の回答を記録する時', () => {
    test('質問に回答すると、答えが保存される', async () => {
      const { result } = renderHookWithChakra(() => useQuestionManagement());

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

    test('回答を削除すると、答えがクリアされる', async () => {
      const { result } = renderHookWithChakra(() => useQuestionManagement());

      await act(async () => {
        await result.current.answerQuestionInList('list-id', 'q1', '');
      });

      expect(mockStore.answerQuestion).toHaveBeenCalledWith(
        'list-id',
        'q1',
        ''
      );
    });
  });

  describe('質問の順番を整理する時', () => {
    test('重要な質問を上に移動できる', async () => {
      const { result } = renderHookWithChakra(() => useQuestionManagement());

      await act(async () => {
        await result.current.reorderQuestionsInList('list-id', 1, 0); // 2番目を1番目に
      });

      expect(mockStore.reorderQuestions).toHaveBeenCalledWith('list-id', 1, 0);
    });

    test('未回答の質問を上部に整理できる', async () => {
      const { result } = renderHookWithChakra(() => useQuestionManagement());

      await act(async () => {
        await result.current.sortByAnswerStatus();
      });

      expect(mockStore.sortCurrentListByAnswerStatus).toHaveBeenCalled();
    });
  });
});

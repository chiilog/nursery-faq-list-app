/**
 * useQuestionListData フックのテスト
 * TDD思想に基づく振る舞い駆動テスト
 */

import { describe, test, expect, vi, beforeEach } from 'vitest';
import { renderHookWithChakra } from '../test/testUtils';
import { mockQuestionList, mockErrorHandler } from '../test/testData';
import { useQuestionListData } from './useQuestionListData';
import type { QuestionList } from '../types/data';

// ストアのモック
let mockStore: {
  questionLists: QuestionList[];
  currentList: QuestionList | null;
  loading: boolean;
  loadQuestionLists: ReturnType<typeof vi.fn>;
} = {
  questionLists: [mockQuestionList],
  currentList: mockQuestionList,
  loading: false,
  loadQuestionLists: vi.fn().mockResolvedValue(undefined),
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

describe('質問リストデータ管理', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStore = {
      questionLists: [mockQuestionList],
      currentList: mockQuestionList,
      loading: false,
      loadQuestionLists: vi.fn().mockResolvedValue(undefined),
    };
  });

  describe('データ読み込み', () => {
    test('初回起動時、既存の質問リストが表示される', () => {
      const { result } = renderHookWithChakra(() => useQuestionListData());

      expect(result.current.questionLists).toHaveLength(1);
      expect(result.current.questionLists[0].title).toBe(
        'テスト保育園見学リスト'
      );
      expect(result.current.currentList?.nurseryName).toBe('テスト保育園');
    });

    test('読み込み中はローディング状態が表示される', () => {
      mockStore.loading = true;

      const { result } = renderHookWithChakra(() => useQuestionListData());

      expect(result.current.loading).toBe(true);
    });
  });
});

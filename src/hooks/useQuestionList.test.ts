/**
 * useQuestionList MVP版フックのテスト
 * TDD思想に基づくMVP機能のテスト
 */

import { describe, test, expect, vi, beforeEach } from 'vitest';
import { renderHookWithChakra } from '../test/testUtils';
import { mockQuestionList } from '../test/testData';
import { useQuestionList } from './useQuestionList';

// MVP機能のモック
const mockListManagement = {
  questionLists: [mockQuestionList],
  currentList: mockQuestionList,
  loading: false,
  createList: vi.fn(),
  updateList: vi.fn(),
  deleteList: vi.fn(),
  selectList: vi.fn(),
};

const mockQuestionManagement = {
  addQuestionToList: vi.fn(),
  updateQuestionInList: vi.fn(),
  deleteQuestionFromList: vi.fn(),
  answerQuestionInList: vi.fn(),
};

// モック設定
vi.mock('./useQuestionListManagement', () => ({
  useQuestionListManagement: () => mockListManagement,
}));

vi.mock('./useQuestionOperations', () => ({
  useQuestionOperations: () => mockQuestionManagement,
}));

describe('質問リストMVPフック', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('MVP機能の統合インターフェースを確認する時', () => {
    test('基本的な状態データが正しく統合されている', () => {
      const { result } = renderHookWithChakra(() => useQuestionList());

      // MVP版のデータ状態確認
      expect(result.current.questionLists).toEqual([mockQuestionList]);
      expect(result.current.currentList).toEqual(mockQuestionList);
      expect(result.current.loading).toBe(false);
    });

    test('リスト管理操作のメソッドが正しく統合されている', () => {
      const { result } = renderHookWithChakra(() => useQuestionList());

      // リスト管理メソッドの存在確認
      expect(typeof result.current.createList).toBe('function');
      expect(typeof result.current.updateList).toBe('function');
      expect(typeof result.current.deleteList).toBe('function');
      expect(typeof result.current.selectList).toBe('function');
    });

    test('質問管理操作のメソッドが正しく統合されている', () => {
      const { result } = renderHookWithChakra(() => useQuestionList());

      // 質問管理メソッドの存在確認
      expect(typeof result.current.addQuestionToList).toBe('function');
      expect(typeof result.current.updateQuestionInList).toBe('function');
      expect(typeof result.current.deleteQuestionFromList).toBe('function');
      expect(typeof result.current.answerQuestionInList).toBe('function');
    });
  });

  describe('MVP版のAPIインターフェースを確認する時', () => {
    test('MVP機能のプロパティが全て存在している', () => {
      const { result } = renderHookWithChakra(() => useQuestionList());

      // MVP版のAPIプロパティ確認
      const expectedProperties = [
        // データ状態（MVP版）
        'questionLists',
        'currentList',
        'loading',
        // リスト管理操作
        'createList',
        'updateList',
        'deleteList',
        'selectList',
        // 質問管理操作
        'addQuestionToList',
        'updateQuestionInList',
        'deleteQuestionFromList',
        'answerQuestionInList',
      ];

      expectedProperties.forEach((prop) => {
        expect(result.current).toHaveProperty(prop);
      });
    });
  });

  describe('基本的な動作を確認する時', () => {
    test('質問リスト作成機能が正しく動作する', async () => {
      const { result } = renderHookWithChakra(() => useQuestionList());

      // createListが呼び出されることを確認
      await result.current.createList({ title: 'テスト質問リスト' });
      expect(mockListManagement.createList).toHaveBeenCalledWith({
        title: 'テスト質問リスト',
      });
    });

    test('質問追加機能が正しく動作する', async () => {
      const { result } = renderHookWithChakra(() => useQuestionList());

      // addQuestionToListが呼び出されることを確認
      await result.current.addQuestionToList('list-id', {
        text: 'テスト質問',
      });
      expect(mockQuestionManagement.addQuestionToList).toHaveBeenCalledWith(
        'list-id',
        {
          text: 'テスト質問',
          category: 'テスト',
        }
      );
    });

    test('質問回答機能が正しく動作する', async () => {
      const { result } = renderHookWithChakra(() => useQuestionList());

      // answerQuestionInListが呼び出されることを確認
      await result.current.answerQuestionInList(
        'list-id',
        'question-id',
        'テスト回答'
      );
      expect(mockQuestionManagement.answerQuestionInList).toHaveBeenCalledWith(
        'list-id',
        'question-id',
        'テスト回答'
      );
    });
  });
});

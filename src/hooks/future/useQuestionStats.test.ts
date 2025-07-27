/**
 * useQuestionStats フックのテスト
 * t-wadaのTDD思想に基づく振る舞い駆動テスト
 * 実装詳細ではなく、ユーザーが期待する振る舞いに着目したテスト設計
 */

import { describe, test, expect, vi, beforeEach } from 'vitest';
import { renderHookWithChakra } from '../../test/testUtils';
import { mockQuestionList } from '../../test/testData';
import { useQuestionStats } from './useQuestionStats';
import type { QuestionList } from '../../types/data';

// テスト用データ設定
const createQuestionListWithStats = (
  answered: number,
  total: number
): QuestionList => ({
  ...mockQuestionList,
  id: 'test-list',
  questions: Array.from({ length: total }, (_, index) => ({
    id: `q${index + 1}`,
    text: `質問${index + 1}`,
    answer: index < answered ? '回答済み' : '',
    isAnswered: index < answered,
    priority: 'medium' as const,
    category: 'テスト',
    orderIndex: index + 1,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  })),
});

// ストアのモック
let mockQuestionLists: QuestionList[] = [];
let mockCurrentList: QuestionList | null = null;

// モジュールのモック
vi.mock('../useQuestionListManagement', () => ({
  useQuestionListManagement: () => ({
    currentList: mockCurrentList,
    questionLists: mockQuestionLists,
  }),
}));

describe('質問統計を確認する時', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockQuestionLists = [];
    mockCurrentList = null;
  });

  describe('現在の質問リストの統計を確認する時', () => {
    test('未回答の質問しかない時、進捗率は0%になる', () => {
      // Given: 5問すべて未回答の質問リストが現在選択されている
      const allUnansweredList = createQuestionListWithStats(0, 5);
      mockCurrentList = allUnansweredList;

      // When: 統計フックを使用する
      const { result } = renderHookWithChakra(() => useQuestionStats());

      // Then: 進捗率が0%で表示される
      const stats = result.current.currentListStats;
      expect(stats).not.toBeNull();
      expect(stats!.total).toBe(5);
      expect(stats!.answered).toBe(0);
      expect(stats!.unanswered).toBe(5);
      expect(stats!.progress).toBe(0);
    });

    test('すべての質問に回答済みの時、進捗率は100%になる', () => {
      // Given: 3問すべて回答済みの質問リストが現在選択されている
      const allAnsweredList = createQuestionListWithStats(3, 3);
      mockCurrentList = allAnsweredList;

      // When: 統計フックを使用する
      const { result } = renderHookWithChakra(() => useQuestionStats());

      // Then: 進捗率が100%で表示される
      const stats = result.current.currentListStats;
      expect(stats).not.toBeNull();
      expect(stats!.total).toBe(3);
      expect(stats!.answered).toBe(3);
      expect(stats!.unanswered).toBe(0);
      expect(stats!.progress).toBe(100);
    });

    test('一部の質問に回答済みの時、正確な進捗率が計算される', () => {
      // Given: 10問中4問回答済みの質問リストが現在選択されている
      const partiallyAnsweredList = createQuestionListWithStats(4, 10);
      mockCurrentList = partiallyAnsweredList;

      // When: 統計フックを使用する
      const { result } = renderHookWithChakra(() => useQuestionStats());

      // Then: 進捗率が40%で表示される（4/10 = 0.4 = 40%）
      const stats = result.current.currentListStats;
      expect(stats).not.toBeNull();
      expect(stats!.total).toBe(10);
      expect(stats!.answered).toBe(4);
      expect(stats!.unanswered).toBe(6);
      expect(stats!.progress).toBe(40);
    });

    test('質問リストが空の時、統計は0件として表示される', () => {
      // Given: 質問が1つもない空のリストが現在選択されている
      const emptyList = createQuestionListWithStats(0, 0);
      mockCurrentList = emptyList;

      // When: 統計フックを使用する
      const { result } = renderHookWithChakra(() => useQuestionStats());

      // Then: すべての統計が0で、進捗率も0%として表示される
      const stats = result.current.currentListStats;
      expect(stats).not.toBeNull();
      expect(stats!.total).toBe(0);
      expect(stats!.answered).toBe(0);
      expect(stats!.unanswered).toBe(0);
      expect(stats!.progress).toBe(0);
    });

    test('現在の質問リストが選択されていない時、統計は表示されない', () => {
      // Given: 現在選択されている質問リストがない
      mockCurrentList = null;

      // When: 統計フックを使用する
      const { result } = renderHookWithChakra(() => useQuestionStats());

      // Then: 統計は表示されない（null）
      expect(result.current.currentListStats).toBeNull();
    });
  });

  describe('特定の質問リストの統計を確認する時', () => {
    test('IDを指定してリストの統計を取得できる', () => {
      // Given: 複数の質問リストが存在し、特定のIDのリストを指定する
      const targetList = createQuestionListWithStats(2, 8);
      targetList.id = 'target-list-id';
      const otherList = createQuestionListWithStats(1, 3);
      otherList.id = 'other-list-id';

      mockQuestionLists = [targetList, otherList];
      mockCurrentList = otherList; // 別のリストが現在選択されている

      // When: 特定のIDで統計を取得する
      const { result } = renderHookWithChakra(() => useQuestionStats());
      const stats = result.current.getListStats('target-list-id');

      // Then: 指定したリストの統計が返される
      expect(stats).not.toBeNull();
      expect(stats!.total).toBe(8);
      expect(stats!.answered).toBe(2);
      expect(stats!.unanswered).toBe(6);
      expect(stats!.progress).toBe(25); // 2/8 = 0.25 = 25%
    });

    test('存在しないIDを指定した時、統計は取得できない', () => {
      // Given: 質問リストが存在するが、指定するIDが存在しない
      const existingList = createQuestionListWithStats(1, 2);
      existingList.id = 'existing-list';
      mockQuestionLists = [existingList];

      // When: 存在しないIDで統計を取得しようとする
      const { result } = renderHookWithChakra(() => useQuestionStats());
      const stats = result.current.getListStats('non-existing-id');

      // Then: 統計は取得できない（null）
      expect(stats).toBeNull();
    });

    test('IDを指定せずに呼び出すと現在のリストの統計が返される', () => {
      // Given: 現在のリストが選択されている
      const currentList = createQuestionListWithStats(3, 5);
      mockCurrentList = currentList;

      // When: IDを指定せずに統計を取得する
      const { result } = renderHookWithChakra(() => useQuestionStats());
      const stats = result.current.getListStats();

      // Then: 現在のリストの統計が返される
      expect(stats).not.toBeNull();
      expect(stats!.total).toBe(5);
      expect(stats!.answered).toBe(3);
      expect(stats!.progress).toBe(60); // 3/5 = 0.6 = 60%
    });
  });

  describe('進捗率の計算精度を確認する時', () => {
    test('小数点以下は四捨五入されて整数パーセントで表示される', () => {
      // Given: 3問中1問回答済み（33.333...%）の質問リスト
      const listWithDecimalProgress = createQuestionListWithStats(1, 3);
      mockCurrentList = listWithDecimalProgress;

      // When: 統計フックを使用する
      const { result } = renderHookWithChakra(() => useQuestionStats());

      // Then: 進捗率が33%（四捨五入）で表示される
      const stats = result.current.currentListStats;
      expect(stats!.progress).toBe(33); // 33.333... → 33
    });

    test('大量の質問がある場合でも正確に統計が計算される', () => {
      // Given: 1000問中750問回答済みの大規模な質問リスト
      const largeList = createQuestionListWithStats(750, 1000);
      mockCurrentList = largeList;

      // When: 統計フックを使用する
      const { result } = renderHookWithChakra(() => useQuestionStats());

      // Then: 正確に統計が計算される
      const stats = result.current.currentListStats;
      expect(stats!.total).toBe(1000);
      expect(stats!.answered).toBe(750);
      expect(stats!.unanswered).toBe(250);
      expect(stats!.progress).toBe(75); // 750/1000 = 0.75 = 75%
    });
  });
});

/**
 * useQuestionSearch フックのテスト
 * t-wadaのTDD思想に基づく振る舞い駆動テスト
 * ユーザーの検索体験に着目したテスト設計
 */

import { describe, test, expect, vi, beforeEach } from 'vitest';
import { renderHookWithChakra } from '../../test/testUtils';
import { useQuestionSearch } from './useQuestionSearch';
import type { QuestionList, Question } from '../../types/data';

// テスト用データ作成ヘルパー
const createQuestion = (
  id: string,
  text: string,
  answer = '',
  category = '基本'
): Question => ({
  id,
  text,
  answer,
  category,
  isAnswered: answer !== '',
  createdAt: new Date('2023-01-01'),
  updatedAt: new Date('2023-01-01'),
});

const createQuestionList = (
  id: string,
  title: string,
  nurseryName: string,
  questions: Question[]
): QuestionList => ({
  id,
  title,
  nurseryName,
  questions,
  createdAt: new Date('2023-01-01'),
  updatedAt: new Date('2023-01-01'),
  isTemplate: false,
});

// テスト用の質問リストデータ
const sakuraQuestions = [
  createQuestion(
    'q1',
    '開園時間は何時から何時まででしょうか？',
    '7:00-19:00',
    '基本情報'
  ),
  createQuestion(
    'q2',
    '給食は園で作っていますか？',
    '園内の厨房で手作りしています',
    '食事'
  ),
  createQuestion('q3', '延長保育はありますか？', '', '時間'),
  createQuestion('q4', '病児保育の対応はどうなっていますか？', '', '健康'),
];

const himawariQuestions = [
  createQuestion('q5', '月謝はいくらですか？', '3歳児: 28,000円', '費用'),
  createQuestion('q6', '英語教育はありますか？', '', '教育'),
  createQuestion(
    'q7',
    '給食のアレルギー対応はしていますか？',
    '除去食で対応可能です',
    '食事'
  ),
];

const testLists = [
  createQuestionList(
    'list1',
    'さくら保育園の見学チェックリスト',
    'さくら保育園',
    sakuraQuestions
  ),
  createQuestionList(
    'list2',
    'ひまわり保育園の質問リスト',
    'ひまわり保育園',
    himawariQuestions
  ),
  createQuestionList('list3', '認可外保育所の確認事項', '小さな家保育所', [
    createQuestion('q8', '保育料金の支払い方法は？', '', '費用'),
    createQuestion('q9', '園児の年齢構成を教えてください', '', '基本情報'),
  ]),
];

// ストアのモック
let mockQuestionLists: QuestionList[] = [];
let mockCurrentList: QuestionList | null = null;

// モジュールのモック
vi.mock('../useQuestionListManagement', () => ({
  useQuestionListManagement: () => ({
    questionLists: mockQuestionLists,
    currentList: mockCurrentList,
  }),
}));

describe('質問を検索する時', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockQuestionLists = [...testLists];
    mockCurrentList = testLists[0]; // さくら保育園のリストを選択
  });

  describe('質問リストを検索する時', () => {
    test('保育園名で検索すると該当するリストが見つかる', () => {
      // Given: 複数の保育園の質問リストが存在する
      const { result } = renderHookWithChakra(() => useQuestionSearch());

      // When: 「さくら」で検索する
      const searchResults = result.current.searchLists('さくら');

      // Then: さくら保育園のリストが見つかる
      expect(searchResults).toHaveLength(1);
      expect(searchResults[0].title).toBe('さくら保育園の見学チェックリスト');
      expect(searchResults[0].nurseryName).toBe('さくら保育園');
    });

    test('質問リストのタイトルで検索すると該当するリストが見つかる', () => {
      // Given: 複数の質問リストが存在する
      const { result } = renderHookWithChakra(() => useQuestionSearch());

      // When: 「チェックリスト」で検索する
      const searchResults = result.current.searchLists('チェックリスト');

      // Then: タイトルにチェックリストが含まれるリストが見つかる
      expect(searchResults).toHaveLength(1);
      expect(searchResults[0].title).toContain('チェックリスト');
    });

    test('質問の内容で検索すると関連するリストが見つかる', () => {
      // Given: 複数の質問リストが存在する
      const { result } = renderHookWithChakra(() => useQuestionSearch());

      // When: 「英語教育」で検索する
      const searchResults = result.current.searchLists('英語教育');

      // Then: 英語教育の質問があるひまわり保育園のリストが見つかる
      expect(searchResults).toHaveLength(1);
      expect(searchResults[0].nurseryName).toBe('ひまわり保育園');
      expect(
        searchResults[0].questions.some((q) => q.text.includes('英語教育'))
      ).toBe(true);
    });

    test('回答内容で検索すると該当するリストが見つかる', () => {
      // Given: 回答済みの質問があるリストが存在する
      const { result } = renderHookWithChakra(() => useQuestionSearch());

      // When: 「手作り」で検索する
      const searchResults = result.current.searchLists('手作り');

      // Then: 手作りという回答があるさくら保育園のリストが見つかる
      expect(searchResults).toHaveLength(1);
      expect(searchResults[0].nurseryName).toBe('さくら保育園');
      expect(
        searchResults[0].questions.some((q) => q.answer?.includes('手作り'))
      ).toBe(true);
    });

    test('検索語が空の時は全てのリストが表示される', () => {
      // Given: 複数の質問リストが存在する
      const { result } = renderHookWithChakra(() => useQuestionSearch());

      // When: 空文字で検索する
      const searchResults = result.current.searchLists('');

      // Then: 全てのリストが表示される
      expect(searchResults).toHaveLength(3);
    });

    test('該当しない検索語では結果が見つからない', () => {
      // Given: 複数の質問リストが存在する
      const { result } = renderHookWithChakra(() => useQuestionSearch());

      // When: 存在しない単語で検索する
      const searchResults = result.current.searchLists('存在しない保育園');

      // Then: 結果が見つからない
      expect(searchResults).toHaveLength(0);
    });

    test('大文字小文字を区別せずに検索できる', () => {
      // Given: 複数の質問リストが存在する
      const { result } = renderHookWithChakra(() => useQuestionSearch());

      // When: 大文字で「SAKURA」と検索する（データは「さくら」）
      const searchResults = result.current.searchLists('SAKURA');

      // Then: 大文字小文字を区別せずにマッチしない（日本語の場合）
      expect(searchResults).toHaveLength(0);
    });
  });

  describe('現在のリスト内の質問を検索する時', () => {
    test('質問内容で検索すると該当する質問が見つかる', () => {
      // Given: さくら保育園のリストが現在選択されている
      const { result } = renderHookWithChakra(() => useQuestionSearch());

      // When: 「開園時間」で検索する
      const searchResults =
        result.current.searchQuestionsInCurrentList('開園時間');

      // Then: 開園時間に関する質問が見つかる
      expect(searchResults).toHaveLength(1);
      expect(searchResults[0].text).toContain('開園時間');
    });

    test('回答内容で検索すると該当する質問が見つかる', () => {
      // Given: さくら保育園のリストが現在選択されている
      const { result } = renderHookWithChakra(() => useQuestionSearch());

      // When: 「7:00」で検索する
      const searchResults = result.current.searchQuestionsInCurrentList('7:00');

      // Then: 7:00という回答がある質問が見つかる
      expect(searchResults).toHaveLength(1);
      expect(searchResults[0].answer).toContain('7:00');
    });

    test('カテゴリで検索すると該当する質問が見つかる', () => {
      // Given: さくら保育園のリストが現在選択されている
      const { result } = renderHookWithChakra(() => useQuestionSearch());

      // When: 「食事」で検索する
      const searchResults = result.current.searchQuestionsInCurrentList('食事');

      // Then: 食事カテゴリの質問が見つかる
      expect(searchResults).toHaveLength(1);
      expect(searchResults[0].category).toBe('食事');
    });

    test('現在のリストが選択されていない時は空の結果が返される', () => {
      // Given: 現在選択されているリストがない
      mockCurrentList = null;
      const { result } = renderHookWithChakra(() => useQuestionSearch());

      // When: 何かで検索する
      const searchResults =
        result.current.searchQuestionsInCurrentList('何でも');

      // Then: 空の結果が返される
      expect(searchResults).toHaveLength(0);
    });

    test('未回答の質問も検索対象に含まれる', () => {
      // Given: さくら保育園のリストが現在選択されている（未回答の質問を含む）
      const { result } = renderHookWithChakra(() => useQuestionSearch());

      // When: 「延長保育」で検索する（この質問は未回答）
      const searchResults =
        result.current.searchQuestionsInCurrentList('延長保育');

      // Then: 未回答でも該当する質問が見つかる
      expect(searchResults).toHaveLength(1);
      expect(searchResults[0].text).toContain('延長保育');
      expect(searchResults[0].isAnswered).toBe(false);
    });
  });

  describe('テンプレートを検索する時', () => {
    test('テンプレートは現在実装されていないため空の結果が返される', () => {
      // Given: テンプレート機能は将来実装予定
      const { result } = renderHookWithChakra(() => useQuestionSearch());

      // When: テンプレートを検索する
      const searchResults =
        result.current.searchTemplates('何かのテンプレート');

      // Then: 空の結果が返される（将来実装予定）
      expect(searchResults).toHaveLength(0);
    });

    test('空の検索でもテンプレートは見つからない', () => {
      // Given: テンプレート機能は将来実装予定
      const { result } = renderHookWithChakra(() => useQuestionSearch());

      // When: 空文字でテンプレートを検索する
      const searchResults = result.current.searchTemplates('');

      // Then: 空の結果が返される
      expect(searchResults).toHaveLength(0);
    });
  });

  describe('検索機能の汎用性を確認する時', () => {
    test('createSearchFunction を使って独自の検索ロジックを作成できる', () => {
      // Given: 独自のデータ型で検索したい
      const customData = [
        { name: 'データA', value: 'テスト用の値1' },
        { name: 'データB', value: 'テスト用の値2' },
        { name: 'カスタムC', value: '特別な内容' },
      ];

      const { result } = renderHookWithChakra(() => useQuestionSearch());

      // When: createSearchFunction を使って独自の検索関数を作成
      const customSearchFunction = result.current.createSearchFunction(
        customData,
        (item) => [item.name, item.value]
      );

      // Then: 独自のデータを検索できる
      const searchResults = customSearchFunction('テスト');
      expect(searchResults).toHaveLength(2);
      expect(searchResults.map((item) => item.name)).toEqual([
        'データA',
        'データB',
      ]);
    });

    test('部分一致での検索が可能である', () => {
      // Given: 複数の質問リストが存在する
      const { result } = renderHookWithChakra(() => useQuestionSearch());

      // When: 部分的な文字列で検索する
      const searchResults = result.current.searchLists('保育');

      // Then: 部分一致で複数のリストが見つかる
      expect(searchResults.length).toBeGreaterThan(1);
      expect(
        searchResults.every(
          (list) =>
            list.nurseryName?.includes('保育') || list.title.includes('保育')
        )
      ).toBe(true);
    });
  });
});

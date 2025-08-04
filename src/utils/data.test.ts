/**
 * データユーティリティ関数のテスト
 * TDD思想に基づく振る舞いベーステスト
 * Given-When-Then構造による明確なテスト記述
 */

import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import type {
  Question,
  QuestionList,
  CreateQuestionListInput,
} from '../types/data';
import {
  generateId,
  createQuestion,
  createQuestionList,
  answerQuestion,
  updateQuestionListTimestamp,
  addQuestionToList,
  removeQuestionFromList,
  updateQuestionInList,
  getQuestionListStats,
  createQuestionListFromTemplate,
} from './data';
import {
  createQuestionMock,
  createCreateQuestionInputMock,
} from '../test/test-utils';

// モックデータ
const mockDate = new Date('2023-12-01T10:00:00Z');

// crypto.randomUUIDのモック
const mockGenerateId = vi.fn(() => 'mock-uuid-123');

describe('データユーティリティ関数', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(mockDate);

    // crypto.randomUUIDをモック
    Object.defineProperty(globalThis, 'crypto', {
      value: { randomUUID: mockGenerateId },
      writable: true,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('generateId', () => {
    describe('IDを生成する時', () => {
      test('UUID形式の文字列を返す', () => {
        // When: IDを生成する
        const id = generateId();

        // Then: UUID形式の文字列が返される
        expect(id).toBe('mock-uuid-123');
        expect(mockGenerateId).toHaveBeenCalledOnce();
      });
    });
  });

  describe('createQuestion', () => {
    describe('必須フィールドのみで質問を作成する時', () => {
      test('デフォルト値が設定された質問オブジェクトを返す', () => {
        // Given: 必須フィールドのみの入力データ
        const input = createCreateQuestionInputMock({
          text: 'テスト質問',
        });
        // When: 質問を作成する
        const question = createQuestion(input);

        // Then: デフォルト値が設定された質問オブジェクトが返される
        expect(question).toEqual({
          id: 'mock-uuid-123',
          text: 'テスト質問',
          answer: undefined,
          isAnswered: false,
          answeredBy: undefined,
          answeredAt: undefined,
          createdAt: mockDate,
          updatedAt: mockDate,
        });
      });
    });

    describe('全フィールドを指定して質問を作成する時', () => {
      test('指定した値が設定された質問オブジェクトを返す', () => {
        // Given: 全フィールドを含む入力データ
        const input = createCreateQuestionInputMock({
          text: '  保育時間を教えてください  ',
        });
        // When: 質問を作成する
        const question = createQuestion(input);

        // Then: 指定した値とトリム処理が適用された質問オブジェクトが返される
        expect(question).toEqual({
          id: 'mock-uuid-123',
          text: '保育時間を教えてください',
          answer: undefined,
          isAnswered: false,
          answeredBy: undefined,
          answeredAt: undefined,
          createdAt: mockDate,
          updatedAt: mockDate,
        });
      });
    });

    describe('テキストに前後の空白がある時', () => {
      test('空白がトリムされた質問オブジェクトを返す', () => {
        // Given: 前後に空白があるテキスト
        const input = createCreateQuestionInputMock({
          text: '   給食はありますか？   ',
        });

        // When: 質問を作成する
        const question = createQuestion(input);

        // Then: 空白がトリムされたテキストが設定される
        expect(question.text).toBe('給食はありますか？');
      });
    });
  });

  describe('createQuestionList', () => {
    describe('必須フィールドのみで質問リストを作成する時', () => {
      test('デフォルト値が設定された質問リストオブジェクトを返す', () => {
        // Given: 必須フィールドのみの入力データ
        const input: CreateQuestionListInput = {
          title: 'テスト質問リスト',
        };

        // When: 質問リストを作成する
        const questionList = createQuestionList(input);

        // Then: デフォルト値が設定された質問リストオブジェクトが返される
        expect(questionList).toEqual({
          id: 'mock-uuid-123',
          title: 'テスト質問リスト',
          nurseryName: undefined,
          visitDate: undefined,
          questions: [],
          sharedWith: [],
          createdAt: mockDate,
          updatedAt: mockDate,
          isTemplate: false,
        });
      });
    });

    describe('全フィールドを指定して質問リストを作成する時', () => {
      test('指定した値が設定された質問リストオブジェクトを返す', () => {
        // Given: 全フィールドを含む入力データ
        const visitDate = new Date('2023-12-15');
        const input: CreateQuestionListInput = {
          title: '  テスト保育園見学リスト  ',
          nurseryName: '  テスト保育園  ',
          visitDate,
          isTemplate: true,
        };

        // When: 質問リストを作成する
        const questionList = createQuestionList(input);

        // Then: 指定した値とトリム処理が適用された質問リストオブジェクトが返される
        expect(questionList).toEqual({
          id: 'mock-uuid-123',
          title: 'テスト保育園見学リスト',
          nurseryName: 'テスト保育園',
          visitDate,
          questions: [],
          sharedWith: [],
          createdAt: mockDate,
          updatedAt: mockDate,
          isTemplate: true,
        });
      });
    });

    describe('タイトルに前後の空白がある時', () => {
      test('空白がトリムされた質問リストオブジェクトを返す', () => {
        // Given: 前後に空白があるタイトル
        const input: CreateQuestionListInput = {
          title: '   保育園見学質問リスト   ',
        };

        // When: 質問リストを作成する
        const questionList = createQuestionList(input);

        // Then: 空白がトリムされたタイトルが設定される
        expect(questionList.title).toBe('保育園見学質問リスト');
      });
    });

    describe('保育園名に前後の空白がある時', () => {
      test('空白がトリムされた質問リストオブジェクトを返す', () => {
        // Given: 前後に空白がある保育園名
        const input: CreateQuestionListInput = {
          title: 'テスト質問リスト',
          nurseryName: '   さくら保育園   ',
        };

        // When: 質問リストを作成する
        const questionList = createQuestionList(input);

        // Then: 空白がトリムされた保育園名が設定される
        expect(questionList.nurseryName).toBe('さくら保育園');
      });
    });
  });

  describe('answerQuestion', () => {
    const baseQuestion = createQuestionMock({
      id: 'q1',
      text: 'テスト質問',
      answer: undefined,
      isAnswered: false,
      answeredBy: undefined,
      answeredAt: undefined,
    });

    describe('回答を設定する時', () => {
      test('回答が設定され、isAnsweredがtrueになる', () => {
        // Given: 未回答の質問と回答テキスト
        const answer = 'テスト回答';

        // When: 質問に回答する
        const answeredQuestion = answerQuestion(baseQuestion, answer);

        // Then: 回答が設定され、isAnsweredがtrueになる
        expect(answeredQuestion.answer).toBe('テスト回答');
        expect(answeredQuestion.isAnswered).toBe(true);
        expect(answeredQuestion.answeredAt).toEqual(mockDate);
      });
    });

    describe('回答者を指定して回答を設定する時', () => {
      test('回答者が設定された質問オブジェクトを返す', () => {
        // Given: 未回答の質問、回答テキスト、回答者
        const answer = 'テスト回答';
        const answeredBy = 'user123';

        // When: 回答者を指定して質問に回答する
        const answeredQuestion = answerQuestion(
          baseQuestion,
          answer,
          answeredBy
        );

        // Then: 回答者が設定される
        expect(answeredQuestion.answeredBy).toBe('user123');
        expect(answeredQuestion.isAnswered).toBe(true);
      });
    });

    describe('空の回答を設定する時', () => {
      test('isAnsweredがfalseでansweredAtがundefinedになる', () => {
        // Given: 未回答の質問と空の回答テキスト
        const answer = '';

        // When: 空の回答を設定する
        const answeredQuestion = answerQuestion(baseQuestion, answer);

        // Then: isAnsweredがfalseでansweredAtがundefinedになる
        expect(answeredQuestion.answer).toBe('');
        expect(answeredQuestion.isAnswered).toBe(false);
        expect(answeredQuestion.answeredAt).toBeUndefined();
      });
    });

    describe('空白のみの回答を設定する時', () => {
      test('空白がトリムされ、isAnsweredがfalseになる', () => {
        // Given: 未回答の質問と空白のみの回答テキスト
        const answer = '   ';

        // When: 空白のみの回答を設定する
        const answeredQuestion = answerQuestion(baseQuestion, answer);

        // Then: 空白がトリムされ、isAnsweredがfalseになる
        expect(answeredQuestion.answer).toBe('');
        expect(answeredQuestion.isAnswered).toBe(false);
        expect(answeredQuestion.answeredAt).toBeUndefined();
      });
    });

    describe('前後に空白がある回答を設定する時', () => {
      test('空白がトリムされた回答が設定される', () => {
        // Given: 未回答の質問と前後に空白がある回答テキスト
        const answer = '   詳細な回答です   ';

        // When: 回答を設定する
        const answeredQuestion = answerQuestion(baseQuestion, answer);

        // Then: 空白がトリムされた回答が設定される
        expect(answeredQuestion.answer).toBe('詳細な回答です');
        expect(answeredQuestion.isAnswered).toBe(true);
      });
    });

    describe('元の質問オブジェクトが変更されないことを確認する時', () => {
      test('元の質問オブジェクトは変更されない', () => {
        // Given: 未回答の質問
        const originalQuestion = { ...baseQuestion };
        const answer = 'テスト回答';

        // When: 質問に回答する
        answerQuestion(baseQuestion, answer);

        // Then: 元の質問オブジェクトは変更されない
        expect(baseQuestion).toEqual(originalQuestion);
      });
    });
  });

  describe('updateQuestionListTimestamp', () => {
    const baseQuestionList: QuestionList = {
      id: 'list1',
      title: 'テスト質問リスト',
      nurseryName: 'テスト保育園',
      visitDate: undefined,
      questions: [],
      sharedWith: [],
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01'),
      isTemplate: false,
    };

    describe('質問リストのタイムスタンプを更新する時', () => {
      test('updatedAtが現在時刻に更新される', () => {
        // Given: 質問リスト
        const questionList = { ...baseQuestionList };

        // When: タイムスタンプを更新する
        const updatedList = updateQuestionListTimestamp(questionList);

        // Then: updatedAtが現在時刻に更新される
        expect(updatedList.updatedAt).toEqual(mockDate);
      });
    });

    describe('createdAtは変更されないことを確認する時', () => {
      test('createdAtは元の値を維持する', () => {
        // Given: 質問リスト
        const questionList = { ...baseQuestionList };
        const originalCreatedAt = questionList.createdAt;

        // When: タイムスタンプを更新する
        const updatedList = updateQuestionListTimestamp(questionList);

        // Then: createdAtは変更されない
        expect(updatedList.createdAt).toEqual(originalCreatedAt);
      });
    });

    describe('他のフィールドは変更されないことを確認する時', () => {
      test('updatedAt以外のフィールドは元の値を維持する', () => {
        // Given: 質問リスト
        const questionList = { ...baseQuestionList };

        // When: タイムスタンプを更新する
        const updatedList = updateQuestionListTimestamp(questionList);

        // Then: updatedAt以外のフィールドは変更されない
        expect(updatedList.id).toBe(questionList.id);
        expect(updatedList.title).toBe(questionList.title);
        expect(updatedList.nurseryName).toBe(questionList.nurseryName);
        expect(updatedList.questions).toEqual(questionList.questions);
      });
    });

    describe('元のオブジェクトが変更されないことを確認する時', () => {
      test('元の質問リストオブジェクトは変更されない', () => {
        // Given: 質問リスト
        const questionList = { ...baseQuestionList };
        const originalList = { ...questionList };

        // When: タイムスタンプを更新する
        updateQuestionListTimestamp(questionList);

        // Then: 元のオブジェクトは変更されない
        expect(questionList).toEqual(originalList);
      });
    });
  });

  describe('addQuestionToList', () => {
    const baseQuestionList: QuestionList = {
      id: 'list1',
      title: 'テスト質問リスト',
      nurseryName: 'テスト保育園',
      visitDate: undefined,
      questions: [
        {
          id: 'existing-q1',
          text: '既存の質問',
          answer: undefined,
          isAnswered: false,
        } as Question,
      ],
      sharedWith: [],
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01'),
      isTemplate: false,
    };

    describe('質問リストに新しい質問を追加する時', () => {
      test('新しい質問が先頭に追加される', () => {
        // Given: 既存の質問が1つある質問リストと新しい質問の入力データ
        const questionInput = createCreateQuestionInputMock({
          text: '新しい質問',
        });

        // When: 質問を質問リストに追加する
        const updatedList = addQuestionToList(baseQuestionList, questionInput);

        // Then: 新しい質問が先頭に追加される
        expect(updatedList.questions).toHaveLength(2);
        expect(updatedList.questions[0].text).toBe('新しい質問');
        // 既存の質問が後に配置される
        expect(updatedList.questions[1].text).toBe('既存の質問');
      });
    });

    describe('タイムスタンプが更新されることを確認する時', () => {
      test('updatedAtが現在時刻に更新される', () => {
        // Given: 質問リストと新しい質問
        const questionInput = createCreateQuestionInputMock({
          text: '新しい質問',
        });

        // When: 質問を追加する
        const updatedList = addQuestionToList(baseQuestionList, questionInput);

        // Then: updatedAtが現在時刻に更新される
        expect(updatedList.updatedAt).toEqual(mockDate);
      });
    });

    describe('空の質問リストに質問を追加する時', () => {
      test('最初の質問として正しく追加される', () => {
        // Given: 空の質問リスト
        const emptyList = { ...baseQuestionList, questions: [] };
        const questionInput = createCreateQuestionInputMock({
          text: '最初の質問',
        });

        // When: 質問を追加する
        const updatedList = addQuestionToList(emptyList, questionInput);

        // Then: 最初の質問として追加される
        expect(updatedList.questions).toHaveLength(1);
        expect(updatedList.questions[0].text).toBe('最初の質問');
      });
    });

    describe('元の質問リストが変更されないことを確認する時', () => {
      test('元の質問リストオブジェクトは変更されない', () => {
        // Given: 質問リスト
        const originalList = { ...baseQuestionList };
        const questionInput = createCreateQuestionInputMock({
          text: '新しい質問',
        });

        // When: 質問を追加する
        addQuestionToList(baseQuestionList, questionInput);

        // Then: 元のオブジェクトは変更されない
        expect(baseQuestionList.questions).toHaveLength(1);
        expect(baseQuestionList.updatedAt).toEqual(originalList.updatedAt);
      });
    });
  });

  describe('removeQuestionFromList', () => {
    const createQuestionListWithMultipleQuestions = (): QuestionList => ({
      id: 'list1',
      title: 'テスト質問リスト',
      nurseryName: 'テスト保育園',
      visitDate: undefined,
      questions: [
        {
          id: 'q1',
          text: '質問1',
          answer: undefined,
          isAnswered: false,
        } as Question,
        {
          id: 'q2',
          text: '質問2',
          answer: undefined,
          isAnswered: false,
        } as Question,
        {
          id: 'q3',
          text: '質問3',
          answer: undefined,
          isAnswered: false,
        } as Question,
      ],
      sharedWith: [],
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01'),
      isTemplate: false,
    });

    describe('存在する質問を削除する時', () => {
      test('指定した質問が削除される', () => {
        // Given: 3つの質問がある質問リスト
        const questionList = createQuestionListWithMultipleQuestions();

        // When: 中間の質問を削除する
        const updatedList = removeQuestionFromList(questionList, 'q2');

        // Then: 指定した質問が削除される
        expect(updatedList.questions).toHaveLength(2);
        expect(
          updatedList.questions.find((q) => q.id === 'q2')
        ).toBeUndefined();
        expect(updatedList.questions[0].id).toBe('q1');
        expect(updatedList.questions[1].id).toBe('q3');
      });
    });

    describe('存在しない質問IDを指定して削除する時', () => {
      test('質問リストは変更されない', () => {
        // Given: 3つの質問がある質問リスト
        const questionList = createQuestionListWithMultipleQuestions();
        const originalQuestionsLength = questionList.questions.length;

        // When: 存在しない質問IDで削除を試行する
        const updatedList = removeQuestionFromList(
          questionList,
          'non-existent-id'
        );

        // Then: 質問リストは変更されない
        expect(updatedList.questions).toHaveLength(originalQuestionsLength);
        expect(updatedList.questions.map((q) => q.id)).toEqual([
          'q1',
          'q2',
          'q3',
        ]);
      });
    });

    describe('最後の質問を削除する時', () => {
      test('空の質問リストになる', () => {
        // Given: 1つの質問がある質問リスト
        const questionList = {
          ...createQuestionListWithMultipleQuestions(),
          questions: [createQuestionListWithMultipleQuestions().questions[0]],
        };

        // When: 最後の質問を削除する
        const updatedList = removeQuestionFromList(questionList, 'q1');

        // Then: 空の質問リストになる
        expect(updatedList.questions).toHaveLength(0);
      });
    });

    describe('タイムスタンプが更新されることを確認する時', () => {
      test('updatedAtが現在時刻に更新される', () => {
        // Given: 質問リスト
        const questionList = createQuestionListWithMultipleQuestions();

        // When: 質問を削除する
        const updatedList = removeQuestionFromList(questionList, 'q2');

        // Then: updatedAtが現在時刻に更新される
        expect(updatedList.updatedAt).toEqual(mockDate);
      });
    });

    describe('元の質問リストが変更されないことを確認する時', () => {
      test('元の質問リストオブジェクトは変更されない', () => {
        // Given: 質問リスト
        const questionList = createQuestionListWithMultipleQuestions();
        const originalQuestionsLength = questionList.questions.length;

        // When: 質問を削除する
        removeQuestionFromList(questionList, 'q2');

        // Then: 元のオブジェクトは変更されない
        expect(questionList.questions).toHaveLength(originalQuestionsLength);
      });
    });
  });

  describe('updateQuestionInList', () => {
    const createQuestionListForUpdate = (): QuestionList => ({
      id: 'list1',
      title: 'テスト質問リスト',
      nurseryName: 'テスト保育園',
      visitDate: undefined,
      questions: [
        createQuestionMock({
          id: 'q1',
          text: '元の質問1',
          answer: undefined,
          isAnswered: false,
          answeredBy: undefined,
          answeredAt: undefined,
        }),
        createQuestionMock({
          id: 'q2',
          text: '元の質問2',
          answer: undefined,
          isAnswered: false,
          answeredBy: undefined,
          answeredAt: undefined,
        }),
      ],
      sharedWith: [],
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01'),
      isTemplate: false,
    });

    describe('存在する質問を更新する時', () => {
      test('指定した質問が更新される', () => {
        // Given: 質問リストと更新後の質問オブジェクト
        const questionList = createQuestionListForUpdate();
        const updatedQuestion = createQuestionMock({
          id: 'q1',
          text: '更新された質問1',
          answer: '更新された回答',
          isAnswered: true,
          answeredBy: 'user123',
          answeredAt: mockDate,
        });

        // When: 質問を更新する
        const updatedList = updateQuestionInList(
          questionList,
          'q1',
          updatedQuestion
        );

        // Then: 指定した質問が更新される
        const targetQuestion = updatedList.questions.find((q) => q.id === 'q1');
        expect(targetQuestion).toEqual(updatedQuestion);
      });
    });

    describe('他の質問は変更されないことを確認する時', () => {
      test('更新対象以外の質問は元の値を維持する', () => {
        // Given: 質問リストと更新後の質問オブジェクト
        const questionList = createQuestionListForUpdate();
        const originalQ2 = { ...questionList.questions[1] };
        const updatedQuestion: Question = {
          ...questionList.questions[0],
          text: '更新された質問1',
        };

        // When: 質問を更新する
        const updatedList = updateQuestionInList(
          questionList,
          'q1',
          updatedQuestion
        );

        // Then: 他の質問は変更されない
        const q2 = updatedList.questions.find((q) => q.id === 'q2');
        expect(q2).toEqual(originalQ2);
      });
    });

    describe('存在しない質問IDを指定して更新する時', () => {
      test('質問リストは変更されない', () => {
        // Given: 質問リストと更新用の質問オブジェクト
        const questionList = createQuestionListForUpdate();
        const originalQuestions = [...questionList.questions];
        const updatedQuestion = createQuestionMock({
          id: 'non-existent-id',
          text: '存在しない質問',
          answer: undefined,
          isAnswered: false,
        });

        // When: 存在しない質問IDで更新を試行する
        const updatedList = updateQuestionInList(
          questionList,
          'non-existent-id',
          updatedQuestion
        );

        // Then: 質問リストは変更されない
        expect(updatedList.questions).toEqual(originalQuestions);
      });
    });

    describe('タイムスタンプが更新されることを確認する時', () => {
      test('updatedAtが現在時刻に更新される', () => {
        // Given: 質問リストと更新後の質問オブジェクト
        const questionList = createQuestionListForUpdate();
        const updatedQuestion: Question = {
          ...questionList.questions[0],
          text: '更新された質問',
        };

        // When: 質問を更新する
        const updatedList = updateQuestionInList(
          questionList,
          'q1',
          updatedQuestion
        );

        // Then: updatedAtが現在時刻に更新される
        expect(updatedList.updatedAt).toEqual(mockDate);
      });
    });

    describe('元の質問リストが変更されないことを確認する時', () => {
      test('元の質問リストオブジェクトは変更されない', () => {
        // Given: 質問リスト
        const questionList = createQuestionListForUpdate();
        const originalFirstQuestion = { ...questionList.questions[0] };
        const updatedQuestion: Question = {
          ...questionList.questions[0],
          text: '更新された質問',
        };

        // When: 質問を更新する
        updateQuestionInList(questionList, 'q1', updatedQuestion);

        // Then: 元のオブジェクトは変更されない
        expect(questionList.questions[0]).toEqual(originalFirstQuestion);
      });
    });
  });

  describe('getQuestionListStats', () => {
    describe('質問が存在しない質問リストの統計を取得する時', () => {
      test('全ての値が0またはデフォルト値になる', () => {
        // Given: 質問が存在しない質問リスト
        const emptyQuestionList: QuestionList = {
          id: 'list1',
          title: 'テスト質問リスト',
          questions: [],
          createdAt: mockDate,
          updatedAt: mockDate,
          isTemplate: false,
          sharedWith: [],
        };

        // When: 統計情報を取得する
        const stats = getQuestionListStats(emptyQuestionList);

        // Then: 全ての値が0またはデフォルト値になる
        expect(stats).toEqual({
          total: 0,
          answered: 0,
          unanswered: 0,
          progress: 0,
        });
      });
    });

    describe('全て未回答の質問リストの統計を取得する時', () => {
      test('answered=0、unanswered=total、progress=0になる', () => {
        // Given: 全て未回答の質問リスト
        const unansweredQuestionList: QuestionList = {
          id: 'list1',
          title: 'テスト質問リスト',
          questions: [
            { id: 'q1', isAnswered: false } as Question,
            { id: 'q2', isAnswered: false } as Question,
            { id: 'q3', isAnswered: false } as Question,
          ],
          createdAt: mockDate,
          updatedAt: mockDate,
          isTemplate: false,
          sharedWith: [],
        };

        // When: 統計情報を取得する
        const stats = getQuestionListStats(unansweredQuestionList);

        // Then: answered=0、unanswered=total、progress=0になる
        expect(stats).toEqual({
          total: 3,
          answered: 0,
          unanswered: 3,
          progress: 0,
        });
      });
    });

    describe('全て回答済みの質問リストの統計を取得する時', () => {
      test('answered=total、unanswered=0、progress=100になる', () => {
        // Given: 全て回答済みの質問リスト
        const answeredQuestionList: QuestionList = {
          id: 'list1',
          title: 'テスト質問リスト',
          questions: [
            { id: 'q1', isAnswered: true } as Question,
            { id: 'q2', isAnswered: true } as Question,
          ],
          createdAt: mockDate,
          updatedAt: mockDate,
          isTemplate: false,
          sharedWith: [],
        };

        // When: 統計情報を取得する
        const stats = getQuestionListStats(answeredQuestionList);

        // Then: answered=total、unanswered=0、progress=100になる
        expect(stats).toEqual({
          total: 2,
          answered: 2,
          unanswered: 0,
          progress: 100,
        });
      });
    });

    describe('一部回答済みの質問リストの統計を取得する時', () => {
      test('正確な統計値と進捗率が計算される', () => {
        // Given: 5つ中3つが回答済みの質問リスト
        const mixedQuestionList: QuestionList = {
          id: 'list1',
          title: 'テスト質問リスト',
          questions: [
            { id: 'q1', isAnswered: true } as Question,
            { id: 'q2', isAnswered: false } as Question,
            { id: 'q3', isAnswered: true } as Question,
            { id: 'q4', isAnswered: false } as Question,
            { id: 'q5', isAnswered: true } as Question,
          ],
          createdAt: mockDate,
          updatedAt: mockDate,
          isTemplate: false,
          sharedWith: [],
        };

        // When: 統計情報を取得する
        const stats = getQuestionListStats(mixedQuestionList);

        // Then: 正確な統計値が計算される（3/5 = 60%）
        expect(stats).toEqual({
          total: 5,
          answered: 3,
          unanswered: 2,
          progress: 60,
        });
      });
    });

    describe('進捗率の端数処理を確認する時', () => {
      test('進捗率が四捨五入される', () => {
        // Given: 3つ中1つが回答済みの質問リスト（33.33...%）
        const questionList: QuestionList = {
          id: 'list1',
          title: 'テスト質問リスト',
          questions: [
            { id: 'q1', isAnswered: true } as Question,
            { id: 'q2', isAnswered: false } as Question,
            { id: 'q3', isAnswered: false } as Question,
          ],
          createdAt: mockDate,
          updatedAt: mockDate,
          isTemplate: false,
          sharedWith: [],
        };

        // When: 統計情報を取得する
        const stats = getQuestionListStats(questionList);

        // Then: 進捗率が四捨五入される（33.33... → 33）
        expect(stats.progress).toBe(33);
      });
    });
  });

  describe('createQuestionListFromTemplate', () => {
    const createTemplateQuestionList = (): QuestionList => ({
      id: 'template-1',
      title: 'テンプレート質問リスト',
      nurseryName: 'テンプレート保育園',
      questions: [
        createQuestionMock({
          id: 'tq1',
          text: 'テンプレート質問1',
          answer: 'テンプレート回答1',
          isAnswered: true,
          answeredBy: 'template-user',
          answeredAt: new Date('2023-01-01'),
        }),
        createQuestionMock({
          id: 'tq2',
          text: 'テンプレート質問2',
          answer: undefined,
          isAnswered: false,
          answeredBy: undefined,
          answeredAt: undefined,
        }),
      ],
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01'),
      isTemplate: true,
      sharedWith: [],
    });

    describe('テンプレートから質問リストを作成する時', () => {
      test('カスタマイズした情報で新しい質問リストが作成される', () => {
        // Given: テンプレート質問リストとカスタマイズ情報
        const template = createTemplateQuestionList();
        const customizations: CreateQuestionListInput = {
          title: '新しい質問リスト',
          nurseryName: '新しい保育園',
          visitDate: new Date('2023-12-15'),
          isTemplate: false,
        };

        // When: テンプレートから質問リストを作成する
        const newQuestionList = createQuestionListFromTemplate(
          template,
          customizations
        );

        // Then: カスタマイズした情報で新しい質問リストが作成される
        expect(newQuestionList.id).toBe('mock-uuid-123');
        expect(newQuestionList.title).toBe('新しい質問リスト');
        expect(newQuestionList.nurseryName).toBe('新しい保育園');
        expect(newQuestionList.visitDate).toEqual(new Date('2023-12-15'));
        expect(newQuestionList.isTemplate).toBe(false);
        expect(newQuestionList.createdAt).toEqual(mockDate);
        expect(newQuestionList.updatedAt).toEqual(mockDate);
      });
    });

    describe('テンプレートの質問がコピーされることを確認する時', () => {
      test('質問のテキストと基本情報はコピーされる', () => {
        // Given: テンプレート質問リスト
        const template = createTemplateQuestionList();
        const customizations: CreateQuestionListInput = {
          title: '新しい質問リスト',
        };

        // When: テンプレートから質問リストを作成する
        const newQuestionList = createQuestionListFromTemplate(
          template,
          customizations
        );

        // Then: 質問のテキストがコピーされる
        expect(newQuestionList.questions).toHaveLength(2);
        expect(newQuestionList.questions[0].text).toBe('テンプレート質問1');
        expect(newQuestionList.questions[1].text).toBe('テンプレート質問2');
      });
    });

    describe('回答関連の情報がリセットされることを確認する時', () => {
      test('answer、isAnswered、answeredBy、answeredAtがリセットされる', () => {
        // Given: 回答済みの質問を含むテンプレート
        const template = createTemplateQuestionList();
        const customizations: CreateQuestionListInput = {
          title: '新しい質問リスト',
        };

        // When: テンプレートから質問リストを作成する
        const newQuestionList = createQuestionListFromTemplate(
          template,
          customizations
        );

        // Then: 回答関連の情報がリセットされる
        newQuestionList.questions.forEach((question) => {
          expect(question.answer).toBeUndefined();
          expect(question.isAnswered).toBe(false);
          expect(question.answeredBy).toBeUndefined();
          expect(question.answeredAt).toBeUndefined();
        });
      });
    });

    describe('新しいIDが生成されることを確認する時', () => {
      test('質問リストと各質問に新しいIDが生成される', () => {
        // Given: テンプレート質問リスト
        const template = createTemplateQuestionList();
        const customizations: CreateQuestionListInput = {
          title: '新しい質問リスト',
        };

        // モックを2回目、3回目の呼び出し用に設定
        mockGenerateId
          .mockReturnValueOnce('new-list-id')
          .mockReturnValueOnce('new-question-id-1')
          .mockReturnValueOnce('new-question-id-2');

        // When: テンプレートから質問リストを作成する
        const newQuestionList = createQuestionListFromTemplate(
          template,
          customizations
        );

        // Then: 新しいIDが生成される
        expect(newQuestionList.id).toBe('new-list-id');
        expect(newQuestionList.questions[0].id).toBe('new-question-id-1');
        expect(newQuestionList.questions[1].id).toBe('new-question-id-2');

        // 元のテンプレートのIDと異なることを確認
        expect(newQuestionList.id).not.toBe(template.id);
        expect(newQuestionList.questions[0].id).not.toBe(
          template.questions[0].id
        );
        expect(newQuestionList.questions[1].id).not.toBe(
          template.questions[1].id
        );
      });
    });

    describe('空の質問を持つテンプレートから作成する時', () => {
      test('空の質問リストが作成される', () => {
        // Given: 質問が空のテンプレート
        const emptyTemplate = {
          ...createTemplateQuestionList(),
          questions: [],
        };
        const customizations: CreateQuestionListInput = {
          title: '新しい質問リスト',
        };

        // When: テンプレートから質問リストを作成する
        const newQuestionList = createQuestionListFromTemplate(
          emptyTemplate,
          customizations
        );

        // Then: 空の質問リストが作成される
        expect(newQuestionList.questions).toHaveLength(0);
      });
    });

    describe('元のテンプレートが変更されないことを確認する時', () => {
      test('元のテンプレートオブジェクトは変更されない', () => {
        // Given: テンプレート質問リスト
        const template = createTemplateQuestionList();
        const originalTemplateId = template.id;
        const originalQuestionsLength = template.questions.length;
        const originalFirstQuestionId = template.questions[0]?.id;
        const customizations: CreateQuestionListInput = {
          title: '新しい質問リスト',
        };

        // When: テンプレートから質問リストを作成する
        createQuestionListFromTemplate(template, customizations);

        // Then: 元のテンプレートの主要プロパティは変更されない
        expect(template.id).toBe(originalTemplateId);
        expect(template.questions).toHaveLength(originalQuestionsLength);
        expect(template.questions[0]?.id).toBe(originalFirstQuestionId);
      });
    });
  });
});

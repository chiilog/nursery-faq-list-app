/**
 * データユーティリティ関数のテスト
 * TDD原則に基づく包括的なテストケース
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  generateId,
  createQuestion,
  answerQuestion,
  addQuestionToQuestionsArray,
} from './data';
import type { Question } from '../types/entities';
import type { CreateQuestionInput } from '../types/inputs';

describe('generateId', () => {
  describe('正常系', () => {
    it('UUID v4形式の文字列を返す', () => {
      const id = generateId();

      // UUID v4のパターンをチェック
      const uuidV4Pattern =
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(id).toMatch(uuidV4Pattern);
      expect(typeof id).toBe('string');
      expect(id.length).toBe(36);
    });

    it('呼び出すたびに異なるIDを返す', () => {
      const id1 = generateId();
      const id2 = generateId();
      const id3 = generateId();

      expect(id1).not.toBe(id2);
      expect(id2).not.toBe(id3);
      expect(id1).not.toBe(id3);
    });

    it('crypto.randomUUIDを呼び出している', () => {
      const mockRandomUUID = vi.spyOn(crypto, 'randomUUID');
      mockRandomUUID.mockReturnValue('12345678-1234-4000-8000-123456789abc');

      const result = generateId();

      expect(mockRandomUUID).toHaveBeenCalledTimes(1);
      expect(result).toBe('12345678-1234-4000-8000-123456789abc');

      mockRandomUUID.mockRestore();
    });
  });
});

describe('createQuestion', () => {
  let mockDate: Date;

  beforeEach(() => {
    mockDate = new Date('2024-01-01T00:00:00.000Z');
    vi.useFakeTimers();
    vi.setSystemTime(mockDate);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('正常系', () => {
    it('最小限の入力で質問オブジェクトを作成する', () => {
      const input: CreateQuestionInput = {
        text: '保育時間を教えてください',
      };

      const result = createQuestion(input);

      expect(result).toEqual({
        id: expect.any(String),
        text: '保育時間を教えてください',
        answer: undefined,
        isAnswered: false,
        answeredBy: undefined,
        answeredAt: undefined,
        createdAt: mockDate,
        updatedAt: mockDate,
      });
      expect(result.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );
    });

    it('回答付きの入力で質問オブジェクトを作成する', () => {
      const input: CreateQuestionInput = {
        text: '保育時間を教えてください',
        answer: '7:00-19:00',
        isAnswered: true,
      };

      const result = createQuestion(input);

      expect(result).toEqual({
        id: expect.any(String),
        text: '保育時間を教えてください',
        answer: undefined, // createQuestion関数では入力のanswerは無視される仕様
        isAnswered: false, // createQuestion関数では入力のisAnsweredは無視される仕様
        answeredBy: undefined,
        answeredAt: undefined,
        createdAt: mockDate,
        updatedAt: mockDate,
      });
    });

    it('前後の空白を含むテキストをトリミングする', () => {
      const input: CreateQuestionInput = {
        text: '  保育時間を教えてください  ',
      };

      const result = createQuestion(input);

      expect(result.text).toBe('保育時間を教えてください');
    });

    it('改行やタブを含むテキストをトリミングする', () => {
      const input: CreateQuestionInput = {
        text: '\n\t  保育時間を教えてください  \r\n',
      };

      const result = createQuestion(input);

      expect(result.text).toBe('保育時間を教えてください');
    });

    it('毎回異なるIDを生成する', () => {
      const input: CreateQuestionInput = {
        text: '保育時間を教えてください',
      };

      const result1 = createQuestion(input);
      const result2 = createQuestion(input);

      expect(result1.id).not.toBe(result2.id);
    });

    it('作成日時と更新日時が同じ値になる', () => {
      const input: CreateQuestionInput = {
        text: '保育時間を教えてください',
      };

      const result = createQuestion(input);

      expect(result.createdAt).toEqual(result.updatedAt);
      expect(result.createdAt).toEqual(mockDate);
    });
  });

  describe('異常系', () => {
    it('input.textがnullの場合はエラーを投げる', () => {
      const input = { text: null } as any;
      expect(() => createQuestion(input)).toThrow('Question text is required');
    });

    it('input.textがundefinedの場合はエラーを投げる', () => {
      const input = { text: undefined } as any;
      expect(() => createQuestion(input)).toThrow('Question text is required');
    });

    it('inputがnullの場合はエラーを投げる', () => {
      expect(() => createQuestion(null as any)).toThrow(
        'Question text is required'
      );
    });

    it('inputがundefinedの場合はエラーを投げる', () => {
      expect(() => createQuestion(undefined as any)).toThrow(
        'Question text is required'
      );
    });

    it('空文字列の場合はエラーを投げる', () => {
      const input: CreateQuestionInput = { text: '' };
      expect(() => createQuestion(input)).toThrow(
        'Question text cannot be empty'
      );
    });

    it('空白のみの文字列の場合はエラーを投げる', () => {
      const input: CreateQuestionInput = { text: '   ' };
      expect(() => createQuestion(input)).toThrow(
        'Question text cannot be empty'
      );
    });

    it('タブや改行のみの文字列の場合はエラーを投げる', () => {
      const input: CreateQuestionInput = { text: '\t\n\r ' };
      expect(() => createQuestion(input)).toThrow(
        'Question text cannot be empty'
      );
    });
  });
});

describe('answerQuestion', () => {
  let mockDate: Date;
  let baseQuestion: Question;

  beforeEach(() => {
    mockDate = new Date('2024-01-01T00:00:00.000Z');
    vi.useFakeTimers();
    vi.setSystemTime(mockDate);

    baseQuestion = {
      id: 'test-id',
      text: '保育時間を教えてください',
      answer: undefined,
      isAnswered: false,
      answeredBy: undefined,
      answeredAt: undefined,
      createdAt: new Date('2023-12-01T00:00:00.000Z'),
      updatedAt: new Date('2023-12-01T00:00:00.000Z'),
    };
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('正常系', () => {
    it('空でない回答を設定すると回答済みになる', () => {
      const result = answerQuestion(baseQuestion, '7:00-19:00');

      expect(result).toEqual({
        ...baseQuestion,
        answer: '7:00-19:00',
        isAnswered: true,
        answeredBy: undefined,
        answeredAt: mockDate,
        updatedAt: mockDate,
      });
    });

    it('回答者情報付きで回答を設定する', () => {
      const result = answerQuestion(baseQuestion, '7:00-19:00', 'user123');

      expect(result).toEqual({
        ...baseQuestion,
        answer: '7:00-19:00',
        isAnswered: true,
        answeredBy: 'user123',
        answeredAt: mockDate,
        updatedAt: mockDate,
      });
    });

    it('前後の空白を含む回答をトリミングする', () => {
      const result = answerQuestion(baseQuestion, '  7:00-19:00  ');

      expect(result.answer).toBe('7:00-19:00');
      expect(result.isAnswered).toBe(true);
      expect(result.answeredAt).toEqual(mockDate);
      expect(result.updatedAt).toEqual(mockDate);
    });

    it('改行やタブを含む回答をトリミングする', () => {
      const result = answerQuestion(baseQuestion, '\n\t  7:00-19:00  \r\n');

      expect(result.answer).toBe('7:00-19:00');
      expect(result.isAnswered).toBe(true);
      expect(result.answeredAt).toEqual(mockDate);
      expect(result.updatedAt).toEqual(mockDate);
    });

    it('元の質問オブジェクトを変更しない（イミュータブル）', () => {
      const originalQuestion = { ...baseQuestion };

      answerQuestion(baseQuestion, '7:00-19:00');

      expect(baseQuestion).toEqual(originalQuestion);
    });
  });

  describe('空の回答の場合', () => {
    it('空文字列の回答は未回答状態になる', () => {
      const result = answerQuestion(baseQuestion, '');

      expect(result).toEqual({
        ...baseQuestion,
        answer: '',
        isAnswered: false,
        answeredBy: undefined,
        answeredAt: undefined,
        updatedAt: mockDate,
      });
    });

    it('空白のみの回答は未回答状態になる', () => {
      const result = answerQuestion(baseQuestion, '   ');

      expect(result).toEqual({
        ...baseQuestion,
        answer: '',
        isAnswered: false,
        answeredBy: undefined,
        answeredAt: undefined,
        updatedAt: mockDate,
      });
    });

    it('空白のみの回答でも回答者情報は設定されるが回答日時は設定されない', () => {
      const result = answerQuestion(baseQuestion, '   ', 'user123');

      expect(result.answeredBy).toBe('user123');
      expect(result.answeredAt).toBeUndefined();
      expect(result.updatedAt).toEqual(mockDate);
    });
  });

  describe('既に回答済みの質問を更新する場合', () => {
    it('既存の回答を新しい回答で上書きする', () => {
      const answeredQuestion: Question = {
        ...baseQuestion,
        answer: '旧回答',
        isAnswered: true,
        answeredBy: 'oldUser',
        answeredAt: new Date('2023-12-15T00:00:00.000Z'),
      };

      const result = answerQuestion(answeredQuestion, '新回答', 'newUser');

      expect(result).toEqual({
        ...answeredQuestion,
        answer: '新回答',
        isAnswered: true,
        answeredBy: 'newUser',
        answeredAt: mockDate,
        updatedAt: mockDate,
      });
    });

    it('回答を空にすると未回答状態に戻る', () => {
      const answeredQuestion: Question = {
        ...baseQuestion,
        answer: '既存回答',
        isAnswered: true,
        answeredBy: 'user123',
        answeredAt: new Date('2023-12-15T00:00:00.000Z'),
      };

      const result = answerQuestion(answeredQuestion, '');

      expect(result).toEqual({
        ...answeredQuestion,
        answer: '',
        isAnswered: false,
        answeredBy: undefined,
        answeredAt: undefined,
        updatedAt: mockDate,
      });
    });
  });
});

describe('addQuestionToQuestionsArray', () => {
  describe('正常系', () => {
    it('空の配列に質問を追加する', () => {
      const existingQuestions: Question[] = [];
      const newQuestion: Question = {
        id: 'new-id',
        text: '新しい質問',
        answer: undefined,
        isAnswered: false,
        answeredBy: undefined,
        answeredAt: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = addQuestionToQuestionsArray(
        existingQuestions,
        newQuestion
      );

      expect(result).toEqual([newQuestion]);
      expect(result.length).toBe(1);
    });

    it('既存の質問がある配列の先頭に新しい質問を追加する', () => {
      const existingQuestion: Question = {
        id: 'existing-id',
        text: '既存の質問',
        answer: '既存の回答',
        isAnswered: true,
        answeredBy: undefined,
        answeredAt: undefined,
        createdAt: new Date('2023-12-01T00:00:00.000Z'),
        updatedAt: new Date('2023-12-01T00:00:00.000Z'),
      };

      const newQuestion: Question = {
        id: 'new-id',
        text: '新しい質問',
        answer: undefined,
        isAnswered: false,
        answeredBy: undefined,
        answeredAt: undefined,
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
        updatedAt: new Date('2024-01-01T00:00:00.000Z'),
      };

      const existingQuestions = [existingQuestion];
      const result = addQuestionToQuestionsArray(
        existingQuestions,
        newQuestion
      );

      expect(result).toEqual([newQuestion, existingQuestion]);
      expect(result[0]).toEqual(newQuestion);
      expect(result[1]).toEqual(existingQuestion);
      expect(result.length).toBe(2);
    });

    it('複数の既存質問がある配列の先頭に新しい質問を追加する', () => {
      const question1: Question = {
        id: 'id-1',
        text: '質問1',
        answer: undefined,
        isAnswered: false,
        answeredBy: undefined,
        answeredAt: undefined,
        createdAt: new Date('2023-11-01T00:00:00.000Z'),
        updatedAt: new Date('2023-11-01T00:00:00.000Z'),
      };

      const question2: Question = {
        id: 'id-2',
        text: '質問2',
        answer: '回答2',
        isAnswered: true,
        answeredBy: undefined,
        answeredAt: undefined,
        createdAt: new Date('2023-12-01T00:00:00.000Z'),
        updatedAt: new Date('2023-12-01T00:00:00.000Z'),
      };

      const newQuestion: Question = {
        id: 'new-id',
        text: '新しい質問',
        answer: undefined,
        isAnswered: false,
        answeredBy: undefined,
        answeredAt: undefined,
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
        updatedAt: new Date('2024-01-01T00:00:00.000Z'),
      };

      const existingQuestions = [question1, question2];
      const result = addQuestionToQuestionsArray(
        existingQuestions,
        newQuestion
      );

      expect(result).toEqual([newQuestion, question1, question2]);
      expect(result.length).toBe(3);
    });

    it('元の配列を変更しない（イミュータブル）', () => {
      const existingQuestion: Question = {
        id: 'existing-id',
        text: '既存の質問',
        answer: undefined,
        isAnswered: false,
        answeredBy: undefined,
        answeredAt: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const newQuestion: Question = {
        id: 'new-id',
        text: '新しい質問',
        answer: undefined,
        isAnswered: false,
        answeredBy: undefined,
        answeredAt: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const originalQuestions = [existingQuestion];
      const result = addQuestionToQuestionsArray(
        originalQuestions,
        newQuestion
      );

      expect(originalQuestions).toEqual([existingQuestion]);
      expect(originalQuestions.length).toBe(1);
      expect(result).not.toBe(originalQuestions);
    });

    it('質問オブジェクトの参照を保持する', () => {
      const existingQuestion: Question = {
        id: 'existing-id',
        text: '既存の質問',
        answer: undefined,
        isAnswered: false,
        answeredBy: undefined,
        answeredAt: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const newQuestion: Question = {
        id: 'new-id',
        text: '新しい質問',
        answer: undefined,
        isAnswered: false,
        answeredBy: undefined,
        answeredAt: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const existingQuestions = [existingQuestion];
      const result = addQuestionToQuestionsArray(
        existingQuestions,
        newQuestion
      );

      expect(result[0]).toBe(newQuestion);
      expect(result[1]).toBe(existingQuestion);
    });
  });
});

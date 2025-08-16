/**
 * バリデーション関数のテスト
 * TDD原則に基づく包括的なテストケース
 */

import { describe, it, expect } from 'vitest';
import {
  validateQuestionText,
  validateAnswerText,
  validateNurseryName,
  validateVisitDate,
  validateCreateQuestionInput,
  validateUpdateQuestionInput,
  validateQuestion,
} from './validation';
import type { Question } from '../types/entities';
import type { CreateQuestionInput, UpdateQuestionInput } from '../types/inputs';

describe('validateQuestionText', () => {
  describe('正常系', () => {
    it('有効な質問テキストに対してisValid=trueを返す', () => {
      const result = validateQuestionText('保育時間を教えてください');
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('1文字の質問テキストを有効とする', () => {
      const result = validateQuestionText('あ');
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('500文字ちょうどの質問テキストを有効とする', () => {
      const text = 'あ'.repeat(500);
      const result = validateQuestionText(text);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('前後の空白を含む質問テキストを有効とする（境界値）', () => {
      const result = validateQuestionText('  保育時間を教えてください  ');
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });
  });

  describe('異常系', () => {
    it('空文字列に対してエラーメッセージを返す', () => {
      const result = validateQuestionText('');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('質問内容を入力してください');
    });

    it('空白のみの文字列に対してエラーメッセージを返す', () => {
      const result = validateQuestionText('   ');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('質問内容を入力してください');
    });

    it('501文字の質問テキストに対してエラーメッセージを返す（境界値+1）', () => {
      const text = 'あ'.repeat(501);
      const result = validateQuestionText(text);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        '質問内容は500文字以内で入力してください'
      );
    });

    it('タブや改行のみの文字列に対してエラーメッセージを返す', () => {
      const result = validateQuestionText('\t\n\r ');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('質問内容を入力してください');
    });
  });
});

describe('validateAnswerText', () => {
  describe('正常系', () => {
    it('有効な回答テキストに対してisValid=trueを返す', () => {
      const result = validateAnswerText('午前7時から午後7時まで');
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('空文字列を有効とする（回答は任意のため）', () => {
      const result = validateAnswerText('');
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('1000文字ちょうどの回答テキストを有効とする', () => {
      const text = 'あ'.repeat(1000);
      const result = validateAnswerText(text);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });
  });

  describe('異常系', () => {
    it('1001文字の回答テキストに対してエラーメッセージを返す（境界値+1）', () => {
      const text = 'あ'.repeat(1001);
      const result = validateAnswerText(text);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('回答は1000文字以内で入力してください');
    });

    it('前後の空白を含む1001文字の回答テキストに対してエラーメッセージを返す', () => {
      // trim()後に1001文字になるように調整: '  ' + 1001文字 + '  '
      const text = '  ' + 'あ'.repeat(1001) + '  ';
      const result = validateAnswerText(text);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('回答は1000文字以内で入力してください');
    });
  });
});

describe('validateNurseryName', () => {
  describe('正常系', () => {
    it('有効な保育園名に対してisValid=trueを返す', () => {
      const result = validateNurseryName('さくら保育園');
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('空文字列を有効とする（保育園名は任意のため）', () => {
      const result = validateNurseryName('');
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('100文字ちょうどの保育園名を有効とする', () => {
      const name = 'あ'.repeat(100);
      const result = validateNurseryName(name);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('空白のみの保育園名を有効とする', () => {
      const result = validateNurseryName('   ');
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });
  });

  describe('異常系', () => {
    it('101文字の保育園名に対してエラーメッセージを返す（境界値+1）', () => {
      const name = 'あ'.repeat(101);
      const result = validateNurseryName(name);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        '保育園名は100文字以内で入力してください'
      );
    });

    it('前後の空白を含む101文字の保育園名に対してエラーメッセージを返す', () => {
      // trim()後に101文字になるように調整: '  ' + 101文字 + '  '
      const name = '  ' + 'あ'.repeat(101) + '  ';
      const result = validateNurseryName(name);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        '保育園名は100文字以内で入力してください'
      );
    });
  });
});

describe('validateVisitDate', () => {
  describe('正常系', () => {
    it('現在時刻以降の日付を有効とする', () => {
      // 現在時刻より1分後の日付を作成
      const futureDate = new Date();
      futureDate.setMinutes(futureDate.getMinutes() + 1);
      const result = validateVisitDate(futureDate);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('明日の日付を有効とする', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const result = validateVisitDate(tomorrow);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('1年後の日付を有効とする（境界値）', () => {
      const oneYearLater = new Date();
      oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
      const result = validateVisitDate(oneYearLater);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });
  });

  describe('異常系', () => {
    it('昨日の日付に対してエラーメッセージを返す', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const result = validateVisitDate(yesterday);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        '見学日は今日以降の日付を入力してください'
      );
    });

    it('1年と1日後の日付に対してエラーメッセージを返す（境界値+1）', () => {
      const overOneYear = new Date();
      overOneYear.setFullYear(overOneYear.getFullYear() + 1);
      overOneYear.setDate(overOneYear.getDate() + 1);
      const result = validateVisitDate(overOneYear);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        '見学日は1年以内の日付を選択してください'
      );
    });

    it('過去の年に対してエラーメッセージを返す', () => {
      const pastYear = new Date();
      pastYear.setFullYear(pastYear.getFullYear() - 1);
      const result = validateVisitDate(pastYear);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        '見学日は今日以降の日付を入力してください'
      );
    });
  });
});

describe('validateCreateQuestionInput', () => {
  describe('正常系', () => {
    it('有効な質問作成入力に対してisValid=trueを返す', () => {
      const input: CreateQuestionInput = {
        text: '保育時間を教えてください',
      };
      const result = validateCreateQuestionInput(input);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('回答付きの質問作成入力を有効とする', () => {
      const input: CreateQuestionInput = {
        text: '保育時間を教えてください',
        answer: '7:00-19:00',
        isAnswered: true,
      };
      const result = validateCreateQuestionInput(input);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });
  });

  describe('異常系', () => {
    it('空の質問テキストに対してエラーメッセージを返す', () => {
      const input: CreateQuestionInput = {
        text: '',
      };
      const result = validateCreateQuestionInput(input);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('質問内容を入力してください');
    });

    it('501文字の質問テキストに対してエラーメッセージを返す', () => {
      const input: CreateQuestionInput = {
        text: 'あ'.repeat(501),
      };
      const result = validateCreateQuestionInput(input);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        '質問内容は500文字以内で入力してください'
      );
    });
  });
});

describe('validateUpdateQuestionInput', () => {
  describe('正常系', () => {
    it('質問テキストのみの更新を有効とする', () => {
      const input: UpdateQuestionInput = {
        text: '保育時間を教えてください',
      };
      const result = validateUpdateQuestionInput(input);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('回答のみの更新を有効とする', () => {
      const input: UpdateQuestionInput = {
        answer: '7:00-19:00',
      };
      const result = validateUpdateQuestionInput(input);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('質問テキストと回答の両方の更新を有効とする', () => {
      const input: UpdateQuestionInput = {
        text: '保育時間を教えてください',
        answer: '7:00-19:00',
        isAnswered: true,
      };
      const result = validateUpdateQuestionInput(input);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('空の回答を有効とする', () => {
      const input: UpdateQuestionInput = {
        answer: '',
      };
      const result = validateUpdateQuestionInput(input);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('空白のみの回答を有効とする', () => {
      const input: UpdateQuestionInput = {
        answer: '   ',
      };
      const result = validateUpdateQuestionInput(input);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });
  });

  describe('異常系', () => {
    it('無効な質問テキストに対してエラーメッセージを返す', () => {
      const input: UpdateQuestionInput = {
        text: '',
      };
      const result = validateUpdateQuestionInput(input);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('質問内容を入力してください');
    });

    it('1001文字の回答に対してエラーメッセージを返す', () => {
      const input: UpdateQuestionInput = {
        answer: 'あ'.repeat(1001),
      };
      const result = validateUpdateQuestionInput(input);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('回答は1000文字以内で入力してください');
    });

    it('複数のエラーを同時に検出する', () => {
      const input: UpdateQuestionInput = {
        text: '',
        answer: 'あ'.repeat(1001),
      };
      const result = validateUpdateQuestionInput(input);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(2);
      expect(result.errors).toContain('質問内容を入力してください');
      expect(result.errors).toContain('回答は1000文字以内で入力してください');
    });
  });
});

describe('validateQuestion', () => {
  const createMockQuestion = (overrides?: Partial<Question>): Question => ({
    id: 'test-id',
    text: '保育時間を教えてください',
    answer: '7:00-19:00',
    isAnswered: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

  describe('正常系', () => {
    it('有効な質問オブジェクトに対してisValid=trueを返す', () => {
      const question = createMockQuestion();
      const result = validateQuestion(question);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('回答がない質問を有効とする', () => {
      const question = createMockQuestion({
        answer: undefined,
        isAnswered: false,
      });
      const result = validateQuestion(question);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('空の回答を有効とする', () => {
      const question = createMockQuestion({
        answer: '',
        isAnswered: false,
      });
      const result = validateQuestion(question);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('空白のみの回答を有効とする', () => {
      const question = createMockQuestion({
        answer: '   ',
        isAnswered: false,
      });
      const result = validateQuestion(question);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });
  });

  describe('異常系', () => {
    it('無効な質問テキストに対してエラーメッセージを返す', () => {
      const question = createMockQuestion({
        text: '',
      });
      const result = validateQuestion(question);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('質問内容を入力してください');
    });

    it('1001文字の回答に対してエラーメッセージを返す', () => {
      const question = createMockQuestion({
        answer: 'あ'.repeat(1001),
      });
      const result = validateQuestion(question);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('回答は1000文字以内で入力してください');
    });

    it('複数のエラーを同時に検出する', () => {
      const question = createMockQuestion({
        text: '',
        answer: 'あ'.repeat(1001),
      });
      const result = validateQuestion(question);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(2);
      expect(result.errors).toContain('質問内容を入力してください');
      expect(result.errors).toContain('回答は1000文字以内で入力してください');
    });
  });
});

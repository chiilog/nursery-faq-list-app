/**
 * @fileoverview validation.ts のTDD準拠テスト
 * t-wadaさんのTDD原則に厳密に準拠したテスト設計
 * Given-When-Then構造と1テスト1検証の原則を徹底
 */

import { describe, it, expect } from 'vitest';
import type {
  CreateQuestionListInput,
  UpdateQuestionInput,
  UpdateQuestionListInput,
  Question,
  QuestionList,
} from '../types/data';
import {
  createQuestionMock,
  createCreateQuestionInputMock,
} from '../test/test-utils';
import {
  validateQuestionText,
  validateAnswerText,
  validateQuestionListTitle,
  validateNurseryName,
  validateVisitDate,
  validateCreateQuestionInput,
  validateUpdateQuestionInput,
  validateCreateQuestionListInput,
  validateUpdateQuestionListInput,
  validateQuestion,
  validateQuestionList,
} from './validation';

describe('validateQuestionText', () => {
  describe('空文字・null・undefinedのケース', () => {
    it('空文字列を渡した時、バリデーションエラーが返される', () => {
      // Given: 空文字列
      const text = '';

      // When: バリデーションを実行
      const result = validateQuestionText(text);

      // Then: バリデーション失敗
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('質問内容を入力してください');
    });

    it('半角スペースのみの文字列を渡した時、バリデーションエラーが返される', () => {
      // Given: 半角スペースのみの文字列
      const text = '   ';

      // When: バリデーションを実行
      const result = validateQuestionText(text);

      // Then: バリデーション失敗
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('質問内容を入力してください');
    });

    it('全角スペースのみの文字列を渡した時、バリデーションエラーが返される', () => {
      // Given: 全角スペースのみの文字列
      const text = '　　　';

      // When: バリデーションを実行
      const result = validateQuestionText(text);

      // Then: バリデーション失敗
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('質問内容を入力してください');
    });
  });

  describe('文字数制限のケース', () => {
    it('500文字ちょうどの文字列を渡した時、バリデーションが成功する', () => {
      // Given: 500文字ちょうどの文字列
      const text = 'あ'.repeat(500);

      // When: バリデーションを実行
      const result = validateQuestionText(text);

      // Then: バリデーション成功
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('501文字の文字列を渡した時、バリデーションエラーが返される', () => {
      // Given: 501文字の文字列
      const text = 'あ'.repeat(501);

      // When: バリデーションを実行
      const result = validateQuestionText(text);

      // Then: バリデーション失敗
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        '質問内容は500文字以内で入力してください'
      );
    });

    it('前後に空白がある有効な文字列を渡した時、トリム後の文字数で判定される', () => {
      // Given: 前後に空白がある498文字の文字列（トリム後は498文字）
      const text = '  ' + 'あ'.repeat(498) + '  ';

      // When: バリデーションを実行
      const result = validateQuestionText(text);

      // Then: バリデーション成功
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('有効な入力のケース', () => {
    it('通常の質問文を渡した時、バリデーションが成功する', () => {
      // Given: 通常の質問文
      const text = '保育園の開園時間はいつですか？';

      // When: バリデーションを実行
      const result = validateQuestionText(text);

      // Then: バリデーション成功
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('1文字の文字列を渡した時、バリデーションが成功する', () => {
      // Given: 1文字の文字列
      const text = 'a';

      // When: バリデーションを実行
      const result = validateQuestionText(text);

      // Then: バリデーション成功
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });
});

describe('validateAnswerText', () => {
  describe('文字数制限のケース', () => {
    it('1000文字ちょうどの文字列を渡した時、バリデーションが成功する', () => {
      // Given: 1000文字ちょうどの文字列
      const answer = 'あ'.repeat(1000);

      // When: バリデーションを実行
      const result = validateAnswerText(answer);

      // Then: バリデーション成功
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('1001文字の文字列を渡した時、バリデーションエラーが返される', () => {
      // Given: 1001文字の文字列
      const answer = 'あ'.repeat(1001);

      // When: バリデーションを実行
      const result = validateAnswerText(answer);

      // Then: バリデーション失敗
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('回答は1000文字以内で入力してください');
    });

    it('前後に空白がある有効な文字列を渡した時、トリム後の文字数で判定される', () => {
      // Given: 前後に空白がある998文字の文字列（トリム後は998文字）
      const answer = '  ' + 'あ'.repeat(998) + '  ';

      // When: バリデーションを実行
      const result = validateAnswerText(answer);

      // Then: バリデーション成功
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('有効な入力のケース', () => {
    it('空文字列を渡した時、バリデーションが成功する', () => {
      // Given: 空文字列（回答は任意項目）
      const answer = '';

      // When: バリデーションを実行
      const result = validateAnswerText(answer);

      // Then: バリデーション成功
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('通常の回答文を渡した時、バリデーションが成功する', () => {
      // Given: 通常の回答文
      const answer = '開園時間は午前7時から午後7時までです。';

      // When: バリデーションを実行
      const result = validateAnswerText(answer);

      // Then: バリデーション成功
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });
});

describe('validateQuestionListTitle', () => {
  describe('空文字・null・undefinedのケース', () => {
    it('空文字列を渡した時、バリデーションエラーが返される', () => {
      // Given: 空文字列
      const title = '';

      // When: バリデーションを実行
      const result = validateQuestionListTitle(title);

      // Then: バリデーション失敗
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('質問リストのタイトルを入力してください');
    });

    it('半角スペースのみの文字列を渡した時、バリデーションエラーが返される', () => {
      // Given: 半角スペースのみの文字列
      const title = '   ';

      // When: バリデーションを実行
      const result = validateQuestionListTitle(title);

      // Then: バリデーション失敗
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('質問リストのタイトルを入力してください');
    });
  });

  describe('文字数制限のケース', () => {
    it('100文字ちょうどの文字列を渡した時、バリデーションが成功する', () => {
      // Given: 100文字ちょうどの文字列
      const title = 'あ'.repeat(100);

      // When: バリデーションを実行
      const result = validateQuestionListTitle(title);

      // Then: バリデーション成功
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('101文字の文字列を渡した時、バリデーションエラーが返される', () => {
      // Given: 101文字の文字列
      const title = 'あ'.repeat(101);

      // When: バリデーションを実行
      const result = validateQuestionListTitle(title);

      // Then: バリデーション失敗
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'タイトルは100文字以内で入力してください'
      );
    });
  });

  describe('有効な入力のケース', () => {
    it('通常のタイトルを渡した時、バリデーションが成功する', () => {
      // Given: 通常のタイトル
      const title = 'さくら保育園見学時の質問リスト';

      // When: バリデーションを実行
      const result = validateQuestionListTitle(title);

      // Then: バリデーション成功
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });
});

describe('validateNurseryName', () => {
  describe('文字数制限のケース', () => {
    it('100文字ちょうどの文字列を渡した時、バリデーションが成功する', () => {
      // Given: 100文字ちょうどの文字列
      const name = 'あ'.repeat(100);

      // When: バリデーションを実行
      const result = validateNurseryName(name);

      // Then: バリデーション成功
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('101文字の文字列を渡した時、バリデーションエラーが返される', () => {
      // Given: 101文字の文字列
      const name = 'あ'.repeat(101);

      // When: バリデーションを実行
      const result = validateNurseryName(name);

      // Then: バリデーション失敗
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        '保育園名は100文字以内で入力してください'
      );
    });
  });

  describe('有効な入力のケース', () => {
    it('空文字列を渡した時、バリデーションが成功する', () => {
      // Given: 空文字列（保育園名は任意項目）
      const name = '';

      // When: バリデーションを実行
      const result = validateNurseryName(name);

      // Then: バリデーション成功
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('通常の保育園名を渡した時、バリデーションが成功する', () => {
      // Given: 通常の保育園名
      const name = 'さくら保育園';

      // When: バリデーションを実行
      const result = validateNurseryName(name);

      // Then: バリデーション成功
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });
});

describe('validateVisitDate', () => {
  describe('日付範囲のケース', () => {
    it('昨日の日付を渡した時、バリデーションエラーが返される', () => {
      // Given: 昨日の日付
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      // When: バリデーションを実行
      const result = validateVisitDate(yesterday);

      // Then: バリデーション失敗
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        '見学日は今日以降の日付を選択してください'
      );
    });

    it('今日の日付を渡した時、バリデーションが成功する', () => {
      // Given: 今日の日付
      const today = new Date();

      // When: バリデーションを実行
      const result = validateVisitDate(today);

      // Then: バリデーション成功
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('1年後の日付を渡した時、バリデーションが成功する', () => {
      // Given: 1年後の日付
      const oneYearLater = new Date();
      oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);

      // When: バリデーションを実行
      const result = validateVisitDate(oneYearLater);

      // Then: バリデーション成功
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('1年と1日後の日付を渡した時、バリデーションエラーが返される', () => {
      // Given: 1年と1日後の日付
      const overOneYear = new Date();
      overOneYear.setFullYear(overOneYear.getFullYear() + 1);
      overOneYear.setDate(overOneYear.getDate() + 1);

      // When: バリデーションを実行
      const result = validateVisitDate(overOneYear);

      // Then: バリデーション失敗
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        '見学日は1年以内の日付を選択してください'
      );
    });
  });

  describe('有効な入力のケース', () => {
    it('明日の日付を渡した時、バリデーションが成功する', () => {
      // Given: 明日の日付
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      // When: バリデーションを実行
      const result = validateVisitDate(tomorrow);

      // Then: バリデーション成功
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });
});

describe('validateCreateQuestionInput', () => {
  describe('必須項目のケース', () => {
    it('テキストが空の入力を渡した時、バリデーションエラーが返される', () => {
      // Given: テキストが空の入力
      const input = createCreateQuestionInputMock({
        text: '',
      });

      // When: バリデーションを実行
      const result = validateCreateQuestionInput(input);

      // Then: バリデーション失敗
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('質問内容を入力してください');
    });

    it('有効なテキストの入力を渡した時、バリデーションが成功する', () => {
      // Given: 有効なテキストの入力
      const input = createCreateQuestionInputMock({
        text: '開園時間はいつですか？',
      });

      // When: バリデーションを実行
      const result = validateCreateQuestionInput(input);

      // Then: バリデーション成功
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('オプション項目のケース', () => {
    it('優先度とカテゴリを含む有効な入力を渡した時、バリデーションが成功する', () => {
      // Given: 優先度とカテゴリを含む有効な入力
      const input = createCreateQuestionInputMock({
        text: '開園時間はいつですか？',
        category: '基本情報',
      });

      // When: バリデーションを実行
      const result = validateCreateQuestionInput(input);

      // Then: バリデーション成功
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });
});

describe('validateUpdateQuestionInput', () => {
  describe('テキスト更新のケース', () => {
    it('空のテキストで更新しようとした時、バリデーションエラーが返される', () => {
      // Given: 空のテキストで更新
      const input: UpdateQuestionInput = {
        text: '',
      };

      // When: バリデーションを実行
      const result = validateUpdateQuestionInput(input);

      // Then: バリデーション失敗
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('質問内容を入力してください');
    });

    it('有効なテキストで更新する時、バリデーションが成功する', () => {
      // Given: 有効なテキストで更新
      const input: UpdateQuestionInput = {
        text: '更新された質問内容',
      };

      // When: バリデーションを実行
      const result = validateUpdateQuestionInput(input);

      // Then: バリデーション成功
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('回答更新のケース', () => {
    it('1001文字の回答で更新しようとした時、バリデーションエラーが返される', () => {
      // Given: 1001文字の回答で更新
      const input: UpdateQuestionInput = {
        answer: 'あ'.repeat(1001),
      };

      // When: バリデーションを実行
      const result = validateUpdateQuestionInput(input);

      // Then: バリデーション失敗
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('回答は1000文字以内で入力してください');
    });

    it('空の回答で更新する時、バリデーションが成功する', () => {
      // Given: 空の回答で更新（空文字は回答削除とみなされスキップ）
      const input: UpdateQuestionInput = {
        answer: '',
      };

      // When: バリデーションを実行
      const result = validateUpdateQuestionInput(input);

      // Then: バリデーション成功
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('有効な回答で更新する時、バリデーションが成功する', () => {
      // Given: 有効な回答で更新
      const input: UpdateQuestionInput = {
        answer: '開園時間は午前7時から午後7時までです。',
      };

      // When: バリデーションを実行
      const result = validateUpdateQuestionInput(input);

      // Then: バリデーション成功
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('複合更新のケース', () => {
    it('複数の項目を同時に更新する時、全てのバリデーションが適用される', () => {
      // Given: 複数項目の更新（一部エラー含む）
      const input: UpdateQuestionInput = {
        text: '', // エラー
        answer: 'あ'.repeat(1001), // エラー
      };

      // When: バリデーションを実行
      const result = validateUpdateQuestionInput(input);

      // Then: 全てのエラーが含まれる
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('質問内容を入力してください');
      expect(result.errors).toContain('回答は1000文字以内で入力してください');
    });
  });
});

describe('validateCreateQuestionListInput', () => {
  describe('必須項目のケース', () => {
    it('タイトルが空の入力を渡した時、バリデーションエラーが返される', () => {
      // Given: タイトルが空の入力
      const input: CreateQuestionListInput = {
        title: '',
      };

      // When: バリデーションを実行
      const result = validateCreateQuestionListInput(input);

      // Then: バリデーション失敗
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('質問リストのタイトルを入力してください');
    });

    it('有効なタイトルの入力を渡した時、バリデーションが成功する', () => {
      // Given: 有効なタイトルの入力
      const input: CreateQuestionListInput = {
        title: '保育園見学質問リスト',
      };

      // When: バリデーションを実行
      const result = validateCreateQuestionListInput(input);

      // Then: バリデーション成功
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('オプション項目のケース', () => {
    it('保育園名が101文字の入力を渡した時、バリデーションエラーが返される', () => {
      // Given: 保育園名が101文字の入力
      const input: CreateQuestionListInput = {
        title: '保育園見学質問リスト',
        nurseryName: 'あ'.repeat(101),
      };

      // When: バリデーションを実行
      const result = validateCreateQuestionListInput(input);

      // Then: バリデーション失敗
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        '保育園名は100文字以内で入力してください'
      );
    });

    it('過去の見学日の入力を渡した時、バリデーションエラーが返される', () => {
      // Given: 過去の見学日の入力
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const input: CreateQuestionListInput = {
        title: '保育園見学質問リスト',
        visitDate: yesterday,
      };

      // When: バリデーションを実行
      const result = validateCreateQuestionListInput(input);

      // Then: バリデーション失敗
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        '見学日は今日以降の日付を選択してください'
      );
    });

    it('全ての項目が有効な入力を渡した時、バリデーションが成功する', () => {
      // Given: 全ての項目が有効な入力
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const input: CreateQuestionListInput = {
        title: '保育園見学質問リスト',
        nurseryName: 'さくら保育園',
        visitDate: tomorrow,
        isTemplate: false,
      };

      // When: バリデーションを実行
      const result = validateCreateQuestionListInput(input);

      // Then: バリデーション成功
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });
});

describe('validateUpdateQuestionListInput', () => {
  describe('タイトル更新のケース', () => {
    it('空のタイトルで更新しようとした時、バリデーションエラーが返される', () => {
      // Given: 空のタイトルで更新
      const input: UpdateQuestionListInput = {
        title: '',
      };

      // When: バリデーションを実行
      const result = validateUpdateQuestionListInput(input);

      // Then: バリデーション失敗
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('質問リストのタイトルを入力してください');
    });

    it('有効なタイトルで更新する時、バリデーションが成功する', () => {
      // Given: 有効なタイトルで更新
      const input: UpdateQuestionListInput = {
        title: '更新されたタイトル',
      };

      // When: バリデーションを実行
      const result = validateUpdateQuestionListInput(input);

      // Then: バリデーション成功
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('複合更新のケース', () => {
    it('複数の項目を同時に更新する時、全てのバリデーションが適用される', () => {
      // Given: 複数項目の更新（一部エラー含む）
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const input: UpdateQuestionListInput = {
        title: '', // エラー
        nurseryName: 'あ'.repeat(101), // エラー
        visitDate: yesterday, // エラー
      };

      // When: バリデーションを実行
      const result = validateUpdateQuestionListInput(input);

      // Then: 全てのエラーが含まれる
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('質問リストのタイトルを入力してください');
      expect(result.errors).toContain(
        '保育園名は100文字以内で入力してください'
      );
      expect(result.errors).toContain(
        '見学日は今日以降の日付を選択してください'
      );
    });
  });
});

describe('validateQuestion', () => {
  const createValidQuestion = (): Question =>
    createQuestionMock({
      id: 'test-id',
      text: '開園時間はいつですか？',
      isAnswered: false,
    });

  describe('必須項目のケース', () => {
    it('テキストが空の質問を渡した時、バリデーションエラーが返される', () => {
      // Given: テキストが空の質問
      const question: Question = {
        ...createValidQuestion(),
        text: '',
      };

      // When: バリデーションを実行
      const result = validateQuestion(question);

      // Then: バリデーション失敗
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('質問内容を入力してください');
    });
  });

  describe('回答のケース', () => {
    it('1001文字の回答を持つ質問を渡した時、バリデーションエラーが返される', () => {
      // Given: 1001文字の回答を持つ質問
      const question: Question = {
        ...createValidQuestion(),
        answer: 'あ'.repeat(1001),
      };

      // When: バリデーションを実行
      const result = validateQuestion(question);

      // Then: バリデーション失敗
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('回答は1000文字以内で入力してください');
    });

    it('空文字の回答を持つ質問を渡した時、バリデーションが成功する', () => {
      // Given: 空文字の回答を持つ質問（空文字はスキップされる）
      const question: Question = {
        ...createValidQuestion(),
        answer: '',
      };

      // When: バリデーションを実行
      const result = validateQuestion(question);

      // Then: バリデーション成功
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('有効な質問のケース', () => {
    it('全ての項目が有効な質問を渡した時、バリデーションが成功する', () => {
      // Given: 全ての項目が有効な質問
      const question: Question = {
        ...createValidQuestion(),
        answer: '開園時間は午前7時から午後7時までです。',
      };

      // When: バリデーションを実行
      const result = validateQuestion(question);

      // Then: バリデーション成功
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });
});

describe('validateQuestionList', () => {
  const createValidQuestionList = (): QuestionList => ({
    id: 'test-id',
    title: '保育園見学質問リスト',
    questions: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    isTemplate: false,
  });

  const createValidQuestion = (id: string, index: number): Question =>
    createQuestionMock({
      id,
      text: `質問${index}`,
      isAnswered: false,
    });

  describe('基本項目のケース', () => {
    it('タイトルが空の質問リストを渡した時、バリデーションエラーが返される', () => {
      // Given: タイトルが空の質問リスト
      const questionList: QuestionList = {
        ...createValidQuestionList(),
        title: '',
      };

      // When: バリデーションを実行
      const result = validateQuestionList(questionList);

      // Then: バリデーション失敗
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('質問リストのタイトルを入力してください');
    });

    it('101文字の保育園名を持つ質問リストを渡した時、バリデーションエラーが返される', () => {
      // Given: 101文字の保育園名を持つ質問リスト
      const questionList: QuestionList = {
        ...createValidQuestionList(),
        nurseryName: 'あ'.repeat(101),
      };

      // When: バリデーションを実行
      const result = validateQuestionList(questionList);

      // Then: バリデーション失敗
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        '保育園名は100文字以内で入力してください'
      );
    });

    it('過去の見学日を持つ質問リストを渡した時、バリデーションエラーが返される', () => {
      // Given: 過去の見学日を持つ質問リスト
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const questionList: QuestionList = {
        ...createValidQuestionList(),
        visitDate: yesterday,
      };

      // When: バリデーションを実行
      const result = validateQuestionList(questionList);

      // Then: バリデーション失敗
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        '見学日は今日以降の日付を選択してください'
      );
    });
  });

  describe('質問配列のケース', () => {
    it('無効な質問を含む質問リストを渡した時、バリデーションエラーが返される', () => {
      // Given: 無効な質問を含む質問リスト
      const invalidQuestion = createQuestionMock({
        id: 'invalid-id',
        text: '', // エラー
        isAnswered: false,
      });
      const questionList: QuestionList = {
        ...createValidQuestionList(),
        questions: [invalidQuestion],
      };

      // When: バリデーションを実行
      const result = validateQuestionList(questionList);

      // Then: バリデーション失敗
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('質問1: 質問内容を入力してください');
    });

    it('有効な質問のみを含む質問リストを渡した時、バリデーションが成功する', () => {
      // Given: 有効な質問のみを含む質問リスト
      const question1 = createValidQuestion('id1', 0);
      const question2 = createValidQuestion('id2', 1);
      const questionList: QuestionList = {
        ...createValidQuestionList(),
        questions: [question1, question2],
      };

      // When: バリデーションを実行
      const result = validateQuestionList(questionList);

      // Then: バリデーション成功
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('複合エラーのケース', () => {
    it('複数のエラーを含む質問リストを渡した時、全てのエラーが返される', () => {
      // Given: 複数のエラーを含む質問リスト
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const invalidQuestion = createQuestionMock({
        id: 'invalid-id',
        text: '', // エラー
        isAnswered: false,
      });
      const questionList: QuestionList = {
        ...createValidQuestionList(),
        title: '', // エラー
        nurseryName: 'あ'.repeat(101), // エラー
        visitDate: yesterday, // エラー
        questions: [invalidQuestion],
      };

      // When: バリデーションを実行
      const result = validateQuestionList(questionList);

      // Then: 全てのエラーが含まれる
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('質問リストのタイトルを入力してください');
      expect(result.errors).toContain(
        '保育園名は100文字以内で入力してください'
      );
      expect(result.errors).toContain(
        '見学日は今日以降の日付を選択してください'
      );
      expect(result.errors).toContain('質問1: 質問内容を入力してください');
    });
  });

  describe('有効な質問リストのケース', () => {
    it('全ての項目が有効な質問リストを渡した時、バリデーションが成功する', () => {
      // Given: 全ての項目が有効な質問リスト
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const question1 = createValidQuestion('id1', 0);
      const question2 = createValidQuestion('id2', 1);
      const questionList: QuestionList = {
        ...createValidQuestionList(),
        nurseryName: 'さくら保育園',
        visitDate: tomorrow,
        questions: [question1, question2],
      };

      // When: バリデーションを実行
      const result = validateQuestionList(questionList);

      // Then: バリデーション成功
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });
});

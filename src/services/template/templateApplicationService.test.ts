import { describe, test, expect } from 'vitest';
import {
  applyTemplateQuestions,
  applyTemplateToNursery,
  applyTemplateById,
} from './templateApplicationService';
import type { Template, Nursery, Question } from '../../types/entities';

describe('templateApplicationService', () => {
  // テスト用ファクトリー関数
  const createTestTemplate = (overrides = {}): Template => ({
    id: 'template-1',
    name: 'テンプレート1',
    questions: ['テンプレート質問1', 'テンプレート質問2'],
    isSystem: true,
    createdAt: new Date('2025-08-30T09:00:00.000Z'),
    updatedAt: new Date('2025-08-30T09:00:00.000Z'),
    ...overrides,
  });

  const createTestQuestion = (overrides = {}): Question => ({
    id: 'existing-question-1',
    text: '既存の質問',
    isAnswered: true,
    createdAt: new Date('2025-08-30T08:00:00.000Z'),
    updatedAt: new Date('2025-08-30T08:30:00.000Z'),
    ...overrides,
  });

  const createTestNursery = (overrides = {}): Nursery => ({
    id: 'nursery-1',
    name: 'テスト保育園',
    visitSessions: [
      {
        id: 'session-1',
        visitDate: new Date('2025-09-01'),
        status: 'planned',
        questions: [createTestQuestion()],
        insights: [],
        createdAt: new Date('2025-08-30T07:00:00.000Z'),
        updatedAt: new Date('2025-08-30T07:30:00.000Z'),
      },
    ],
    createdAt: new Date('2025-08-30T06:00:00.000Z'),
    updatedAt: new Date('2025-08-30T06:30:00.000Z'),
    ...overrides,
  });

  describe('テンプレート質問の適用', () => {
    test('テンプレートから質問リストを作成する', () => {
      // Given: 2つの質問を持つテンプレート
      const template = createTestTemplate();
      const existingQuestions: Question[] = [];

      // When: テンプレート質問を適用
      const result = applyTemplateQuestions(template, existingQuestions);

      // Then: テンプレートの質問が新しい質問として作成される
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(
        expect.objectContaining({
          text: 'テンプレート質問1',
          isAnswered: false,
          id: expect.any(String),
        })
      );
      expect(result[1]).toEqual(
        expect.objectContaining({
          text: 'テンプレート質問2',
          isAnswered: false,
          id: expect.any(String),
        })
      );
    });

    test('既存質問を保持しながらテンプレート質問を追加する', () => {
      // Given: 既存質問1つとテンプレート質問2つ
      const template = createTestTemplate();
      const existingQuestion = createTestQuestion({ text: '既存の質問' });
      const existingQuestions = [existingQuestion];

      // When: テンプレート質問を追加
      const result = applyTemplateQuestions(template, existingQuestions);

      // Then: 既存質問＋テンプレート質問の計3つになる
      expect(result).toHaveLength(3);
      expect(result[0]).toEqual(existingQuestion);
      expect(result[1].text).toBe('テンプレート質問1');
      expect(result[2].text).toBe('テンプレート質問2');
    });

    test('空のテンプレートでは既存質問のみ返される', () => {
      // Given: 質問が空のテンプレート
      const emptyTemplate = createTestTemplate({ questions: [] });
      const existingQuestion = createTestQuestion();
      const existingQuestions = [existingQuestion];

      // When: 空テンプレートを適用
      const result = applyTemplateQuestions(emptyTemplate, existingQuestions);

      // Then: 既存質問のみが返される
      expect(result).toEqual(existingQuestions);
    });

    test('大量の質問でも適切に処理される', () => {
      // Given: 10個の質問を持つテンプレート
      const manyQuestions = Array.from(
        { length: 10 },
        (_, i) => `質問${i + 1}`
      );
      const template = createTestTemplate({ questions: manyQuestions });

      // When: 大量の質問を適用
      const result = applyTemplateQuestions(template, []);

      // Then: すべての質問が適切に作成される
      expect(result).toHaveLength(10);
      result.forEach((question, index) => {
        expect(question.text).toBe(`質問${index + 1}`);
        expect(question.isAnswered).toBe(false);
      });
    });
  });

  describe('保育園へのテンプレート適用', () => {
    test('最初の見学セッションにテンプレート質問が追加される', () => {
      // Given: 1つの質問を持つ見学セッションがある保育園
      const template = createTestTemplate();
      const nursery = createTestNursery();

      // When: テンプレートを適用
      const result = applyTemplateToNursery(template, nursery);

      // Then: 最初の見学セッションの質問が追加される（既存1＋テンプレート2）
      expect(result.visitSessions[0].questions).toHaveLength(3);
      expect(result.visitSessions[0].questions[1].text).toBe(
        'テンプレート質問1'
      );
      expect(result.visitSessions[0].questions[2].text).toBe(
        'テンプレート質問2'
      );
    });

    test('複数の見学セッションがある場合は最初のセッションのみ更新される', () => {
      // Given: 複数の見学セッションを持つ保育園
      const template = createTestTemplate();
      const nursery = createTestNursery({
        visitSessions: [
          {
            id: 'session-1',
            visitDate: new Date('2025-09-01'),
            status: 'planned',
            questions: [createTestQuestion()],
            insights: [],
            createdAt: new Date('2025-08-30T07:00:00.000Z'),
            updatedAt: new Date('2025-08-30T07:30:00.000Z'),
          },
          {
            id: 'session-2',
            visitDate: new Date('2025-09-15'),
            status: 'planned',
            questions: [],
            insights: [],
            createdAt: new Date('2025-08-30T07:00:00.000Z'),
            updatedAt: new Date('2025-08-30T07:30:00.000Z'),
          },
        ],
      });
      const originalSecondSession = nursery.visitSessions[1];

      // When: テンプレートを適用
      const result = applyTemplateToNursery(template, nursery);

      // Then: 最初のセッションのみ更新、2番目は変更なし
      expect(result.visitSessions[0].questions).toHaveLength(3);
      expect(result.visitSessions[1]).toEqual(originalSecondSession);
    });

    test('見学セッションが存在しない場合はエラーが発生する', () => {
      // Given: 見学セッションが空の保育園
      const template = createTestTemplate();
      const nursery = createTestNursery({ visitSessions: [] });

      // When & Then: エラーが発生する
      expect(() => {
        applyTemplateToNursery(template, nursery);
      }).toThrow('見学セッションが存在しません');
    });

    test('元の保育園オブジェクトは変更されない', () => {
      // Given: 保育園オブジェクト
      const template = createTestTemplate();
      const nursery = createTestNursery();
      const originalQuestionsCount = nursery.visitSessions[0].questions.length;

      // When: テンプレートを適用
      const result = applyTemplateToNursery(template, nursery);

      // Then: 元のオブジェクトは変更されない
      expect(nursery.visitSessions[0].questions).toHaveLength(
        originalQuestionsCount
      );
      expect(result).not.toBe(nursery);
    });

    test('更新日時が適切に設定される', () => {
      // Given: テンプレートと保育園
      const template = createTestTemplate();
      const nursery = createTestNursery();
      const originalNurseryUpdatedAt = nursery.updatedAt;
      const originalSessionUpdatedAt = nursery.visitSessions[0].updatedAt;

      // When: テンプレートを適用
      const result = applyTemplateToNursery(template, nursery);

      // Then: 更新日時が新しく設定される
      expect(result.updatedAt).not.toEqual(originalNurseryUpdatedAt);
      expect(result.visitSessions[0].updatedAt).not.toEqual(
        originalSessionUpdatedAt
      );
    });
  });

  describe('IDによるテンプレート適用', () => {
    test('指定されたIDのテンプレートを適用する', () => {
      // Given: 複数のテンプレートと保育園
      const templates = [
        createTestTemplate({ id: 'template-1', name: 'テンプレート1' }),
        createTestTemplate({
          id: 'template-2',
          name: 'テンプレート2',
          questions: ['別の質問'],
        }),
      ];
      const nursery = createTestNursery();

      // When: 特定のIDでテンプレートを適用
      const result = applyTemplateById('template-1', nursery, templates);

      // Then: 指定されたテンプレートが適用される
      const firstSession = result.visitSessions[0];
      expect(firstSession.questions).toHaveLength(3); // 既存1 + テンプレート2
      expect(firstSession.questions[1].text).toBe('テンプレート質問1');
      expect(firstSession.questions[2].text).toBe('テンプレート質問2');
    });

    test('異なるIDのテンプレートを適用する', () => {
      // Given: 複数のテンプレート
      const templates = [
        createTestTemplate({ id: 'template-1' }),
        createTestTemplate({
          id: 'template-2',
          questions: ['特別な質問A', '特別な質問B', '特別な質問C'],
        }),
      ];
      const nursery = createTestNursery();

      // When: template-2を適用
      const result = applyTemplateById('template-2', nursery, templates);

      // Then: template-2の質問が適用される
      const firstSession = result.visitSessions[0];
      expect(firstSession.questions).toHaveLength(4); // 既存1 + テンプレート3
      expect(firstSession.questions[1].text).toBe('特別な質問A');
      expect(firstSession.questions[3].text).toBe('特別な質問C');
    });

    test('存在しないIDの場合はエラーが発生する', () => {
      // Given: テンプレート一覧
      const templates = [createTestTemplate({ id: 'existing-template' })];
      const nursery = createTestNursery();

      // When & Then: 存在しないIDを指定するとエラー
      expect(() => {
        applyTemplateById('non-existent-id', nursery, templates);
      }).toThrow('テンプレート（ID: non-existent-id）が見つかりません');
    });

    test('空のテンプレートリストでもエラーが適切に発生する', () => {
      // Given: 空のテンプレートリスト
      const emptyTemplates: Template[] = [];
      const nursery = createTestNursery();

      // When & Then: 空のリストでもエラーが発生
      expect(() => {
        applyTemplateById('any-id', nursery, emptyTemplates);
      }).toThrow('テンプレート（ID: any-id）が見つかりません');
    });
  });
});

import { describe, test, expect } from 'vitest';
import {
  applyTemplateToNursery,
  applyTemplateQuestions,
} from './templateService';
import type { Nursery, Question, QuestionTemplate } from '../types/entities';

describe('templateService', () => {
  const mockTemplate: QuestionTemplate = {
    id: 'test-template',
    title: 'テストテンプレート',
    description: 'テスト用のテンプレート',
    isCustom: false,
    questions: [
      { text: '質問1', order: 0 },
      { text: '質問2', order: 1 },
      { text: '質問3', order: 2 },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockNursery: Nursery = {
    id: 'nursery-1',
    name: 'テスト保育園',
    visitSessions: [
      {
        id: 'session-1',
        visitDate: new Date('2025-02-15'),
        status: 'planned',
        questions: [
          {
            id: 'q-existing-1',
            text: '既存の質問',
            isAnswered: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        insights: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe('applyTemplateQuestions', () => {
    test('テンプレートの質問を既存の質問リストに追加できる', () => {
      const existingQuestions: Question[] = [
        {
          id: 'q1',
          text: '既存の質問',
          isAnswered: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const result = applyTemplateQuestions(mockTemplate, existingQuestions);

      // 既存の質問 + テンプレートの質問数
      expect(result.length).toBe(4);

      // 既存の質問が最初に来る
      expect(result[0].text).toBe('既存の質問');

      // テンプレートの質問が追加される
      expect(result[1].text).toBe('質問1');
      expect(result[2].text).toBe('質問2');
      expect(result[3].text).toBe('質問3');
    });

    test('既存の質問がある場合でも全てのテンプレート質問が追加される', () => {
      const existingQuestions: Question[] = [
        {
          id: 'q1',
          text: '【既存】ユーザーが作成した質問',
          isAnswered: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'q2',
          text: '質問1', // テンプレートと同じテキストでも追加される
          isAnswered: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const result = applyTemplateQuestions(mockTemplate, existingQuestions);

      // 既存の質問2個 + テンプレートの質問3個 = 5個
      expect(result.length).toBe(5);
      expect(result[0].text).toBe('【既存】ユーザーが作成した質問');
      expect(result[1].text).toBe('質問1'); // 既存の質問1
      expect(result[2].text).toBe('質問1'); // テンプレートの質問1
      expect(result[3].text).toBe('質問2'); // テンプレートの質問2
      expect(result[4].text).toBe('質問3'); // テンプレートの質問3
    });

    test('空の質問リストにテンプレートを適用できる', () => {
      const result = applyTemplateQuestions(mockTemplate, []);

      expect(result.length).toBe(3);
      expect(result[0].text).toBe('質問1');
      expect(result[1].text).toBe('質問2');
      expect(result[2].text).toBe('質問3');
    });

    test('追加された質問には新しいIDが生成される', () => {
      const result = applyTemplateQuestions(mockTemplate, []);

      result.forEach((question) => {
        expect(question.id).toBeDefined();
        expect(question.id).not.toBe('');
        expect(question.id).toMatch(/^[a-z0-9-]+$/);
      });

      // 各質問のIDが一意であることを確認
      const ids = result.map((q) => q.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    test('追加された質問は未回答状態で作成される', () => {
      const result = applyTemplateQuestions(mockTemplate, []);

      result.forEach((question) => {
        expect(question.isAnswered).toBe(false);
        expect(question.answer).toBeUndefined();
        expect(question.answeredBy).toBeUndefined();
        expect(question.answeredAt).toBeUndefined();
      });
    });
  });

  describe('applyTemplateToNursery', () => {
    test('保育園の最初の見学セッションにテンプレートを適用できる', () => {
      const result = applyTemplateToNursery(mockTemplate, mockNursery);

      expect(result.visitSessions[0].questions.length).toBe(4);
      expect(result.visitSessions[0].questions[0].text).toBe('既存の質問');
      expect(result.visitSessions[0].questions[1].text).toBe('質問1');
    });

    test('見学セッションがない場合はエラーを投げる', () => {
      const nurseryWithoutSession: Nursery = {
        ...mockNursery,
        visitSessions: [],
      };

      expect(() => {
        applyTemplateToNursery(mockTemplate, nurseryWithoutSession);
      }).toThrow('見学セッションが存在しません');
    });

    test('保育園オブジェクトの他のプロパティは変更されない', () => {
      const result = applyTemplateToNursery(mockTemplate, mockNursery);

      expect(result.id).toBe(mockNursery.id);
      expect(result.name).toBe(mockNursery.name);
      expect(result.visitSessions[0].id).toBe(mockNursery.visitSessions[0].id);
      expect(result.visitSessions[0].visitDate).toEqual(
        mockNursery.visitSessions[0].visitDate
      );
      expect(result.visitSessions[0].status).toBe(
        mockNursery.visitSessions[0].status
      );
    });

    test('更新日時が更新される', () => {
      const before = new Date();
      const result = applyTemplateToNursery(mockTemplate, mockNursery);
      const after = new Date();

      expect(result.updatedAt.getTime()).toBeGreaterThanOrEqual(
        before.getTime()
      );
      expect(result.updatedAt.getTime()).toBeLessThanOrEqual(after.getTime());
      expect(
        result.visitSessions[0].updatedAt.getTime()
      ).toBeGreaterThanOrEqual(before.getTime());
      expect(result.visitSessions[0].updatedAt.getTime()).toBeLessThanOrEqual(
        after.getTime()
      );
    });
  });
});

import { describe, test, expect } from 'vitest';
import {
  getSystemTemplates,
  getCustomTemplates,
  saveCustomTemplate,
  applyTemplateQuestions,
  applyTemplateToNursery,
  applyTemplateById,
} from './templateService';
import type { Nursery, Question, Template } from '../../types/entities';

describe('templateService', () => {
  const mockTemplate: Template = {
    id: 'test-template',
    name: 'テストテンプレート',
    questions: ['質問1', '質問2', '質問3'],
    isSystem: false,
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

  describe('getSystemTemplates', () => {
    test('システムテンプレートを取得できる', () => {
      const result = getSystemTemplates();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      result.forEach((template) => {
        expect(template).toHaveProperty('id');
        expect(template).toHaveProperty('name');
        expect(template).toHaveProperty('questions');
        expect(template.isSystem).toBe(true);
      });
    });
  });

  describe('getCustomTemplates', () => {
    test('空の配列を返す（将来実装予定）', () => {
      const result = getCustomTemplates();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });
  });

  describe('saveCustomTemplate', () => {
    test('テンプレートを保存する（現在はconsole.log）', () => {
      const templateToSave = {
        name: 'テスト用テンプレート',
        questions: ['カスタム質問1', 'カスタム質問2'],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // エラーが発生しないことを確認
      expect(() => saveCustomTemplate(templateToSave)).not.toThrow();
    });
  });

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
        expect(typeof question.id).toBe('string');
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

  describe('applyTemplateById', () => {
    const templates = [mockTemplate];

    test('IDでテンプレートを検索して保育園に適用できる', () => {
      const result = applyTemplateById('test-template', mockNursery, templates);

      expect(result.visitSessions[0].questions.length).toBe(4);
      expect(result.visitSessions[0].questions[1].text).toBe('質問1');
    });

    test('存在しないIDの場合はエラーを投げる', () => {
      expect(() => {
        applyTemplateById('non-existent', mockNursery, templates);
      }).toThrow('テンプレート（ID: non-existent）が見つかりません');
    });
  });
});

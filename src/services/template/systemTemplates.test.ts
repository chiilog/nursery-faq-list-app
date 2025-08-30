import { describe, test, expect } from 'vitest';
import { getDefaultTemplate } from './systemTemplates';

describe('systemTemplates', () => {
  describe('getDefaultTemplate', () => {
    test('デフォルトテンプレートが取得できる', () => {
      const templates = getDefaultTemplate();

      // 基本的な構造の確認
      expect(templates).toBeDefined();
      expect(Array.isArray(templates)).toBe(true);
      expect(templates.length).toBe(1);

      const template = templates[0];
      expect(template.id).toBe('hokatsu-techo-recommend');
      expect(template.name).toBe('保活手帳おすすめセット');
      expect(template.isSystem).toBe(true);
    });

    test('デフォルトテンプレートに必要な質問が含まれている', () => {
      const templates = getDefaultTemplate();
      const template = templates[0];

      // 質問が存在することを確認
      expect(template.questions).toBeDefined();
      expect(Array.isArray(template.questions)).toBe(true);
      expect(template.questions.length).toBeGreaterThan(0);

      // 各質問の構造を確認
      template.questions.forEach((question) => {
        expect(question).toBeDefined();
        expect(typeof question).toBe('string');
        expect(question.length).toBeGreaterThan(0);
      });
    });

    test('デフォルトテンプレートに重要な質問カテゴリが含まれている', () => {
      const templates = getDefaultTemplate();
      const template = templates[0];
      const questionTexts = template.questions;

      // 保育方針に関する質問
      expect(
        questionTexts.some(
          (text: string) =>
            text.includes('保育方針') || text.includes('教育理念')
        )
      ).toBe(true);

      // 給食に関する質問
      expect(
        questionTexts.some(
          (text: string) => text.includes('給食') || text.includes('食事')
        )
      ).toBe(true);

      // アレルギーに関する質問
      expect(
        questionTexts.some((text: string) => text.includes('アレルギー'))
      ).toBe(true);

      // 安全・セキュリティに関する質問
      expect(
        questionTexts.some(
          (text: string) =>
            text.includes('安全') || text.includes('セキュリティ')
        )
      ).toBe(true);

      // 持ち物に関する質問
      expect(
        questionTexts.some(
          (text: string) => text.includes('持ち物') || text.includes('準備')
        )
      ).toBe(true);

      // 費用に関する質問
      expect(
        questionTexts.some(
          (text: string) => text.includes('費用') || text.includes('料金')
        )
      ).toBe(true);
    });

    test('質問配列が適切に設定されている', () => {
      const templates = getDefaultTemplate();
      const template = templates[0];

      expect(Array.isArray(template.questions)).toBe(true);
      expect(template.questions.length).toBeGreaterThan(0);
    });

    test('日付フィールドが適切に設定されている', () => {
      const templates = getDefaultTemplate();
      const template = templates[0];

      expect(typeof template.createdAt).toBe('string');
      expect(typeof template.updatedAt).toBe('string');
      expect(template.createdAt).toEqual(template.updatedAt);
    });
  });
});

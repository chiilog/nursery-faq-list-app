import { describe, test, expect } from 'vitest';
import { getDefaultTemplate } from './systemTemplates';

describe('systemTemplates', () => {
  describe('getDefaultTemplate', () => {
    test('デフォルトテンプレートが取得できる', () => {
      const template = getDefaultTemplate();

      // 基本的な構造の確認
      expect(template).toBeDefined();
      expect(template.id).toBe('hokatsu-techo-recommend');
      expect(template.title).toBe('保活手帳おすすめセット');
      expect(template.isCustom).toBe(false);
      expect(template.createdBy).toBeUndefined();
    });

    test('デフォルトテンプレートに必要な質問が含まれている', () => {
      const template = getDefaultTemplate();

      // 質問が存在することを確認
      expect(template.questions).toBeDefined();
      expect(Array.isArray(template.questions)).toBe(true);
      expect(template.questions.length).toBeGreaterThan(0);

      // 各質問の構造を確認
      template.questions.forEach((question, index) => {
        expect(question.text).toBeDefined();
        expect(typeof question.text).toBe('string');
        expect(question.text.length).toBeGreaterThan(0);
        expect(question.order).toBe(index);
      });
    });

    test('デフォルトテンプレートに重要な質問カテゴリが含まれている', () => {
      const template = getDefaultTemplate();
      const questionTexts = template.questions.map((q) => q.text);

      // 保育方針に関する質問
      expect(
        questionTexts.some(
          (text) => text.includes('保育方針') || text.includes('教育理念')
        )
      ).toBe(true);

      // 給食に関する質問
      expect(
        questionTexts.some(
          (text) => text.includes('給食') || text.includes('食事')
        )
      ).toBe(true);

      // アレルギーに関する質問
      expect(questionTexts.some((text) => text.includes('アレルギー'))).toBe(
        true
      );

      // 安全・セキュリティに関する質問
      expect(
        questionTexts.some(
          (text) => text.includes('安全') || text.includes('セキュリティ')
        )
      ).toBe(true);

      // 持ち物に関する質問
      expect(
        questionTexts.some(
          (text) => text.includes('持ち物') || text.includes('準備')
        )
      ).toBe(true);

      // 費用に関する質問
      expect(
        questionTexts.some(
          (text) => text.includes('費用') || text.includes('料金')
        )
      ).toBe(true);
    });

    test('質問が適切な順序で並んでいる', () => {
      const template = getDefaultTemplate();

      template.questions.forEach((question, index) => {
        expect(question.order).toBe(index);
      });
    });

    test('日付フィールドが適切に設定されている', () => {
      const template = getDefaultTemplate();

      expect(template.createdAt).toBeInstanceOf(Date);
      expect(template.updatedAt).toBeInstanceOf(Date);
      expect(template.createdAt.getTime()).toBeLessThanOrEqual(
        template.updatedAt.getTime()
      );
    });
  });
});

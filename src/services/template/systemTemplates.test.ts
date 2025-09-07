import { describe, test, expect } from 'vitest';
import {
  getDefaultTemplate,
  validateSystemQuestionsData,
} from './systemTemplates';

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

      expect(template.createdAt).toBeInstanceOf(Date);
      expect(template.updatedAt).toBeInstanceOf(Date);
      expect(template.createdAt).toEqual(template.updatedAt);
    });
  });

  // バリデーション関数のテスト
  describe('validateSystemQuestionsData', () => {
    describe('正常系', () => {
      test('有効なデータが正しくバリデーションされる', () => {
        const validData = {
          defaultTemplate: {
            id: 'test-template',
            name: 'テストテンプレート',
            questions: ['質問1', '質問2'],
          },
        };

        const result = validateSystemQuestionsData(validData);

        expect(result).toEqual(validData);
        expect(result.defaultTemplate.id).toBe('test-template');
        expect(result.defaultTemplate.name).toBe('テストテンプレート');
        expect(result.defaultTemplate.questions).toEqual(['質問1', '質問2']);
      });

      test('空の質問配列でもバリデーションが通る', () => {
        const validDataWithEmptyQuestions = {
          defaultTemplate: {
            id: 'empty-template',
            name: '空のテンプレート',
            questions: [],
          },
        };

        expect(() => {
          validateSystemQuestionsData(validDataWithEmptyQuestions);
        }).not.toThrow();

        const result = validateSystemQuestionsData(validDataWithEmptyQuestions);
        expect(result.defaultTemplate.questions).toEqual([]);
      });
    });

    describe('異常系テスト', () => {
      test('null値でバリデーションエラー', () => {
        expect(() => {
          validateSystemQuestionsData(null);
        }).toThrow('Invalid system questions data: not an object');
      });

      test('undefined値でバリデーションエラー', () => {
        expect(() => {
          validateSystemQuestionsData(undefined);
        }).toThrow('Invalid system questions data: not an object');
      });

      test('プリミティブ値でバリデーションエラー', () => {
        expect(() => {
          validateSystemQuestionsData('invalid string');
        }).toThrow('Invalid system questions data: not an object');

        expect(() => {
          validateSystemQuestionsData(123);
        }).toThrow('Invalid system questions data: not an object');

        expect(() => {
          validateSystemQuestionsData(true);
        }).toThrow('Invalid system questions data: not an object');
      });

      test('空のオブジェクトでバリデーションエラー', () => {
        expect(() => {
          validateSystemQuestionsData({});
        }).toThrow('Invalid system questions data: missing defaultTemplate');
      });

      test('defaultTemplateがnullの場合のバリデーションエラー', () => {
        expect(() => {
          validateSystemQuestionsData({ defaultTemplate: null });
        }).toThrow('Invalid system questions data: missing defaultTemplate');
      });

      test('defaultTemplateが不正な型の場合のバリデーションエラー', () => {
        expect(() => {
          validateSystemQuestionsData({ defaultTemplate: 'invalid' });
        }).toThrow('Invalid system questions data: missing defaultTemplate');

        expect(() => {
          validateSystemQuestionsData({ defaultTemplate: 123 });
        }).toThrow('Invalid system questions data: missing defaultTemplate');
      });

      test('テンプレート構造が不正な場合のバリデーションエラー', () => {
        // idが不正な型
        expect(() => {
          validateSystemQuestionsData({
            defaultTemplate: {
              id: 123,
              name: 'テスト',
              questions: ['質問1'],
            },
          });
        }).toThrow('Invalid system questions data: invalid template structure');

        // nameが不正な型
        expect(() => {
          validateSystemQuestionsData({
            defaultTemplate: {
              id: 'test',
              name: null,
              questions: ['質問1'],
            },
          });
        }).toThrow('Invalid system questions data: invalid template structure');

        // questionsが配列でない
        expect(() => {
          validateSystemQuestionsData({
            defaultTemplate: {
              id: 'test',
              name: 'テスト',
              questions: 'invalid',
            },
          });
        }).toThrow('Invalid system questions data: invalid template structure');

        // questionsが文字列以外を含む
        expect(() => {
          validateSystemQuestionsData({
            defaultTemplate: {
              id: 'test',
              name: 'テスト',
              questions: ['valid', 123, 'also valid'],
            },
          });
        }).toThrow('Invalid system questions data: invalid template structure');
      });

      test('必須フィールドが欠けている場合のバリデーションエラー', () => {
        // idが欠如
        expect(() => {
          validateSystemQuestionsData({
            defaultTemplate: {
              name: 'テスト',
              questions: ['質問1'],
            },
          });
        }).toThrow('Invalid system questions data: invalid template structure');

        // nameが欠如
        expect(() => {
          validateSystemQuestionsData({
            defaultTemplate: {
              id: 'test',
              questions: ['質問1'],
            },
          });
        }).toThrow('Invalid system questions data: invalid template structure');

        // questionsが欠如
        expect(() => {
          validateSystemQuestionsData({
            defaultTemplate: {
              id: 'test',
              name: 'テスト',
            },
          });
        }).toThrow('Invalid system questions data: invalid template structure');
      });
    });

    describe('境界値テスト', () => {
      test('非常に長い文字列でもバリデーションが通る', () => {
        const longString = 'a'.repeat(10000);
        const dataWithLongStrings = {
          defaultTemplate: {
            id: longString,
            name: longString,
            questions: [longString],
          },
        };

        expect(() => {
          validateSystemQuestionsData(dataWithLongStrings);
        }).not.toThrow();
      });

      test('大量の質問配列でもバリデーションが通る', () => {
        const manyQuestions = Array.from(
          { length: 1000 },
          (_, i) => `質問${i}`
        );
        const dataWithManyQuestions = {
          defaultTemplate: {
            id: 'test',
            name: 'テスト',
            questions: manyQuestions,
          },
        };

        expect(() => {
          validateSystemQuestionsData(dataWithManyQuestions);
        }).not.toThrow();

        const result = validateSystemQuestionsData(dataWithManyQuestions);
        expect(result.defaultTemplate.questions.length).toBe(1000);
      });

      test('空文字列フィールドでもバリデーションが通る', () => {
        const dataWithEmptyStrings = {
          defaultTemplate: {
            id: '',
            name: '',
            questions: [''],
          },
        };

        expect(() => {
          validateSystemQuestionsData(dataWithEmptyStrings);
        }).not.toThrow();
      });
    });

    describe('型安全性テスト', () => {
      test('追加のプロパティがある場合でも正しく処理される', () => {
        const dataWithExtraProperties = {
          defaultTemplate: {
            id: 'test',
            name: 'テスト',
            questions: ['質問1'],
            extraProperty: 'should be ignored', // 追加のプロパティ
          },
          extraRootProperty: 'also ignored', // ルートレベルの追加プロパティ
        };

        const result = validateSystemQuestionsData(dataWithExtraProperties);

        // 必要なプロパティのみが含まれることを確認
        expect(result).toEqual({
          defaultTemplate: {
            id: 'test',
            name: 'テスト',
            questions: ['質問1'],
          },
        });

        // 追加のプロパティは含まれない
        expect('extraProperty' in result.defaultTemplate).toBe(false);
        expect('extraRootProperty' in result).toBe(false);
      });
    });
  });

  describe('getDefaultTemplate異常系', () => {
    test('バリデーション関数が不正データでエラーを投げることを確認', () => {
      // この場合は実際のJSONファイルに依存するため、
      // バリデーション関数が適切にエラーを投げることの確認として記述
      // 実際の実装では、getDefaultTemplate内でvalidateSystemQuestionsDataが
      // 不正なデータでエラーを投げることを確認
      expect(() => {
        validateSystemQuestionsData(null);
      }).toThrow('Invalid system questions data: not an object');
    });
  });
});

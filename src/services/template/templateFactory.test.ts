import { describe, test, expect } from 'vitest';
import { createTemplate, createCustomTemplate } from './templateFactory';
import type { Template } from '../../types/entities';

describe('templateFactory', () => {
  describe('システムテンプレート作成', () => {
    test('指定されたIDとデータでシステムテンプレートを作成する', () => {
      // Given: システムテンプレートの作成情報
      const id = 'nursery-basic-questions';
      const name = '保育園基本質問セット';
      const questions = ['園の方針は？', '保育時間は？'];

      // When: システムテンプレートを作成
      const result = createTemplate(id, name, questions);

      // Then: システムテンプレートとして作成される
      expect(result).toEqual(
        expect.objectContaining({
          id,
          name,
          questions,
          isSystem: true,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        })
      );
    });

    test('複数の質問を持つテンプレートを作成できる', () => {
      // Given: 多数の質問
      const questions = [
        '保育理念について教えてください',
        '安全対策はどうなっていますか',
        '給食はどのような内容ですか',
        '園庭の広さはどれくらいですか',
        '保護者との連絡方法は？',
      ];

      // When: 複数質問でテンプレートを作成
      const result = createTemplate(
        'detailed-template',
        '詳細テンプレート',
        questions
      );

      // Then: すべての質問が正しく設定される
      expect(result.questions).toEqual(questions);
      expect(result.questions).toHaveLength(5);
    });

    test('空の質問配列でもテンプレートを作成できる', () => {
      // Given: 空の質問配列（将来質問を追加予定の場合など）
      const questions: string[] = [];

      // When: 空の質問でテンプレートを作成
      const result = createTemplate(
        'empty-template',
        '空テンプレート',
        questions
      );

      // Then: 空の質問配列を持つテンプレートが作成される
      expect(result.questions).toEqual([]);
      expect(result.isSystem).toBe(true);
    });

    test('特殊文字を含む質問でもテンプレートを作成できる', () => {
      // Given: 特殊文字を含む質問
      const questions = [
        'アレルギー対応は「完全除去」ですか？',
        '延長保育料金：¥500/時間ですか？',
        '園児数は30人以下ですか？',
      ];

      // When: 特殊文字を含む質問でテンプレートを作成
      const result = createTemplate(
        'special-chars',
        '特殊文字テンプレート',
        questions
      );

      // Then: 特殊文字も正しく保持される
      expect(result.questions).toEqual(questions);
      expect(result.questions[0]).toContain('「完全除去」');
      expect(result.questions[1]).toContain('¥500');
    });
  });

  describe('カスタムテンプレート作成', () => {
    test('ユーザー独自のテンプレートを作成する', () => {
      // Given: ユーザーが定義したテンプレート情報
      const name = '私の保育園チェックリスト';
      const questions = [
        '先生の雰囲気はどうですか',
        '子どもたちは楽しそうですか',
      ];

      // When: カスタムテンプレートを作成
      const result = createCustomTemplate(name, questions);

      // Then: カスタムテンプレートとして作成される
      expect(result).toEqual(
        expect.objectContaining({
          name,
          questions,
          isSystem: false,
          id: expect.any(String),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        })
      );
    });

    test('一意のIDが自動生成される', () => {
      // Given: 同じ名前のテンプレート
      const name = '同じ名前のテンプレート';
      const questions = ['質問1'];

      // When: 複数回作成
      const template1 = createCustomTemplate(name, questions);
      const template2 = createCustomTemplate(name, questions);

      // Then: 異なるIDが生成される
      expect(template1.id).not.toBe(template2.id);
      expect(template1.id).toBeTruthy();
      expect(template2.id).toBeTruthy();
    });

    test('長いテンプレート名でも作成できる', () => {
      // Given: 長いテンプレート名
      const name =
        '保育園見学時に確認すべき詳細項目チェックリスト（安全性・教育方針・設備・保育士の雰囲気・給食・延長保育を含む）';
      const questions = ['テスト質問'];

      // When: 長い名前でテンプレートを作成
      const result = createCustomTemplate(name, questions);

      // Then: 長い名前も正しく設定される
      expect(result.name).toBe(name);
      expect(result.name.length).toBeGreaterThan(50);
    });

    test('大量の質問でもテンプレートを作成できる', () => {
      // Given: 大量の質問（パフォーマンステスト的側面）
      const manyQuestions = Array.from(
        { length: 50 },
        (_, i) => `質問${i + 1}`
      );

      // When: 大量の質問でテンプレートを作成
      const result = createCustomTemplate(
        '大量質問テンプレート',
        manyQuestions
      );

      // Then: すべての質問が正しく設定される
      expect(result.questions).toHaveLength(50);
      expect(result.questions[0]).toBe('質問1');
      expect(result.questions[49]).toBe('質問50');
    });

    test('特別な用途向けの質問でもテンプレートを作成できる', () => {
      // Given: 特別な用途（アレルギー対応重視）の質問
      const questions = [
        'アレルギー児への対応実績はありますか',
        'エピペンの取り扱いは可能ですか',
        '除去食の準備体制はどうなっていますか',
        '緊急時の医療機関との連携は',
      ];

      // When: 特別用途のテンプレートを作成
      const result = createCustomTemplate(
        'アレルギー対応重視テンプレート',
        questions
      );

      // Then: 用途特化の質問が正しく設定される
      expect(result.questions).toEqual(questions);
      expect(result.isSystem).toBe(false);
      expect(result.name).toContain('アレルギー');
    });
  });

  describe('テンプレート種類の違い', () => {
    test('システムテンプレートは管理者が定義し、カスタムテンプレートはユーザーが作成する', () => {
      // Given: 同じ質問内容
      const name = '保育園見学質問';
      const questions = ['保育時間はどうなっていますか'];

      // When: システムとカスタムでそれぞれ作成
      const systemTemplate = createTemplate(
        'official-template',
        name,
        questions
      );
      const customTemplate = createCustomTemplate(name, questions);

      // Then: システム管理の違いが明確
      expect(systemTemplate.isSystem).toBe(true); // 管理者が提供
      expect(customTemplate.isSystem).toBe(false); // ユーザーが作成

      // 質問内容は同じでも出自が異なる
      expect(systemTemplate.questions).toEqual(customTemplate.questions);
    });

    test('IDの管理方法が用途に応じて異なる', () => {
      // Given: テンプレート情報
      const name = 'テストテンプレート';
      const questions = ['テスト質問'];

      // When: システム（ID指定）とカスタム（ID自動生成）で作成
      const systemTemplate = createTemplate(
        'predictable-system-id',
        name,
        questions
      );
      const customTemplate = createCustomTemplate(name, questions);

      // Then: ID管理方法が用途に合っている
      expect(systemTemplate.id).toBe('predictable-system-id'); // 管理者が意図したID
      expect(customTemplate.id).toMatch(/^[0-9a-f-]{36}$/); // UUID形式の自動生成ID
      expect(customTemplate.id).not.toBe(systemTemplate.id);
    });

    test('両方とも有効なテンプレートオブジェクトを作成する', () => {
      // Given: テンプレート情報
      const questions = ['共通質問'];

      // When: それぞれでテンプレート作成
      const systemTemplate = createTemplate('sys-1', 'システム版', questions);
      const customTemplate = createCustomTemplate('ユーザー版', questions);

      // Then: どちらも有効なTemplateオブジェクト
      const validateTemplate = (template: Template) => {
        expect(template.id).toBeTruthy();
        expect(template.name).toBeTruthy();
        expect(template.questions).toBeInstanceOf(Array);
        expect(template.createdAt).toBeTruthy();
        expect(template.updatedAt).toBeTruthy();
        expect(typeof template.isSystem).toBe('boolean');
      };

      validateTemplate(systemTemplate);
      validateTemplate(customTemplate);
    });
  });
});

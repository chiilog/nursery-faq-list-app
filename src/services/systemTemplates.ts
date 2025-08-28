/**
 * @description システム提供テンプレートデータの定義
 * システムが提供する汎用的な保育園見学質問テンプレート
 * 質問データはJSONファイルから読み込み、編集を容易にする
 */

import type { QuestionTemplate } from '../types/entities';
import systemQuestionsData from './systemQuestions.json';

// バリデーション結果をキャッシュ
let validatedData: SystemQuestionsSchema | null = null;
let validationError: Error | null = null;

/**
 * @description システム質問データのスキーマ
 */
interface SystemQuestionsSchema {
  defaultNurseryTemplate: {
    id: string;
    title: string;
    description: string;
    questions: Array<{
      text: string;
      order: number;
    }>;
  };
}

/**
 * @description システム質問データの妥当性を検証する
 * @param data - 検証対象のデータ
 * @returns 妥当な場合true
 */
function validateSystemQuestions(data: unknown): data is SystemQuestionsSchema {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  if (!('defaultNurseryTemplate' in data)) {
    return false;
  }

  const template = (data as Record<string, unknown>).defaultNurseryTemplate;

  if (typeof template !== 'object' || template === null) {
    return false;
  }

  const templateObj = template as Record<string, unknown>;

  // 必須プロパティの検証
  if (
    typeof templateObj.id !== 'string' ||
    typeof templateObj.title !== 'string' ||
    typeof templateObj.description !== 'string'
  ) {
    return false;
  }

  // questions配列の検証
  if (!Array.isArray(templateObj.questions)) {
    return false;
  }

  return templateObj.questions.every((question: unknown) => {
    if (typeof question !== 'object' || question === null) {
      return false;
    }

    const questionObj = question as Record<string, unknown>;
    return (
      typeof questionObj.text === 'string' &&
      typeof questionObj.order === 'number'
    );
  });
}

/**
 * @description 初期化時に一度だけバリデーションを実行
 */
function getValidatedData(): SystemQuestionsSchema {
  if (validatedData) {
    return validatedData;
  }

  if (validationError) {
    throw validationError;
  }

  if (!validateSystemQuestions(systemQuestionsData)) {
    validationError = new Error('Invalid system questions data format');
    throw validationError;
  }

  validatedData = systemQuestionsData;
  return validatedData;
}

/**
 * @description デフォルトテンプレートを取得する
 * JSONファイルからデータを読み込み、QuestionTemplate形式で返す
 * @returns {Readonly<QuestionTemplate>} システム提供のデフォルトテンプレート
 * @throws {Error} JSONデータが不正な形式の場合
 */
export function getDefaultTemplate(): Readonly<QuestionTemplate> {
  const data = getValidatedData();
  const templateData = data.defaultNurseryTemplate;

  // JSONデータからQuestionTemplateオブジェクトを構築
  return {
    id: templateData.id,
    title: templateData.title,
    description: templateData.description,
    isCustom: false,
    questions: templateData.questions.map((q) => ({ ...q })), // deep copy
    createdAt: new Date('2025-01-01T00:00:00Z'),
    updatedAt: new Date('2025-01-01T00:00:00Z'),
  } as const;
}

// テンプレートをキャッシュ
let cachedTemplates: readonly QuestionTemplate[] | null = null;

/**
 * @description すべてのシステムテンプレートを取得する（将来の拡張用）
 * @returns {readonly QuestionTemplate[]} システムが提供するテンプレートの配列
 */
export function getAllSystemTemplates(): readonly QuestionTemplate[] {
  if (cachedTemplates) {
    return cachedTemplates;
  }

  // 現在は1つのテンプレートのみ、将来的に複数のテンプレートを提供予定
  cachedTemplates = [getDefaultTemplate()] as const;
  return cachedTemplates;
}

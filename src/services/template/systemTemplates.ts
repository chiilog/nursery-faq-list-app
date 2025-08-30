import type { Template } from '../../types/entities';
import systemQuestionsData from './systemQuestions.json';

/**
 * @description JSONデータの型定義
 */
interface SystemQuestionsData {
  defaultTemplate: {
    id: string;
    name: string;
    questions: string[];
  };
}

/**
 * @description JSONデータの型安全性を確保するバリデーション関数
 * @param data - 未知の型のJSONデータ
 * @returns 型ガードされたSystemQuestionsData
 * @throws {Error} データが期待される形式でない場合
 */
export function validateSystemQuestionsData(
  data: unknown
): SystemQuestionsData {
  if (typeof data !== 'object' || data === null) {
    throw new Error('Invalid system questions data: not an object');
  }

  const obj = data as Record<string, unknown>;

  if (typeof obj.defaultTemplate !== 'object' || obj.defaultTemplate === null) {
    throw new Error('Invalid system questions data: missing defaultTemplate');
  }

  const template = obj.defaultTemplate as Record<string, unknown>;

  if (
    typeof template.id !== 'string' ||
    typeof template.name !== 'string' ||
    !Array.isArray(template.questions) ||
    !template.questions.every((q): q is string => typeof q === 'string')
  ) {
    throw new Error(
      'Invalid system questions data: invalid template structure'
    );
  }

  return {
    defaultTemplate: {
      id: template.id,
      name: template.name,
      questions: template.questions,
    },
  };
}

/**
 * @description システム提供のデフォルトテンプレートを取得する
 * @returns デフォルトテンプレートの配列
 * @throws {Error} システムテンプレートデータが無効な場合
 */
export const getDefaultTemplate = (): Template[] => {
  const validatedData = validateSystemQuestionsData(systemQuestionsData);
  const { id, name, questions } = validatedData.defaultTemplate;

  const template: Template = {
    id,
    name,
    questions,
    isSystem: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return [template];
};

/**
 * @description すべてのシステムテンプレートを取得する（現在はデフォルトテンプレートのみ）
 * @returns システムテンプレートの配列
 */
export const getAllSystemTemplates = (): Template[] => {
  return getDefaultTemplate();
};

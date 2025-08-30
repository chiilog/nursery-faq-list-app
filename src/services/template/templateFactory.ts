import type { Template } from '../../types/entities';

/**
 * @description システム提供のテンプレートを作成する
 * @param id - テンプレートの一意識別子
 * @param name - テンプレート名
 * @param questions - 質問文字列の配列
 * @returns 作成されたシステムテンプレート（isSystem: true）
 * @example
 * const template = createTemplate(
 *   'system-default',
 *   'デフォルトテンプレート',
 *   ['施設の安全性は？']
 * );
 */
export const createTemplate = (
  id: string,
  name: string,
  questions: string[]
): Template => {
  return {
    id,
    name,
    questions,
    isSystem: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

/**
 * @description ユーザー定義のカスタムテンプレートを作成する
 * @param name - テンプレート名
 * @param questions - 質問文字列の配列
 * @returns 作成されたカスタムテンプレート（isSystem: false）
 * @example
 * const customTemplate = createCustomTemplate(
 *   '私のカスタムテンプレート',
 *   ['特別な教育プログラムはありますか？']
 * );
 * console.log(customTemplate.isSystem); // false
 */
export const createCustomTemplate = (
  name: string,
  questions: string[]
): Template => {
  return {
    id: crypto.randomUUID(),
    name,
    questions,
    isSystem: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

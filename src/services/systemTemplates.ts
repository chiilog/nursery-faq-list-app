/**
 * @description システム提供テンプレートデータの定義
 * システムが提供する汎用的な保育園見学質問テンプレート
 * 質問データはJSONファイルから読み込み、編集を容易にする
 */

import type { QuestionTemplate } from '../types/entities';
import systemQuestionsData from './systemQuestions.json';

/**
 * @description デフォルトテンプレートを取得する
 * JSONファイルからデータを読み込み、QuestionTemplate形式で返す
 * @returns {QuestionTemplate} システム提供のデフォルトテンプレート
 */
export function getDefaultTemplate(): QuestionTemplate {
  const templateData = systemQuestionsData.defaultNurseryTemplate;

  // JSONデータからQuestionTemplateオブジェクトを構築
  return {
    id: templateData.id,
    title: templateData.title,
    description: templateData.description,
    isCustom: false,
    questions: [...templateData.questions], // 配列をコピーして外部変更を防ぐ
    createdAt: new Date('2025-01-01T00:00:00Z'),
    updatedAt: new Date('2025-01-01T00:00:00Z'),
  };
}

/**
 * @description すべてのシステムテンプレートを取得する（将来の拡張用）
 * @returns {QuestionTemplate[]} システムが提供するテンプレートの配列
 */
export function getAllSystemTemplates(): QuestionTemplate[] {
  // 現在は1つのテンプレートのみ、将来的に複数のテンプレートを提供予定
  return [getDefaultTemplate()];
}

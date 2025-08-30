/**
 * @description テンプレート適用サービスの関数群
 * テンプレートの適用ロジックを担当
 */

import type { Nursery, Question, Template } from '../../types/entities';
import { generateId } from '../../utils/id';

/**
 * @description テンプレート質問から新しいQuestionを作成する
 * @param questionText - 質問のテキスト
 * @param now - 作成・更新日時
 * @returns 新しく作成されたQuestionオブジェクト
 * @example
 * const question = createQuestionFromTemplate('施設の安全対策について教えてください', new Date());
 * console.log(question.isAnswered); // false
 */
const createQuestionFromTemplate = (
  questionText: string,
  now: Date
): Question => {
  return {
    id: generateId(),
    text: questionText,
    isAnswered: false,
    createdAt: now,
    updatedAt: now,
  };
};

/**
 * @description テンプレートの質問を既存の質問リストに追加する
 * @param template - 質問を取得するテンプレート
 * @param existingQuestions - 既存の質問リスト
 * @returns 既存の質問とテンプレートの質問を統合した新しい質問リスト
 * @example
 * const template = { questions: ['施設の安全性はどうですか？'] };
 * const result = applyTemplateQuestions(template, []);
 * console.log(result.length); // 1
 */
export const applyTemplateQuestions = (
  template: Template,
  existingQuestions: readonly Question[]
): Question[] => {
  const now = new Date();

  // テンプレートの質問を新しい質問として作成
  const newQuestions = template.questions.map((questionText: string) =>
    createQuestionFromTemplate(questionText, now)
  );

  // 既存の質問の後に新しい質問を追加
  return [...existingQuestions, ...newQuestions];
};

/**
 * @description テンプレートの質問を保育園の最初の見学セッションに適用する
 * @param template - 適用するテンプレート
 * @param nursery - 対象の保育園オブジェクト
 * @returns テンプレートが適用された新しい保育園オブジェクト
 * @throws {Error} 見学セッションが存在しない場合
 * @example
 * const nursery = { visitSessions: [{ questions: [] }] };
 * const template = { questions: ['施設の安全性は？'] };
 * const result = applyTemplateToNursery(template, nursery);
 */
export const applyTemplateToNursery = (
  template: Template,
  nursery: Nursery
): Nursery => {
  if (nursery.visitSessions.length === 0) {
    throw new Error('見学セッションが存在しません');
  }

  const now = new Date();
  const [firstSession, ...restSessions] = nursery.visitSessions;

  // 最初の見学セッションを更新
  const updatedSession = {
    ...firstSession,
    questions: applyTemplateQuestions(template, firstSession.questions),
    updatedAt: now,
  };

  // 新しい保育園オブジェクトを作成
  return {
    ...nursery,
    visitSessions: [updatedSession, ...restSessions],
    updatedAt: now,
  };
};

/**
 * @description テンプレートIDからテンプレートを検索し、保育園に適用する
 * @param templateId - 適用するテンプレートのID
 * @param nursery - 対象の保育園オブジェクト
 * @param templates - 利用可能なテンプレートの一覧
 * @returns テンプレートが適用された新しい保育園オブジェクト
 * @throws {Error} 指定されたテンプレートが見つからない場合
 * @example
 * const templates = [{ id: 'template1', questions: [...] }];
 * const result = applyTemplateById('template1', nursery, templates);
 */
export const applyTemplateById = (
  templateId: string,
  nursery: Nursery,
  templates: readonly Template[]
): Nursery => {
  const template = templates.find((t) => t.id === templateId);

  if (!template) {
    throw new Error(`テンプレート（ID: ${templateId}）が見つかりません`);
  }

  return applyTemplateToNursery(template, nursery);
};

/**
 * @description テンプレート関連のサービス層
 * 質問テンプレートの適用や管理を行う
 */

import type { Nursery, Question, QuestionTemplate } from '../types/entities';
import { generateId } from '../utils/id';

/**
 * @description テンプレート質問から新しいQuestionを作成する
 * @param templateQuestion - テンプレートの質問
 * @param now - 作成日時
 * @returns 新しいQuestion
 */
function createQuestionFromTemplate(
  templateQuestion: QuestionTemplate['questions'][0],
  now: Date
): Question {
  return {
    id: generateId(),
    text: templateQuestion.text,
    isAnswered: false,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * @description テンプレートの質問を既存の質問リストに適用する
 * @param template - 適用するテンプレート
 * @param existingQuestions - 既存の質問リスト
 * @returns 既存の質問とテンプレートの質問を結合した新しい質問リスト
 */
export function applyTemplateQuestions(
  template: Readonly<QuestionTemplate>,
  existingQuestions: readonly Question[]
): Question[] {
  const now = new Date();

  // テンプレートの質問を新しい質問として作成
  const newQuestions = template.questions.map((templateQuestion) =>
    createQuestionFromTemplate(templateQuestion, now)
  );

  // 既存の質問の後に新しい質問を追加
  return [...existingQuestions, ...newQuestions];
}

/**
 * @description 保育園の最初の見学セッションにテンプレートを適用する
 * @param template - 適用するテンプレート
 * @param nursery - 対象の保育園
 * @returns テンプレートが適用された新しい保育園オブジェクト
 * @throws {Error} 見学セッションが存在しない場合
 */
export function applyTemplateToNursery(
  template: Readonly<QuestionTemplate>,
  nursery: Readonly<Nursery>
): Nursery {
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
}

/**
 * @description テンプレートIDから保育園にテンプレートを適用する（将来の拡張用）
 * @param templateId - テンプレートのID
 * @param nursery - 対象の保育園
 * @param templates - 利用可能なテンプレートのリスト
 * @returns テンプレートが適用された新しい保育園オブジェクト
 * @throws {Error} 指定されたテンプレートが見つからない場合
 */
export function applyTemplateById(
  templateId: string,
  nursery: Readonly<Nursery>,
  templates: readonly QuestionTemplate[]
): Nursery {
  const template = templates.find((t) => t.id === templateId);

  if (!template) {
    throw new Error(`テンプレート（ID: ${templateId}）が見つかりません`);
  }

  return applyTemplateToNursery(template, nursery);
}

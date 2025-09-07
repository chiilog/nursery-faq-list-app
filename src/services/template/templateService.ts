/**
 * @description テンプレート関連のサービス
 * 複雑なファクトリーパターンと依存性注入を排除したシンプルな実装
 */

import type { Template, Nursery, Question } from '../../types/entities';
import { getDefaultTemplate } from './systemTemplates';

/**
 * @description システムテンプレートを取得する
 * @returns システムテンプレートの配列を含むPromise
 */
export const getSystemTemplates = (): Template[] => {
  // 現在はローカルJSONデータのみなので、AbortSignalは不要
  return getDefaultTemplate();
};

/**
 * @description カスタムテンプレートを取得する
 * @returns 空の配列（将来実装予定）
 */
export const getCustomTemplates = (): Template[] => {
  // 将来的にローカルストレージやAPIから取得
  return [];
};

/**
 * @description カスタムテンプレートを保存する
 * @param template - 保存するテンプレート（idとisSystemは除外）
 */
export const saveCustomTemplate = (
  template: Pick<Template, 'name' | 'questions' | 'createdAt' | 'updatedAt'>
): void => {
  // 将来的にローカルストレージやAPIに保存
  console.log('カスタムテンプレートを保存:', template);
};

/**
 * @description テンプレートの質問から新しいQuestion配列を作成する
 * @param template - テンプレート
 * @param existingQuestions - 既存の質問配列
 * @returns 既存の質問とテンプレート質問を結合した配列
 */
export const applyTemplateQuestions = (
  template: Template,
  existingQuestions: Question[]
): Question[] => {
  const templateQuestions: Question[] = template.questions.map(
    (questionText) => ({
      id: crypto.randomUUID(),
      text: questionText,
      isAnswered: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  );

  return [...existingQuestions, ...templateQuestions];
};

/**
 * @description テンプレートを保育園の最初の見学セッションに適用する
 * @param template - 適用するテンプレート
 * @param nursery - 対象の保育園
 * @returns テンプレートが適用された保育園オブジェクト
 * @throws 見学セッションが存在しない場合
 */
export const applyTemplateToNursery = (
  template: Template,
  nursery: Nursery
): Nursery => {
  if (nursery.visitSessions.length === 0) {
    throw new Error('見学セッションが存在しません');
  }

  const firstSession = nursery.visitSessions[0];
  const updatedQuestions = applyTemplateQuestions(
    template,
    firstSession.questions
  );

  return {
    ...nursery,
    visitSessions: [
      {
        ...firstSession,
        questions: updatedQuestions,
        updatedAt: new Date(),
      },
      ...nursery.visitSessions.slice(1),
    ],
    updatedAt: new Date(),
  };
};

/**
 * @description IDでテンプレートを検索して保育園に適用する
 * @param templateId - テンプレートID
 * @param nursery - 対象の保育園
 * @param templates - テンプレート配列
 * @returns テンプレートが適用された保育園オブジェクト
 * @throws テンプレートが見つからない場合
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

/**
 * @description テンプレート関連のサービス統合レイヤー
 * 質問テンプレートの適用や管理を行う
 *
 * 互換性のために既存のエクスポートを維持しつつ、
 * 機能別に分離されたTemplateRepositoryとTemplateApplicationServiceを統合
 */

import type { Nursery, Question, Template } from '../../types/entities';
import { TemplateDataStore } from './templateRepository';
import {
  applyTemplateQuestions as applyTemplateQuestionsCore,
  applyTemplateToNursery as applyTemplateToNurseryCore,
  applyTemplateById as applyTemplateByIdCore,
} from './templateApplicationService';

// インスタンスを作成（シングルトン）
const templateRepository = new TemplateDataStore();

/**
 * @description テンプレートの質問を既存の質問リストに適用する
 * @param template - 適用するテンプレート
 * @param existingQuestions - 既存の質問リスト
 * @returns 既存の質問とテンプレートの質問を結合した新しい質問リスト
 */
export function applyTemplateQuestions(
  template: Readonly<Template>,
  existingQuestions: readonly Question[]
): Question[] {
  return applyTemplateQuestionsCore(template, existingQuestions);
}

/**
 * @description 保育園の最初の見学セッションにテンプレートを適用する
 * @param template - 適用するテンプレート
 * @param nursery - 対象の保育園
 * @returns テンプレートが適用された新しい保育園オブジェクト
 * @throws {Error} 見学セッションが存在しない場合
 */
export function applyTemplateToNursery(
  template: Readonly<Template>,
  nursery: Readonly<Nursery>
): Nursery {
  return applyTemplateToNurseryCore(template, nursery);
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
  templates: readonly Template[]
): Nursery {
  return applyTemplateByIdCore(templateId, nursery, templates);
}

/**
 * @description システム提供のデフォルトテンプレートを取得する
 * @returns システムテンプレートの配列を含むPromise
 * @throws {Error} システムテンプレートの取得に失敗した場合
 */
export const getSystemTemplates = (): Promise<Template[]> =>
  templateRepository.getSystemTemplates();

/**
 * @description カスタムテンプレートを取得する
 * @returns カスタムテンプレートの配列を含むPromise
 * @throws {Error} カスタムテンプレートの取得に失敗した場合
 */
export const getCustomTemplates = (): Promise<Template[]> =>
  templateRepository.getCustomTemplates();

/**
 * @description カスタムテンプレートを保存する
 * @param template - 保存するテンプレートオブジェクト
 * @returns 保存処理の完了を示すPromise
 * @throws {Error} テンプレートの保存に失敗した場合
 */
export const saveCustomTemplate = (template: Template): Promise<void> =>
  templateRepository.saveCustomTemplate(template);

/**
 * @description テンプレートサービスの公開インターフェースオブジェクト
 * すべてのテンプレート関連機能を一元的に提供する
 * @example
 * import { TemplateService } from './templateService';
 * const templates = await TemplateService.getSystemTemplates('kindergarten');
 */
export const TemplateService = {
  getSystemTemplates,
  getCustomTemplates,
  saveCustomTemplate,
  applyTemplateQuestions,
  applyTemplateToNursery,
  applyTemplateById,
};

/**
 * @description 依存性注入用のテンプレートデータストアインスタンス取得メソッド
 * テスト時にモックインスタンスと差し替え可能
 * @returns TemplateDataStoreのインスタンス
 */
export function getTemplateRepository() {
  return templateRepository;
}

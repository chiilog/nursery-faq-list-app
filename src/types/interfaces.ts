/**
 * @description テンプレート関連のインターフェース定義
 * SOLID原則の依存性逆転原則（DIP）を適用するための抽象定義
 */

import type { Template, Nursery, Question } from './entities';

/**
 * @description テンプレートリポジトリのインターフェース
 * データの取得・保存に関する責任を持つ
 */
export interface TemplateRepository {
  /**
   * @description システム提供のデフォルトテンプレートを取得する
   * @returns システムテンプレートの配列を含むPromise
   * @throws {Error} システムテンプレートの取得に失敗した場合
   */
  getSystemTemplates(): Promise<Template[]>;

  /**
   * @description ユーザーが作成したカスタムテンプレートの一覧を取得する
   * @returns カスタムテンプレートの配列を含むPromise
   * @throws {Error} カスタムテンプレートの取得に失敗した場合
   */
  getCustomTemplates(): Promise<Template[]>;

  /**
   * @description カスタムテンプレートをストレージに保存する
   * @param template - 保存するテンプレートオブジェクト
   * @returns 保存処理の完了を示すPromise
   * @throws {Error} テンプレートの保存に失敗した場合
   */
  saveCustomTemplate(template: Template): Promise<void>;
}

/**
 * @description テンプレート適用サービスのインターフェース
 * テンプレートの適用ロジックに関する責任を持つ
 */
export interface TemplateApplicationService {
  /**
   * @description テンプレートの質問を指定された保育園の見学セッションに適用する
   * @param template - 適用するテンプレート
   * @param nursery - 対象の保育園オブジェクト
   * @returns テンプレートが適用された新しい保育園オブジェクト
   * @throws {Error} 見学セッションが存在しない場合
   */
  applyTemplateToNursery(template: Template, nursery: Nursery): Nursery;

  /**
   * @description テンプレートの質問を既存の質問リストに追加する
   * @param template - 質問を取得するテンプレート
   * @param existingQuestions - 既存の質問リスト
   * @returns 既存の質問とテンプレートの質問を統合した新しい質問リスト
   */
  applyTemplateQuestions(
    template: Template,
    existingQuestions: readonly Question[]
  ): Question[];
}

/**
 * @description テンプレートファクトリーのインターフェース
 * テンプレートの生成に関する責任を持つ
 */
export interface TemplateFactory {
  /**
   * @description システム提供のテンプレートを作成する
   * @param id - テンプレートの一意識別子
   * @param name - テンプレートの名前
   * @param questions - 質問の文字列配列
   * @returns 作成されたシステムテンプレート
   */
  createTemplate(id: string, name: string, questions: string[]): Template;

  /**
   * @description ユーザー定義のカスタムテンプレートを作成する
   * @param name - テンプレートの名前
   * @param questions - 質問の文字列配列
   * @returns 作成されたカスタムテンプレート
   */
  createCustomTemplate(name: string, questions: string[]): Template;
}

/**
 * @description エラーハンドラーのインターフェース
 * エラー処理に関する責任を持つ
 */
export interface ErrorHandler {
  /**
   * @description アプリケーション内で発生したエラーを処理する
   * @param message - エラーメッセージ
   * @param error - エラーオブジェクト（型不明のため unknown として扱う）
   * @throws 処理できない致命的エラーの場合は再スローする可能性がある
   */
  handleError(message: string, error: unknown): void;
}

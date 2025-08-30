/**
 * @description テンプレートリポジトリの実装
 * データの取得・保存を担当
 */

import type { Template } from '../../types/entities';
import type { TemplateRepository } from '../../types/interfaces';
import { getDefaultTemplate } from './systemTemplates';

/**
 * @description テンプレートデータストア
 * データの取得・保存を担当
 * TemplateRepositoryインターフェースを実装し、システムテンプレートとカスタムテンプレートの管理機能を提供
 */
export class TemplateDataStore implements TemplateRepository {
  /**
   * @description システム提供のデフォルトテンプレートを非同期に取得する
   * @returns システムテンプレートの配列を含むPromise
   * @throws {Error} システムテンプレートの取得に失敗した場合
   */
  async getSystemTemplates(): Promise<Template[]> {
    // 非同期処理をシミュレート（将来的にAPI呼び出しに変更予定）
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(getDefaultTemplate());
      }, 100);
    });
  }

  /**
   * @description カスタムテンプレートの一覧を非同期に取得する
   * @returns カスタムテンプレートの配列を含むPromise
   * @throws {Error} カスタムテンプレートの取得に失敗した場合
   */
  async getCustomTemplates(): Promise<Template[]> {
    // 将来的にローカルストレージやAPIから取得
    return Promise.resolve([]);
  }

  /**
   * @description カスタムテンプレートを非同期に保存する
   * @param template - 保存するテンプレート
   * @returns 保存処理の完了を示すPromise
   * @throws {Error} テンプレートの保存に失敗した場合
   */
  async saveCustomTemplate(template: Template): Promise<void> {
    // 将来的にローカルストレージやAPIに保存
    console.log('カスタムテンプレートを保存:', template);
    return Promise.resolve();
  }
}

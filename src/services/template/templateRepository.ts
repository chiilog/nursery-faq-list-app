/**
 * @description テンプレートリポジトリの実装
 * データの取得・保存を担当
 */

import type { Template } from '../../types/entities';
import type { TemplateRepository } from '../../types/template';
import { getDefaultTemplate } from './systemTemplates';

/**
 * @description テンプレートデータストア
 * データの取得・保存を担当
 * TemplateRepositoryインターフェースを実装し、システムテンプレートとカスタムテンプレートの管理機能を提供
 */
export class TemplateDataStore implements TemplateRepository {
  /**
   * @description システム提供のデフォルトテンプレートを非同期に取得する
   * @param signal - リクエストをキャンセルするためのAbortSignal
   * @returns システムテンプレートの配列を含むPromise
   * @throws {Error} システムテンプレートの取得に失敗した場合
   */
  async getSystemTemplates(signal?: AbortSignal): Promise<Template[]> {
    // 非同期処理をシミュレート（ユーザー作成テンプレートの共有機能実装時にAPI呼び出しに変更予定）
    return new Promise((resolve, reject) => {
      // AbortSignalが既にキャンセルされている場合
      if (signal?.aborted) {
        reject(new DOMException('Operation was aborted', 'AbortError'));
        return;
      }

      const timeoutId = setTimeout(() => {
        resolve(getDefaultTemplate());
      }, 100);

      // AbortSignalがキャンセルされた場合のクリーンアップ
      signal?.addEventListener('abort', () => {
        clearTimeout(timeoutId);
        reject(new DOMException('Operation was aborted', 'AbortError'));
      });
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
   * @param template - 保存するテンプレート（idとisSystemは除外）
   * @returns 保存処理の完了を示すPromise
   * @throws {Error} テンプレートの保存に失敗した場合
   */
  async saveCustomTemplate(
    template: Pick<Template, 'name' | 'questions' | 'createdAt' | 'updatedAt'>
  ): Promise<void> {
    // 将来的にローカルストレージやAPIに保存
    console.log('カスタムテンプレートを保存:', template);
    return Promise.resolve();
  }
}

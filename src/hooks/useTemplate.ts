/**
 * @description テンプレート機能を提供するカスタムフック
 * システム提供およびユーザー作成のテンプレートを統一的に管理
 */

import { useState, useCallback, useMemo } from 'react';
import { useNurseryStore } from '../stores/nurseryStore';
import { getAllSystemTemplates } from '../services/systemTemplates';
import { applyTemplateToNursery } from '../services/templateService';
import type { QuestionTemplate } from '../types/entities';

/**
 * @description テンプレート機能のカスタムフック
 * @returns テンプレート操作のための関数とステート
 */
export function useTemplate() {
  const [isApplying, setIsApplying] = useState(false);
  const { currentNursery, updateNursery } = useNurseryStore();

  /**
   * @description 利用可能な全テンプレートを取得する
   * @returns {QuestionTemplate[]} 全テンプレートの配列
   * @example
   * ```typescript
   * const { getAllTemplates } = useTemplate();
   * const templates = getAllTemplates();
   * console.log(templates.length); // 利用可能な全テンプレート数
   * ```
   */
  const getAllTemplates = useCallback((): QuestionTemplate[] => {
    const systemTemplates = getAllSystemTemplates();
    // 将来的にはここでユーザー作成のテンプレートも統合して返す
    // 例: [...systemTemplates, ...userTemplates]
    return systemTemplates;
  }, []);

  /**
   * @description 指定された種別のテンプレートを取得する
   * @param isCustom - true: ユーザー作成、false: システム提供、undefined: 全て
   * @returns {QuestionTemplate[]} 条件に合致するテンプレートの配列
   * @example
   * ```typescript
   * const { getTemplates } = useTemplate();
   * const systemTemplates = getTemplates(false);  // システム提供のみ
   * const userTemplates = getTemplates(true);     // ユーザー作成のみ
   * const allTemplates = getTemplates();          // 全て
   * ```
   */
  const getTemplates = useCallback(
    (isCustom?: boolean): QuestionTemplate[] => {
      const allTemplates = getAllTemplates();

      if (isCustom === undefined) {
        return allTemplates;
      }

      return allTemplates.filter((template) => template.isCustom === isCustom);
    },
    [getAllTemplates]
  );

  /**
   * @description テンプレートが存在するかを確認する
   * @param isCustom - true: ユーザー作成、false: システム提供、undefined: 全て
   * @returns {boolean} 条件に合致するテンプレートが存在する場合true
   * @example
   * ```typescript
   * const { hasTemplates } = useTemplate();
   * if (hasTemplates(false)) {
   *   // システム提供テンプレートがある場合の処理
   * }
   * if (hasTemplates()) {
   *   // いずれかのテンプレートがある場合の処理
   * }
   * ```
   */
  const hasTemplates = useCallback(
    (isCustom?: boolean): boolean => {
      const templates = getTemplates(isCustom);
      return (
        templates.length > 0 && templates.some((t) => t.questions.length > 0)
      );
    },
    [getTemplates]
  );

  /**
   * @description 指定されたテンプレートを保育園に適用する
   * @param nurseryId - 対象の保育園ID
   * @param templateId - 適用するテンプレートID（省略時はデフォルトテンプレート）
   * @returns {Promise<boolean>} 成功したらtrue、失敗したらfalse
   * @throws なし（エラーはキャッチされてfalseが返される）
   * @example
   * ```typescript
   * const { applyTemplate } = useTemplate();
   * // デフォルトテンプレートを適用
   * const success = await applyTemplate('nursery-123');
   * // 特定のテンプレートを適用
   * const success = await applyTemplate('nursery-123', 'template-456');
   * ```
   */
  const applyTemplate = useCallback(
    async (nurseryId: string, templateId?: string): Promise<boolean> => {
      setIsApplying(true);

      try {
        // 現在の保育園を使用
        if (!currentNursery || currentNursery.id !== nurseryId) {
          console.error(`保育園（ID: ${nurseryId}）が見つかりません`);
          return false;
        }

        // テンプレートを取得
        let template: QuestionTemplate | undefined;

        if (templateId) {
          // 将来的にはIDでテンプレートを検索
          template = getAllTemplates().find((t) => t.id === templateId);
          if (!template) {
            console.error(`テンプレート（ID: ${templateId}）が見つかりません`);
            return false;
          }
        } else {
          // デフォルトテンプレート（システム提供テンプレートの最初のもの）を使用
          const systemTemplates = getAllSystemTemplates();
          template = systemTemplates[0];
          if (!template) {
            console.error('システム提供テンプレートが見つかりません');
            return false;
          }
        }

        // テンプレートを適用
        const updatedNursery = applyTemplateToNursery(template, currentNursery);

        // ストアを更新
        await updateNursery(nurseryId, updatedNursery);

        return true;
      } catch (error) {
        console.error('テンプレート適用中にエラーが発生しました:', error);
        return false;
      } finally {
        setIsApplying(false);
      }
    },
    [currentNursery, updateNursery, getAllTemplates]
  );

  // 統計情報を提供（将来のUI表示用）
  const templateStats = useMemo(() => {
    const all = getAllTemplates();
    const system = getTemplates(false);
    const custom = getTemplates(true);

    return {
      total: all.length,
      system: system.length,
      custom: custom.length,
    };
  }, [getAllTemplates, getTemplates]);

  return {
    isApplying,
    applyTemplate,
    getTemplates,
    hasTemplates,
    getAllTemplates,
    templateStats,
  };
}

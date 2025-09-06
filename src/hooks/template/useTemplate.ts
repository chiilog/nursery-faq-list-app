/**
 * @description テンプレート機能を提供するカスタムフック
 * システム提供およびユーザー作成のテンプレートを統一的に管理
 */

import { useCallback, useMemo, useEffect } from 'react';
import { useSystemTemplates } from './useSystemTemplates';
import { useCustomTemplates } from './useCustomTemplates';
import { useTemplateApplication } from './useTemplateApplication';
import { handleError } from '../../utils/errorHandler';
import type { Template } from '../../types/entities';

/**
 * @description テンプレート機能のカスタムフック
 * @returns テンプレート操作のための関数とステート
 */
export function useTemplate() {
  const {
    templates: systemTemplates,
    loading: systemLoading,
    loadTemplates,
  } = useSystemTemplates();
  const { customTemplates, saveTemplate } = useCustomTemplates();
  const { isApplying, applyTemplate: applyTemplateToNursery } =
    useTemplateApplication();

  // 統合されたテンプレートリスト
  const allTemplates = useMemo(() => {
    return [...systemTemplates, ...customTemplates];
  }, [systemTemplates, customTemplates]);

  /**
   * @description 全テンプレートを取得する
   */
  const getAllTemplates = () => allTemplates;

  /**
   * @description 指定された種別のテンプレートを取得する
   * @param isCustom - true: カスタム、false: システム、undefined: 全て
   */
  const getTemplates = useCallback(
    (isCustom?: boolean): Template[] => {
      if (isCustom === undefined) {
        return allTemplates;
      }
      return allTemplates.filter((template) =>
        isCustom ? !template.isSystem : template.isSystem
      );
    },
    [allTemplates]
  );

  /**
   * @description テンプレートが存在するかを確認する
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
   * @description テンプレートを保育園に適用する
   * @param nurseryId - 適用対象の保育園ID
   * @param templateId - 使用するテンプレートID（省略時は最初のシステムテンプレートを使用）
   * @returns 適用が成功した場合はtrue、失敗した場合はfalse
   */
  const applyTemplate = useCallback(
    async (nurseryId: string, templateId?: string): Promise<boolean> => {
      let template: Template | undefined;

      if (templateId) {
        template = allTemplates.find((t) => t.id === templateId);
        if (!template) {
          handleError(
            `テンプレート（ID: ${templateId}）が見つかりません`,
            new Error('Template not found')
          );
          return false;
        }
      } else {
        template = systemTemplates.at(0);
        if (!template) {
          handleError(
            'システム提供テンプレートが見つかりません',
            new Error('No system templates')
          );
          return false;
        }
      }

      return await applyTemplateToNursery(nurseryId, template);
    },
    [allTemplates, systemTemplates, applyTemplateToNursery]
  );

  // 初回ロード
  useEffect(() => {
    const loadData = async () => {
      try {
        await loadTemplates();
      } catch (error) {
        handleError('テンプレートの読み込みに失敗しました', error);
      }
    };
    void loadData();
  }, [loadTemplates]);

  const templateStats = {
    total: allTemplates.length,
    system: systemTemplates.length,
    custom: customTemplates.length,
  };

  return {
    isApplying,
    loading: systemLoading,
    applyTemplate,
    getTemplates,
    hasTemplates,
    getAllTemplates,
    saveTemplate,
    templateStats,
  };
}

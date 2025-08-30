/**
 * @description テンプレート機能を提供するカスタムフック
 * システム提供およびユーザー作成のテンプレートを統一的に管理
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useNurseryStore } from '../../stores/nurseryStore';
import { useSystemTemplates } from './useSystemTemplates';
import { useCustomTemplates } from './useCustomTemplates';
import { TemplateService } from '../../services/template/templateService';
import { handleError } from '../../utils/errorHandler';
import type { Template, Nursery } from '../../types/entities';

/**
 * @description 保育園オブジェクトの妥当性を検証する型ガード
 * @param nursery - 検証対象のオブジェクト
 * @param expectedId - 期待する保育園ID
 * @returns 妥当な場合true
 */
function isValidNursery(
  nursery: unknown,
  expectedId: string
): nursery is Nursery {
  return (
    typeof nursery === 'object' &&
    nursery !== null &&
    'id' in nursery &&
    'visitSessions' in nursery &&
    Array.isArray((nursery as Nursery).visitSessions) &&
    (nursery as { id: unknown }).id === expectedId
  );
}

/**
 * @description テンプレート機能のカスタムフック
 * @returns テンプレート操作のための関数とステート
 */
export function useTemplate() {
  const [isApplying, setIsApplying] = useState(false);
  const { currentNursery, updateNursery } = useNurseryStore();
  const {
    templates: systemTemplates,
    loading: systemLoading,
    loadTemplates,
  } = useSystemTemplates();
  const { customTemplates, saveTemplate } = useCustomTemplates();

  // 統合されたテンプレートリスト
  const allTemplates = useMemo(() => {
    return [...systemTemplates, ...customTemplates];
  }, [systemTemplates, customTemplates]);

  /**
   * @description 全テンプレートを取得する
   */
  const getAllTemplates = useCallback((): Template[] => {
    return allTemplates;
  }, [allTemplates]);

  /**
   * @description 指定された種別のテンプレートを取得する
   * @param isCustom - true: カスタム、false: システム、undefined: 全て
   */
  const getTemplates = useCallback(
    (isCustom?: boolean): Template[] => {
      if (isCustom === undefined) {
        return allTemplates;
      }
      return allTemplates.filter((template) => !template.isSystem === isCustom);
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
   */
  const applyTemplate = useCallback(
    async (nurseryId: string, templateId?: string): Promise<boolean> => {
      setIsApplying(true);

      try {
        if (!isValidNursery(currentNursery, nurseryId)) {
          handleError(
            `保育園（ID: ${nurseryId}）が見つかりません`,
            new Error('Invalid nursery')
          );
          return false;
        }

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
          template = systemTemplates[0];
          if (!template) {
            handleError(
              'システム提供テンプレートが見つかりません',
              new Error('No system templates')
            );
            return false;
          }
        }

        const updatedNursery = TemplateService.applyTemplateToNursery(
          template,
          currentNursery
        );
        await updateNursery(nurseryId, updatedNursery);
        return true;
      } catch (error) {
        handleError('テンプレート適用中にエラーが発生しました', error);
        return false;
      } finally {
        setIsApplying(false);
      }
    },
    [currentNursery, updateNursery, allTemplates, systemTemplates]
  );

  // 初回ロード
  useEffect(() => {
    void loadTemplates();
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

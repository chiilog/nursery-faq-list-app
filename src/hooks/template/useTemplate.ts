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
import type { CreateVisitSessionInput } from '../../types/inputs';

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
  if (typeof nursery !== 'object' || nursery === null) {
    return false;
  }

  const obj = nursery as Record<string, unknown>;

  return (
    'id' in obj &&
    'visitSessions' in obj &&
    obj.id === expectedId &&
    Array.isArray(obj.visitSessions)
  );
}

/**
 * @description テンプレート機能のカスタムフック
 * @returns テンプレート操作のための関数とステート
 */
export function useTemplate() {
  const [isApplying, setIsApplying] = useState(false);
  const {
    currentNursery,
    updateNursery,
    createVisitSession,
    setCurrentNursery,
  } = useNurseryStore();
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
  const getAllTemplates = useCallback(() => allTemplates, [allTemplates]);

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
          template = systemTemplates.at(0);
          if (!template) {
            handleError(
              'システム提供テンプレートが見つかりません',
              new Error('No system templates')
            );
            return false;
          }
        }

        // 使用するNurseryオブジェクトを決定
        let nurseryToUse = currentNursery;

        // セッションが存在しない場合は新規作成
        if (currentNursery.visitSessions.length === 0) {
          const sessionInput: CreateVisitSessionInput = {
            visitDate: new Date(),
            status: 'planned' as const,
            questions: [],
            insights: [],
          };

          try {
            await createVisitSession(nurseryId, sessionInput);
            // セッション作成後、最新のデータを取得
            await setCurrentNursery(nurseryId);

            // セッション作成後の最新のNurseryデータを再度取得
            const store = useNurseryStore.getState?.();
            nurseryToUse = store?.currentNursery ?? currentNursery;

            if (!isValidNursery(nurseryToUse, nurseryId)) {
              handleError(
                `セッション作成後の保育園データの取得に失敗しました（ID: ${nurseryId}）`,
                new Error('Failed to get updated nursery data')
              );
              return false;
            }
          } catch (error) {
            handleError('見学セッションの作成に失敗しました', error);
            return false;
          }
        }

        const updatedNursery = TemplateService.applyTemplateToNursery(
          template,
          nurseryToUse
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
    [
      currentNursery,
      updateNursery,
      createVisitSession,
      setCurrentNursery,
      allTemplates,
      systemTemplates,
    ]
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

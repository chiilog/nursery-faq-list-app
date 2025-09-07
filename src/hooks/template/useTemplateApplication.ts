import { useState, useCallback } from 'react';
import type { Template } from '../../types/entities';
import type { CreateVisitSessionInput } from '../../types/inputs';
import { useNurseryStore } from '../../stores/nurseryStore';
import { applyTemplateToNursery } from '../../services/template/templateService';
import { handleError } from '../../utils/errorHandler';
import { isValidNursery } from '../../utils/validation';

/**
 * @description テンプレート適用専用のフック
 * useTemplateから分離してテンプレート適用ロジックのみを担当
 */
export const useTemplateApplication = () => {
  const [isApplying, setIsApplying] = useState(false);
  const { currentNursery, updateNursery, createVisitSession } =
    useNurseryStore();

  /**
   * @description テンプレートを保育園に適用する。セッションが存在しない場合は自動的に新規作成する
   * @param nurseryId - 適用対象の保育園ID
   * @param template - 使用するテンプレート
   * @returns 適用が成功した場合はtrue、失敗した場合はfalse
   * @throws テンプレート適用中にエラーが発生した場合
   */
  const applyTemplate = useCallback(
    async (nurseryId: string, template: Template): Promise<boolean> => {
      setIsApplying(true);

      try {
        if (!isValidNursery(currentNursery, nurseryId)) {
          handleError(
            `保育園（ID: ${nurseryId}）が見つかりません`,
            new Error('Invalid nursery')
          );
          return false;
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
            // セッション作成後、明示的に最新データを取得
            const store = useNurseryStore.getState();
            const updatedNursery = store.currentNursery;

            if (!updatedNursery || !isValidNursery(updatedNursery, nurseryId)) {
              handleError(
                `セッション作成後の保育園データの取得に失敗しました（ID: ${nurseryId}）`,
                new Error('Failed to get updated nursery data')
              );
              return false;
            }

            nurseryToUse = updatedNursery;
          } catch (error) {
            handleError('見学セッションの作成に失敗しました', error);
            return false;
          }
        }

        const updatedNursery = applyTemplateToNursery(template, nurseryToUse);
        await updateNursery(nurseryId, updatedNursery);
        return true;
      } catch (error) {
        handleError('テンプレート適用中にエラーが発生しました', error);
        return false;
      } finally {
        setIsApplying(false);
      }
    },
    [currentNursery, updateNursery, createVisitSession]
  );

  return {
    isApplying,
    applyTemplate,
  };
};

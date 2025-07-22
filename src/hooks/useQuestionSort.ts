/**
 * 質問ソート操作フック
 * 質問の並び替えとソート機能を提供
 */

import { useCallback } from 'react';
import { useQuestionListStore } from '../stores/questionListStore';
import { useErrorHandler } from './useErrorHandler';

/**
 * 質問ソート操作フック
 */
export function useQuestionSort() {
  // パフォーマンス最適化：必要なアクションのみを選択的に購読
  const reorderQuestions = useQuestionListStore(
    (state) => state.reorderQuestions
  );
  const sortCurrentListByAnswerStatus = useQuestionListStore(
    (state) => state.sortCurrentListByAnswerStatus
  );

  const { handleAsyncOperation } = useErrorHandler();

  // 質問並び替え
  const reorderQuestionsInList = useCallback(
    async (listId: string, fromIndex: number, toIndex: number) => {
      return await handleAsyncOperation(
        () => reorderQuestions(listId, fromIndex, toIndex),
        {
          loadingMessage: '質問を並び替え中...',
          successMessage: '質問を並び替えました',
        }
      );
    },
    [reorderQuestions, handleAsyncOperation]
  );

  // 回答状況でソート
  const sortByAnswerStatus = useCallback(async () => {
    return await handleAsyncOperation(() => sortCurrentListByAnswerStatus(), {
      loadingMessage: '質問を並び替え中...',
      successMessage: '未回答の質問を上部に移動しました',
    });
  }, [sortCurrentListByAnswerStatus, handleAsyncOperation]);

  return {
    reorderQuestionsInList,
    sortByAnswerStatus,
  };
}

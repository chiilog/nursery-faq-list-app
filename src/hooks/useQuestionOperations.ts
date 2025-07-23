/**
 * 質問操作フック
 * 質問の追加、更新、削除、回答を提供
 */

import { useCallback } from 'react';
import { useQuestionListStore } from '../stores/questionListStore';
import { useErrorHandler } from './useErrorHandler';
import type { CreateQuestionInput, UpdateQuestionInput } from '../types/data';

/**
 * 質問操作フック
 */
export function useQuestionOperations() {
  // パフォーマンス最適化：必要なアクションのみを選択的に購読
  const addQuestion = useQuestionListStore((state) => state.addQuestion);
  const updateQuestion = useQuestionListStore((state) => state.updateQuestion);
  const deleteQuestion = useQuestionListStore((state) => state.deleteQuestion);
  const answerQuestion = useQuestionListStore((state) => state.answerQuestion);

  const { handleAsyncOperation } = useErrorHandler();

  // 質問追加
  const addQuestionToList = useCallback(
    async (listId: string, input: CreateQuestionInput) => {
      return await handleAsyncOperation(() => addQuestion(listId, input), {
        loadingMessage: '質問を追加中...',
        successMessage: '質問を追加しました',
      });
    },
    [addQuestion, handleAsyncOperation]
  );

  // 質問更新
  const updateQuestionInList = useCallback(
    async (
      listId: string,
      questionId: string,
      updates: UpdateQuestionInput
    ) => {
      return await handleAsyncOperation(
        () => updateQuestion(listId, questionId, updates),
        {
          loadingMessage: '質問を更新中...',
          successMessage: '質問を更新しました',
        }
      );
    },
    [updateQuestion, handleAsyncOperation]
  );

  // 質問削除
  const deleteQuestionFromList = useCallback(
    async (listId: string, questionId: string) => {
      return await handleAsyncOperation(
        () => deleteQuestion(listId, questionId),
        {
          loadingMessage: '質問を削除中...',
          successMessage: '質問を削除しました',
        }
      );
    },
    [deleteQuestion, handleAsyncOperation]
  );

  // 質問回答
  const answerQuestionInList = useCallback(
    async (listId: string, questionId: string, answer: string) => {
      return await handleAsyncOperation(
        () => answerQuestion(listId, questionId, answer),
        {
          loadingMessage: '回答を保存中...',
          successMessage: answer.trim()
            ? '回答を保存しました'
            : '回答をクリアしました',
        }
      );
    },
    [answerQuestion, handleAsyncOperation]
  );

  return {
    addQuestionToList,
    updateQuestionInList,
    deleteQuestionFromList,
    answerQuestionInList,
  };
}

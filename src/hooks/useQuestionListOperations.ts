/**
 * 質問リスト操作フック
 * CRUD操作を提供
 */

import { useCallback } from 'react';
import { useQuestionListStore } from '../stores/questionListStore';
import { useErrorHandler } from './useErrorHandler';
import type {
  CreateQuestionListInput,
  UpdateQuestionListInput,
} from '../types/data';

/**
 * 質問リスト操作フック
 */
export function useQuestionListOperations() {
  // パフォーマンス最適化：必要なアクションのみを選択的に購読
  const createQuestionList = useQuestionListStore(
    (state) => state.createQuestionList
  );
  const updateQuestionList = useQuestionListStore(
    (state) => state.updateQuestionList
  );
  const deleteQuestionList = useQuestionListStore(
    (state) => state.deleteQuestionList
  );
  const setCurrentList = useQuestionListStore((state) => state.setCurrentList);

  const { handleAsyncOperation } = useErrorHandler();

  // 質問リスト作成
  const createList = useCallback(
    async (input: CreateQuestionListInput) => {
      return await handleAsyncOperation(() => createQuestionList(input), {
        loadingMessage: '質問リストを作成中...',
        successMessage: '質問リストを作成しました',
      });
    },
    [createQuestionList, handleAsyncOperation]
  );

  // 質問リスト更新
  const updateList = useCallback(
    async (id: string, updates: UpdateQuestionListInput) => {
      return await handleAsyncOperation(() => updateQuestionList(id, updates), {
        loadingMessage: '質問リストを更新中...',
        successMessage: '質問リストを更新しました',
      });
    },
    [updateQuestionList, handleAsyncOperation]
  );

  // 質問リスト削除
  const deleteList = useCallback(
    async (id: string) => {
      return await handleAsyncOperation(() => deleteQuestionList(id), {
        loadingMessage: '質問リストを削除中...',
        successMessage: '質問リストを削除しました',
      });
    },
    [deleteQuestionList, handleAsyncOperation]
  );

  // 現在の質問リスト設定
  const selectList = useCallback(
    async (id: string | null) => {
      return await handleAsyncOperation(() => setCurrentList(id), {
        loadingMessage: id ? '質問リストを読み込み中...' : undefined,
      });
    },
    [setCurrentList, handleAsyncOperation]
  );

  return {
    // CRUD操作
    createList,
    updateList,
    deleteList,
    selectList,
  };
}

/**
 * 質問リストデータ管理フック
 * 質問リストの状態とデータアクセスを提供
 */

import { useEffect } from 'react';
import { useQuestionListStore } from '../stores/questionListStore';
import { useErrorHandler } from './useErrorHandler';

/**
 * 質問リストデータフック
 */
export function useQuestionListData() {
  // パフォーマンス最適化：必要な状態のみを選択的に購読
  const questionLists = useQuestionListStore((state) => state.questionLists);
  const currentList = useQuestionListStore((state) => state.currentList);
  const loading = useQuestionListStore((state) => state.loading);
  const loadQuestionLists = useQuestionListStore(
    (state) => state.loadQuestionLists
  );

  const { handleError } = useErrorHandler();

  // 初期データ読み込み
  useEffect(() => {
    void handleError(loadQuestionLists, {
      successMessage: '質問リストを読み込みました',
    });
  }, [handleError, loadQuestionLists]);

  return {
    // データ状態
    questionLists,
    currentList,
    loading,
  };
}

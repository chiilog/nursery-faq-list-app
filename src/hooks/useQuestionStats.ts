/**
 * 質問統計用カスタムフック
 * 質問リストの統計情報を計算・提供
 */

import { useCallback } from 'react';
import { useQuestionListStore } from '../stores/questionListStore';

/**
 * 質問統計フック
 */
export function useQuestionStats() {
  const { currentList, getQuestionListStats } = useQuestionListStore();

  // 統計情報取得
  const getListStats = useCallback(
    (listId?: string) => {
      const targetId = listId || currentList?.id;
      if (!targetId) return null;

      return getQuestionListStats(targetId);
    },
    [currentList?.id, getQuestionListStats]
  );

  // 現在のリストの統計情報
  const currentListStats = currentList ? getListStats(currentList.id) : null;

  return {
    // 統計情報
    currentListStats,
    getListStats,
  };
}

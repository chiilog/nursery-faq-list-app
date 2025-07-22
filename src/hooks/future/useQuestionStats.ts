/**
 * 質問統計用カスタムフック
 * 質問リストの統計情報を計算・提供
 */

import { useCallback } from 'react';
import { useQuestionListManagement } from '../useQuestionListManagement';
import type { QuestionListStats, Question } from '../../types';

/**
 * 質問統計フック
 */
export function useQuestionStats() {
  const { currentList, questionLists } = useQuestionListManagement();

  // 統計情報計算
  const calculateStats = useCallback((questions: Question[]) => {
    const total = questions.length;
    const answered = questions.filter((q) => q.isAnswered).length;
    const unanswered = total - answered;
    const progress = total > 0 ? Math.round((answered / total) * 100) : 0;

    return { total, answered, unanswered, progress };
  }, []);

  // 統計情報取得
  const getListStats = useCallback(
    (listId?: string): QuestionListStats | null => {
      const targetList = listId
        ? questionLists.find((list) => list.id === listId)
        : currentList;

      if (!targetList) return null;

      return calculateStats(targetList.questions);
    },
    [currentList, questionLists, calculateStats]
  );

  // 現在のリストの統計情報
  const currentListStats = currentList
    ? calculateStats(currentList.questions)
    : null;

  return {
    // 統計情報
    currentListStats,
    getListStats,
  };
}

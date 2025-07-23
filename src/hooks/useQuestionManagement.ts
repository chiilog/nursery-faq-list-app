/**
 * 質問管理用カスタムフック
 * 個別質問の管理操作を提供
 */

import { useQuestionOperations } from './useQuestionOperations';
import { useQuestionSort } from './useQuestionSort';

/**
 * 質問管理フック
 */
export function useQuestionManagement() {
  const operations = useQuestionOperations();
  const sortOperations = useQuestionSort();

  return {
    // 質問操作
    ...operations,

    // ソート操作
    ...sortOperations,
  };
}

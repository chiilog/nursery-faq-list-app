/**
 * 質問リスト管理用カスタムフック
 * 質問リストの基本的な管理操作を提供
 */

import { useQuestionListData } from './useQuestionListData';
import { useQuestionListOperations } from './useQuestionListOperations';

/**
 * 質問リスト管理フック
 */
export function useQuestionListManagement() {
  const data = useQuestionListData();
  const operations = useQuestionListOperations();

  return {
    // データ状態
    ...data,

    // CRUD操作
    ...operations,
  };
}

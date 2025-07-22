/**
 * 質問管理用カスタムフック
 * 個別質問の管理操作を提供
 */

import { useQuestionCRUD } from './useQuestionCRUD';
import { useQuestionSort } from './useQuestionSort';

/**
 * 質問管理フック
 */
export function useQuestionManagement() {
  const crudOperations = useQuestionCRUD();
  const sortOperations = useQuestionSort();

  return {
    // CRUD操作
    ...crudOperations,

    // ソート操作
    ...sortOperations,
  };
}

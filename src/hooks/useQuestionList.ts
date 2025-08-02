/**
 * 質問リスト操作用カスタムフック（MVP版）
 * MVPに必要な基本機能のみを提供
 */

import { useQuestionListManagement } from './useQuestionListManagement';
import { useQuestionOperations } from './useQuestionOperations';

/**
 * 質問リスト操作フック（MVP版）
 * 基本的な質問リスト管理と質問操作のみを提供
 */
export function useQuestionList() {
  const listManagement = useQuestionListManagement();
  const questionOperations = useQuestionOperations();

  return {
    // データ状態
    questionLists: listManagement.questionLists,
    currentList: listManagement.currentList,
    loading: listManagement.loading,

    // リスト管理操作
    createList: listManagement.createList,
    updateList: listManagement.updateList,
    deleteList: listManagement.deleteList,
    selectList: listManagement.selectList,

    // 質問管理操作
    addQuestionToList: questionOperations.addQuestionToList,
    updateQuestionInList: questionOperations.updateQuestionInList,
    deleteQuestionFromList: questionOperations.deleteQuestionFromList,
    answerQuestionInList: questionOperations.answerQuestionInList,
  };
}

/**
 * 質問リスト操作用カスタムフック（統合版）
 * 各機能別フックを統合して従来のAPIを維持
 */

import { useQuestionListManagement } from './useQuestionListManagement';
import { useQuestionManagement } from './useQuestionManagement';
import { useTemplateManagement } from './useTemplateManagement';
import { useQuestionSearch } from './useQuestionSearch';
import { useQuestionStats } from './useQuestionStats';

/**
 * 質問リスト操作フック（統合版）
 * 既存のAPIを維持しながら、内部的に責務を分割
 */
export function useQuestionList() {
  const listManagement = useQuestionListManagement();
  const questionManagement = useQuestionManagement();
  const templateManagement = useTemplateManagement();
  const questionSearch = useQuestionSearch();
  const questionStats = useQuestionStats();

  return {
    // データ状態
    questionLists: listManagement.questionLists,
    currentList: listManagement.currentList,
    templates: templateManagement.templates,
    loading: listManagement.loading,
    currentListStats: questionStats.currentListStats,

    // リスト管理操作
    createList: listManagement.createList,
    updateList: listManagement.updateList,
    deleteList: listManagement.deleteList,
    selectList: listManagement.selectList,

    // 質問管理操作
    addQuestionToList: questionManagement.addQuestionToList,
    updateQuestionInList: questionManagement.updateQuestionInList,
    deleteQuestionFromList: questionManagement.deleteQuestionFromList,
    answerQuestionInList: questionManagement.answerQuestionInList,
    reorderQuestionsInList: questionManagement.reorderQuestionsInList,
    sortByAnswerStatus: questionManagement.sortByAnswerStatus,

    // テンプレート管理操作
    loadAvailableTemplates: templateManagement.loadAvailableTemplates,
    createListFromTemplate: templateManagement.createListFromTemplate,

    // ユーティリティ
    getListStats: questionStats.getListStats,
    searchLists: questionSearch.searchLists,
    searchTemplates: questionSearch.searchTemplates,
    searchQuestionsInCurrentList: questionSearch.searchQuestionsInCurrentList,
  };
}

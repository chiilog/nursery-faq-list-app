/**
 * 質問リスト操作用カスタムフック
 * 質問リストの基本的なCRUD操作を提供
 */

import { useCallback, useEffect } from "react";
import { useQuestionListStore } from "../stores/questionListStore";
import { useErrorHandler } from "./useErrorHandler";
import type {
  CreateQuestionListInput,
  UpdateQuestionListInput,
  CreateQuestionInput,
  UpdateQuestionInput,
} from "../types/data";

/**
 * 質問リスト操作フック
 */
export function useQuestionList() {
  const {
    questionLists,
    currentList,
    loading,
    templates,
    loadQuestionLists,
    createQuestionList,
    updateQuestionList,
    deleteQuestionList,
    setCurrentList,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    answerQuestion,
    reorderQuestions,
    loadTemplates,
    createFromTemplate,
    getQuestionListStats,
    sortCurrentListByAnswerStatus,
  } = useQuestionListStore();

  const { handleError, handleAsyncOperation } = useErrorHandler();

  // 初期データ読み込み
  useEffect(() => {
    handleError(loadQuestionLists, {
      successMessage: "質問リストを読み込みました",
    });
  }, [handleError, loadQuestionLists]);

  // 質問リスト作成
  const createList = useCallback(async (input: CreateQuestionListInput) => {
    return await handleAsyncOperation(
      () => createQuestionList(input),
      {
        loadingMessage: "質問リストを作成中...",
        successMessage: "質問リストを作成しました",
      }
    );
  }, [createQuestionList, handleAsyncOperation]);

  // 質問リスト更新
  const updateList = useCallback(async (id: string, updates: UpdateQuestionListInput) => {
    return await handleAsyncOperation(
      () => updateQuestionList(id, updates),
      {
        loadingMessage: "質問リストを更新中...",
        successMessage: "質問リストを更新しました",
      }
    );
  }, [updateQuestionList, handleAsyncOperation]);

  // 質問リスト削除
  const deleteList = useCallback(async (id: string) => {
    return await handleAsyncOperation(
      () => deleteQuestionList(id),
      {
        loadingMessage: "質問リストを削除中...",
        successMessage: "質問リストを削除しました",
      }
    );
  }, [deleteQuestionList, handleAsyncOperation]);

  // 現在の質問リスト設定
  const selectList = useCallback(async (id: string | null) => {
    return await handleAsyncOperation(
      () => setCurrentList(id),
      {
        loadingMessage: id ? "質問リストを読み込み中..." : undefined,
      }
    );
  }, [setCurrentList, handleAsyncOperation]);

  // 質問追加
  const addQuestionToList = useCallback(async (listId: string, input: CreateQuestionInput) => {
    return await handleAsyncOperation(
      () => addQuestion(listId, input),
      {
        loadingMessage: "質問を追加中...",
        successMessage: "質問を追加しました",
      }
    );
  }, [addQuestion, handleAsyncOperation]);

  // 質問更新
  const updateQuestionInList = useCallback(async (
    listId: string,
    questionId: string,
    updates: UpdateQuestionInput
  ) => {
    return await handleAsyncOperation(
      () => updateQuestion(listId, questionId, updates),
      {
        loadingMessage: "質問を更新中...",
        successMessage: "質問を更新しました",
      }
    );
  }, [updateQuestion, handleAsyncOperation]);

  // 質問削除
  const deleteQuestionFromList = useCallback(async (listId: string, questionId: string) => {
    return await handleAsyncOperation(
      () => deleteQuestion(listId, questionId),
      {
        loadingMessage: "質問を削除中...",
        successMessage: "質問を削除しました",
      }
    );
  }, [deleteQuestion, handleAsyncOperation]);

  // 質問回答
  const answerQuestionInList = useCallback(async (
    listId: string,
    questionId: string,
    answer: string
  ) => {
    return await handleAsyncOperation(
      () => answerQuestion(listId, questionId, answer),
      {
        loadingMessage: "回答を保存中...",
        successMessage: answer.trim() ? "回答を保存しました" : "回答をクリアしました",
      }
    );
  }, [answerQuestion, handleAsyncOperation]);

  // 質問並び替え
  const reorderQuestionsInList = useCallback(async (
    listId: string,
    fromIndex: number,
    toIndex: number
  ) => {
    return await handleAsyncOperation(
      () => reorderQuestions(listId, fromIndex, toIndex),
      {
        loadingMessage: "質問を並び替え中...",
        successMessage: "質問を並び替えました",
      }
    );
  }, [reorderQuestions, handleAsyncOperation]);

  // 回答状況でソート
  const sortByAnswerStatus = useCallback(async () => {
    return await handleAsyncOperation(
      () => sortCurrentListByAnswerStatus(),
      {
        loadingMessage: "質問を並び替え中...",
        successMessage: "未回答の質問を上部に移動しました",
      }
    );
  }, [sortCurrentListByAnswerStatus, handleAsyncOperation]);

  // テンプレート読み込み
  const loadAvailableTemplates = useCallback(async () => {
    return await handleAsyncOperation(
      () => loadTemplates(),
      {
        loadingMessage: "テンプレートを読み込み中...",
      }
    );
  }, [loadTemplates, handleAsyncOperation]);

  // テンプレートから作成
  const createListFromTemplate = useCallback(async (
    templateId: string,
    customizations: CreateQuestionListInput
  ) => {
    return await handleAsyncOperation(
      () => createFromTemplate(templateId, customizations),
      {
        loadingMessage: "テンプレートから質問リストを作成中...",
        successMessage: "テンプレートから質問リストを作成しました",
      }
    );
  }, [createFromTemplate, handleAsyncOperation]);

  // 統計情報取得
  const getListStats = useCallback((listId?: string) => {
    const targetId = listId || currentList?.id;
    if (!targetId) return null;
    
    return getQuestionListStats(targetId);
  }, [currentList?.id, getQuestionListStats]);

  // 現在のリストの統計情報
  const currentListStats = currentList ? getListStats(currentList.id) : null;

  // 質問リストの検索・フィルタリング
  const searchLists = useCallback((query: string) => {
    if (!query.trim()) return questionLists;
    
    const lowercaseQuery = query.toLowerCase();
    return questionLists.filter(list =>
      list.title.toLowerCase().includes(lowercaseQuery) ||
      list.nurseryName?.toLowerCase().includes(lowercaseQuery) ||
      list.questions.some(q => 
        q.text.toLowerCase().includes(lowercaseQuery) ||
        q.answer?.toLowerCase().includes(lowercaseQuery)
      )
    );
  }, [questionLists]);

  // テンプレートの検索・フィルタリング
  const searchTemplates = useCallback((query: string) => {
    if (!query.trim()) return templates;
    
    const lowercaseQuery = query.toLowerCase();
    return templates.filter(template =>
      template.title.toLowerCase().includes(lowercaseQuery) ||
      template.questions.some(q => q.text.toLowerCase().includes(lowercaseQuery))
    );
  }, [templates]);

  // 質問の検索・フィルタリング
  const searchQuestionsInCurrentList = useCallback((query: string) => {
    if (!currentList || !query.trim()) return currentList?.questions || [];
    
    const lowercaseQuery = query.toLowerCase();
    return currentList.questions.filter(question =>
      question.text.toLowerCase().includes(lowercaseQuery) ||
      question.answer?.toLowerCase().includes(lowercaseQuery) ||
      question.category?.toLowerCase().includes(lowercaseQuery)
    );
  }, [currentList]);

  return {
    // データ状態
    questionLists,
    currentList,
    templates,
    loading,
    currentListStats,

    // CRUD操作
    createList,
    updateList,
    deleteList,
    selectList,

    // 質問操作
    addQuestionToList,
    updateQuestionInList,
    deleteQuestionFromList,
    answerQuestionInList,
    reorderQuestionsInList,
    sortByAnswerStatus,

    // テンプレート操作
    loadAvailableTemplates,
    createListFromTemplate,

    // ユーティリティ
    getListStats,
    searchLists,
    searchTemplates,
    searchQuestionsInCurrentList,
  };
}
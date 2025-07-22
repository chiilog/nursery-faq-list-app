/**
 * 質問検索用カスタムフック
 * 質問リスト、テンプレート、質問の検索機能を提供
 */

import { useCallback } from 'react';
import { useQuestionListStore } from '../stores/questionListStore';

/**
 * 質問検索フック
 */
export function useQuestionSearch() {
  const { questionLists, templates, currentList } = useQuestionListStore();

  // 共通検索ユーティリティ
  const createSearchFunction = useCallback(
    <T>(items: T[], searchFields: (item: T) => string[]) =>
      (query: string): T[] => {
        if (!query.trim()) return items;

        const lowercaseQuery = query.toLowerCase();
        return items.filter((item) =>
          searchFields(item).some((field) =>
            field?.toLowerCase().includes(lowercaseQuery)
          )
        );
      },
    []
  );

  // 質問リストの検索・フィルタリング
  const searchLists = useCallback(
    (query: string) => {
      return createSearchFunction(questionLists, (list) => [
        list.title,
        list.nurseryName || '',
        ...list.questions.flatMap((q) => [q.text, q.answer || '']),
      ])(query);
    },
    [questionLists, createSearchFunction]
  );

  // テンプレートの検索・フィルタリング
  const searchTemplates = useCallback(
    (query: string) => {
      return createSearchFunction(templates, (template) => [
        template.title,
        ...template.questions.map((q) => q.text),
      ])(query);
    },
    [templates, createSearchFunction]
  );

  // 質問の検索・フィルタリング
  const searchQuestionsInCurrentList = useCallback(
    (query: string) => {
      if (!currentList) return [];

      return createSearchFunction(currentList.questions, (question) => [
        question.text,
        question.answer || '',
        question.category || '',
      ])(query);
    },
    [currentList, createSearchFunction]
  );

  return {
    // 検索機能
    searchLists,
    searchTemplates,
    searchQuestionsInCurrentList,
    createSearchFunction,
  };
}

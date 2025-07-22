/**
 * テンプレート管理用カスタムフック
 * 質問リストテンプレート関連の管理操作を提供
 */

import { useCallback } from 'react';
import { useQuestionListStore } from '../stores/questionListStore';
import { useErrorHandler } from './useErrorHandler';
import type { CreateQuestionListInput } from '../types/data';

/**
 * テンプレート管理フック
 */
export function useTemplateManagement() {
  const { templates, loadTemplates, createFromTemplate } =
    useQuestionListStore();

  const { handleAsyncOperation } = useErrorHandler();

  // テンプレート読み込み
  const loadAvailableTemplates = useCallback(async () => {
    return await handleAsyncOperation(() => loadTemplates(), {
      loadingMessage: 'テンプレートを読み込み中...',
    });
  }, [loadTemplates, handleAsyncOperation]);

  // テンプレートから作成
  const createListFromTemplate = useCallback(
    async (templateId: string, customizations: CreateQuestionListInput) => {
      return await handleAsyncOperation(
        () => createFromTemplate(templateId, customizations),
        {
          loadingMessage: 'テンプレートから質問リストを作成中...',
          successMessage: 'テンプレートから質問リストを作成しました',
        }
      );
    },
    [createFromTemplate, handleAsyncOperation]
  );

  return {
    // データ状態
    templates,

    // テンプレート操作
    loadAvailableTemplates,
    createListFromTemplate,
  };
}

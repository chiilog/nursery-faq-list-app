/**
 * テンプレート管理用カスタムフック
 * 質問リストテンプレート関連の管理操作を提供
 */

import { useCallback } from 'react';
import type { CreateQuestionListInput } from '../../types';
import { EMPTY_TEMPLATES } from '../../constants/templates';

/**
 * テンプレート管理フック
 */
export function useTemplateManagement() {
  // テンプレート読み込み
  const loadAvailableTemplates = useCallback(() => {
    // 将来実装予定
    return EMPTY_TEMPLATES;
  }, []);

  // テンプレートから作成
  const createListFromTemplate = useCallback(
    (_templateId: string, _customizations: CreateQuestionListInput) => {
      // TODO: テンプレートから作成機能を実装
      return null;
    },
    []
  );

  return {
    // データ状態
    templates: EMPTY_TEMPLATES,

    // テンプレート操作
    loadAvailableTemplates,
    createListFromTemplate,
  };
}

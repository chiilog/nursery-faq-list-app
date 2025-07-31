/**
 * テンプレート管理用カスタムフック
 * 質問リストテンプレート関連の管理操作を提供
 */

import { useCallback } from 'react';
import type { QuestionList, CreateQuestionListInput } from '../../types';

// テンプレートは将来実装予定のため、空配列で初期化（定数として定義）
const EMPTY_TEMPLATES: QuestionList[] = [];

/**
 * テンプレート管理フック
 */
export function useTemplateManagement() {
  const templates = EMPTY_TEMPLATES;

  // テンプレート読み込み
  const loadAvailableTemplates = useCallback(() => {
    // 将来実装予定
    return templates;
  }, [templates]);

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
    templates,

    // テンプレート操作
    loadAvailableTemplates,
    createListFromTemplate,
  };
}

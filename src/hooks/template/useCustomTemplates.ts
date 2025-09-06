import { useState, useCallback } from 'react';
import type { Template } from '../../types/entities';
import {
  getCustomTemplates,
  saveCustomTemplate,
} from '../../services/template/templateService';
import { handleError } from '../../utils/errorHandler';

/**
 * @description カスタムテンプレートの状態管理フック
 */
export const useCustomTemplates = () => {
  const [customTemplates, setCustomTemplates] = useState<Template[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // 保存処理用の状態（読み込み状態とは分離）
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const loadTemplates = useCallback(() => {
    setLoadingTemplates(true);
    setLoadError(null);

    try {
      const result = getCustomTemplates();
      setCustomTemplates(result);
    } catch (err: unknown) {
      const errorMessage = 'カスタムテンプレートの読み込みに失敗しました';
      setLoadError(errorMessage);
      handleError(errorMessage, err);
    } finally {
      setLoadingTemplates(false);
    }
  }, []);

  const saveTemplate = useCallback(
    (templateData: { name: string; questions: string[] }) => {
      setSavingTemplate(true);
      setSaveError(null);
      try {
        const newTemplate: Template = {
          id: crypto.randomUUID(),
          name: templateData.name,
          questions: templateData.questions,
          isSystem: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        const { id, isSystem, ...templateToSave } = newTemplate;
        saveCustomTemplate(templateToSave);

        // 保存後にテンプレート一覧を再読み込み
        loadTemplates();

        return newTemplate;
      } catch (err) {
        const errorMessage = 'テンプレートの保存に失敗しました';
        setSaveError(errorMessage);
        handleError(errorMessage, err);
        throw err;
      } finally {
        setSavingTemplate(false);
      }
    },
    [loadTemplates]
  );

  // 統合されたローディング状態（読み込み中または保存中）
  const loading = loadingTemplates || savingTemplate;
  // 統合されたエラー状態（読み込みエラーまたは保存エラー）
  const error = loadError || saveError;

  return {
    customTemplates,
    loading,
    error,
    saveTemplate,
    loadTemplates,
  };
};

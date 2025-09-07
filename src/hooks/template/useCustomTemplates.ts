import { useState, useCallback } from 'react';
import type { Template } from '../../types/entities';
import {
  getCustomTemplates,
  saveCustomTemplate,
} from '../../services/template/templateService';
import { handleError } from '../../utils/errorHandler';

/**
 * @description テンプレートデータのバリデーションと正規化を行う
 * @param templateData - バリデーション対象のデータ
 * @returns 正規化されたデータ
 * @throws バリデーションエラーの場合
 */
const validateAndNormalizeTemplate = (templateData: {
  name: string;
  questions: string[];
}) => {
  const trimmedName = templateData.name.trim();
  if (!trimmedName) {
    throw new Error('テンプレート名を入力してください');
  }

  const normalizedQuestions = Array.from(
    new Set(
      templateData.questions.map((q) => q.trim()).filter((q) => q.length > 0)
    )
  );

  if (normalizedQuestions.length === 0) {
    throw new Error('質問を1つ以上入力してください');
  }

  return {
    name: trimmedName,
    questions: normalizedQuestions,
  };
};

/**
 * @description カスタムテンプレートの状態管理フック
 */
export const useCustomTemplates = () => {
  const [customTemplates, setCustomTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTemplates = useCallback(() => {
    setLoading(true);
    setError(null);

    try {
      const result = getCustomTemplates();
      setCustomTemplates(result);
    } catch (err: unknown) {
      const errorMessage = 'カスタムテンプレートの読み込みに失敗しました';
      setError(errorMessage);
      handleError(errorMessage, err);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveTemplate = useCallback(
    (templateData: { name: string; questions: string[] }) => {
      setLoading(true);
      setError(null);

      try {
        const normalizedData = validateAndNormalizeTemplate(templateData);

        const newTemplate: Template = {
          id: crypto.randomUUID(),
          name: normalizedData.name,
          questions: normalizedData.questions,
          isSystem: false,
          createdBy: 'current-user', // TODO: 実際のユーザーIDを設定
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const { id, isSystem, ...templateToSave } = newTemplate;
        saveCustomTemplate(templateToSave);

        // 楽観的更新
        setCustomTemplates((prev) => [...prev, newTemplate]);

        return newTemplate;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'テンプレートの保存に失敗しました';
        setError(errorMessage);
        handleError(errorMessage, err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    customTemplates,
    loading,
    error,
    saveTemplate,
    loadTemplates,
  };
};

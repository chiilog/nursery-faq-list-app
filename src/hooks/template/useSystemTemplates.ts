import { useState, useCallback } from 'react';
import type { Template } from '../../types/entities';
import { getSystemTemplates } from '../../services/template/templateService';
import { handleError } from '../../utils/errorHandler';

/**
 * @description システムテンプレートの状態管理フック
 */
export const useSystemTemplates = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTemplates = useCallback(() => {
    setLoading(true);
    setError(null);

    try {
      const result = getSystemTemplates();
      setTemplates(result);
    } catch (err: unknown) {
      setError('システムテンプレートの読み込みに失敗しました');
      handleError('システムテンプレートの読み込みに失敗しました', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    templates,
    loading,
    error,
    loadTemplates,
  };
};

import { useState, useCallback } from 'react';
import type { Template } from '../../types/entities';
import { TemplateService } from '../../services/template/templateService';
import { handleError } from '../../utils/errorHandler';

export const useSystemTemplates = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTemplates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const systemTemplates = await TemplateService.getSystemTemplates();
      setTemplates(systemTemplates);
    } catch (err) {
      const errorMessage = 'システムテンプレートの読み込みに失敗しました';
      setError(errorMessage);
      handleError(errorMessage, err);
    } finally {
      setLoading(false);
    }
  }, []);

  return { templates, loading, error, loadTemplates };
};

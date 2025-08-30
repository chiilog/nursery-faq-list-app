import { useState, useCallback } from 'react';
import type { Template } from '../../types/entities';
import { TemplateService } from '../../services/template/templateService';
import { handleError } from '../../utils/errorHandler';

export const useCustomTemplates = () => {
  const [customTemplates, setCustomTemplates] = useState<Template[]>([]);

  const saveTemplate = useCallback(
    async (templateData: { name: string; questions: string[] }) => {
      try {
        const newTemplate: Template = {
          id: crypto.randomUUID(),
          name: templateData.name,
          questions: templateData.questions,
          isSystem: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await TemplateService.saveCustomTemplate(newTemplate);
        setCustomTemplates((prev) => [...prev, newTemplate]);
        return newTemplate;
      } catch (err) {
        const errorMessage = 'テンプレートの保存に失敗しました';
        handleError(errorMessage, err);
        throw err;
      }
    },
    []
  );

  const loadCustomTemplates = useCallback(async () => {
    try {
      const templates = await TemplateService.getCustomTemplates();
      setCustomTemplates(templates);
    } catch (err) {
      handleError('カスタムテンプレートの読み込みに失敗しました', err);
    }
  }, []);

  return { customTemplates, saveTemplate, loadCustomTemplates };
};

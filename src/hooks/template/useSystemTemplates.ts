import { useState, useCallback, useRef, useEffect } from 'react';
import type { Template } from '../../types/entities';
import { TemplateService } from '../../services/template/templateService';
import { handleError } from '../../utils/errorHandler';

export const useSystemTemplates = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    // クリーンアップ関数でフラグをfalseに設定
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const loadTemplates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const systemTemplates = await TemplateService.getSystemTemplates();
      // コンポーネントがマウントされている場合のみ状態を更新
      if (isMountedRef.current) {
        setTemplates(systemTemplates);
      }
    } catch (err) {
      const errorMessage = 'システムテンプレートの読み込みに失敗しました';
      if (isMountedRef.current) {
        setError(errorMessage);
      }
      handleError(errorMessage, err);
    } finally {
      // コンポーネントがマウントされている場合のみ状態を更新
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  return { templates, loading, error, loadTemplates };
};

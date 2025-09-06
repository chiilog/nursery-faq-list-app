import { useState, useCallback, useRef, useEffect } from 'react';
import type { Template } from '../../types/entities';
import {
  type TemplateService,
  createTemplateService,
} from '../../services/template/templateService';
import { handleError } from '../../utils/errorHandler';

/**
 * @description システムテンプレートの状態管理フック
 * 直接useTemplateStateを使用してシンプルな実装
 */
export const useSystemTemplates = (
  templateService: Pick<
    TemplateService,
    'getSystemTemplates'
  > = createTemplateService()
) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const loadTemplates = useCallback(async () => {
    // 前のリクエストをキャンセル
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // 新しいAbortControllerを作成
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setLoading(true);
    setError(null);

    try {
      const result = await templateService.getSystemTemplates(
        abortController.signal
      );

      // リクエストがキャンセルされていない場合のみ状態を更新
      if (!abortController.signal.aborted) {
        setTemplates(result);
      }
    } catch (err: unknown) {
      // AbortErrorの場合は何もしない（正常なキャンセル）
      if (err instanceof DOMException && err.name === 'AbortError') {
        return;
      }

      // リクエストがキャンセルされていない場合のみエラー状態を更新
      if (!abortController.signal.aborted) {
        setError('システムテンプレートの読み込みに失敗しました');
        handleError('システムテンプレートの読み込みに失敗しました', err);
      }
    } finally {
      // リクエストがキャンセルされていない場合のみloading状態を更新
      if (!abortController.signal.aborted) {
        setLoading(false);
      }
    }
  }, [templateService]);

  return {
    templates,
    loading,
    error,
    loadTemplates,
  };
};

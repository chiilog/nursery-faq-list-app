/**
 * エラーハンドリング用カスタムフック
 * 統一されたエラー処理とユーザーフレンドリーなエラーメッセージ
 * 新旧両アーキテクチャ対応
 */

import { useCallback, useMemo } from 'react';
import { useQuestionListStore } from '../stores/questionListStore';
import { useNurseryStore } from '../stores/nurseryStore';
import type { AppError } from '../stores/questionListStore';
import { getErrorMessage } from '../utils/errorMessages';
import {
  getErrorSeverity,
  isRetryable,
  isCriticalError,
  isUserActionError,
} from '../utils/errorClassification';
import {
  handleError,
  handleErrorWithRetry,
  handleAsyncOperation,
  type ErrorHandlerOptions,
  type RetryErrorHandlerOptions,
  type AsyncOperationOptions,
} from '../utils/errorOperations';

type StoreType = 'nursery' | 'questionList' | 'both';

interface UseErrorHandlerOptions {
  store?: StoreType;
}

/**
 * エラーハンドリング用フック
 * 新旧両アーキテクチャに対応し、優先度に基づいてエラーを表示
 */
export function useErrorHandler(options: UseErrorHandlerOptions = {}) {
  const { store = 'both' } = options;
  
  const nurseryStore = useNurseryStore();
  const questionListStore = useQuestionListStore();

  // エラーと clearError を統合管理
  const { error, clearError } = useMemo(() => {
    if (store === 'nursery') {
      return {
        error: nurseryStore.error,
        clearError: nurseryStore.clearError,
      };
    }
    
    if (store === 'questionList') {
      return {
        error: questionListStore.error,
        clearError: questionListStore.clearError,
      };
    }

    // 'both' の場合は nurseryStore を優先（新アーキテクチャ優先）
    const primaryError = nurseryStore.error || questionListStore.error;
    const clearAllErrors = () => {
      nurseryStore.clearError();
      questionListStore.clearError();
    };

    return {
      error: primaryError,
      clearError: clearAllErrors,
    };
  }, [store, nurseryStore, questionListStore]);

  // ユーザーフレンドリーなエラーメッセージを取得
  const getUserFriendlyMessage = useCallback((error: AppError): string => {
    return getErrorMessage(error.code, error.message);
  }, []);

  // エラー処理のヘルパー関数
  const handleErrorOperation = useCallback(
    async (operation: () => Promise<void>, options?: ErrorHandlerOptions) => {
      return handleError(operation, clearError, options);
    },
    [clearError]
  );

  // 再試行機能付きエラーハンドリング
  const handleRetryOperation = useCallback(
    async (
      operation: () => Promise<void>,
      maxRetries: number = 3,
      options?: RetryErrorHandlerOptions
    ) => {
      return handleErrorWithRetry(operation, clearError, maxRetries, options);
    },
    [clearError]
  );

  // ローディング中のエラーハンドリング
  const handleAsync = useCallback(
    async <T>(
      operation: () => Promise<T>,
      options?: AsyncOperationOptions<T>
    ): Promise<T | null> => {
      return handleAsyncOperation(operation, clearError, options);
    },
    [clearError]
  );

  return {
    // 現在のエラー状態
    error,
    hasError: !!error,

    // エラー情報取得
    getErrorMessage: getUserFriendlyMessage,
    getErrorSeverity,
    isRetryable,
    isCriticalError,
    isUserActionError,

    // エラー処理
    clearError,
    handleError: handleErrorOperation,
    handleErrorWithRetry: handleRetryOperation,
    handleAsyncOperation: handleAsync,
  };
}

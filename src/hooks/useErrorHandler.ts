/**
 * エラーハンドリング用カスタムフック
 * 統一されたエラー処理とユーザーフレンドリーなエラーメッセージ
 */

import { useCallback } from 'react';
import { useQuestionListStore } from '../stores/questionListStore';
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

/**
 * エラーハンドリング用フック
 */
export function useErrorHandler() {
  const { error, clearError } = useQuestionListStore();

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

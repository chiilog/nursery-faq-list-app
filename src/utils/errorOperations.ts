/**
 * エラー処理実行ロジック
 * 共通のエラーハンドリング処理を提供
 */

import type { AppError } from '../stores/questionListStore';
import { isRetryable } from './errorClassification';

/**
 * エラー処理のオプション型
 */
export interface ErrorHandlerOptions {
  successMessage?: string;
  onSuccess?: () => void;
  onError?: (error: AppError) => void;
}

/**
 * 再試行付きエラー処理のオプション型
 */
export interface RetryErrorHandlerOptions extends ErrorHandlerOptions {
  onRetry?: (attempt: number) => void;
}

/**
 * 非同期操作のオプション型
 */
export interface AsyncOperationOptions<T> {
  loadingMessage?: string;
  successMessage?: string;
  onSuccess?: (result: T) => void;
  onError?: (error: AppError) => void;
}

/**
 * 基本的なエラーハンドリング
 */
export async function handleError(
  operation: () => Promise<void>,
  clearError: () => void,
  options?: ErrorHandlerOptions
): Promise<void> {
  try {
    clearError();
    await operation();

    if (options?.successMessage) {
      // 成功メッセージの表示（将来的にToastやSnackbarで実装）
      console.log(options.successMessage);
    }

    options?.onSuccess?.();
  } catch (error) {
    const appError = error as AppError;
    options?.onError?.(appError);
  }
}

/**
 * 再試行機能付きエラーハンドリング
 */
export async function handleErrorWithRetry(
  operation: () => Promise<void>,
  clearError: () => void,
  maxRetries: number = 3,
  options?: RetryErrorHandlerOptions
): Promise<void> {
  let lastError: AppError | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      clearError();
      await operation();

      if (options?.successMessage) {
        console.log(options.successMessage);
      }

      options?.onSuccess?.();
      return;
    } catch (error) {
      lastError = error as AppError;

      if (attempt < maxRetries && isRetryable(lastError)) {
        options?.onRetry?.(attempt);
        // 指数バックオフで再試行間隔を調整
        const delay = Math.min(Math.pow(2, attempt) * 1000, 30000); // 最大30秒
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        break;
      }
    }
  }

  // 全ての再試行が失敗した場合
  if (lastError) {
    options?.onError?.(lastError);
  }
}

/**
 * ローディング中のエラーハンドリング
 */
export async function handleAsyncOperation<T>(
  operation: () => Promise<T>,
  clearError: () => void,
  options?: AsyncOperationOptions<T>
): Promise<T | null> {
  try {
    clearError();

    if (options?.loadingMessage) {
      // ローディング状態の設定（将来的にUIで表示）
      console.log(options.loadingMessage);
    }

    const result = await operation();

    if (options?.successMessage) {
      console.log(options.successMessage);
    }

    options?.onSuccess?.(result);
    return result;
  } catch (error) {
    const appError = error as AppError;
    options?.onError?.(appError);
    return null;
  }
}

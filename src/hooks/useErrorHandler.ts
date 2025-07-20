/**
 * エラーハンドリング用カスタムフック
 * 統一されたエラー処理とユーザーフレンドリーなエラーメッセージ
 */

import { useCallback } from "react";
import { useQuestionListStore } from "../stores/questionListStore";
import type { AppError } from "../stores/questionListStore";

// エラーメッセージのマッピング
const ERROR_MESSAGES: Record<string, string> = {
  // バリデーションエラー
  VALIDATION_FAILED: "入力内容に問題があります。確認してください。",
  
  // データストアエラー
  DUPLICATE_TITLE: "同じ名前の質問リストが既に存在します。",
  NOT_FOUND: "指定されたデータが見つかりません。",
  LIST_NOT_FOUND: "質問リストが見つかりません。",
  QUESTION_NOT_FOUND: "指定された質問が見つかりません。",
  TEMPLATE_NOT_FOUND: "指定されたテンプレートが見つかりません。",
  NOT_TEMPLATE: "選択されたリストはテンプレートではありません。",
  
  // 操作エラー
  CREATE_FAILED: "作成に失敗しました。もう一度お試しください。",
  UPDATE_FAILED: "更新に失敗しました。もう一度お試しください。",
  DELETE_FAILED: "削除に失敗しました。もう一度お試しください。",
  LOAD_FAILED: "データの読み込みに失敗しました。",
  SAVE_FAILED: "データの保存に失敗しました。",
  
  // ストレージエラー
  STORAGE_SAVE_FAILED: "データの保存に失敗しました。ストレージの容量を確認してください。",
  STORAGE_LOAD_FAILED: "データの読み込みに失敗しました。データが破損している可能性があります。",
  ENCRYPTION_FAILED: "データの暗号化に失敗しました。",
  DECRYPTION_FAILED: "データの復号化に失敗しました。データが破損している可能性があります。",
  
  // ネットワークエラー（将来用）
  NETWORK_ERROR: "ネットワークエラーが発生しました。接続を確認してください。",
  SYNC_FAILED: "データの同期に失敗しました。",
  
  // その他
  UNKNOWN_ERROR: "予期しないエラーが発生しました。",
};

/**
 * エラーハンドリング用フック
 */
export function useErrorHandler() {
  const { error, clearError } = useQuestionListStore();

  /**
   * ユーザーフレンドリーなエラーメッセージを取得
   */
  const getErrorMessage = useCallback((error: AppError): string => {
    if (error.code && ERROR_MESSAGES[error.code]) {
      return ERROR_MESSAGES[error.code];
    }
    
    // コードが見つからない場合は、元のメッセージを使用
    return error.message || ERROR_MESSAGES.UNKNOWN_ERROR;
  }, []);

  /**
   * エラーの重要度を判定
   */
  const getErrorSeverity = useCallback((error: AppError): "error" | "warning" | "info" => {
    if (!error.code) return "error";
    
    // 警告レベルのエラーコード
    const warningCodes = [
      "DUPLICATE_TITLE",
      "NOT_FOUND",
      "LIST_NOT_FOUND",
      "QUESTION_NOT_FOUND",
      "TEMPLATE_NOT_FOUND",
      "NOT_TEMPLATE",
    ];
    
    // 情報レベルのエラーコード
    const infoCodes = [
      "VALIDATION_FAILED",
    ];
    
    if (warningCodes.includes(error.code)) {
      return "warning";
    }
    
    if (infoCodes.includes(error.code)) {
      return "info";
    }
    
    return "error";
  }, []);

  /**
   * エラーが再試行可能かどうかを判定
   */
  const isRetryable = useCallback((error: AppError): boolean => {
    if (!error.code) return false;
    
    // 再試行可能なエラーコード
    const retryableCodes = [
      "LOAD_FAILED",
      "SAVE_FAILED",
      "CREATE_FAILED",
      "UPDATE_FAILED",
      "DELETE_FAILED",
      "STORAGE_SAVE_FAILED",
      "STORAGE_LOAD_FAILED",
      "NETWORK_ERROR",
      "SYNC_FAILED",
    ];
    
    return retryableCodes.includes(error.code);
  }, []);

  /**
   * エラー処理のヘルパー関数
   */
  const handleError = useCallback(async (
    operation: () => Promise<void>,
    options?: {
      successMessage?: string;
      onSuccess?: () => void;
      onError?: (error: AppError) => void;
    }
  ) => {
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
  }, [clearError]);

  /**
   * 再試行機能付きエラーハンドリング
   */
  const handleErrorWithRetry = useCallback(async (
    operation: () => Promise<void>,
    maxRetries: number = 3,
    options?: {
      successMessage?: string;
      onSuccess?: () => void;
      onError?: (error: AppError) => void;
      onRetry?: (attempt: number) => void;
    }
  ) => {
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
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        } else {
          break;
        }
      }
    }
    
    // 全ての再試行が失敗した場合
    if (lastError) {
      options?.onError?.(lastError);
    }
  }, [clearError, isRetryable]);

  /**
   * ローディング中のエラーハンドリング
   */
  const handleAsyncOperation = useCallback(async <T>(
    operation: () => Promise<T>,
    options?: {
      loadingMessage?: string;
      successMessage?: string;
      onSuccess?: (result: T) => void;
      onError?: (error: AppError) => void;
    }
  ): Promise<T | null> => {
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
  }, [clearError]);

  return {
    // 現在のエラー状態
    error,
    hasError: !!error,
    
    // エラー情報取得
    getErrorMessage,
    getErrorSeverity,
    isRetryable,
    
    // エラー処理
    clearError,
    handleError,
    handleErrorWithRetry,
    handleAsyncOperation,
  };
}
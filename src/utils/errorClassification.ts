/**
 * エラー分類とカテゴリ判定ロジック
 * エラーの重要度や再試行可能性を判定
 */

import type { AppError } from '../stores/questionListStore';

/**
 * エラー重要度の型定義
 */
export type ErrorSeverity = 'error' | 'warning' | 'info';

/**
 * 警告レベルのエラーコード
 */
const WARNING_ERROR_CODES = [
  'DUPLICATE_TITLE',
  'NOT_FOUND',
  'LIST_NOT_FOUND',
  'QUESTION_NOT_FOUND',
  'TEMPLATE_NOT_FOUND',
  'NOT_TEMPLATE',
] as const;

/**
 * 情報レベルのエラーコード
 */
const INFO_ERROR_CODES = ['VALIDATION_FAILED'] as const;

/**
 * 再試行可能なエラーコード
 */
const RETRYABLE_ERROR_CODES = [
  'LOAD_FAILED',
  'SAVE_FAILED',
  'CREATE_FAILED',
  'UPDATE_FAILED',
  'DELETE_FAILED',
  'STORAGE_SAVE_FAILED',
  'STORAGE_LOAD_FAILED',
  'NETWORK_ERROR',
  'SYNC_FAILED',
] as const;

/**
 * エラーの重要度を判定
 */
export function getErrorSeverity(error: AppError): ErrorSeverity {
  if (!error.code) return 'error';

  if (
    WARNING_ERROR_CODES.includes(
      error.code as (typeof WARNING_ERROR_CODES)[number]
    )
  ) {
    return 'warning';
  }

  if (
    INFO_ERROR_CODES.includes(error.code as (typeof INFO_ERROR_CODES)[number])
  ) {
    return 'info';
  }

  return 'error';
}

/**
 * エラーが再試行可能かどうかを判定
 */
export function isRetryable(error: AppError): boolean {
  if (!error.code) return false;

  return RETRYABLE_ERROR_CODES.includes(
    error.code as (typeof RETRYABLE_ERROR_CODES)[number]
  );
}

/**
 * エラーが致命的かどうかを判定
 */
export function isCriticalError(error: AppError): boolean {
  if (!error.code) return true;

  const criticalCodes = [
    'ENCRYPTION_FAILED',
    'DECRYPTION_FAILED',
    'STORAGE_LOAD_FAILED',
  ];

  return criticalCodes.includes(error.code);
}

/**
 * エラーがユーザーアクション由来かどうかを判定
 */
export function isUserActionError(error: AppError): boolean {
  if (!error.code) return false;

  const userActionCodes = [
    'VALIDATION_FAILED',
    'DUPLICATE_TITLE',
    'NOT_FOUND',
    'LIST_NOT_FOUND',
    'QUESTION_NOT_FOUND',
    'TEMPLATE_NOT_FOUND',
    'NOT_TEMPLATE',
  ];

  return userActionCodes.includes(error.code);
}

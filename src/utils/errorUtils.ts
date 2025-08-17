/**
 * エラーハンドリングユーティリティ
 *
 * TypeScript公式推奨パターンに従った統一的なエラー処理関数群です。
 * unknown型からError型への安全な変換と、一貫したエラーメッセージの提供を行います。
 */

/**
 * unknown型の値をError型に安全に変換
 *
 * TypeScript公式ドキュメント推奨の型安全なエラー変換パターンです。
 * String()コンストラクタではなく、プリミティブ型チェックを使用します。
 *
 * @param error - 変換対象のunknown値
 * @returns Error型のオブジェクト
 *
 * @example
 * ```typescript
 * try {
 *   riskyOperation();
 * } catch (error) {
 *   const safeError = ensureError(error);
 *   console.error(safeError.message);
 * }
 * ```
 */
export function ensureError(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  }

  if (typeof error === 'string') {
    return new Error(error);
  }

  if (typeof error === 'object' && error !== null && 'message' in error) {
    return new Error(String((error as { message: unknown }).message));
  }

  return new Error('Unknown error occurred');
}

/**
 * unknown型の値から安全にエラーメッセージを抽出
 *
 * ログ出力やユーザー向けメッセージに使用する文字列を
 * 型安全に抽出します。
 *
 * @param error - メッセージ抽出対象のunknown値
 * @returns エラーメッセージ文字列
 *
 * @example
 * ```typescript
 * try {
 *   riskyOperation();
 * } catch (error) {
 *   const message = getErrorMessage(error);
 *   logger.error(`Operation failed: ${message}`);
 * }
 * ```
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = (error as { message: unknown }).message;
    return typeof message === 'string' ? message : 'Unknown error';
  }

  return 'Unknown error occurred';
}

/**
 * エラーの詳細情報を含むオブジェクトを作成
 *
 * デバッグやログ記録に使用する詳細なエラー情報を提供します。
 *
 * @param error - 詳細情報取得対象のunknown値
 * @returns エラー詳細情報オブジェクト
 */
export interface ErrorDetails {
  message: string;
  name: string;
  stack?: string;
  cause?: unknown;
}

export function getErrorDetails(error: unknown): ErrorDetails {
  if (error instanceof Error) {
    return {
      message: error.message,
      name: error.name,
      stack: error.stack,
      cause: error.cause,
    };
  }

  return {
    message: getErrorMessage(error),
    name: 'UnknownError',
    stack: undefined,
    cause: error,
  };
}

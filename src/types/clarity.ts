/**
 * @description Microsoft Clarity関連の型定義
 * TypeScript Best Practiceに従い、any型を排除し型安全性を確保
 */

/**
 * @description Branded Type for Clarity Project ID
 * プロジェクトIDの型安全性を確保するためのBranded Type
 */
export type ClarityProjectId = string & {
  readonly __brand: 'ClarityProjectId';
};

/**
 * @description プロジェクトIDのバリデーション関数
 * @param id - 検証するプロジェクトID
 * @returns バリデーション済みのClarityProjectId
 * @throws {Error} 無効なプロジェクトIDの場合
 */
export function createClarityProjectId(id: string): ClarityProjectId {
  if (!id || typeof id !== 'string' || id.trim() === '') {
    throw new ClarityError(
      'INVALID_PROJECT_ID',
      '無効なClarity プロジェクトIDです'
    );
  }

  // プロジェクトIDの形式検証（英数字とハイフンのみ）
  const validIdPattern = /^[a-zA-Z0-9-]+$/;
  if (!validIdPattern.test(id.trim())) {
    throw new ClarityError(
      'INVALID_PROJECT_ID',
      'Clarity プロジェクトIDは英数字とハイフンのみ使用可能です'
    );
  }

  return id.trim() as ClarityProjectId;
}

/**
 * @description Clarityコマンド引数の型定義
 */
export interface ClarityCommandArgs {
  consent: [boolean];
  set: [string, string | number | boolean];
  stop: [];
}

/**
 * @description Clarity関数の型定義
 * 各コマンドに対応する引数を型安全に管理
 */
export type ClarityFunction = {
  <K extends keyof ClarityCommandArgs>(
    command: K,
    ...args: ClarityCommandArgs[K]
  ): void;
};

/**
 * @description WindowオブジェクトにClarityを追加した型
 */
export interface WindowWithClarity extends Window {
  clarity?: ClarityFunction;
}

/**
 * @description Clarityプロジェクト設定の型（不変性保証）
 */
export interface ClarityConfig {
  readonly projectId: ClarityProjectId;
  readonly maskTextContent: boolean;
  readonly respectDoNotTrack: boolean;
  readonly sensitiveSelectors: readonly string[];
  readonly enableDataMasking: boolean;
}

/**
 * @description Clarityサービス初期化オプション（不変性保証）
 */
export interface ClarityInitOptions {
  readonly projectId: ClarityProjectId;
  readonly enableDataMasking?: boolean;
  readonly enableTextMasking?: boolean;
  readonly respectDoNotTrack?: boolean;
  readonly sensitiveSelectors?: readonly string[];
}

/**
 * @description Clarityエラーの種類
 */
export type ClarityErrorType =
  | 'INVALID_PROJECT_ID'
  | 'SCRIPT_LOAD_FAILED'
  | 'INITIALIZATION_FAILED'
  | 'PROJECT_ID_NOT_SET'
  | 'ALREADY_DISABLED';

/**
 * @description Clarity固有のエラークラス（型安全）
 */
export class ClarityError extends Error {
  readonly type: ClarityErrorType;
  readonly originalError?: Error;

  constructor(type: ClarityErrorType, message: string, originalError?: Error) {
    super(message);
    this.name = 'ClarityError';
    this.type = type;
    this.originalError = originalError;

    // TypeScriptでのError継承対応
    Object.setPrototypeOf(this, ClarityError.prototype);
  }

  /**
   * @description エラー情報の構造化表現を取得
   */
  toJSON(): Readonly<{
    name: string;
    message: string;
    type: ClarityErrorType;
    stack?: string;
    originalError?: string;
  }> {
    return Object.freeze({
      name: this.name,
      message: this.message,
      type: this.type,
      stack: this.stack,
      originalError: this.originalError?.message,
    });
  }
}

/**
 * @description 結果型（Success | Failure）
 * 型安全なエラーハンドリングを提供する関数型パターン
 */
export type Result<T, E = ClarityError> =
  | { readonly success: true; readonly data: T }
  | { readonly success: false; readonly error: E };

/**
 * @description 成功結果を作成するヘルパー関数
 * @template T - 成功時のデータ型
 * @param data - 成功時のデータ
 * @returns 成功を表すResult型
 */
export const createSuccess = <T>(data: T): Result<T> =>
  Object.freeze({ success: true, data });

/**
 * @description 失敗結果を作成するヘルパー関数
 * @template T - 期待されるデータ型（エラー時は使用されない）
 * @param error - エラーオブジェクト
 * @returns 失敗を表すResult型
 */
export const createFailure = <T>(error: ClarityError): Result<T> =>
  Object.freeze({ success: false, error });

/**
 * @description Result型の値を安全に処理するためのユーティリティ関数
 * @template T - 成功時のデータ型
 * @template U - 変換後のデータ型
 * @param result - 処理するResult
 * @param onSuccess - 成功時の処理関数
 * @param onFailure - 失敗時の処理関数
 * @returns 変換後の値
 */
export const mapResult = <T, U>(
  result: Result<T>,
  onSuccess: (data: T) => U,
  onFailure: (error: ClarityError) => U
): U => {
  return result.success ? onSuccess(result.data) : onFailure(result.error);
};

/**
 * @description Result型をチェーンするためのユーティリティ関数（モナド的操作）
 * @template T - 元の成功時のデータ型
 * @template U - 変換後の成功時のデータ型
 * @param result - チェーン元のResult
 * @param fn - 変換関数（成功時のみ実行）
 * @returns 変換後のResult
 */
export const chainResult = <T, U>(
  result: Result<T>,
  fn: (data: T) => Result<U>
): Result<U> => {
  return result.success ? fn(result.data) : result;
};

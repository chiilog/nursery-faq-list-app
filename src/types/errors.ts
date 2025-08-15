/**
 * アプリケーション共通エラークラス
 *
 * エラー処理の一貫性とコードの重複排除を目的とした
 * 基底エラークラスと特化クラスの階層構造
 */

export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * データストア関連のエラー
 */
export class DataStoreError extends AppError {
  constructor(message: string, code: string, cause?: Error) {
    super(message, code, cause);
    this.name = 'DataStoreError';
  }
}

/**
 * 暗号化サービス関連のエラー
 */
export class CryptoServiceError extends AppError {
  constructor(message: string, code: string, cause?: Error) {
    super(message, code, cause);
    this.name = 'CryptoServiceError';
  }
}

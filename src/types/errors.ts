/**
 * アプリケーション共通エラークラス
 *
 * エラー処理の一貫性とコードの重複排除を目的とした
 * 基底エラークラスと特化クラスの階層構造
 */

/**
 * アプリケーション基底エラークラス
 *
 * すべてのカスタムエラーの基底となるクラス。
 * エラーコードと原因エラーの情報を含む統一的なエラー処理を提供する。
 *
 * @example
 * ```typescript
 * throw new AppError(
 *   'データの処理に失敗しました',
 *   'DATA_PROCESSING_FAILED',
 *   originalError
 * );
 * ```
 */
export class AppError extends Error {
  /**
   * AppErrorインスタンスを作成する
   *
   * @param message - エラーメッセージ
   * @param code - エラーコード（ログ・監視用）
   * @param cause - 原因となったエラー（オプション）
   */
  constructor(
    message: string,
    public readonly code: string,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = 'AppError';
    // 継承チェーンを安定させる
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * データストア関連のエラー
 *
 * データの保存、読み込み、削除などのストレージ操作で発生するエラーを表す。
 *
 * @example
 * ```typescript
 * throw new DataStoreError(
 *   'ストレージへの保存に失敗しました',
 *   'STORAGE_WRITE_FAILED',
 *   originalError
 * );
 * ```
 */
export class DataStoreError extends AppError {
  /**
   * DataStoreErrorインスタンスを作成する
   *
   * @param message - エラーメッセージ
   * @param code - エラーコード
   * @param cause - 原因となったエラー（オプション）
   */
  constructor(message: string, code: string, cause?: Error) {
    super(message, code, cause);
    this.name = 'DataStoreError';
  }
}

/**
 * 暗号化サービス関連のエラー
 *
 * データの暗号化、復号化、キー管理などの暗号化操作で発生するエラーを表す。
 *
 * @example
 * ```typescript
 * throw new CryptoServiceError(
 *   'データの復号化に失敗しました',
 *   'DECRYPTION_FAILED',
 *   originalError
 * );
 * ```
 */
export class CryptoServiceError extends AppError {
  /**
   * CryptoServiceErrorインスタンスを作成する
   *
   * @param message - エラーメッセージ
   * @param code - エラーコード
   * @param cause - 原因となったエラー（オプション）
   */
  constructor(message: string, code: string, cause?: Error) {
    super(message, code, cause);
    this.name = 'CryptoServiceError';
  }
}

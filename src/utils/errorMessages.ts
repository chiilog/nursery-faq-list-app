/**
 * エラーメッセージの定義とマッピング
 * アプリケーション全体で使用するエラーメッセージを一元管理
 */

/**
 * エラーコードとユーザーフレンドリーなメッセージのマッピング
 */
export const ERROR_MESSAGES: Record<string, string> = {
  // バリデーションエラー
  VALIDATION_FAILED: '入力内容に問題があります。確認してください。',

  // データストアエラー
  DUPLICATE_TITLE: '同じ名前の質問リストが既に存在します。',
  NOT_FOUND: '指定されたデータが見つかりません。',
  LIST_NOT_FOUND: '質問リストが見つかりません。',
  QUESTION_NOT_FOUND: '指定された質問が見つかりません。',
  TEMPLATE_NOT_FOUND: '指定されたテンプレートが見つかりません。',
  NOT_TEMPLATE: '選択されたリストはテンプレートではありません。',

  // 操作エラー
  CREATE_FAILED: '作成に失敗しました。もう一度お試しください。',
  UPDATE_FAILED: '更新に失敗しました。もう一度お試しください。',
  DELETE_FAILED: '削除に失敗しました。もう一度お試しください。',
  LOAD_FAILED: 'データの読み込みに失敗しました。',
  SAVE_FAILED: 'データの保存に失敗しました。',

  // ストレージエラー
  STORAGE_SAVE_FAILED:
    'データの保存に失敗しました。ストレージの容量を確認してください。',
  STORAGE_LOAD_FAILED:
    'データの読み込みに失敗しました。データが破損している可能性があります。',
  ENCRYPTION_FAILED: 'データの暗号化に失敗しました。',
  DECRYPTION_FAILED:
    'データの復号化に失敗しました。データが破損している可能性があります。',

  // ネットワークエラー（将来用）
  NETWORK_ERROR: 'ネットワークエラーが発生しました。接続を確認してください。',
  SYNC_FAILED: 'データの同期に失敗しました。',

  // その他
  UNKNOWN_ERROR: '予期しないエラーが発生しました。',
} as const;

/**
 * エラーコードからユーザーフレンドリーなメッセージを取得
 */
export function getErrorMessage(
  errorCode?: string,
  fallbackMessage?: string
): string {
  if (errorCode && ERROR_MESSAGES[errorCode]) {
    return ERROR_MESSAGES[errorCode];
  }

  return fallbackMessage || ERROR_MESSAGES.UNKNOWN_ERROR;
}

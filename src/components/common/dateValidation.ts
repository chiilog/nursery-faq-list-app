/**
 * 日付バリデーション共通関数
 */

/**
 * 見学日のバリデーション（任意項目）
 */
export const validateVisitDate = (
  visitDate: Date | null
): string | undefined => {
  if (!visitDate) {
    return undefined; // null/undefinedは有効（任意項目のため）
  }

  // Dateオブジェクトが有効かチェック
  if (isNaN(visitDate.getTime())) {
    return '有効な日付を入力してください';
  }

  // 過去の日付チェック（今日以降のみ許可）
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dateValue = new Date(visitDate);
  dateValue.setHours(0, 0, 0, 0);

  if (dateValue < today) {
    return '見学日は今日以降の日付を入力してください';
  }

  return undefined;
};

/**
 * 見学日のバリデーション（utils/validation.ts互換版）
 * 1年制限付き、「選択してください」文言版
 */
export const validateVisitDateLegacy = (
  visitDate: Date
): string | undefined => {
  // Dateオブジェクトが有効かチェック
  if (isNaN(visitDate.getTime())) {
    return '有効な日付を入力してください';
  }

  const now = new Date();
  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(now.getFullYear() + 1);

  if (visitDate < now) {
    return '見学日は今日以降の日付を選択してください';
  }

  if (visitDate > oneYearFromNow) {
    return '見学日は1年以内の日付を選択してください';
  }

  return undefined;
};

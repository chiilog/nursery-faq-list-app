/**
 * 日付フォーマットユーティリティ
 */

/**
 * 日付を見やすい形式（YYYY/M/D）にフォーマット
 * @param date フォーマットする日付
 * @throws {Error} 無効な日付が渡された場合
 */
export const formatDate = (date: Date): string => {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    throw new Error('formatDateに無効な日付が渡されました');
  }
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
};

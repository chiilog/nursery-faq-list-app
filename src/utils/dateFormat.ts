/**
 * 日付フォーマットユーティリティ
 */

/**
 * 日付を見やすい形式（YYYY/M/D）にフォーマット
 */
export const formatDate = (date: Date): string => {
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
};

/**
 * 保育園名バリデーション関数
 */

/**
 * 保育園名のバリデーション（必須項目版）
 * @param name 保育園名
 * @returns エラーメッセージ（エラーがない場合はundefined）
 */
export const validateNurseryName = (name: string): string | undefined => {
  const trimmedName = name.trim();

  if (!name) {
    return '保育園名は必須です';
  }

  if (trimmedName.length === 0) {
    return '保育園名は1文字以上で入力してください';
  }

  if (name.length > 100) {
    return '保育園名は100文字以内で入力してください';
  }

  return undefined;
};

/**
 * 保育園名のバリデーション（任意項目版）
 * @param name 保育園名
 * @returns エラーメッセージ（エラーがない場合はundefined）
 */
export const validateNurseryNameOptional = (
  name: string
): string | undefined => {
  // 空文字列は許可（任意項目のため）
  if (!name || name.trim().length === 0) {
    return undefined;
  }

  if (name.length > 100) {
    return '保育園名は100文字以内で入力してください';
  }

  return undefined;
};

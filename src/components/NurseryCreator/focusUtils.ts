/**
 * フォーカス管理ユーティリティ
 */

import type { ValidationErrors } from './types';

export const focusFirstErrorField = (
  errors: ValidationErrors,
  nameInputRef: React.RefObject<HTMLInputElement | null>,
  visitDateInputRef: React.RefObject<HTMLInputElement | null>
) => {
  try {
    if (errors.name && nameInputRef.current) {
      nameInputRef.current.focus();
    } else if (errors.visitDate && visitDateInputRef.current) {
      visitDateInputRef.current.focus();
    }
  } catch {
    // フォーカス設定エラーを無視（テスト環境での互換性のため）
  }
};

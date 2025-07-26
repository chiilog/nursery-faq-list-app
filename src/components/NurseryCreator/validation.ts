/**
 * NurseryCreatorのバリデーションロジック
 */

import type { FormData, ValidationErrors } from './types';

export const validateNurseryForm = (formData: FormData): ValidationErrors => {
  const errors: ValidationErrors = {};

  // 保育園名のバリデーション
  const trimmedName = formData.name.trim();
  if (!formData.name) {
    errors.name = '保育園名は必須です';
  } else if (trimmedName.length === 0) {
    errors.name = '保育園名は1文字以上で入力してください';
  } else if (formData.name.length > 100) {
    errors.name = '保育園名は100文字以内で入力してください';
  }

  // 見学日のバリデーション（任意項目）
  if (formData.visitDate.trim()) {
    // 日付が入力されている場合のみバリデーション
    const dateValue = new Date(formData.visitDate);
    if (isNaN(dateValue.getTime())) {
      errors.visitDate = '有効な日付を入力してください';
    } else {
      // 過去の日付チェック（今日以降のみ許可）
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      dateValue.setHours(0, 0, 0, 0);

      if (dateValue < today) {
        errors.visitDate = '見学日は今日以降の日付を入力してください';
      }
    }
  }

  return errors;
};

export const hasValidationErrors = (errors: ValidationErrors): boolean => {
  return Object.keys(errors).length > 0;
};

/**
 * NurseryCreatorのバリデーションロジック
 */

import type { FormData, ValidationErrors } from './types';

/**
 * 日付文字列の妥当性をチェック
 * HTML5 date inputが受け入れない極端な日付を検出
 */
const isValidDateString = (dateString: string): boolean => {
  // YYYY-MM-DD形式の基本チェック
  const datePattern = /^\d{4}-\d{2}-\d{2}$/;
  if (!datePattern.test(dateString)) {
    return false;
  }

  const [year, month, day] = dateString.split('-').map(Number);

  // 極端に大きな年や小さな年の検出
  // より現実的な範囲に制限（1900-2100年）
  if (year < 1900 || year > 2100) {
    return false;
  }

  // 月の範囲チェック
  if (month < 1 || month > 12) {
    return false;
  }

  // 日の範囲チェック
  if (day < 1 || day > 31) {
    return false;
  }

  // 実際の日付として妥当かチェック
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
};

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

    // 無効な日付の検出を強化
    if (isNaN(dateValue.getTime()) || !isValidDateString(formData.visitDate)) {
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

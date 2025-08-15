/**
 * バリデーション関数
 * データ入力時の検証ロジック
 */

import type {
  CreateQuestionInput,
  UpdateQuestionInput,
  Question,
} from '../types/data';

// バリデーション制限値の定数定義
export const VALIDATION_LIMITS = {
  QUESTION_TEXT_MAX_LENGTH: 500,
  ANSWER_TEXT_MAX_LENGTH: 1000,
  NURSERY_NAME_MAX_LENGTH: 100,
} as const;

// エラーメッセージの型定義
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * 質問テキストのバリデーション
 */
export function validateQuestionText(text: string): ValidationResult {
  const errors: string[] = [];

  if (!text || text.trim().length === 0) {
    errors.push('質問内容を入力してください');
  }

  if (text.trim().length > VALIDATION_LIMITS.QUESTION_TEXT_MAX_LENGTH) {
    errors.push(
      `質問内容は${VALIDATION_LIMITS.QUESTION_TEXT_MAX_LENGTH}文字以内で入力してください`
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * 回答テキストのバリデーション
 */
export function validateAnswerText(answer: string): ValidationResult {
  const errors: string[] = [];

  if (answer.trim().length > VALIDATION_LIMITS.ANSWER_TEXT_MAX_LENGTH) {
    errors.push(
      `回答は${VALIDATION_LIMITS.ANSWER_TEXT_MAX_LENGTH}文字以内で入力してください`
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * 保育園名のバリデーション
 * @param name 保育園名
 * @param required 必須項目かどうか（デフォルト: false）
 * @returns ValidationResult
 */
export function validateNurseryName(
  name: string,
  required: boolean = false
): ValidationResult {
  const errors: string[] = [];
  const trimmedName = name.trim();

  if (required && trimmedName.length === 0) {
    errors.push('保育園名は必須です');
  }

  if (trimmedName.length > VALIDATION_LIMITS.NURSERY_NAME_MAX_LENGTH) {
    errors.push(
      `保育園名は${VALIDATION_LIMITS.NURSERY_NAME_MAX_LENGTH}文字以内で入力してください`
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * 保育園名のシンプルバリデーション（エラーメッセージのみ返す）
 * @param name 保育園名
 * @param required 必須項目かどうか（デフォルト: false - 元の関数と一貫性を保つため）
 * @returns エラーメッセージ（エラーがない場合はundefined）
 */
export function validateNurseryNameSimple(
  name: string,
  required: boolean = false
): string | undefined {
  const result = validateNurseryName(name, required);
  return result.errors[0];
}

/**
 * 見学日のバリデーション
 * @param date 見学日（nullの場合は任意項目として扱う）
 * @param required 必須項目かどうか（デフォルト: false）
 * @returns ValidationResult
 */
export function validateVisitDate(
  date: Date | null,
  required: boolean = false
): ValidationResult {
  const errors: string[] = [];

  // nullチェック
  if (!date) {
    if (required) {
      errors.push('見学日は必須です');
    }
    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Dateオブジェクトの有効性チェック
  if (isNaN(date.getTime())) {
    errors.push('有効な日付を入力してください');
    return {
      isValid: false,
      errors,
    };
  }

  // 日付範囲のチェック
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dateValue = new Date(date);
  dateValue.setHours(0, 0, 0, 0);

  if (dateValue < today) {
    errors.push('見学日は今日以降の日付を入力してください');
  }

  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(today.getFullYear() + 1);
  oneYearFromNow.setHours(0, 0, 0, 0);
  if (dateValue > oneYearFromNow) {
    errors.push('見学日は1年以内の日付を選択してください');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * 見学日のシンプルバリデーション（エラーメッセージのみ返す）
 * @param date 見学日
 * @param required 必須項目かどうか
 * @returns エラーメッセージ（エラーがない場合はundefined）
 */
export function validateVisitDateSimple(
  date: Date | null,
  required: boolean = false
): string | undefined {
  const result = validateVisitDate(date, required);
  return result.errors[0];
}

/**
 * 質問作成入力のバリデーション
 */
export function validateCreateQuestionInput(
  input: CreateQuestionInput
): ValidationResult {
  const textValidation = validateQuestionText(input.text);

  return {
    isValid: textValidation.isValid,
    errors: textValidation.errors,
  };
}

/**
 * 質問更新入力のバリデーション
 */
export function validateUpdateQuestionInput(
  input: UpdateQuestionInput
): ValidationResult {
  const errors: string[] = [];

  if (input.text !== undefined) {
    const textValidation = validateQuestionText(input.text);
    errors.push(...textValidation.errors);
  }

  if (input.answer !== undefined && input.answer.trim().length > 0) {
    const answerValidation = validateAnswerText(input.answer);
    errors.push(...answerValidation.errors);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * 質問オブジェクト全体のバリデーション
 */
export function validateQuestion(question: Question): ValidationResult {
  const errors: string[] = [];

  const textValidation = validateQuestionText(question.text);
  errors.push(...textValidation.errors);

  if (question.answer && question.answer.trim().length > 0) {
    const answerValidation = validateAnswerText(question.answer);
    errors.push(...answerValidation.errors);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

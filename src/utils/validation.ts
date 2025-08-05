/**
 * バリデーション関数
 * データ入力時の検証ロジック
 */

import type {
  CreateQuestionInput,
  UpdateQuestionInput,
  Question,
} from '../types/data';

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

  if (text.trim().length > 500) {
    errors.push('質問内容は500文字以内で入力してください');
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

  if (answer.trim().length > 1000) {
    errors.push('回答は1000文字以内で入力してください');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * 保育園名のバリデーション
 */
export function validateNurseryName(name: string): ValidationResult {
  const errors: string[] = [];

  if (name && name.trim().length > 100) {
    errors.push('保育園名は100文字以内で入力してください');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * 見学日のバリデーション
 */
export function validateVisitDate(date: Date): ValidationResult {
  const errors: string[] = [];
  const now = new Date();
  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(now.getFullYear() + 1);

  if (date < now) {
    errors.push('見学日は今日以降の日付を選択してください');
  }

  if (date > oneYearFromNow) {
    errors.push('見学日は1年以内の日付を選択してください');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
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

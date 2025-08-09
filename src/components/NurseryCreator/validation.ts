/**
 * NurseryCreatorのバリデーションロジック
 */

import {
  validateNurseryNameSimple,
  validateVisitDateSimple,
} from '../../utils/validation';
import type { FormData, ValidationErrors } from './types';

export const validateNurseryForm = (formData: FormData): ValidationErrors => {
  const errors: ValidationErrors = {};

  // 保育園名のバリデーション（必須）
  const nameError = validateNurseryNameSimple(formData.name, true);
  if (nameError) {
    errors.name = nameError;
  }

  // 見学日のバリデーション（任意項目）
  const visitDateError = validateVisitDateSimple(formData.visitDate, false);
  if (visitDateError) {
    errors.visitDate = visitDateError;
  }
  return errors;
};

export const hasValidationErrors = (errors: ValidationErrors): boolean => {
  return Object.keys(errors).length > 0;
};

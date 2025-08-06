/**
 * NurseryCreatorのバリデーションロジック
 */

import { validateVisitDate } from '../common/dateValidation';
import { validateNurseryName } from '../common/nameValidation';
import type { FormData, ValidationErrors } from './types';

export const validateNurseryForm = (formData: FormData): ValidationErrors => {
  const errors: ValidationErrors = {};

  // 保育園名のバリデーション
  const nameError = validateNurseryName(formData.name);
  if (nameError) {
    errors.name = nameError;
  }

  // 見学日のバリデーション（任意項目）
  const visitDateError = validateVisitDate(formData.visitDate);
  if (visitDateError) {
    errors.visitDate = visitDateError;
  }
  return errors;
};

export const hasValidationErrors = (errors: ValidationErrors): boolean => {
  return Object.keys(errors).length > 0;
};

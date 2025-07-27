/**
 * フォームフィールドコンポーネント
 */

import { Input, Field } from '@chakra-ui/react';
import type { FormData, ValidationErrors } from './types';

interface FormFieldsProps {
  formData: FormData;
  validationErrors: ValidationErrors;
  onInputChange: (
    field: keyof FormData
  ) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  isDisabled: boolean;
  nameInputRef: React.RefObject<HTMLInputElement | null>;
  visitDateInputRef: React.RefObject<HTMLInputElement | null>;
}

export const FormFields = ({
  formData,
  validationErrors,
  onInputChange,
  isDisabled,
  nameInputRef,
  visitDateInputRef,
}: FormFieldsProps) => {
  return (
    <div>
      {/* 保育園名 */}
      <Field.Root invalid={!!validationErrors.name} mb={5}>
        <Field.Label htmlFor="nursery-name" mb={1}>
          保育園名
          <Field.RequiredIndicator />
        </Field.Label>
        <Input
          id="nursery-name"
          ref={nameInputRef}
          value={formData.name}
          onChange={onInputChange('name')}
          placeholder="保育園名を入力してください"
          disabled={isDisabled}
          required
          size="lg"
          borderRadius="md"
        />
        {validationErrors.name && (
          <Field.ErrorText mt={2}>{validationErrors.name}</Field.ErrorText>
        )}
      </Field.Root>

      {/* 見学日 */}
      <Field.Root invalid={!!validationErrors.visitDate}>
        <Field.Label htmlFor="nursery-visit-date" mb={1}>
          見学日
        </Field.Label>
        <Input
          id="nursery-visit-date"
          ref={visitDateInputRef}
          type="date"
          value={formData.visitDate}
          onChange={onInputChange('visitDate')}
          disabled={isDisabled}
          size="lg"
          borderRadius="md"
        />
        <Field.HelperText mt={1} color="gray.600" fontSize="sm">
          見学日が未定の場合は空欄のまま保存してください
        </Field.HelperText>
        {validationErrors.visitDate && (
          <Field.ErrorText mt={2}>{validationErrors.visitDate}</Field.ErrorText>
        )}
      </Field.Root>
    </div>
  );
};

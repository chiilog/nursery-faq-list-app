/**
 * フォームフィールドコンポーネント
 */

import { VisitDatePicker } from '../../shared/VisitDatePicker';
import { NurseryNameInput } from '../../shared/NurseryNameInput';
import type { FormData, ValidationErrors } from './types';

interface FormFieldsProps {
  formData: FormData;
  validationErrors: ValidationErrors;
  onNameChange: (value: string) => void;
  onDateChange: (date: Date | null) => void;
  isDisabled: boolean;
  nameInputRef: React.RefObject<HTMLInputElement | null>;
}

export const FormFields = ({
  formData,
  validationErrors,
  onNameChange,
  onDateChange,
  isDisabled,
  nameInputRef,
}: FormFieldsProps) => {
  return (
    <div>
      {/* 保育園名 */}
      <NurseryNameInput
        value={formData.name}
        onChange={onNameChange}
        label="保育園名"
        isRequired={true}
        disabled={isDisabled}
        isInvalid={!!validationErrors.name}
        errorMessage={validationErrors.name}
        id="nursery-name"
        ref={nameInputRef}
      />

      {/* 見学日 */}
      <VisitDatePicker
        selectedDate={formData.visitDate}
        onChange={onDateChange}
        label="見学日"
        placeholder="見学日を選択してください"
        disabled={isDisabled}
        isInvalid={!!validationErrors.visitDate}
        errorMessage={validationErrors.visitDate}
        helperText="見学日が未定の場合は空欄のまま保存してください"
        id="nursery-visit-date"
      />
    </div>
  );
};

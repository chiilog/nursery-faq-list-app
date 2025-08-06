/**
 * 保育園追加コンポーネント（リファクタリング版）
 * 責務を分割して保守性を向上
 */

import { Box } from '@chakra-ui/react';
import { useState, useRef } from 'react';
import { useNurseryStore } from '../../stores/nurseryStore';
import type { CreateNurseryInput } from '../../types/data';

import { ErrorDisplay } from './ErrorDisplay';
import { LoadingDisplay } from './LoadingDisplay';
import { FormFields } from './FormFields';
import { FormActions } from './FormActions';
import { validateNurseryForm, hasValidationErrors } from './validation';
import { validateVisitDate } from '../common/dateValidation';
import { focusFirstErrorField } from './focusUtils';
import type { NurseryCreatorProps, FormData, ValidationErrors } from './types';

/**
 * 保育園追加フォームコンポーネント
 */
export const NurseryCreator = ({ onCancel }: NurseryCreatorProps) => {
  const { createNursery, clearError, loading, error } = useNurseryStore();

  const [formData, setFormData] = useState<FormData>({
    name: '',
    visitDate: null,
  });

  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );

  // フォーカス管理用のref
  const nameInputRef = useRef<HTMLInputElement>(null);

  const validateForm = (): boolean => {
    const errors = validateNurseryForm(formData);
    setValidationErrors(errors);

    // エラーがある場合は最初のエラーフィールドにフォーカス
    if (hasValidationErrors(errors)) {
      focusFirstErrorField(errors, nameInputRef, null);
    }

    return !hasValidationErrors(errors);
  };

  const handleNameChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      name: value,
    }));

    // バリデーションエラーをクリア
    if (validationErrors.name) {
      setValidationErrors((prev) => ({
        ...prev,
        name: undefined,
      }));
    }
  };

  const handleDateChange = (date: Date | null) => {
    setFormData((prev) => ({
      ...prev,
      visitDate: date,
    }));

    // 日付バリデーションのみ実行
    const dateError = validateVisitDate(date);
    setValidationErrors((prev) => ({
      ...prev,
      visitDate: dateError,
    }));
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const nurseryData: CreateNurseryInput = {
        name: formData.name.trim(),
        visitDate: formData.visitDate || undefined,
      };

      const result = await createNursery(nurseryData);

      // 保存成功後はonCancelを呼び出してフォームを閉じる
      if (result) {
        onCancel();
      }
    } catch (error) {
      // エラーハンドリングはストアで管理
      console.error('保育園作成エラー:', error);
    }
  };

  return (
    <Box p={6} maxW="md" mx="auto">
      <Box mb={6}>
        <h2>新しい保育園を追加</h2>
      </Box>

      <Box mb={4}>
        <ErrorDisplay error={error} onClearError={clearError} />
      </Box>

      <Box mb={4}>
        <LoadingDisplay loading={loading} />
      </Box>

      <Box mb={6}>
        <FormFields
          formData={formData}
          validationErrors={validationErrors}
          onNameChange={handleNameChange}
          onDateChange={handleDateChange}
          isDisabled={loading.isLoading}
          nameInputRef={nameInputRef}
        />
      </Box>

      <FormActions
        onSave={() => void handleSave()}
        onCancel={onCancel}
        isDisabled={loading.isLoading}
      />
    </Box>
  );
};

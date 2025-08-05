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
import { focusFirstErrorField } from './focusUtils';
import type { NurseryCreatorProps, FormData, ValidationErrors } from './types';

/**
 * 保育園追加フォームコンポーネント
 */
export const NurseryCreator = ({ onCancel }: NurseryCreatorProps) => {
  const { createNursery, clearError, loading, error } = useNurseryStore();

  const [formData, setFormData] = useState<FormData>({
    name: '',
    visitDate: '',
  });

  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );

  // フォーカス管理用のref
  const nameInputRef = useRef<HTMLInputElement>(null);
  const visitDateInputRef = useRef<HTMLInputElement>(null);

  const validateForm = (): boolean => {
    const errors = validateNurseryForm(formData);
    setValidationErrors(errors);

    // エラーがある場合は最初のエラーフィールドにフォーカス
    if (hasValidationErrors(errors)) {
      focusFirstErrorField(errors, nameInputRef, visitDateInputRef);
    }

    return !hasValidationErrors(errors);
  };

  const handleInputChange =
    (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));

      // リアルタイムでエラーをクリア
      if (validationErrors[field as keyof ValidationErrors]) {
        setValidationErrors((prev) => ({
          ...prev,
          [field]: undefined,
        }));
      }
    };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const nurseryData: CreateNurseryInput = {
        name: formData.name.trim(),
        visitDate: formData.visitDate.trim()
          ? new Date(formData.visitDate)
          : undefined,
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
          onInputChange={handleInputChange}
          isDisabled={loading.isLoading}
          nameInputRef={nameInputRef}
          visitDateInputRef={visitDateInputRef}
        />
      </Box>

      <FormActions
        onSave={() => void handleSave()}
        onCancel={onCancel}
        isSaveDisabled={loading.isLoading}
        isCancelDisabled={false}
      />
    </Box>
  );
};

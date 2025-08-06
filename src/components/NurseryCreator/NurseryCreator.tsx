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
      const value = e.target.value;
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));

      // 日付フィールドの場合、入力時にもバリデーションを実行
      if (field === 'visitDate') {
        if (value) {
          const tempErrors = validateNurseryForm({
            ...formData,
            visitDate: value,
          });

          if (tempErrors.visitDate) {
            setValidationErrors((prev) => ({
              ...prev,
              visitDate: tempErrors.visitDate,
            }));
          } else {
            setValidationErrors((prev) => ({
              ...prev,
              visitDate: undefined,
            }));
          }
        } else {
          // 値が空の場合はエラーをクリア
          setValidationErrors((prev) => ({
            ...prev,
            visitDate: undefined,
          }));
        }
      } else if (validationErrors[field as keyof ValidationErrors]) {
        // その他のフィールドはエラーをクリア
        setValidationErrors((prev) => ({
          ...prev,
          [field]: undefined,
        }));
      }
    };

  // 日付フィールド専用のblurハンドラー
  const handleDateBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const inputElement = e.target as HTMLInputElement;
    const value = inputElement.value;

    // ブラウザが無効な値を表示している場合を検出
    // validity.badInputはブラウザが無効と判断した値を示す
    if (inputElement.validity && inputElement.validity.badInput) {
      setValidationErrors((prev) => ({
        ...prev,
        visitDate: '有効な日付を入力してください',
      }));
      return;
    }

    // 通常のバリデーション
    if (value) {
      const tempErrors = validateNurseryForm({
        ...formData,
        visitDate: value,
      });

      if (tempErrors.visitDate) {
        setValidationErrors((prev) => ({
          ...prev,
          visitDate: tempErrors.visitDate,
        }));
      } else {
        // エラーがない場合はクリア
        setValidationErrors((prev) => ({
          ...prev,
          visitDate: undefined,
        }));
      }
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
          onDateBlur={handleDateBlur}
          isDisabled={loading.isLoading}
          nameInputRef={nameInputRef}
          visitDateInputRef={visitDateInputRef}
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

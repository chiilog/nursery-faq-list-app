/**
 * 共通保育園名入力コンポーネント
 * Chakra UI Field + Input + バリデーション表示を統合
 */

import React from 'react';
import { Input, Field, Text } from '@chakra-ui/react';

interface NurseryNameInputProps {
  value: string;
  onChange: (value: string) => void;
  isRequired?: boolean;
  disabled?: boolean;
  isInvalid?: boolean;
  errorMessage?: string;
  placeholder?: string;
  label?: string;
  id?: string;
}

export const NurseryNameInput = React.forwardRef<
  HTMLInputElement,
  NurseryNameInputProps
>(
  (
    {
      value,
      onChange,
      isRequired = false,
      disabled = false,
      isInvalid = false,
      errorMessage,
      placeholder = '保育園名を入力してください',
      label,
      id,
    },
    ref
  ) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value);
    };

    // 共通のInputプロパティを定義（DRY原則）
    const inputProps = {
      id,
      ref,
      value,
      onChange: handleChange,
      placeholder,
      disabled,
      required: isRequired,
      size: 'lg' as const,
      borderRadius: 'md',
    };

    // ラベルなしの場合の追加プロパティ
    const inputWithoutLabelProps = {
      ...inputProps,
      fontSize: 'lg',
      fontWeight: 'bold',
      bg: 'white',
      'data-error': isInvalid,
    };

    // Inputコンポーネントを一度だけ定義（より簡潔に）
    const inputElement = (
      <Input {...(label ? inputProps : inputWithoutLabelProps)} />
    );

    if (label) {
      // ラベル付きの場合はField.Rootでラップ
      return (
        <Field.Root invalid={isInvalid} mb={5}>
          <Field.Label htmlFor={id} mb={1}>
            {label}
            {isRequired && <Field.RequiredIndicator />}
          </Field.Label>
          {inputElement}
          {errorMessage && (
            <Field.ErrorText mt={2}>{errorMessage}</Field.ErrorText>
          )}
        </Field.Root>
      );
    }

    // ラベルなしの場合は直接Input + エラー表示
    return (
      <>
        {inputElement}
        {isInvalid && errorMessage && (
          <Text color="red.500" fontSize="sm" mt={1}>
            {errorMessage}
          </Text>
        )}
      </>
    );
  }
);

NurseryNameInput.displayName = 'NurseryNameInput';

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

    if (label) {
      // ラベル付きの場合はField.Rootでラップ
      return (
        <Field.Root invalid={isInvalid} mb={5}>
          <Field.Label htmlFor={id} mb={1}>
            {label}
            {isRequired && <Field.RequiredIndicator />}
          </Field.Label>
          <Input
            id={id}
            ref={ref}
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            disabled={disabled}
            required={isRequired}
            size="lg"
            borderRadius="md"
          />
          {errorMessage && (
            <Field.ErrorText mt={2}>{errorMessage}</Field.ErrorText>
          )}
        </Field.Root>
      );
    }

    // ラベルなしの場合は直接Input + エラー表示
    return (
      <>
        <Input
          id={id}
          ref={ref}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          required={isRequired}
          size="lg"
          fontSize="lg"
          fontWeight="bold"
          bg="white"
          borderColor={isInvalid ? 'red.500' : undefined}
          _focus={{
            borderColor: isInvalid ? 'red.500' : undefined,
            shadow: isInvalid ? '0 0 0 1px red.500' : undefined,
          }}
          data-error={isInvalid}
        />
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

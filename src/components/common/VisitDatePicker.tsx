/**
 * VisitDatePickerコンポーネント
 * react-datepicker + Chakra UI統合
 */

import React from 'react';
import { Input, Field } from '@chakra-ui/react';
import DatePicker, { registerLocale } from 'react-datepicker';
import { ja } from 'date-fns/locale';
import 'react-datepicker/dist/react-datepicker.css';

// 日本語ロケールを登録
registerLocale('ja', ja);

interface VisitDatePickerProps {
  selectedDate: Date | null;
  onChange: (date: Date | null) => void;
  label?: string;
  isRequired?: boolean;
  placeholder?: string;
  disabled?: boolean;
  isInvalid?: boolean;
  errorMessage?: string;
  helperText?: string;
  id?: string;
}

export const VisitDatePicker = ({
  selectedDate,
  onChange,
  label,
  isRequired = false,
  placeholder = '見学日を選択してください',
  disabled = false,
  isInvalid = false,
  errorMessage,
  helperText,
  id,
}: VisitDatePickerProps) => {
  // Chakra UIのInputをreact-datepickerのcustomInputとして使用
  const CustomDateInput = React.forwardRef<
    HTMLInputElement,
    React.InputHTMLAttributes<HTMLInputElement>
  >(({ value, onClick, onChange: onInputChange, ...props }, ref) => (
    <Input
      {...props}
      ref={ref}
      value={value || ''}
      onClick={onClick}
      onChange={onInputChange}
      size="lg"
      borderRadius="md"
      placeholder={placeholder}
      disabled={disabled}
      readOnly
      tabIndex={0}
      aria-label={placeholder ?? '日付を選択'}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          // キーボードイベントの場合は直接クリックイベントを作成
          const clickEvent = new MouseEvent('click', { bubbles: true });
          e.currentTarget.dispatchEvent(clickEvent);
        }
      }}
      borderColor={isInvalid ? 'red.500' : undefined}
      _focus={{
        borderColor: isInvalid ? 'red.500' : undefined,
        shadow: isInvalid ? '0 0 0 1px red.500' : undefined,
      }}
      id={id} // 明示的にidを設定
    />
  ));

  if (label) {
    // ラベル付きの場合はField.Rootでラップ
    return (
      <Field.Root invalid={isInvalid}>
        <Field.Label htmlFor={id} mb={1}>
          {label}
          {isRequired && <Field.RequiredIndicator />}
        </Field.Label>
        <DatePicker
          selected={selectedDate}
          onChange={onChange}
          dateFormat="yyyy/MM/dd"
          minDate={new Date()}
          maxDate={new Date(2100, 11, 31)}
          customInput={<CustomDateInput />}
          isClearable
          disabled={disabled}
          locale="ja"
          id={id}
        />
        {helperText && (
          <Field.HelperText mt={1} color="gray.600" fontSize="sm">
            {helperText}
          </Field.HelperText>
        )}
        {errorMessage && (
          <Field.ErrorText mt={2}>{errorMessage}</Field.ErrorText>
        )}
      </Field.Root>
    );
  }

  // ラベルなしの場合はDatePickerのみ
  return (
    <DatePicker
      selected={selectedDate}
      onChange={onChange}
      dateFormat="yyyy/MM/dd"
      minDate={new Date()}
      maxDate={new Date(2100, 11, 31)}
      customInput={<CustomDateInput />}
      isClearable
      disabled={disabled}
      locale="ja"
      id={id}
    />
  );
};

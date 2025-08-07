/**
 * フォームアクションコンポーネント（ボタン類）
 */

import { Button, HStack, VStack, type ButtonProps } from '@chakra-ui/react';

interface FormActionsProps {
  onSave: () => void;
  onCancel: () => void;
  isDisabled?: boolean;

  // 汎用化のための新しいProps
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'inline';
  layout?: 'horizontal' | 'vertical';
  saveLabel?: string;
  cancelLabel?: string;
  saveButtonProps?: Partial<ButtonProps>;
  cancelButtonProps?: Partial<ButtonProps>;
}

export const FormActions = ({
  onSave,
  onCancel,
  isDisabled = false,
  size = 'lg',
  variant = 'primary',
  layout = 'horizontal',
  saveLabel = '保存',
  cancelLabel = 'キャンセル',
  saveButtonProps,
  cancelButtonProps,
}: FormActionsProps) => {
  // バリエーション別のスタイル定義
  const isPrimary = variant === 'primary';
  const isLarge = size === 'lg';
  const isVertical = layout === 'vertical';

  const saveButtonStyles: Partial<ButtonProps> = {
    ...(isPrimary && !isVertical
      ? {
          flex: 2,
          py: isLarge ? 6 : undefined,
          fontWeight: 'bold',
          shadow: 'sm',
          _hover: {
            shadow: 'md',
            transform: 'translateY(-1px)',
          },
          _active: {
            transform: 'translateY(0)',
            shadow: 'sm',
          },
        }
      : {}),
    ...(isVertical
      ? {
          w: 'full',
          py: isLarge ? 6 : 4,
          fontWeight: 'bold',
          shadow: 'sm',
          _hover: {
            shadow: 'md',
            transform: 'translateY(-1px)',
          },
          _active: {
            transform: 'translateY(0)',
            shadow: 'sm',
          },
        }
      : {}),
  };

  const cancelButtonStyles: Partial<ButtonProps> = {
    ...(isPrimary && !isVertical
      ? {
          flex: 1,
          py: isLarge ? 6 : undefined,
          color: 'gray.600',
          _hover: {
            bg: 'gray.50',
            color: 'gray.800',
          },
          _active: {
            bg: 'gray.100',
          },
        }
      : {}),
    ...(isVertical
      ? {
          w: 'full',
          py: isLarge ? 4 : 3,
          color: 'gray.600',
          _hover: {
            bg: 'gray.50',
            color: 'gray.800',
          },
          _active: {
            bg: 'gray.100',
          },
        }
      : {}),
  };

  const Container = isVertical ? VStack : HStack;
  const containerProps = isVertical
    ? { gap: 3, align: 'stretch', w: 'full' }
    : { gap: isPrimary ? 4 : 2, justify: isPrimary ? 'stretch' : 'flex-start' };

  // 縦並びの場合は保存ボタンを上に、横並びの場合はキャンセルボタンを左に
  const buttons = isVertical ? (
    <>
      <Button
        onClick={onSave}
        disabled={isDisabled}
        colorScheme="brand"
        size={size}
        borderRadius="md"
        {...saveButtonStyles}
        {...saveButtonProps}
      >
        {saveLabel}
      </Button>
      <Button
        onClick={onCancel}
        variant="ghost"
        size={size}
        borderRadius="md"
        {...cancelButtonStyles}
        {...cancelButtonProps}
      >
        {cancelLabel}
      </Button>
    </>
  ) : (
    <>
      <Button
        onClick={onCancel}
        variant="ghost"
        size={size}
        borderRadius="md"
        {...cancelButtonStyles}
        {...cancelButtonProps}
      >
        {cancelLabel}
      </Button>
      <Button
        onClick={onSave}
        disabled={isDisabled}
        colorScheme="brand"
        size={size}
        borderRadius="md"
        {...saveButtonStyles}
        {...saveButtonProps}
      >
        {saveLabel}
      </Button>
    </>
  );

  return <Container {...containerProps}>{buttons}</Container>;
};

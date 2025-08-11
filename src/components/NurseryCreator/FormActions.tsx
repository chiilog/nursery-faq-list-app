/**
 * フォームアクションコンポーネント（ボタン類）
 * KISS原則に従い、用途別のシンプルなコンポーネントに分割
 */

import { Button, HStack, VStack } from '@chakra-ui/react';
import type { ButtonProps } from '@chakra-ui/react';

// 共通のボタンスタイル
const commonButtonStyles = {
  borderRadius: 'md',
};

const primarySaveButtonStyles = {
  ...commonButtonStyles,
  flex: 2,
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
};

const primaryCancelButtonStyles = {
  ...commonButtonStyles,
  flex: 1,
  color: 'gray.600',
  _hover: {
    bg: 'gray.50',
    color: 'gray.800',
  },
  _active: {
    bg: 'gray.100',
  },
};

// 基本的なProps型
interface FormActionsProps {
  onSave: () => void;
  onCancel: () => void;
  isDisabled?: boolean;
  saveLabel?: string;
  cancelLabel?: string;
  size?: ButtonProps['size'];
}

/**
 * プライマリフォーム用アクション（メインフォーム用）
 */
export const PrimaryFormActions = ({
  onSave,
  onCancel,
  isDisabled = false,
  saveLabel = '保存',
  cancelLabel = 'キャンセル',
  size = 'lg',
}: FormActionsProps) => {
  return (
    <HStack gap={4} justify="space-between">
      <Button
        onClick={onCancel}
        variant="outline"
        size={size}
        data-size={size}
        {...primaryCancelButtonStyles}
      >
        {cancelLabel}
      </Button>
      <Button
        onClick={onSave}
        disabled={isDisabled}
        colorPalette="brand"
        size={size}
        data-size={size}
        {...primarySaveButtonStyles}
      >
        {saveLabel}
      </Button>
    </HStack>
  );
};

/**
 * インライン編集用アクション（小さめ、横並び）
 */
export const InlineFormActions = ({
  onSave,
  onCancel,
  isDisabled = false,
  saveLabel = '保存',
  cancelLabel = 'キャンセル',
  size = 'sm',
}: FormActionsProps) => {
  return (
    <HStack gap={2}>
      <Button
        onClick={onCancel}
        variant="ghost"
        size={size}
        data-size={size}
        {...commonButtonStyles}
      >
        {cancelLabel}
      </Button>
      <Button
        onClick={onSave}
        disabled={isDisabled}
        colorPalette="brand"
        size={size}
        data-size={size}
        {...commonButtonStyles}
      >
        {saveLabel}
      </Button>
    </HStack>
  );
};

/**
 * 縦並びフォーム用アクション（モバイル用）
 */
export const VerticalFormActions = ({
  onSave,
  onCancel,
  isDisabled = false,
  saveLabel = '保存',
  cancelLabel = 'キャンセル',
  size = 'lg',
}: FormActionsProps) => {
  return (
    <VStack gap={3} align="stretch" w="full">
      <Button
        onClick={onSave}
        disabled={isDisabled}
        colorPalette="brand"
        size={size}
        data-size={size}
        {...primarySaveButtonStyles}
        flex={undefined} // flex設定をリセット
        w="full"
      >
        {saveLabel}
      </Button>
      <Button
        onClick={onCancel}
        variant="outline"
        size={size}
        data-size={size}
        {...primaryCancelButtonStyles}
        flex={undefined} // flex設定をリセット
        w="full"
        py={3} // 縦並びでは異なるパディングを維持
      >
        {cancelLabel}
      </Button>
    </VStack>
  );
};

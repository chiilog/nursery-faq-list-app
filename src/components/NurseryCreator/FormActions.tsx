/**
 * フォームアクションコンポーネント（ボタン類）
 * KISS原則に従い、用途別のシンプルなコンポーネントに分割
 */

import { Button, HStack, VStack } from '@chakra-ui/react';
import type { ButtonProps } from '@chakra-ui/react';
import { APP_CONFIG } from '../../constants/app';

// 共通のボタンスタイル
const commonButtonStyles = {
  borderRadius: 'md',
};

const primarySaveButtonStyles = {
  ...commonButtonStyles,
  flex: 2,
  fontWeight: 'bold',
  shadow: 'sm',
  bgColor: APP_CONFIG.COLORS.PRIMARY,
};

const primaryCancelButtonStyles = {
  ...commonButtonStyles,
  flex: 1,
  bgColor: APP_CONFIG.COLORS.PRIMARY_LIGHT,
  color: APP_CONFIG.COLORS.PRIMARY_DARK,
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
        variant="subtle"
        size={size}
        data-size={size}
        {...primaryCancelButtonStyles}
      >
        {cancelLabel}
      </Button>
      <Button
        onClick={onSave}
        disabled={isDisabled}
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
        variant="subtle"
        size={size}
        data-size={size}
        {...commonButtonStyles}
        bgColor={APP_CONFIG.COLORS.PRIMARY_LIGHT}
        color={APP_CONFIG.COLORS.PRIMARY_DARK}
      >
        {cancelLabel}
      </Button>
      <Button
        onClick={onSave}
        disabled={isDisabled}
        size={size}
        data-size={size}
        bgColor={APP_CONFIG.COLORS.PRIMARY}
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
        variant="subtle"
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

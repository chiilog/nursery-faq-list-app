/**
 * フォームアクションコンポーネント（ボタン類）
 * KISS原則に従い、用途別のシンプルなコンポーネントに分割
 */

import { Button, HStack, VStack } from '@chakra-ui/react';

// 共通のボタンスタイル
const commonButtonStyles = {
  borderRadius: 'md',
};

const primarySaveButtonStyles = {
  ...commonButtonStyles,
  flex: 2,
  py: 6,
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
  py: 6,
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
interface BaseFormActionsProps {
  onSave: () => void;
  onCancel: () => void;
  isDisabled?: boolean;
  saveLabel?: string;
  cancelLabel?: string;
  size?: 'sm' | 'md' | 'lg';
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
}: BaseFormActionsProps) => {
  return (
    <HStack gap={4} justify="stretch">
      <Button
        onClick={onCancel}
        variant="outline"
        size={size}
        {...primaryCancelButtonStyles}
      >
        {cancelLabel}
      </Button>
      <Button
        onClick={onSave}
        disabled={isDisabled}
        colorScheme="brand"
        size={size}
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
}: BaseFormActionsProps) => {
  return (
    <HStack gap={2}>
      <Button
        onClick={onCancel}
        variant="ghost"
        size={size}
        {...commonButtonStyles}
      >
        {cancelLabel}
      </Button>
      <Button
        onClick={onSave}
        disabled={isDisabled}
        colorScheme="brand"
        size={size}
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
}: BaseFormActionsProps) => {
  return (
    <VStack gap={3} align="stretch" w="full">
      <Button
        onClick={onSave}
        disabled={isDisabled}
        colorScheme="brand"
        size={size}
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
        {...primaryCancelButtonStyles}
        flex={undefined} // flex設定をリセット
        w="full"
        py={4} // 縦並びでは異なるパディングを維持
      >
        {cancelLabel}
      </Button>
    </VStack>
  );
};

/**
 * 後方互換性のための汎用FormActions
 * 新規コードでは用途別のコンポーネントを直接使用することを推奨
 */
interface FormActionsProps extends BaseFormActionsProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'inline';
  layout?: 'horizontal' | 'vertical';
  saveLabel?: string;
  cancelLabel?: string;
  // 後方互換性のため残す（使用しない）
  saveButtonProps?: Record<string, unknown>;
  cancelButtonProps?: Record<string, unknown>;
}

export const FormActions = ({
  onSave,
  onCancel,
  isDisabled = false,
  size = 'lg',
  variant = 'primary',
  layout = 'horizontal',
  saveLabel,
  cancelLabel,
}: FormActionsProps) => {
  // レイアウトを優先的に判定
  if (layout === 'vertical') {
    return (
      <VerticalFormActions
        onSave={onSave}
        onCancel={onCancel}
        isDisabled={isDisabled}
        saveLabel={saveLabel}
        cancelLabel={cancelLabel}
        size={size}
      />
    );
  }

  // バリアントで判定
  if (variant === 'inline' || size === 'sm') {
    return (
      <InlineFormActions
        onSave={onSave}
        onCancel={onCancel}
        isDisabled={isDisabled}
        saveLabel={saveLabel}
        cancelLabel={cancelLabel}
        size={size}
      />
    );
  }

  // デフォルトはプライマリ
  return (
    <PrimaryFormActions
      onSave={onSave}
      onCancel={onCancel}
      isDisabled={isDisabled}
      saveLabel={saveLabel}
      cancelLabel={cancelLabel}
      size={size}
    />
  );
};

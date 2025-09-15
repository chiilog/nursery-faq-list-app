/**
 * 共通アクションボタンコンポーネント
 * プライマリとセカンダリのボタンペアを統一的に管理
 */
import { Button, HStack } from '@chakra-ui/react';
import type { ButtonProps } from '@chakra-ui/react';

interface ActionButtonConfig {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: ButtonProps['variant'];
  colorPalette?: ButtonProps['colorPalette'];
}

interface ActionButtonsProps {
  primaryAction: ActionButtonConfig;
  secondaryAction?: ActionButtonConfig;
  size?: ButtonProps['size'];
  justify?: 'start' | 'end' | 'center' | 'space-between';
  gap?: number;
  fullWidth?: boolean;
}

export const ActionButtons = ({
  primaryAction,
  secondaryAction,
  size = 'lg',
  justify = 'space-between',
  gap = 4,
  fullWidth = false,
}: ActionButtonsProps) => {
  // flex値を事前に計算して責務を分離
  const secondaryFlex = fullWidth ? 1 : undefined;
  const primaryFlex = fullWidth ? (secondaryAction ? 2 : 1) : undefined;
  const primaryFontWeight = fullWidth ? 'bold' : undefined;

  return (
    <HStack gap={gap} justify={justify} width={fullWidth ? 'full' : 'auto'}>
      {secondaryAction && (
        <Button
          type="button"
          variant={secondaryAction.variant || 'outline'}
          colorPalette={secondaryAction.colorPalette}
          onClick={secondaryAction.onClick}
          disabled={secondaryAction.disabled || primaryAction.loading}
          loading={secondaryAction.loading}
          size={size}
          flex={secondaryFlex}
        >
          {secondaryAction.label}
        </Button>
      )}
      <Button
        type="button"
        variant={primaryAction.variant || 'solid'}
        colorPalette={primaryAction.colorPalette || 'brand'}
        onClick={primaryAction.onClick}
        disabled={primaryAction.disabled || primaryAction.loading}
        loading={primaryAction.loading}
        size={size}
        flex={primaryFlex}
        fontWeight={primaryFontWeight}
      >
        {primaryAction.label}
      </Button>
    </HStack>
  );
};

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
  return (
    <HStack gap={gap} justify={justify} width={fullWidth ? 'full' : 'auto'}>
      {secondaryAction && (
        <Button
          variant={secondaryAction.variant || 'outline'}
          colorPalette={secondaryAction.colorPalette}
          onClick={secondaryAction.onClick}
          disabled={secondaryAction.disabled || primaryAction.loading}
          loading={secondaryAction.loading}
          size={size}
          flex={fullWidth ? 1 : undefined}
        >
          {secondaryAction.label}
        </Button>
      )}
      <Button
        variant={primaryAction.variant || 'solid'}
        colorPalette={primaryAction.colorPalette || 'brand'}
        onClick={primaryAction.onClick}
        disabled={primaryAction.disabled}
        loading={primaryAction.loading}
        size={size}
        flex={fullWidth ? (secondaryAction ? 2 : 1) : undefined}
        fontWeight={fullWidth ? 'bold' : undefined}
      >
        {primaryAction.label}
      </Button>
    </HStack>
  );
};

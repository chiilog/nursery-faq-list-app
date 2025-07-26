/**
 * フォームアクションコンポーネント（ボタン類）
 */

import { Button, HStack } from '@chakra-ui/react';

interface FormActionsProps {
  onSave: () => void;
  onCancel: () => void;
  isDisabled: boolean;
}

export const FormActions = ({
  onSave,
  onCancel,
  isDisabled,
}: FormActionsProps) => {
  return (
    <HStack gap={4} justify="stretch">
      <Button
        onClick={onSave}
        disabled={isDisabled}
        colorScheme="brand"
        size="lg"
        borderRadius="md"
        flex={2}
        py={6}
        fontWeight="bold"
        shadow="sm"
        _hover={{
          shadow: 'md',
          transform: 'translateY(-1px)',
        }}
        _active={{
          transform: 'translateY(0)',
          shadow: 'sm',
        }}
      >
        保存
      </Button>
      <Button
        onClick={onCancel}
        disabled={isDisabled}
        variant="ghost"
        size="lg"
        borderRadius="md"
        flex={1}
        py={6}
        color="gray.600"
        _hover={{
          bg: 'gray.50',
          color: 'gray.800',
        }}
        _active={{
          bg: 'gray.100',
        }}
      >
        キャンセル
      </Button>
    </HStack>
  );
};

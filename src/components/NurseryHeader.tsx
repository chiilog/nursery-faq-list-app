/**
 * 共通ヘッダーコンポーネント（Chakra UI v3対応）
 */

import { Button, Heading, HStack, IconButton } from '@chakra-ui/react';
import type { HeaderButton, HeaderVariant } from '../types/header';

interface NurseryHeaderProps {
  title: string;
  leftButton?: HeaderButton;
  rightButton?: HeaderButton;
  variant?: HeaderVariant;
}

export const NurseryHeader = ({
  title,
  leftButton,
  rightButton,
  variant = 'with-buttons',
}: NurseryHeaderProps) => {
  if (variant === 'centered') {
    return (
      <Heading
        as="h1"
        size={{ base: 'md', md: 'lg' }}
        color="teal.600"
        textAlign="center"
      >
        {title}
      </Heading>
    );
  }

  return (
    <HStack justify="space-between" align="center" w="full">
      {leftButton ? (
        leftButton.icon ? (
          <IconButton
            onClick={leftButton.onClick}
            variant={leftButton.variant || 'ghost'}
            aria-label={leftButton['aria-label'] || 'Action button'}
            size={{ base: 'xs', md: 'md' }}
            borderRadius="full"
            _hover={{ bg: 'gray.100' }}
          >
            {leftButton.icon}
          </IconButton>
        ) : (
          <Button
            variant={leftButton.variant || 'ghost'}
            onClick={leftButton.onClick}
            size={{ base: 'sm', md: 'md' }}
            px={0}
          >
            {leftButton.text}
          </Button>
        )
      ) : (
        <div style={{ width: '40px' }} /> // スペーサー
      )}

      <Heading
        as="h1"
        size={{ base: 'md', md: 'lg' }}
        color="teal.600"
        flex={1}
        textAlign="center"
      >
        {title}
      </Heading>

      {rightButton ? (
        rightButton.icon ? (
          <IconButton
            onClick={rightButton.onClick}
            variant={rightButton.variant || 'ghost'}
            aria-label={rightButton['aria-label'] || 'Action button'}
            size={{ base: 'sm', md: 'md' }}
            borderRadius="full"
            _hover={{ bg: 'gray.100' }}
          >
            {rightButton.icon}
          </IconButton>
        ) : (
          <Button
            variant={rightButton.variant || 'ghost'}
            onClick={rightButton.onClick}
            size={{ base: 'sm', md: 'md' }}
          >
            {rightButton.text}
          </Button>
        )
      ) : (
        <div style={{ width: '40px' }} /> // スペーサー
      )}
    </HStack>
  );
};

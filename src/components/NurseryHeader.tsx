/**
 * 共通ヘッダーコンポーネント（Chakra UI v3対応）
 */

import { Box, Button, Heading, HStack, IconButton } from '@chakra-ui/react';
import { IoHelpCircleOutline } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();

  const defaultHelpButton: HeaderButton = {
    icon: <IoHelpCircleOutline />,
    onClick: () => void navigate('/about'),
    'aria-label': 'ヘルプ',
  };
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
      {leftButton && !leftButton.hidden ? (
        leftButton.icon ? (
          <IconButton
            onClick={leftButton.onClick}
            variant={leftButton.variant || 'ghost'}
            aria-label={leftButton['aria-label'] || 'Action button'}
            size={{ base: 'sm', md: 'md' }}
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
        <Box w="40px" />
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

      {(() => {
        const buttonToShow = rightButton || defaultHelpButton;
        const shouldShow = buttonToShow && !buttonToShow.hidden;

        return shouldShow ? (
          buttonToShow.icon ? (
            <IconButton
              onClick={buttonToShow.onClick}
              variant={buttonToShow.variant || 'ghost'}
              aria-label={buttonToShow['aria-label'] || 'Action button'}
              size={{ base: 'sm', md: 'md' }}
              borderRadius="full"
              _hover={{ bg: 'gray.100' }}
            >
              {buttonToShow.icon}
            </IconButton>
          ) : (
            <Button
              variant={buttonToShow.variant || 'ghost'}
              onClick={buttonToShow.onClick}
              size={{ base: 'sm', md: 'md' }}
            >
              {buttonToShow.text}
            </Button>
          )
        ) : (
          <Box w="40px" />
        );
      })()}
    </HStack>
  );
};

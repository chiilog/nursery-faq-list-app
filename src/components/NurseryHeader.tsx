/**
 * 共通ヘッダーコンポーネント（Chakra UI v3対応）
 */

import { Box, Button, Heading, HStack, IconButton } from '@chakra-ui/react';
import { IoHelpCircleOutline } from 'react-icons/io5';
import { useNavigate, Link } from 'react-router-dom';
import { APP_CONFIG } from '../constants/app';
import type { HeaderButton, HeaderVariant } from '../types/header';

/**
 * @description ヘッダーコンポーネントのプロパティ
 */
interface NurseryHeaderProps {
  /** ヘッダーのタイトル */
  title: string;
  /** 左側のボタン設定（オプション） */
  leftButton?: HeaderButton;
  /** 右側のボタン設定（オプション） */
  rightButton?: HeaderButton;
  /** ヘッダーの表示バリアント */
  variant?: HeaderVariant;
}

/**
 * @description 共通ヘッダーコンポーネント - アプリケーションの上部に表示される
 * @param props - ヘッダーコンポーネントのプロパティ
 * @returns ヘッダーのJSX要素
 * @example
 * ```tsx
 * <NurseryHeader
 *   title="保活手帳"
 *   variant="centered"
 * />
 * ```
 */
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
      <Link to="/" style={{ textDecoration: 'none' }}>
        <Heading
          as="h1"
          size={{ base: 'md', md: 'lg' }}
          color={APP_CONFIG.COLORS.PRIMARY}
          textAlign="center"
          cursor="pointer"
          transition="opacity 0.2s"
          css={{ '&:hover': { opacity: 0.8 } }}
        >
          {title}
        </Heading>
      </Link>
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
            css={{ '&:hover': { bg: 'gray.100' } }}
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

      <Link to="/" style={{ textDecoration: 'none', flex: 1 }}>
        <Heading
          as="h1"
          size={{ base: 'md', md: 'lg' }}
          color={APP_CONFIG.COLORS.PRIMARY}
          textAlign="center"
          cursor="pointer"
          transition="opacity 0.2s"
          css={{ '&:hover': { opacity: 0.8 } }}
        >
          {title}
        </Heading>
      </Link>

      {(() => {
        const buttonToShow = rightButton || defaultHelpButton;
        const shouldShow = buttonToShow && !buttonToShow.hidden;

        if (!shouldShow) {
          return <Box w="40px" />;
        }

        if (buttonToShow.icon) {
          return (
            <IconButton
              onClick={buttonToShow.onClick}
              variant={buttonToShow.variant || 'ghost'}
              aria-label={buttonToShow['aria-label'] || 'Action button'}
              size={{ base: 'sm', md: 'md' }}
              borderRadius="full"
              css={{ '&:hover': { bg: 'gray.100' } }}
            >
              {buttonToShow.icon}
            </IconButton>
          );
        }

        return (
          <Button
            variant={buttonToShow.variant || 'ghost'}
            onClick={buttonToShow.onClick}
            size={{ base: 'sm', md: 'md' }}
          >
            {buttonToShow.text}
          </Button>
        );
      })()}
    </HStack>
  );
};

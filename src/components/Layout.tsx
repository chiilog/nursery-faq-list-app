import { Box, Container } from '@chakra-ui/react';
import { Outlet } from 'react-router-dom';
import type { ReactNode } from 'react';
import { NurseryHeader } from './NurseryHeader';
import type { HeaderButton, HeaderVariant } from '../types/header';

interface LayoutProps {
  children?: ReactNode;
  headerTitle?: string;
  headerVariant?: HeaderVariant;
  leftButton?: HeaderButton;
  rightButton?: HeaderButton;
  showDefaultTitle?: boolean;
}

export const Layout = ({
  children,
  headerTitle,
  headerVariant = 'centered',
  leftButton,
  rightButton,
  showDefaultTitle = true,
}: LayoutProps) => {
  const shouldShowHeader = headerTitle || showDefaultTitle;
  const title = headerTitle || '保活手帳';

  return (
    <Box minH="100vh" bg="gray.50">
      <Box as="header" bg="white" shadow="sm">
        <Container maxW="container.xl" py={2}>
          {shouldShowHeader && (
            <NurseryHeader
              title={title}
              variant={headerVariant}
              leftButton={leftButton}
              rightButton={rightButton}
            />
          )}
        </Container>
      </Box>

      <Container as="main" maxW="container.xl" py={4}>
        {children || <Outlet />}
      </Container>
    </Box>
  );
};

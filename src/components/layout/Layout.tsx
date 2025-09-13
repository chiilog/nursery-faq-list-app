import { Box, Container } from '@chakra-ui/react';
import { Outlet } from 'react-router-dom';
import type { ReactNode } from 'react';
import { NurseryHeader } from '../features/nursery/NurseryHeader';
import { BottomNavigation } from './BottomNavigation';
import { APP_CONFIG } from '../../constants/app';
import type { HeaderButton, HeaderVariant } from '../../types/header';

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
  const shouldShowHeader = Boolean(headerTitle) || showDefaultTitle;
  const displayTitle =
    headerTitle ?? (showDefaultTitle ? APP_CONFIG.APP_NAME : '');

  return (
    <Box minH="100vh" bg="gray.50">
      {shouldShowHeader && (
        <Box as="header" bg="white" shadow="sm">
          <Container maxW="container.xl" py={2}>
            <NurseryHeader
              title={displayTitle}
              variant={headerVariant}
              leftButton={leftButton}
              rightButton={rightButton}
            />
          </Container>
        </Box>
      )}

      <Container as="main" maxW="container.xl" py={4} pb="80px">
        {children || <Outlet />}
      </Container>

      <BottomNavigation />
    </Box>
  );
};

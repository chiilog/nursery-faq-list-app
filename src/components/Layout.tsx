import { Box, Container, Heading, HStack } from '@chakra-ui/react';
import { Outlet } from 'react-router-dom';
import type { ReactNode } from 'react';

interface LayoutProps {
  children?: ReactNode;
  headerContent?: ReactNode;
  showDefaultTitle?: boolean;
}

export const Layout = ({
  children,
  headerContent,
  showDefaultTitle = true,
}: LayoutProps) => {
  return (
    <Box minH="100vh" bg="gray.50">
      <Box as="header" bg="white" shadow="sm">
        <Container maxW="container.xl" py={4}>
          {headerContent ? (
            <HStack justify="space-between" align="center">
              {headerContent}
            </HStack>
          ) : showDefaultTitle ? (
            <Heading as="h1" size="lg" color="teal.600" textAlign="center">
              保育園見学質問リスト
            </Heading>
          ) : null}
        </Container>
      </Box>

      <Container as="main" maxW="container.xl" py={8}>
        {children || <Outlet />}
      </Container>
    </Box>
  );
};

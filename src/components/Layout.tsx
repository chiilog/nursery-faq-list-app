import { Box, Container, Heading } from '@chakra-ui/react';
import { Outlet } from 'react-router-dom';
import type { ReactNode } from 'react';

interface LayoutProps {
  children?: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <Box minH="100vh" bg="gray.50">
      <Box as="header" bg="white" shadow="sm">
        <Container maxW="container.xl" py={4}>
          <Heading as="h1" size="lg" color="teal.600" textAlign="center">
            保育園見学質問リスト
          </Heading>
        </Container>
      </Box>

      <Container as="main" maxW="container.xl" py={8}>
        {children || <Outlet />}
      </Container>
    </Box>
  );
};

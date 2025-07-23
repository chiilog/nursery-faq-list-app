import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Link as ChakraLink,
  useBreakpointValue,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { ReactNode } from 'react';

interface LayoutProps {
  children?: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const isMobile = useBreakpointValue({ base: true, md: false }) ?? true;

  return (
    <Box minH="100vh" bg="gray.50">
      <Box as="header" bg="white" shadow="sm">
        <Container maxW="container.xl" py={4}>
          <Flex justify="space-between" align="center">
            <Heading as="h1" size="lg" color="teal.600">
              保育園見学質問リスト
            </Heading>

            <nav aria-label="メインナビゲーション">
              {isMobile ? (
                <Button aria-label="メニュー" variant="outline">
                  メニュー
                </Button>
              ) : (
                <Flex gap={4} align="center">
                  <ChakraLink as={RouterLink} to="/" fontWeight="medium">
                    ホーム
                  </ChakraLink>
                  <Button colorScheme="teal">新規作成</Button>
                </Flex>
              )}
            </nav>
          </Flex>
        </Container>
      </Box>

      <Container as="main" maxW="container.xl" py={8}>
        {children}
      </Container>
    </Box>
  );
};

import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Link as ChakraLink,
  Menu,
  Portal,
  useBreakpointValue,
} from '@chakra-ui/react';
import { Link as RouterLink, Outlet, useNavigate } from 'react-router-dom';
import { ReactNode } from 'react';

interface LayoutProps {
  children?: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const isMobile = useBreakpointValue({ base: true, md: false }) ?? true;
  const navigate = useNavigate();

  const handleCreateNew = () => {
    void navigate('/create');
  };

  const handleNavigateHome = () => {
    void navigate('/');
  };

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
                <Menu.Root>
                  <Menu.Trigger asChild>
                    <Button aria-label="メニュー" variant="outline">
                      メニュー
                    </Button>
                  </Menu.Trigger>
                  <Portal>
                    <Menu.Positioner>
                      <Menu.Content>
                        <Menu.Item value="home" onClick={handleNavigateHome}>
                          ホーム
                        </Menu.Item>
                        <Menu.Item value="create" onClick={handleCreateNew}>
                          新規作成
                        </Menu.Item>
                      </Menu.Content>
                    </Menu.Positioner>
                  </Portal>
                </Menu.Root>
              ) : (
                <Flex gap={4} align="center">
                  <ChakraLink as={RouterLink} to="/" fontWeight="medium">
                    ホーム
                  </ChakraLink>
                  <Button colorScheme="teal" onClick={handleCreateNew}>
                    新規作成
                  </Button>
                </Flex>
              )}
            </nav>
          </Flex>
        </Container>
      </Box>

      <Container as="main" maxW="container.xl" py={8}>
        {children || <Outlet />}
      </Container>
    </Box>
  );
};

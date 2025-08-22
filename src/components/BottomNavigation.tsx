import { Box, HStack, VStack, Text, Drawer, Portal } from '@chakra-ui/react';
import { IoHomeOutline, IoHome, IoMenuOutline, IoMenu } from 'react-icons/io5';
import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useCallback } from 'react';
import { ROUTES } from '../constants/routes';
import { APP_CONFIG } from '../constants/app';

/**
 * @description ナビゲーション項目のインターフェース
 */
interface NavItem {
  /** ナビゲーション項目のラベル */
  label: string;
  /** ナビゲーション先のパス */
  path: string;
  /** 通常状態のアイコン */
  icon: React.ReactNode;
  /** アクティブ状態のアイコン */
  activeIcon: React.ReactNode;
}

/**
 * @description 底部ナビゲーションコンポーネント - ホームボタンとメニューDrawerを提供
 * @returns 底部ナビゲーションのJSX要素
 * @example
 * ```tsx
 * <BottomNavigation />
 * ```
 */
export const BottomNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const navItems: NavItem[] = [
    {
      label: 'ホーム',
      path: ROUTES.HOME,
      icon: <IoHomeOutline size={24} />,
      activeIcon: <IoHome size={24} />,
    },
    {
      label: 'メニュー',
      path: '#menu',
      icon: <IoMenuOutline size={24} />,
      activeIcon: <IoMenu size={24} />,
    },
  ];

  // DRY: メニューアイテムの設定を配列化
  const menuItems = [
    { path: ROUTES.ABOUT, label: 'このアプリについて' },
    { path: ROUTES.PRIVACY_SETTINGS, label: 'プライバシー設定' },
    { path: ROUTES.PRIVACY_POLICY, label: 'プライバシーポリシー' },
  ];

  // DRY: 共通スタイルの定義
  const menuItemStyle = {
    cursor: 'pointer' as const,
    p: 4,
    borderBottom: '1px solid',
    borderColor: 'gray.100',
    transition: 'background 0.2s',
    css: { '&:hover': { bg: 'gray.50' } },
  };

  // KISS: 色の取得をシンプル化
  const getItemColor = (isSelected: boolean) =>
    isSelected ? APP_CONFIG.COLORS.PRIMARY : 'gray.600';

  /**
   * @description ナビゲーション項目のクリックハンドラ
   * @param item - クリックされたナビゲーション項目
   */
  const handleNavClick = useCallback(
    (item: NavItem) => {
      if (item.path === '#menu') {
        setIsDrawerOpen((prev) => !prev);
      } else {
        void navigate(item.path);
        setIsDrawerOpen(false);
      }
    },
    [navigate]
  );

  /**
   * @description メニュー項目のクリックハンドラ
   * @param path - 遷移先のパス
   */
  const handleMenuItemClick = useCallback(
    (path: string) => {
      void navigate(path);
      setIsDrawerOpen(false);
    },
    [navigate]
  );

  /**
   * @description 指定されたパスが現在のアクティブパスかどうかを判定
   * @param path - 判定対象のパス
   * @returns アクティブな場合true、そうでない場合false
   */
  const isActive = (path: string) => {
    if (path === ROUTES.HOME) {
      return location.pathname === '/' || location.pathname === '';
    }
    return location.pathname === path;
  };

  return (
    <>
      <Drawer.Root
        open={isDrawerOpen}
        onOpenChange={(e) => setIsDrawerOpen(e.open)}
        placement="bottom"
      >
        <Portal>
          <Drawer.Backdrop />
          <Drawer.Positioner>
            <Drawer.Content maxH="50vh" borderTopRadius="xl" pb="80px">
              <Drawer.Header borderBottom="1px solid" borderColor="gray.200">
                <Drawer.Title fontSize="lg" fontWeight="semibold">
                  メニュー
                </Drawer.Title>
                <Drawer.CloseTrigger />
              </Drawer.Header>
              <Drawer.Body p={0}>
                <VStack align="stretch" gap={0}>
                  {menuItems.map((menuItem, index) => (
                    <Box
                      key={menuItem.path}
                      onClick={() => handleMenuItemClick(menuItem.path)}
                      {...menuItemStyle}
                      borderBottom={
                        index < menuItems.length - 1 ? '1px solid' : 'none'
                      }
                    >
                      <Text fontSize="md">{menuItem.label}</Text>
                    </Box>
                  ))}
                </VStack>
              </Drawer.Body>
            </Drawer.Content>
          </Drawer.Positioner>
        </Portal>
      </Drawer.Root>

      <Portal>
        <Box
          as="nav"
          position="fixed"
          bottom={0}
          left={0}
          right={0}
          bg="white"
          borderTop="1px solid"
          borderColor="gray.200"
          zIndex="2000"
          height="64px"
          css={{ pointerEvents: 'auto' }}
        >
          <HStack height="full" justify="space-around" align="center" gap={0}>
            {navItems.map((item, index) => {
              const isHomeActive =
                item.path === ROUTES.HOME && isActive(item.path);
              const isMenuActive = item.path === '#menu' && isDrawerOpen;
              const selected = isMenuActive || (isHomeActive && !isDrawerOpen);

              return (
                <VStack
                  key={item.label}
                  as="button"
                  onClick={() => handleNavClick(item)}
                  gap={1}
                  flex={1}
                  height="full"
                  justify="center"
                  cursor="pointer"
                  transition="all 0.2s"
                  position="relative"
                  borderRight={
                    index < navItems.length - 1 ? '1px solid' : 'none'
                  }
                  borderColor="gray.200"
                  css={{ pointerEvents: 'auto' }}
                >
                  <Box color={getItemColor(selected)} transition="color 0.2s">
                    {selected ? item.activeIcon : item.icon}
                  </Box>
                  <Text
                    fontSize="xs"
                    color={getItemColor(selected)}
                    fontWeight={selected ? 'semibold' : 'normal'}
                    transition="all 0.2s"
                  >
                    {item.label}
                  </Text>
                </VStack>
              );
            })}
          </HStack>
        </Box>
      </Portal>
    </>
  );
};

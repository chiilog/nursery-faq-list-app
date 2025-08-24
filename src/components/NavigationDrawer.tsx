import {
  Box,
  VStack,
  Text,
  Drawer,
  Portal,
  CloseButton,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';
import { ROUTES, type RoutePath } from '../constants/routes';
import { APP_CONFIG } from '../constants/app';

/**
 * @description メニュー項目のインターフェース
 */
interface MenuItem {
  /** メニュー項目のパス - Branded Typeによる型安全性 */
  readonly path: RoutePath;
  /** メニュー項目のラベル */
  readonly label: string;
}

/**
 * @description NavigationDrawerコンポーネントのProps
 */
interface NavigationDrawerProps {
  /** Drawerの開閉状態 */
  isOpen: boolean;
  /** Drawerの開閉状態変更コールバック */
  onClose: () => void;
}

/**
 * @description ナビゲーション用のDrawerコンポーネント
 * @param props - NavigationDrawerProps
 * @returns DrawerのJSX要素
 * @example
 * ```tsx
 * <NavigationDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
 * ```
 */
export const NavigationDrawer = ({
  isOpen,
  onClose,
}: NavigationDrawerProps) => {
  const navigate = useNavigate();

  // DRY: メニューアイテムの設定を配列化
  const menuItems = [
    { path: ROUTES.ABOUT as RoutePath, label: 'このアプリについて' },
    { path: ROUTES.PRIVACY_POLICY as RoutePath, label: 'プライバシーポリシー' },
  ] as const satisfies readonly MenuItem[];

  // DRY: 共通スタイルの定義
  const menuItemStyle = {
    cursor: 'pointer' as const,
    p: 4,
    borderBottom: '1px solid',
    borderColor: 'gray.100',
    transition: 'background 0.2s',
    css: { '&:hover': { bg: 'gray.50' } },
  };

  /**
   * @description メニュー項目のクリックハンドラ
   * @param path - 遷移先のパス
   */
  const handleMenuItemClick = useCallback(
    (path: string) => {
      void navigate(path);
      onClose();
    },
    [navigate, onClose]
  );

  return (
    <Drawer.Root
      open={isOpen}
      onOpenChange={(e) => !e.open && onClose()}
      size="sm"
    >
      <Portal>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content maxW="280px">
            <Drawer.Header borderBottom="1px solid" borderColor="gray.200">
              <Drawer.Title
                fontSize="lg"
                fontWeight="semibold"
                color={APP_CONFIG.COLORS.PRIMARY}
              >
                メニュー
              </Drawer.Title>
              <Drawer.CloseTrigger asChild>
                <CloseButton size="md" />
              </Drawer.CloseTrigger>
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
  );
};

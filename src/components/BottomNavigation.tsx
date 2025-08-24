import { Box, HStack, VStack, Text, Portal } from '@chakra-ui/react';
import { IoHomeOutline, IoHome, IoMenuOutline, IoMenu } from 'react-icons/io5';
import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useCallback, useMemo, useId } from 'react';
import { ROUTES, type RoutePath } from '../constants/routes';
import { APP_CONFIG } from '../constants/app';
import { NavigationDrawer } from './NavigationDrawer';

/**
 * @description ナビゲーション項目のインターフェース
 */
interface NavItem {
  /** ナビゲーション項目のラベル */
  readonly label: string;
  /** ナビゲーション先のパス - Branded Typeによる型安全性 */
  readonly path: RoutePath;
  /** 通常状態のアイコン */
  readonly icon: React.ReactNode;
  /** アクティブ状態のアイコン */
  readonly activeIcon: React.ReactNode;
}

/**
 * @description 底部ナビゲーションコンポーネント - 底部の固定ナビゲーションバーを提供
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
  const navId = useId();

  const navItems = useMemo(
    () =>
      [
        {
          label: 'ホーム',
          path: ROUTES.HOME as RoutePath,
          icon: <IoHomeOutline size={24} aria-hidden="true" />,
          activeIcon: <IoHome size={24} aria-hidden="true" />,
        },
        {
          label: 'メニュー',
          path: '#menu' as RoutePath,
          icon: <IoMenuOutline size={24} aria-hidden="true" />,
          activeIcon: <IoMenu size={24} aria-hidden="true" />,
        },
      ] as const satisfies readonly NavItem[],
    []
  );

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
   * @description キーボードナビゲーション処理
   * @param event - キーボードイベント
   * @param item - 対象のナビゲーション項目
   */
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent, item: NavItem) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleNavClick(item);
      }
    },
    [handleNavClick]
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
      <NavigationDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        aria-labelledby={`${navId}-menu`}
      />

      <Portal>
        <Box
          as="nav"
          role="tablist"
          aria-label="メインナビゲーション"
          position="fixed"
          bottom={0}
          left={0}
          right={0}
          bg="white"
          borderTop="1px solid"
          borderColor="gray.200"
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
                  onKeyDown={(e) => handleKeyDown(e, item)}
                  aria-label={`${item.label}${selected ? ' - 現在のページ' : ''}`}
                  aria-current={selected ? 'page' : undefined}
                  role="tab"
                  tabIndex={0}
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

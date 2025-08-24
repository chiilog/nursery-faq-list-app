import { IoHomeOutline, IoHome, IoMenuOutline, IoMenu } from 'react-icons/io5';
import { ROUTES, type RoutePath } from './routes';

/**
 * @description ナビゲーション項目のインターフェース
 */
export interface NavigationItem {
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
 * @description メニュー項目のインターフェース
 */
export interface MenuItem {
  /** メニュー項目のパス - Branded Typeによる型安全性 */
  readonly path: RoutePath;
  /** メニュー項目のラベル */
  readonly label: string;
}

/**
 * @description 底部ナビゲーション項目の定義
 * ホームとメニューボタンを含む
 */
export const BOTTOM_NAVIGATION_ITEMS = [
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
] as const satisfies readonly NavigationItem[];

/**
 * @description Drawerメニュー項目の定義
 * このアプリについて、プライバシーポリシーなどの静的ページへのリンク
 */
export const DRAWER_MENU_ITEMS = [
  { path: ROUTES.ABOUT as RoutePath, label: 'このアプリについて' },
  { path: ROUTES.PRIVACY_POLICY as RoutePath, label: 'プライバシーポリシー' },
] as const satisfies readonly MenuItem[];

/**
 * @description ナビゲーション関連の型定義
 */
export type NavigationValue = (typeof BOTTOM_NAVIGATION_ITEMS)[number]['path'];
export type MenuValue = (typeof DRAWER_MENU_ITEMS)[number]['path'];

/**
 * @description 底部ナビゲーション項目のラベル型
 */
export type BottomNavigationLabel =
  (typeof BOTTOM_NAVIGATION_ITEMS)[number]['label'];

/**
 * @description Drawerメニュー項目のラベル型
 */
export type DrawerMenuLabel = (typeof DRAWER_MENU_ITEMS)[number]['label'];

/**
 * @description ナビゲーション項目取得の型安全なヘルパー
 */
export const NAVIGATION_HELPERS = {
  /**
   * パスから底部ナビゲーション項目を取得（型安全）
   */
  getBottomNavItemByPath: (
    path: NavigationValue
  ): (typeof BOTTOM_NAVIGATION_ITEMS)[number] | undefined =>
    BOTTOM_NAVIGATION_ITEMS.find((item) => item.path === path),

  /**
   * ラベルから底部ナビゲーション項目を取得（型安全）
   */
  getBottomNavItemByLabel: (
    label: BottomNavigationLabel
  ): (typeof BOTTOM_NAVIGATION_ITEMS)[number] | undefined =>
    BOTTOM_NAVIGATION_ITEMS.find((item) => item.label === label),

  /**
   * パスからDrawerメニュー項目を取得（型安全）
   */
  getDrawerItemByPath: (
    path: MenuValue
  ): (typeof DRAWER_MENU_ITEMS)[number] | undefined =>
    DRAWER_MENU_ITEMS.find((item) => item.path === path),

  /**
   * ラベルからDrawerメニュー項目を取得（型安全）
   */
  getDrawerItemByLabel: (
    label: DrawerMenuLabel
  ): (typeof DRAWER_MENU_ITEMS)[number] | undefined =>
    DRAWER_MENU_ITEMS.find((item) => item.label === label),
} as const;

/**
 * @description ナビゲーション項目の検証ヘルパー
 */
export const NAVIGATION_VALIDATORS = {
  /**
   * 指定されたパスが有効な底部ナビゲーションパスかどうかを判定
   */
  isValidBottomNavPath: (path: string): path is NavigationValue =>
    BOTTOM_NAVIGATION_ITEMS.some((item) => item.path === path),

  /**
   * 指定されたパスが有効なDrawerメニューパスかどうかを判定
   */
  isValidDrawerMenuPath: (path: string): path is MenuValue =>
    DRAWER_MENU_ITEMS.some((item) => item.path === path),

  /**
   * 指定されたラベルが有効な底部ナビゲーションラベルかどうかを判定
   */
  isValidBottomNavLabel: (label: string): label is BottomNavigationLabel =>
    BOTTOM_NAVIGATION_ITEMS.some((item) => item.label === label),

  /**
   * 指定されたラベルが有効なDrawerメニューラベルかどうかを判定
   */
  isValidDrawerMenuLabel: (label: string): label is DrawerMenuLabel =>
    DRAWER_MENU_ITEMS.some((item) => item.label === label),
} as const;

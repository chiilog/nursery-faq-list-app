import { vi } from 'vitest';
import type { NavigateFunction } from 'react-router-dom';
import {
  BOTTOM_NAVIGATION_ITEMS,
  DRAWER_MENU_ITEMS,
} from '../constants/navigation';
import { ROUTES } from '../constants/routes';

/**
 * @description モックナビゲーション関数を作成する
 * @returns モックされたnavigate関数
 */
export const createMockNavigate = () => vi.fn();

/**
 * @description モックロケーションオブジェクトを作成する
 * @param pathname - パス名 (デフォルト: '/')
 * @returns モックされたlocationオブジェクト
 */
export const createMockLocation = (pathname: string = '/') => ({
  pathname,
  search: '',
  hash: '',
  state: null,
  key: 'default',
});

/**
 * @description パスから底部ナビゲーション項目を取得する
 * @param path - 検索するパス
 * @returns 見つかった項目、存在しない場合はundefined
 */
export const getBottomNavigationItemByPath = (path: string) =>
  BOTTOM_NAVIGATION_ITEMS.find((item) => item.path === path);

/**
 * @description ラベルから底部ナビゲーション項目を取得する
 * @param label - 検索するラベル
 * @returns 見つかった項目、存在しない場合はundefined
 */
export const getBottomNavigationItemByLabel = (label: string) =>
  BOTTOM_NAVIGATION_ITEMS.find((item) => item.label === label);

/**
 * @description パスからDrawerメニュー項目を取得する
 * @param path - 検索するパス
 * @returns 見つかった項目、存在しない場合はundefined
 */
export const getDrawerMenuItemByPath = (path: string) =>
  DRAWER_MENU_ITEMS.find((item) => item.path === path);

/**
 * @description ラベルからDrawerメニュー項目を取得する
 * @param label - 検索するラベル
 * @returns 見つかった項目、存在しない場合はundefined
 */
export const getDrawerMenuItemByLabel = (label: string) =>
  DRAWER_MENU_ITEMS.find((item) => item.label === label);

/**
 * @description テストでよく使用される定数をまとめたオブジェクト
 */
export const TEST_NAVIGATION_CONSTANTS = {
  /** ホームページのパス */
  HOME_PATH: ROUTES.HOME,
  /** メニューの特別なパス */
  MENU_PATH: '#menu',
  /** 底部ナビゲーション項目数 */
  BOTTOM_NAV_ITEMS_COUNT: BOTTOM_NAVIGATION_ITEMS.length,
  /** Drawerメニュー項目数 */
  DRAWER_MENU_ITEMS_COUNT: DRAWER_MENU_ITEMS.length,
} as const;

/**
 * @description React Router関連のモックを一括で設定するヘルパー
 * @param pathname - 初期パス名 (デフォルト: '/')
 * @returns モック関数のオブジェクト
 */
export const setupNavigationMocks = (pathname: string = '/') => {
  const mockNavigate = createMockNavigate();
  const mockLocation = createMockLocation(pathname);

  return {
    mockNavigate,
    mockLocation,
  };
};

/**
 * @description React Routerのモックを設定し、テスト用のナビゲーション関数を作成
 * @returns モックされたnavigate関数
 */
export const createNavigationMock = () => {
  const mockNavigate = vi.fn<NavigateFunction>();

  vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
      ...actual,
      useNavigate: () => mockNavigate,
    };
  });

  return mockNavigate;
};

/**
 * @description テスト共通のセットアップを行うヘルパー
 * @returns テストで使用するモック関数群
 */
export const setupNavigationTest = () => {
  const mockNavigate = vi.fn<NavigateFunction>();
  const mockOnClose = vi.fn<() => void>();

  const clearMocks = () => {
    vi.clearAllMocks();
  };

  return {
    mockNavigate,
    mockOnClose,
    clearMocks,
  };
};

/**
 * @description エラーハンドリングテスト用のヘルパー
 * @param mockNavigate - モックされたnavigate関数
 * @returns エラー処理テスト用の関数群
 */
export const setupErrorHandlingTest = (
  mockNavigate: ReturnType<typeof vi.fn<NavigateFunction>>
) => {
  const consoleErrorSpy = vi
    .spyOn(console, 'error')
    .mockImplementation(() => {});
  const mockNavigateError = vi.fn<NavigateFunction>();
  mockNavigateError.mockRejectedValue(new Error('Navigation failed'));

  // 一時的にモックを変更
  const originalMockNavigate = mockNavigate.getMockImplementation();
  mockNavigate.mockImplementation(mockNavigateError);

  const restoreMocks = () => {
    // モックを元に戻す
    if (originalMockNavigate) {
      mockNavigate.mockImplementation(originalMockNavigate);
    } else {
      mockNavigate.mockRestore();
    }
    consoleErrorSpy.mockRestore();
  };

  return {
    consoleErrorSpy,
    mockNavigateError,
    restoreMocks,
  };
};

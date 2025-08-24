import { useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import { NAVIGATION_VALIDATORS } from '../constants/navigation';

/**
 * @description ナビゲーション関連の共通ロジックを提供するカスタムフック
 * @returns ナビゲーション関連の関数と状態
 *
 * @example
 * ```tsx
 * const { handleNavigation, isHomePage, isCurrentPath } = useNavigation();
 *
 * // 安全なナビゲーション
 * handleNavigation('/about');
 *
 * // 現在のページ判定
 * if (isHomePage()) {
 *   // ホームページ固有の処理
 * }
 *
 * // 任意のパスの判定
 * if (isCurrentPath('/about')) {
 *   // このページ固有の処理
 * }
 * ```
 */
export const useNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  /**
   * @description 型安全なナビゲーション処理
   * @param path - ナビゲーション先のパス
   * @param options - ナビゲーションオプション
   */
  const handleNavigation = useCallback(
    (path: string, options?: { replace?: boolean }) => {
      try {
        void navigate(path, options);
      } catch (error) {
        console.error('Navigation failed:', error);
        // フォールバック：ホームページに戻る
        void navigate(ROUTES.HOME, { replace: true });
      }
    },
    [navigate]
  );

  /**
   * @description 現在のページがホームページかどうかを判定
   * @returns ホームページの場合true
   */
  const isHomePage = useCallback((): boolean => {
    return location.pathname === ROUTES.HOME || location.pathname === '';
  }, [location.pathname]);

  /**
   * @description 指定されたパスが現在のパスと一致するかを判定
   * @param path - 判定対象のパス
   * @returns 一致する場合true
   */
  const isCurrentPath = useCallback(
    (path: string): boolean => {
      return location.pathname === path;
    },
    [location.pathname]
  );

  /**
   * @description 指定されたパスが有効なナビゲーションパスかを判定
   * @param path - 判定対象のパス
   * @returns 有効な場合true
   */
  const isValidNavigationPath = useCallback((path: string): boolean => {
    return (
      NAVIGATION_VALIDATORS.isValidBottomNavPath(path) ||
      NAVIGATION_VALIDATORS.isValidDrawerMenuPath(path) ||
      path.startsWith('#')
    ); // アンカーリンクも許可
  }, []);

  /**
   * @description 現在の場所情報を取得
   * @returns location情報とヘルパー関数
   */
  const getCurrentLocation = useCallback(() => {
    return {
      pathname: location.pathname,
      search: location.search,
      hash: location.hash,
      isHome: isHomePage(),
    };
  }, [location, isHomePage]);

  return {
    handleNavigation,
    isHomePage,
    isCurrentPath,
    isValidNavigationPath,
    getCurrentLocation,
    location,
  };
};

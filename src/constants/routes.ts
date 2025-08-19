/**
 * @description アプリケーション全体のルートパス定数
 * ハードコードされたパスを一元管理し、保守性を向上
 *
 * @example
 * ```tsx
 * import { ROUTES } from '../constants/routes';
 *
 * // React Routerでの使用
 * <Route path={ROUTES.PRIVACY_POLICY} element={<PrivacyPolicyPage />} />
 *
 * // LinkやNavigateでの使用
 * <Link to={ROUTES.PRIVACY_SETTINGS}>設定ページ</Link>
 * navigate(ROUTES.HOME);
 * ```
 */

/**
 * アプリケーションのルートパス定数
 */
export const ROUTES = Object.freeze({
  /** ホームページ */
  HOME: '/',

  /** アバウトページ */
  ABOUT: '/about',

  /** プライバシー設定ページ */
  PRIVACY_SETTINGS: '/privacy-settings',

  /** プライバシーポリシーページ */
  PRIVACY_POLICY: '/privacy-policy',

  /** 保育園詳細ページ（パラメータ付き） */
  NURSERY_DETAIL: '/nursery/:nurseryId',

  /** 404ページ */
  NOT_FOUND: '*',
} as const);

/**
 * 動的ルートパス生成ヘルパー
 */
export const generateRoute = {
  /**
   * @description 保育園詳細ページのパスを生成
   * @param nurseryId 保育園ID
   * @returns 保育園詳細ページのパス
   */
  nurseryDetail: (nurseryId: string): string => `/nursery/${nurseryId}`,
} as const;

/**
 * ルートパスの型定義
 */
export type RouteKeys = keyof typeof ROUTES;
export type RoutePaths = (typeof ROUTES)[RouteKeys];

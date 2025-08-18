/**
 * @description ページ遷移時にスクロール位置を一番上にリセットするコンポーネント
 * React Routerでのページ遷移時に、自動的にページの先頭にスクロールします
 *
 * @example
 * ```tsx
 * // App.tsxやRouter.tsxで使用
 * <BrowserRouter>
 *   <ScrollToTop />
 *   <Routes>
 *     ...
 *   </Routes>
 * </BrowserRouter>
 * ```
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * @description ページ遷移時のスクロール位置リセットコンポーネント
 *
 * useLocationフックを使用してルートの変更を監視し、
 * パス名が変更された際に自動的にページの先頭にスクロールします。
 * スムーズスクロールのサポートを検出し、利用可能な場合は使用します。
 *
 * @returns null - レンダリング要素なし（副作用のみ）
 *
 * @example
 * ```tsx
 * // BrowserRouterの直下に配置して使用
 * function App() {
 *   return (
 *     <BrowserRouter>
 *       <ScrollToTop />
 *       <AppRouter />
 *     </BrowserRouter>
 *   );
 * }
 * ```
 */
export const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // シンプルで確実なスクロール実装
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

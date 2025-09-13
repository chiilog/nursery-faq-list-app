/**
 * AnalyticsRouter - ページ遷移を自動トラッキングするラッパーコンポーネント
 */

import { useEffect, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { useAnalytics } from '../../hooks/useAnalytics';

interface AnalyticsRouterProps {
  children: ReactNode;
}

/**
 * ルーティングとアナリティクスを統合するコンポーネント
 * ページ遷移時に自動的にページビューイベントを送信
 */
export function AnalyticsRouter({ children }: AnalyticsRouterProps) {
  const location = useLocation();
  const { trackPageView } = useAnalytics();

  useEffect(() => {
    // ページ遷移時にページビューイベントを送信
    const { pathname, search, hash } = location;
    const path = `${pathname}${search}${hash}`;
    trackPageView(path);
  }, [
    location.pathname,
    location.search,
    location.hash,
    trackPageView,
    location,
  ]);

  return <>{children}</>;
}

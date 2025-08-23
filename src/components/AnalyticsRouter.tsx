/**
 * AnalyticsRouter - ページ遷移を自動トラッキングするラッパーコンポーネント
 */

import { useEffect, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { useAnalytics } from '../hooks/useAnalytics';

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
    trackPageView(location.pathname);
  }, [location.pathname, trackPageView]);

  return <>{children}</>;
}

/**
 * @description アナリティクスコンテキストを使用するフック
 */

import { useCallback, useContext } from 'react';
import {
  AnalyticsContext,
  type AnalyticsContextType,
} from '../contexts/analyticsContext';

/**
 * useAnalyticsフックの戻り値の型定義
 */
export interface UseAnalyticsReturn extends AnalyticsContextType {
  trackPageView: (page: string) => void;
  trackNurseryCreated: (nurseryId: string) => void;
  trackQuestionAdded: (nurseryId: string, questionCount: number) => void;
  trackInsightAdded: (nurseryId: string, insightCount: number) => void;
}

/**
 * @description 分析サービス（GA4、Clarity）のContextを取得するReactフック
 * @returns 分析サービスの状態と操作関数を含むContext
 * @throws {Error} AnalyticsProvider外で使用された場合
 * @example
 * ```typescript
 * const { trackEvent } = useAnalytics();
 * trackEvent('button_click', { button_name: 'submit' });
 * ```
 */
export function useAnalytics(): UseAnalyticsReturn {
  const context = useContext(AnalyticsContext);

  if (!context) {
    throw new Error('useAnalytics must be used within AnalyticsProvider');
  }

  const { trackEvent } = context;

  // 設計書の仕様に従ったトラッキングメソッド
  const trackPageView = useCallback(
    (page: string) => {
      trackEvent('page_view', { page });
    },
    [trackEvent]
  );

  const trackNurseryCreated = useCallback(
    (nurseryId: string) => {
      trackEvent('nursery_created', { nurseryId });
    },
    [trackEvent]
  );

  const trackQuestionAdded = useCallback(
    (nurseryId: string, questionCount: number) => {
      trackEvent('question_added', { nurseryId, questionCount });
    },
    [trackEvent]
  );

  const trackInsightAdded = useCallback(
    (nurseryId: string, insightCount: number) => {
      trackEvent('insight_added', { nurseryId, insightCount });
    },
    [trackEvent]
  );

  return {
    ...context,
    trackPageView,
    trackNurseryCreated,
    trackQuestionAdded,
    trackInsightAdded,
  };
}

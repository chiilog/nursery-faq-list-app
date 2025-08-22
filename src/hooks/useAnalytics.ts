/**
 * @description アナリティクスコンテキストを使用するフック
 */

import { useContext } from 'react';
import {
  AnalyticsContext,
  type AnalyticsContextType,
} from '../providers/AnalyticsProvider';

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
export function useAnalytics(): AnalyticsContextType {
  const context = useContext(AnalyticsContext);

  if (!context) {
    throw new Error('useAnalytics must be used within AnalyticsProvider');
  }

  return context;
}

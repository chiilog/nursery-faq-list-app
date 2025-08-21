/**
 * @description アナリティクスコンテキストを使用するフック
 */

import { useContext } from 'react';
import {
  AnalyticsContext,
  type AnalyticsContextType,
} from '../providers/AnalyticsProvider';

/**
 * @description アナリティクスコンテキストにアクセスするためのフック
 * @returns アナリティクスのコンテキスト値
 * @throws {Error} AnalyticsProviderの外で使用された場合
 * @example
 * ```typescript
 * const { ga4, clarity, setAnalyticsConsent } = useAnalytics();
 * ```
 */
export function useAnalytics(): AnalyticsContextType {
  const context = useContext(AnalyticsContext);

  if (!context) {
    throw new Error('useAnalytics must be used within AnalyticsProvider');
  }

  return context;
}

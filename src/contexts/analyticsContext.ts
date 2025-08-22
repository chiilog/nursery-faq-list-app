/**
 * アナリティクスコンテキスト定義
 */

import { createContext } from 'react';
import type { UseGA4ServiceReturn } from '../services/ga4Service';
import type { UseClarityServiceReturn } from '../services/clarityService';

/**
 * アナリティクスコンテキストの型定義
 */
export interface AnalyticsContextType {
  readonly ga4: UseGA4ServiceReturn;
  readonly clarity: UseClarityServiceReturn;
  // 統合された同意管理
  readonly setAnalyticsConsent: (consent: boolean) => void;
  readonly hasAnalyticsConsent: boolean;
}

export const AnalyticsContext = createContext<AnalyticsContextType | null>(
  null
);

/**
 * アナリティクスプロバイダーコンポーネント
 * GA4とMicrosoft Clarityを統合管理
 */

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react';
import { useGA4Service } from '../services/ga4Service';
import { useClarityService } from '../services/clarityService';
import { useLocation } from 'react-router-dom';
import { ANALYTICS_CONSTANTS } from '../constants/analytics';

/**
 * アナリティクスコンテキストの型定義
 */
export interface AnalyticsContextType {
  readonly ga4: {
    readonly isEnabled: boolean;
    readonly hasConsent: boolean;
    readonly setConsent: (consent: boolean) => void;
    readonly trackEvent: (
      eventName: string,
      parameters?: Record<string, unknown>
    ) => void;
    readonly trackPageView: (pageTitle: string, pagePath?: string) => void;
  };
  readonly clarity: {
    readonly isInitialized: boolean;
    readonly hasConsent: boolean;
    readonly setConsent: (consent: boolean) => void;
  };
  // 統合された同意管理
  readonly setAnalyticsConsent: (consent: boolean) => void;
  readonly hasAnalyticsConsent: boolean;
}

const AnalyticsContext = createContext<AnalyticsContextType | null>(null);

interface AnalyticsProviderProps {
  children: ReactNode;
  // 初期同意状態（オプション）
  initialConsent?: boolean;
}

/**
 * @description アナリティクスプロバイダー
 * GA4とClarityの初期化と同意管理を統合
 */
export function AnalyticsProvider({
  children,
  initialConsent = false,
}: AnalyticsProviderProps) {
  const ga4 = useGA4Service();
  const clarity = useClarityService();
  const location = useLocation();

  // 統合された同意管理
  const setAnalyticsConsent = useCallback(
    (consent: boolean) => {
      ga4.setConsent(consent);
      clarity.setConsent(consent);

      // ローカルストレージに同意状態を保存
      if (consent) {
        localStorage.setItem(
          ANALYTICS_CONSTANTS.CONSENT_KEY,
          ANALYTICS_CONSTANTS.CONSENT_VALUES.ACCEPTED
        );
      } else {
        localStorage.removeItem(ANALYTICS_CONSTANTS.CONSENT_KEY);
      }
    },
    [ga4, clarity]
  );

  // 初期化時に保存された同意状態を復元
  useEffect(() => {
    const savedConsent =
      localStorage.getItem(ANALYTICS_CONSTANTS.CONSENT_KEY) ===
      ANALYTICS_CONSTANTS.CONSENT_VALUES.ACCEPTED;
    if (savedConsent || initialConsent) {
      setAnalyticsConsent(true);
    }
  }, [initialConsent, setAnalyticsConsent]);

  // ページ遷移を自動トラッキング
  useEffect(() => {
    if (ga4.isEnabled && ga4.hasConsent) {
      // ページタイトルとパスを送信
      const pageTitle = document.title || 'Untitled Page';
      ga4.trackPageView(pageTitle, location.pathname);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, ga4.isEnabled, ga4.hasConsent, ga4.trackPageView]);

  const contextValue: AnalyticsContextType = useMemo(
    () => ({
      ga4,
      clarity,
      setAnalyticsConsent,
      hasAnalyticsConsent: ga4.hasConsent && clarity.hasConsent,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      ga4.isEnabled,
      ga4.hasConsent,
      ga4.setConsent,
      ga4.trackEvent,
      ga4.trackPageView,
      clarity.isInitialized,
      clarity.hasConsent,
      clarity.setConsent,
      setAnalyticsConsent,
    ]
  );

  return (
    <AnalyticsContext.Provider value={contextValue}>
      {children}
    </AnalyticsContext.Provider>
  );
}

// コンテキストをエクスポート（useAnalyticsフックで使用）
export { AnalyticsContext };

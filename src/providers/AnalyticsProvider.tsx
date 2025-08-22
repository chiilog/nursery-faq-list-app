/**
 * アナリティクスプロバイダーコンポーネント
 * GA4とMicrosoft Clarityを統合管理
 */

import { useCallback, useEffect, useMemo, type ReactNode } from 'react';
import {
  useGA4Service,
  type UseGA4ServiceReturn,
} from '../services/ga4Service';
import {
  useClarityService,
  type UseClarityServiceReturn,
} from '../services/clarityService';
import { useLocation } from 'react-router-dom';
import { useCookieConsent } from '../hooks/useCookieConsent';
import {
  AnalyticsContext,
  type AnalyticsContextType,
} from '../contexts/analyticsContext';

interface AnalyticsProviderProps {
  children: ReactNode;
}

/**
 * @description アナリティクスプロバイダー
 * GA4とClarityの初期化と同意管理を統合
 */
export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const ga4: UseGA4ServiceReturn = useGA4Service();
  const clarity: UseClarityServiceReturn = useClarityService();
  const location = useLocation();
  const { consent, setConsent } = useCookieConsent();

  // 統合された同意管理
  const setAnalyticsConsent = useCallback(
    (consentValue: boolean) => {
      setConsent(consentValue);
      ga4.setConsent(consentValue);
      clarity.setConsent(consentValue);
    },
    [setConsent, ga4, clarity]
  );

  // 同意状態の変更時にサービスに反映
  useEffect(() => {
    if (consent !== null) {
      const consentValue = consent === true;
      ga4.setConsent(consentValue);
      clarity.setConsent(consentValue);
    }
  }, [consent, ga4, clarity]);

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
      hasAnalyticsConsent: consent === true,
    }),
    [ga4, clarity, setAnalyticsConsent, consent]
  );

  return (
    <AnalyticsContext.Provider value={contextValue}>
      {children}
    </AnalyticsContext.Provider>
  );
}

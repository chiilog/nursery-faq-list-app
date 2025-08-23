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

  // 統合されたイベントトラッキング
  // GA4のみがカスタムイベントをサポート（Clarityはセッションレコーディングのため不要）
  const trackEvent = useCallback(
    (name: string, params?: Record<string, unknown>) => {
      // 同意がない場合は送信しない
      if (consent !== true) return;
      // GA4にイベントを送信
      ga4.trackEvent(name, params);
    },
    [ga4, consent]
  );

  // 同意状態の変更時にサービスに反映
  useEffect(() => {
    if (consent !== null) {
      const consentValue = consent === true;
      ga4.setConsent(consentValue);
      clarity.setConsent(consentValue);
    }
  }, [consent, ga4, clarity]);

  const contextValue: AnalyticsContextType = useMemo(
    () => ({
      ga4,
      clarity,
      setAnalyticsConsent,
      hasAnalyticsConsent: consent === true,
      trackEvent,
    }),
    [ga4, clarity, setAnalyticsConsent, consent, trackEvent]
  );

  return (
    <AnalyticsContext.Provider value={contextValue}>
      {children}
    </AnalyticsContext.Provider>
  );
}

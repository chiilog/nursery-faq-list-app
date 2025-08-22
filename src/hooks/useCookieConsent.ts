import { useState, useEffect } from 'react';

import { ANALYTICS_CONSTANTS } from '../constants/analytics';

export interface UseCookieConsentReturn {
  consent: boolean | null;
  setConsent: (consent: boolean) => void;
  loading: boolean;
}

/**
 * @description Cookieの同意状態を管理するReactフック。ローカルストレージからの読み込みと保存を行います。
 * @returns 同意状態とその操作関数を含むオブジェクト
 * @example
 * ```typescript
 * const { consent, setConsent, loading } = useCookieConsent();
 * if (!loading && consent === null) {
 *   // 同意バナーを表示
 * }
 * ```
 */
export const useCookieConsent = (): UseCookieConsentReturn => {
  const [consent, setConsentState] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadConsentFromStorage = () => {
      try {
        const storedConsent = localStorage.getItem(
          ANALYTICS_CONSTANTS.CONSENT_KEY
        );
        if (storedConsent === ANALYTICS_CONSTANTS.CONSENT_VALUES.ACCEPTED) {
          setConsentState(true);
        } else if (
          storedConsent === ANALYTICS_CONSTANTS.CONSENT_VALUES.DECLINED
        ) {
          setConsentState(false);
        }
        // それ以外(null含む)は初期値nullのまま
      } catch (error) {
        console.warn('Failed to load cookie consent from storage:', error);
      } finally {
        setLoading(false);
      }
    };

    loadConsentFromStorage();
  }, []);

  const setConsent = (newConsent: boolean) => {
    try {
      localStorage.setItem(
        ANALYTICS_CONSTANTS.CONSENT_KEY,
        newConsent
          ? ANALYTICS_CONSTANTS.CONSENT_VALUES.ACCEPTED
          : ANALYTICS_CONSTANTS.CONSENT_VALUES.DECLINED
      );
      setConsentState(newConsent);
    } catch (error) {
      console.warn('Failed to save cookie consent to storage:', error);
      setConsentState(newConsent);
    }
  };

  return {
    consent,
    setConsent,
    loading,
  };
};

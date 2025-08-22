import { useState, useEffect } from 'react';

interface UseCookieConsentReturn {
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
        const storedConsent = localStorage.getItem('cookie-consent');
        if (storedConsent !== null) {
          setConsentState(storedConsent === 'true');
        }
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
      localStorage.setItem('cookie-consent', String(newConsent));
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

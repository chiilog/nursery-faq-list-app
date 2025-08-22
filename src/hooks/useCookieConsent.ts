import { useState, useEffect } from 'react';

interface UseCookieConsentReturn {
  consent: boolean | null;
  setConsent: (consent: boolean) => void;
  loading: boolean;
}

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

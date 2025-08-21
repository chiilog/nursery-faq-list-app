import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * Branded type for measurement ID
 */
export type MeasurementId = string & { readonly brand: unique symbol };

/**
 * Result type for async operations
 */
export type GA4LoadResult =
  | { readonly success: true }
  | { readonly success: false; readonly error: Error };

/**
 * @description セキュリティ検証付きの測定IDを作成するファクトリー関数
 * @param id - 検証する測定ID文字列
 * @returns 検証済みの測定IDブランド型
 * @throws {Error} 測定IDが無効または危険なパターンを含む場合
 * @example
 * ```typescript
 * const measurementId = createMeasurementId('G-1234567890');
 * ```
 */
export const createMeasurementId = (id: string | undefined): MeasurementId => {
  if (!id) {
    throw new Error('Invalid measurement ID');
  }
  const normalized = id.trim();
  if (normalized === '') {
    throw new Error('Invalid measurement ID');
  }

  // 基本的な文字チェック（英数・ハイフン・アンダースコアのみ）
  const allowedPattern = /^[A-Za-z0-9_-]+$/;
  if (!allowedPattern.test(normalized)) {
    throw new Error('Invalid measurement ID');
  }

  return normalized as MeasurementId;
};

// グローバルオブジェクトの拡張定義
declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (command: string, ...args: unknown[]) => void;
  }
}

/**
 * GA4サービスの返り値型定義
 */
export interface UseGA4ServiceReturn {
  isEnabled: boolean;
  hasConsent: boolean;
  setConsent: (consent: boolean) => void;
  trackEvent: (eventName: string, parameters?: Record<string, unknown>) => void;
  trackPageView: (pageTitle: string, pagePath?: string) => void;
}

/**
 * @description GA4スクリプトを動的に読み込む
 * @param measurementId - 検証済みの測定ID
 * @returns 成功状態またはエラーを含む読み込み結果のPromise
 * @example
 * ```typescript
 * const result = await loadGA4Script(measurementId);
 * if (result.success) {
 *   console.log('GA4スクリプトの読み込みが成功しました');
 * }
 * ```
 */
const loadGA4Script = async (
  measurementId: MeasurementId
): Promise<GA4LoadResult> => {
  try {
    // 既にGA4スクリプトがDOMに追加済みかをチェック（gtag存在は初期スタブの可能性がある）
    if (document.querySelector('script[data-ga4="true"]')) {
      return { success: true };
    }

    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(
        measurementId
      )}`;
      script.setAttribute('data-ga4', 'true');

      let resolved = false;

      script.onload = () => {
        if (!resolved) {
          resolved = true;
          resolve({ success: true });
        }
      };

      script.onerror = () => {
        if (!resolved) {
          resolved = true;
          resolve({
            success: false,
            error: new Error('Failed to load GA4 script'),
          });
        }
      };

      document.head.appendChild(script);

      // テスト環境での即座解決
      if (import.meta.env.MODE === 'test') {
        if (!resolved) {
          resolved = true;
          resolve({ success: true });
        }
      }
    });
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error : new Error('Unknown error occurred'),
    };
  }
};

/**
 * @description Google Analytics 4統合カスタムフック
 * プライバシーを考慮したGA4イベント送信とスクリプト管理を提供
 * @returns GA4サービス操作用の関数とステート
 * @example
 * ```typescript
 * const { isEnabled, hasConsent, setConsent, trackEvent, trackPageView } = useGA4Service();
 *
 * // 同意を設定
 * setConsent(true);
 *
 * // イベントを送信
 * trackEvent('button_click', { button_name: 'signup' });
 *
 * // ページビューを送信
 * trackPageView('Home Page', '/');
 * ```
 */
export function useGA4Service(): UseGA4ServiceReturn {
  const [isServiceEnabled, setIsServiceEnabled] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);
  const [measurementId] = useState<MeasurementId>(() => {
    const id = import.meta.env.VITE_GA4_MEASUREMENT_ID as unknown;
    const measurementIdStr = typeof id === 'string' ? id : undefined;
    try {
      return createMeasurementId(measurementIdStr);
    } catch {
      // 開発環境でのみエラーログを出力
      if (import.meta.env.DEV) {
        console.warn('GA4 measurement ID is not configured properly');
      }
      return createMeasurementId('G-XXXXXXXXXX'); // フォールバック値
    }
  });

  // コンポーネントのマウント状態をトラック
  const isMountedRef = useRef(true);

  /**
   * GA4サービスを初期化
   */
  const initialize = useCallback(async () => {
    // 同意がない場合は初期化しない
    if (!consentGiven) return;

    // 分析機能が無効化されている場合は初期化しない
    if (import.meta.env.VITE_ANALYTICS_ENABLED === 'false') return;

    // Do Not Track設定が有効な場合は初期化しない
    if (navigator.doNotTrack === '1') return;

    try {
      // gtag関数とdataLayerを先に初期化
      window.dataLayer = window.dataLayer || [];

      if (!window.gtag) {
        window.gtag = function (...args: unknown[]) {
          window.dataLayer?.push(args);
        };
      }

      const loadResult = await loadGA4Script(measurementId);

      if (isMountedRef.current && loadResult.success) {
        // GA4初期化
        if (window.gtag) {
          window.gtag('js', new Date());
          window.gtag('config', measurementId, {
            anonymize_ip: true,
            cookie_expires: 60 * 60 * 24 * 30, // 30日
          });
        }

        setIsServiceEnabled(true);
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('GA4 initialization failed:', error);
      }
    }
  }, [consentGiven, measurementId]);

  /**
   * 同意状態を設定
   */
  const setConsent = useCallback(
    (consent: boolean) => {
      setConsentGiven(consent);

      if (consent) {
        void initialize();
      } else {
        setIsServiceEnabled(false);
      }

      if (import.meta.env.DEV) {
        console.log('[GA4Service] Consent updated:', consent);
      }
    },
    [initialize]
  );

  /**
   * カスタムイベントを送信
   */
  const trackEvent = useCallback(
    (eventName: string, parameters?: Record<string, unknown>) => {
      if (!isServiceEnabled || !consentGiven || !window.gtag) {
        return;
      }

      try {
        window.gtag('event', eventName, parameters);
      } catch (error) {
        if (import.meta.env.DEV) {
          console.warn('[GA4Service] Track event failed:', error);
        }
      }
    },
    [isServiceEnabled, consentGiven]
  );

  /**
   * ページビューを送信
   */
  const trackPageView = useCallback(
    (pageTitle: string, pagePath?: string) => {
      const parameters: Record<string, unknown> = {
        page_title: pageTitle,
      };
      if (pagePath) {
        parameters.page_location = pagePath;
      }
      trackEvent('page_view', parameters);
    },
    [trackEvent]
  );

  // 初期化処理
  useEffect(() => {
    if (consentGiven) {
      void initialize();
    }
  }, [consentGiven, initialize]);

  // クリーンアップ
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return {
    isEnabled: isServiceEnabled,
    hasConsent: consentGiven,
    setConsent,
    trackEvent,
    trackPageView,
  };
}

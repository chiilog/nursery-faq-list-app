import { useState, useCallback, useEffect, useRef } from 'react';
import {
  createAnalyticsCore,
  type AnalyticsConfig,
  AnalyticsError,
  AnalyticsErrorType,
  type AnalyticsResult,
} from './analyticsCore';
import { ANALYTICS_CONSTANTS } from '../constants/analytics';
import { isDevelopment, safeExecute } from '../utils/environment';

/**
 * Branded type for measurement ID
 */
export type MeasurementId = string & { readonly brand: unique symbol };

/**
 * Result type for async operations (deprecated - use AnalyticsResult instead)
 */
export type GA4LoadResult = AnalyticsResult;

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
    throw new AnalyticsError(
      AnalyticsErrorType.CONFIGURATION_ERROR,
      'GA4Service',
      'Measurement ID is required'
    );
  }
  const normalized = id.trim();
  if (normalized === '') {
    throw new AnalyticsError(
      AnalyticsErrorType.CONFIGURATION_ERROR,
      'GA4Service',
      'Measurement ID cannot be empty'
    );
  }

  // 基本的な文字チェック（英数・ハイフン・アンダースコアのみ）
  const allowedPattern = /^[A-Za-z0-9_-]+$/;
  if (!allowedPattern.test(normalized)) {
    throw new AnalyticsError(
      AnalyticsErrorType.CONFIGURATION_ERROR,
      'GA4Service',
      'Measurement ID contains invalid characters'
    );
  }

  return normalized as MeasurementId;
};

/**
 * @description GA4サービスの関数型実装
 * @param measurementId - 測定ID
 * @returns GA4サービス関数群
 */
const createGA4ServiceFunctions = (measurementId: MeasurementId) => {
  let isInitialized = false;

  const config: AnalyticsConfig = {
    envVarName: ANALYTICS_CONSTANTS.ENV_VARS.GA4_MEASUREMENT_ID,
    serviceName: 'GA4Service',
    isInitialized: false,
    serviceId: measurementId,
  };

  const core = createAnalyticsCore(config);

  /**
   * @description GA4スクリプトを動的に読み込む
   * @returns 読み込み結果のPromise
   */
  const loadGA4Script = async (): Promise<void> => {
    // 既にGA4スクリプトがDOMに追加済みかをチェック
    if (document.querySelector('script[data-ga4="true"]')) {
      return;
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(
        measurementId
      )}`;
      script.setAttribute('data-ga4', 'true');

      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load GA4 script'));

      document.head.appendChild(script);

      // テスト環境での即座解決
      if (import.meta.env.MODE === 'test') {
        resolve();
      }
    });
  };

  /**
   * @description gtag関数を初期化
   */
  const initializeGtag = (): void => {
    // gtag関数とdataLayerを先に初期化
    window.dataLayer = window.dataLayer || [];

    if (!window.gtag) {
      window.gtag = function (...args: unknown[]) {
        window.dataLayer?.push(args);
      };
    }

    // GA4初期化
    window.gtag('js', new Date());
    window.gtag('config', measurementId, {
      anonymize_ip: true,
      cookie_expires: 60 * 60 * 24 * 30, // 30日
    });
  };

  /**
   * @description GA4サービスを初期化
   * @returns 初期化結果のPromise
   */
  const initialize = async (): Promise<AnalyticsResult> => {
    if (isInitialized || !measurementId) {
      return { success: true, data: undefined };
    }

    if (core.isAnalyticsDisabled() || isDevelopment()) {
      return { success: true, data: undefined };
    }

    return safeExecute(async () => {
      await loadGA4Script();
      initializeGtag();
      isInitialized = true;
      config.isInitialized = true;
      core.devLog('GA4 initialized successfully');
      return { success: true as const, data: undefined as void };
    }, 'GA4 initialization').then((result) => {
      if (result === null) {
        const analyticsError = new AnalyticsError(
          AnalyticsErrorType.INITIALIZATION_FAILED,
          'GA4Service',
          'Failed to initialize GA4 service'
        );
        return { success: false as const, error: analyticsError };
      }
      return result;
    });
  };

  /**
   * @description GA4サービスを無効化
   */
  const disable = (): void => {
    isInitialized = false;
    config.isInitialized = false;
    core.devLog('GA4 disabled');
  };

  /**
   * @description イベントをトラッキング
   * @param eventName - イベント名
   * @param parameters - イベントパラメータ
   */
  const trackEvent = (
    eventName: string,
    parameters?: Record<string, unknown>
  ): void => {
    if (!core.canExecute() || !window.gtag) {
      return;
    }

    try {
      window.gtag('event', eventName, parameters);
    } catch (error) {
      core.devWarn('Track event failed:', error);
    }
  };

  /**
   * @description ページビューをトラッキング
   * @param pageTitle - ページタイトル
   * @param pagePath - ページパス
   */
  const trackPageView = (pageTitle: string, pagePath?: string): void => {
    const parameters: Record<string, unknown> = {
      page_title: pageTitle,
    };
    if (pagePath) {
      parameters.page_location = pagePath;
    }
    trackEvent('page_view', parameters);
  };

  return {
    initialize,
    disable,
    trackEvent,
    trackPageView,
    get isInitialized() {
      return isInitialized;
    },
  };
};

// シングルトンインスタンス用の関数
let ga4ServiceInstance: ReturnType<typeof createGA4ServiceFunctions> | null =
  null;

/**
 * @description GA4サービスインスタンスを取得または作成
 * @returns GA4サービスインスタンス
 */
const getGA4ServiceInstance = (): ReturnType<
  typeof createGA4ServiceFunctions
> => {
  if (!ga4ServiceInstance) {
    const core = createAnalyticsCore({
      envVarName: ANALYTICS_CONSTANTS.ENV_VARS.GA4_MEASUREMENT_ID,
      serviceName: 'GA4Service',
      isInitialized: false,
      serviceId: '',
    });

    let measurementId: MeasurementId;
    try {
      const serviceId = core.getServiceId(
        ANALYTICS_CONSTANTS.ENV_VARS.GA4_MEASUREMENT_ID
      );
      measurementId = createMeasurementId(serviceId);
    } catch {
      measurementId = createMeasurementId('G-XXXXXXXXXX');
      core.devWarn('GA4 measurement ID is not configured properly');
    }

    ga4ServiceInstance = createGA4ServiceFunctions(measurementId);
  }
  return ga4ServiceInstance;
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
  readonly isEnabled: boolean;
  readonly hasConsent: boolean;
  readonly setConsent: (consent: boolean) => void;
  readonly trackEvent: (
    eventName: string,
    parameters?: Record<string, unknown>
  ) => void;
  readonly trackPageView: (pageTitle: string, pagePath?: string) => void;
}

/**
 * @description GA4サービスを管理するReactフック。Cookieの同意管理、サービスの初期化、イベント追跡を提供します。
 * @returns GA4サービスの状態と操作関数を含むオブジェクト
 * @example
 * ```typescript
 * const { isEnabled, setConsent, trackEvent } = useGA4Service();
 * setConsent(true);
 * trackEvent('click', { button_name: 'submit' });
 * ```
 */
export function useGA4Service(): UseGA4ServiceReturn {
  const [isServiceEnabled, setIsServiceEnabled] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);

  // コンポーネントのマウント状態をトラック
  const isMountedRef = useRef(true);

  /**
   * GA4サービスを初期化
   */
  const initialize = useCallback(async () => {
    // 同意がない場合は初期化しない
    if (!consentGiven) return;

    try {
      await getGA4ServiceInstance().initialize();
      if (isMountedRef.current) {
        setIsServiceEnabled(true);
      }
    } catch {
      // エラーハンドリングはサービス内で実行済み
    }
  }, [consentGiven]);

  /**
   * 同意状態を設定
   */
  const setConsent = useCallback(
    (consent: boolean) => {
      setConsentGiven(consent);

      if (consent) {
        initialize().catch((error) => {
          // 適切なエラーハンドリング
          console.warn('GA4 initialization failed:', error);
        });
      } else {
        getGA4ServiceInstance().disable();
        setIsServiceEnabled(false);
      }
    },
    [initialize]
  );

  /**
   * カスタムイベントを送信
   */
  const trackEvent = useCallback(
    (eventName: string, parameters?: Record<string, unknown>) => {
      if (!isServiceEnabled || !consentGiven) {
        return;
      }
      getGA4ServiceInstance().trackEvent(eventName, parameters);
    },
    [isServiceEnabled, consentGiven]
  );

  /**
   * ページビューを送信
   */
  const trackPageView = useCallback(
    (pageTitle: string, pagePath?: string) => {
      if (!isServiceEnabled || !consentGiven) {
        return;
      }
      getGA4ServiceInstance().trackPageView(pageTitle, pagePath);
    },
    [isServiceEnabled, consentGiven]
  );

  // 初期化処理
  useEffect(() => {
    if (consentGiven) {
      initialize().catch((error) => {
        console.warn('GA4 initialization failed:', error);
      });
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

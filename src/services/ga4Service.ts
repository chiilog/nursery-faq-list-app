import { useState, useCallback, useEffect, useRef } from 'react';
import ReactGA from 'react-ga4';
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
 * @description GA4初期化オプションの型定義
 */
interface GA4InitOptions {
  readonly testMode: boolean;
  readonly gaOptions: {
    readonly anonymize_ip: boolean;
    readonly cookie_expires: number;
    readonly send_page_view: boolean;
    readonly allow_google_signals?: boolean;
    readonly allow_ad_personalization_signals?: boolean;
    readonly storage?: string;
  };
  readonly gtagOptions?: {
    readonly debug_mode?: boolean;
  };
}

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
 * @description GA4初期化オプションを型安全に作成
 * @returns 初期化オプション
 */
const createGA4Options = (): GA4InitOptions => ({
  testMode: import.meta.env.MODE === 'test',
  gaOptions: {
    // プライバシー設定（設計書の方針に基づく）
    anonymize_ip: true, // IPアドレスの匿名化
    cookie_expires: 60 * 60 * 24 * 30, // 30日
    send_page_view: false, // 手動でページビューを送信
    allow_google_signals: false, // Googleシグナルを無効化
    allow_ad_personalization_signals: false, // 広告パーソナライゼーションを無効化
    storage: 'none', // Cookieを使用しない
  },
  // GA4用のgtagOptionsでデバッグモードを制御
  ...(import.meta.env.VITE_ANALYTICS_DEBUG === 'true'
    ? {
        gtagOptions: {
          debug_mode: true,
        },
      }
    : {}),
});

/**
 * @description GA4サービスの関数型実装（react-ga4使用）
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
   * @description GA4サービスを初期化（react-ga4使用）
   * @returns 初期化結果のPromise
   */
  const initialize = async (): Promise<AnalyticsResult> => {
    if (isInitialized) {
      return { success: true as const, data: undefined };
    }

    if (core.isAnalyticsDisabled() || isDevelopment()) {
      return { success: true as const, data: undefined };
    }

    try {
      const result = await safeExecute(() => {
        // react-ga4による初期化
        const options = createGA4Options();
        ReactGA.initialize(measurementId, options);

        isInitialized = true;
        config.isInitialized = true;
        core.devLog('GA4 initialized successfully with react-ga4');
        return { success: true as const, data: undefined };
      }, 'GA4 initialization');

      if (result === null) {
        const analyticsError = new AnalyticsError(
          AnalyticsErrorType.INITIALIZATION_FAILED,
          'GA4Service',
          'Failed to initialize GA4 service with react-ga4'
        );
        return { success: false as const, error: analyticsError };
      }

      return result;
    } catch (error) {
      const analyticsError = new AnalyticsError(
        AnalyticsErrorType.INITIALIZATION_FAILED,
        'GA4Service',
        'Failed to initialize GA4 service with react-ga4',
        error instanceof Error ? error : new Error(String(error))
      );
      return { success: false as const, error: analyticsError };
    }
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
   * @description イベントをトラッキング（react-ga4使用）
   * @param eventName - イベント名
   * @param parameters - イベントパラメータ
   */
  const trackEvent = (
    eventName: string,
    parameters?: Record<string, unknown>
  ): void => {
    if (!core.canExecute() || !isInitialized) {
      return;
    }

    try {
      if (typeof eventName !== 'string' || eventName.trim() === '') {
        core.devWarn('Track event skipped: invalid eventName');
        return;
      }
      ReactGA.event(eventName, parameters);
    } catch (error) {
      core.devWarn('Track event failed:', error);
    }
  };

  /**
   * @description ページビューをトラッキング（react-ga4使用）
   * @param pageTitle - ページタイトル
   * @param pagePath - ページパス
   */
  const trackPageView = (pageTitle: string, pagePath?: string): void => {
    if (!core.canExecute() || !isInitialized) {
      return;
    }

    try {
      const hitData: Record<string, unknown> = {
        hitType: 'pageview',
        title: pageTitle,
      };

      const resolvedPage =
        pagePath ??
        (typeof window !== 'undefined'
          ? `${window.location.pathname}${window.location.search}`
          : undefined);
      if (resolvedPage) {
        hitData.page = resolvedPage;
      }

      ReactGA.send(hitData);
    } catch (error) {
      core.devWarn('Track page view failed:', error);
    }
  };

  /**
   * @description Consent Mode v2 を更新（gtag レベルでの同意反映）
   * @param granted - 同意状態
   */
  const updateConsent = (granted: boolean): void => {
    if (!core.canExecute()) return;
    try {
      // react-ga4のgtagメソッドを使用してConsent Mode v2を更新
      ReactGA.gtag(
        'consent',
        'update',
        granted
          ? { analytics_storage: 'granted', ad_storage: 'granted' }
          : { analytics_storage: 'denied', ad_storage: 'denied' }
      );
    } catch (error) {
      core.devWarn('Update consent failed:', error);
    }
  };

  return {
    initialize,
    disable,
    trackEvent,
    trackPageView,
    updateConsent,
    get isInitialized() {
      return isInitialized;
    },
  };
};

/**
 * @description no-op GA4サービス実装（測定ID未設定時用）
 * @param core - 分析コア
 * @returns no-op GA4サービス関数群
 */
function createNoopGA4Service(core: ReturnType<typeof createAnalyticsCore>) {
  return {
    initialize() {
      core.devWarn('GA4 is disabled (no-op instance)');
      return Promise.resolve({
        success: true as const,
        data: undefined,
      });
    },
    disable() {
      core.devLog('GA4 disabled (no-op)');
    },
    trackEvent() {},
    trackPageView() {},
    updateConsent() {},
    get isInitialized() {
      return false;
    },
  };
}

// シングルトンインスタンス用の関数
let ga4ServiceInstance:
  | ReturnType<typeof createGA4ServiceFunctions>
  | ReturnType<typeof createNoopGA4Service>
  | null = null;

/**
 * @description GA4サービスインスタンスを取得または作成
 * @returns GA4サービスインスタンス
 */
const getGA4ServiceInstance = ():
  | ReturnType<typeof createGA4ServiceFunctions>
  | ReturnType<typeof createNoopGA4Service> => {
  if (!ga4ServiceInstance) {
    const core = createAnalyticsCore({
      envVarName: ANALYTICS_CONSTANTS.ENV_VARS.GA4_MEASUREMENT_ID,
      serviceName: 'GA4Service',
      isInitialized: false,
      serviceId: '',
    });

    const serviceId = core.getServiceId(
      ANALYTICS_CONSTANTS.ENV_VARS.GA4_MEASUREMENT_ID
    );
    if (!serviceId) {
      core.devWarn('GA4 measurement ID is missing; GA4 will remain disabled');
      ga4ServiceInstance = createNoopGA4Service(core);
      return ga4ServiceInstance;
    }
    const measurementId = createMeasurementId(serviceId);
    ga4ServiceInstance = createGA4ServiceFunctions(measurementId);
  }
  return ga4ServiceInstance;
};

/**
 * @description テスト用：シングルトンインスタンスをリセット
 */
export const resetGA4ServiceInstance = (): void => {
  ga4ServiceInstance = null;
};

/**
 * @description GA4サービスの返り値型定義
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
 * @description GA4サービスを管理するReactフック。react-ga4ライブラリを使用してCookieの同意管理、サービスの初期化、イベント追跡を提供します。
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
      const serviceInstance = getGA4ServiceInstance();
      const result = await serviceInstance.initialize();

      if (isMountedRef.current && result.success) {
        // no-opサービス（Analytics無効時）ではisEnabledをfalseのままに保持
        const isRealService = serviceInstance.isInitialized;
        setIsServiceEnabled(isRealService);
      }
    } catch {
      // エラーハンドリングはサービス内で実行済み
    }
  }, [consentGiven]);

  /**
   * 同意状態を設定
   */
  const setConsent = useCallback((consent: boolean) => {
    setConsentGiven(consent);

    // Consent Mode v2 を即時更新し（gtag 側の同意反映）、初期化は useEffect に委譲
    getGA4ServiceInstance().updateConsent(consent);
    if (!consent) {
      getGA4ServiceInstance().disable();
      setIsServiceEnabled(false);
    }
  }, []);

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
      void initialize().catch((error) => {
        console.warn('GA4 initialization failed:', error);
      });
    }
  }, [consentGiven, initialize]);

  // マウント状態の管理
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

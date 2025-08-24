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
 * Branded type for clarity project ID
 */
export type ClarityProjectId = string & { readonly brand: unique symbol };

/**
 * Result type for async operations (deprecated - use AnalyticsResult instead)
 */
export type ClarityLoadResult = AnalyticsResult;

/**
 * @description セキュリティ検証付きのプロジェクトIDを作成するファクトリー関数
 * @param id - 検証するプロジェクトID文字列
 * @returns 検証済みのプロジェクトIDブランド型
 * @throws {Error} プロジェクトIDが無効または危険なパターンを含む場合
 * @example
 * ```typescript
 * const projectId = createClarityProjectId('test12345');
 * ```
 */
export const createClarityProjectId = (
  id: string | null | undefined
): ClarityProjectId => {
  if (id === undefined || id === null) {
    throw new AnalyticsError(
      AnalyticsErrorType.CONFIGURATION_ERROR,
      'ClarityService',
      'Clarity project ID is required'
    );
  }
  const normalized = id.trim();
  if (normalized === '') {
    throw new AnalyticsError(
      AnalyticsErrorType.CONFIGURATION_ERROR,
      'ClarityService',
      'Clarity project ID cannot be empty'
    );
  }

  // 基本的な文字チェック（英数字のみ）
  const allowedPattern = /^[A-Za-z0-9]+$/;
  if (!allowedPattern.test(normalized)) {
    throw new AnalyticsError(
      AnalyticsErrorType.CONFIGURATION_ERROR,
      'ClarityService',
      'Clarity project ID contains invalid characters'
    );
  }

  return normalized as ClarityProjectId;
};

/**
 * @description Clarityサービスの関数型実装
 * @param projectId - プロジェクトID
 * @returns Clarityサービス関数群
 */
const createClarityServiceFunctions = (projectId: ClarityProjectId) => {
  let isInitialized = false;

  const config: AnalyticsConfig = {
    envVarName: ANALYTICS_CONSTANTS.ENV_VARS.CLARITY_PROJECT_ID,
    serviceName: 'ClarityService',
    isInitialized: false,
    serviceId: projectId,
  };

  const core = createAnalyticsCore(config);

  /**
   * @description Clarityスクリプトを動的に読み込む
   */
  const loadClarityScript = (): void => {
    // Clarityスクリプトの動的読み込み（可読性を向上）
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.clarity.ms/tag/${projectId}`;

    const firstScript = document.getElementsByTagName('script')[0];
    if (firstScript && firstScript.parentNode) {
      firstScript.parentNode.insertBefore(script, firstScript);
    } else {
      document.head.appendChild(script);
    }

    // グローバル関数の初期化
    if (!window.clarity) {
      window.clarity = function (...args: unknown[]) {
        if (!window.clarity!.q) {
          window.clarity!.q = [];
        }
        window.clarity!.q.push(args);
      };
      window.clarity.q = [];
    }
  };

  /**
   * @description Clarity設定を適用
   * マスク制御はHTML属性(data-clarity-mask/data-clarity-unmask)または
   * Clarityダッシュボードのマスクモード設定で行います
   */
  const applyClaritySettings = (): void => {
    if (window.clarity) {
      // 必要に応じて将来的にここで有効な設定を追加
    }
  };

  /**
   * @description Clarityサービスを初期化
   * @returns 初期化結果のPromise
   */
  const initialize = async (): Promise<AnalyticsResult> => {
    if (isInitialized) {
      return { success: true, data: undefined };
    }

    if (core.isAnalyticsDisabled() || isDevelopment()) {
      return { success: true, data: undefined };
    }

    return safeExecute(() => {
      loadClarityScript();
      applyClaritySettings();
      isInitialized = true;
      config.isInitialized = true;
      core.devLog('Clarity initialized successfully');
      return { success: true as const, data: undefined as void };
    }, 'Clarity initialization').then((result) => {
      if (result === null) {
        const analyticsError = new AnalyticsError(
          AnalyticsErrorType.INITIALIZATION_FAILED,
          'ClarityService',
          'Failed to initialize Clarity service'
        );
        return { success: false as const, error: analyticsError };
      }
      return result;
    });
  };

  /**
   * @description Clarityサービスを無効化
   */
  const disable = (): void => {
    if (typeof window !== 'undefined' && window.clarity) {
      window.clarity('consent', false);
      window.clarity('stop');
    }
    isInitialized = false;
    config.isInitialized = false;
    core.devLog('Clarity disabled');
  };

  /**
   * @description カスタムイベントをトラッキング
   * @param eventName - イベント名
   * @param parameters - イベントパラメータ（オブジェクトを直接渡す）
   */
  const trackEvent = (
    eventName: string,
    parameters?: Record<string, unknown>
  ): void => {
    if (!core.canExecute() || !window.clarity) {
      return;
    }

    try {
      // Clarityのカスタムイベントとして送信
      window.clarity('event', eventName, parameters ?? {});
    } catch (error) {
      core.devWarn('Track event failed:', error);
    }
  };

  /**
   * @description ページビューイベントをトラッキング
   * @param pageTitle - ページタイトル
   * @param pagePath - ページパス
   */
  const trackPageView = (pageTitle: string, pagePath?: string): void => {
    if (!core.canExecute() || !window.clarity) {
      return;
    }

    try {
      // 必要に応じてページ情報をカスタムイベントで送信
      window.clarity('event', 'page_view', {
        url: pagePath ?? window.location.href,
        title: pageTitle,
      });
    } catch (error) {
      core.devWarn('Track page view failed:', error);
    }
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

/**
 * @description 無効化されたClarityサービス（no-op実装）
 * 設定不備時の安全な代替実装
 */
const createNoopClarityService = (
  core: ReturnType<typeof createAnalyticsCore>
) => {
  return {
    initialize(): Promise<AnalyticsResult> {
      core.devWarn('Clarity is disabled (no-op instance)');
      return Promise.resolve({
        success: true as const,
        data: undefined as void,
      });
    },
    disable(): void {
      core.devLog('Clarity disabled (no-op)');
    },
    trackEvent(): void {},
    trackPageView(): void {},
    get isInitialized(): boolean {
      return false;
    },
  };
};

// シングルトンインスタンス用の関数
let clarityServiceInstance: ReturnType<
  typeof createClarityServiceFunctions
> | null = null;

/**
 * @description Clarityサービスインスタンスを取得または作成
 * @returns Clarityサービスインスタンス
 */
const getClarityServiceInstance = (): ReturnType<
  typeof createClarityServiceFunctions
> => {
  if (!clarityServiceInstance) {
    const core = createAnalyticsCore({
      envVarName: ANALYTICS_CONSTANTS.ENV_VARS.CLARITY_PROJECT_ID,
      serviceName: 'ClarityService',
      isInitialized: false,
      serviceId: '',
    });

    const serviceId = core.getServiceId(
      ANALYTICS_CONSTANTS.ENV_VARS.CLARITY_PROJECT_ID
    );
    if (!serviceId) {
      core.devWarn(
        'Clarity project ID is missing; Clarity will remain disabled'
      );
      clarityServiceInstance = createNoopClarityService(core);
      return clarityServiceInstance;
    }

    try {
      const projectId = createClarityProjectId(serviceId);
      clarityServiceInstance = createClarityServiceFunctions(projectId);
    } catch {
      core.devWarn('Invalid Clarity project ID; Clarity will remain disabled');
      clarityServiceInstance = createNoopClarityService(core);
    }
  }
  return clarityServiceInstance;
};

// グローバルオブジェクトの拡張定義
declare global {
  interface Window {
    clarity?: {
      (...args: unknown[]): void;
      q?: unknown[];
    };
  }
}

/**
 * ClarityServiceの返り値型定義
 */
export interface UseClarityServiceReturn {
  readonly isInitialized: boolean;
  readonly hasConsent: boolean;
  readonly setConsent: (consent: boolean) => void;
}

/**
 * @description Microsoft Clarityサービスを管理するReactフック。Cookieの同意管理とサービスの初期化を提供します。
 * @returns Clarityサービスの状態と操作関数を含むオブジェクト
 * @example
 * ```typescript
 * const { isInitialized, setConsent } = useClarityService();
 * setConsent(true);
 * ```
 */
export function useClarityService(): UseClarityServiceReturn {
  const [isServiceInitialized, setIsServiceInitialized] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);

  // コンポーネントのマウント状態をトラック
  const isMountedRef = useRef(true);

  /**
   * Clarityサービスを初期化
   */
  const initialize = useCallback(async () => {
    // 同意がない場合は初期化しない
    if (!consentGiven) return;

    try {
      await getClarityServiceInstance().initialize();
      if (isMountedRef.current) {
        setIsServiceInitialized(true);
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

    if (!consent) {
      getClarityServiceInstance().disable();
      setIsServiceInitialized(false);
    }
  }, []);

  // 初期化処理
  useEffect(() => {
    if (consentGiven) {
      initialize().catch((error) => {
        console.warn('Clarity initialization failed:', error);
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
    isInitialized: isServiceInitialized,
    hasConsent: consentGiven,
    setConsent,
  };
}

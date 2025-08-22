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
  id: string | undefined
): ClarityProjectId => {
  if (!id) {
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
   */
  const applyClaritySettings = (): void => {
    if (window.clarity) {
      // 入力フィールドの自動マスキング
      window.clarity('set', 'maskInputs', true);
      // テキスト内容のマスキング
      window.clarity('set', 'maskText', true);
    }
  };

  /**
   * @description Clarityサービスを初期化
   * @returns 初期化結果のPromise
   */
  const initialize = async (): Promise<AnalyticsResult> => {
    if (isInitialized || !projectId) {
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
   * @description イベントをトラッキング
   * @param eventName - イベント名
   * @param parameters - イベントパラメータ
   */
  const trackEvent = (
    eventName: string,
    parameters?: Record<string, unknown>
  ): void => {
    if (!core.canExecute() || !window.clarity) {
      return;
    }

    try {
      // Clarityのカスタムタグとして送信
      window.clarity('set', eventName, JSON.stringify(parameters || {}));
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
    if (!core.canExecute() || !window.clarity) {
      return;
    }

    try {
      // ClarityはページビューをデフォルトでSPAトラッキングするため、明示的な処理は不要
      // 必要に応じてカスタムタグでページ情報を送信
      window.clarity(
        'set',
        'page_view',
        JSON.stringify({
          url: pagePath || window.location.pathname,
          title: pageTitle,
        })
      );
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

    let projectId: ClarityProjectId;
    try {
      const serviceId = core.getServiceId(
        ANALYTICS_CONSTANTS.ENV_VARS.CLARITY_PROJECT_ID
      );
      projectId = createClarityProjectId(serviceId);
    } catch {
      projectId = createClarityProjectId('test12345');
      core.devWarn('Clarity project ID is not configured properly');
    }

    clarityServiceInstance = createClarityServiceFunctions(projectId);
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
  const setConsent = useCallback(
    (consent: boolean) => {
      setConsentGiven(consent);

      if (consent) {
        initialize().catch((error) => {
          // 適切なエラーハンドリング
          console.warn('Clarity initialization failed:', error);
        });
      } else {
        getClarityServiceInstance().disable();
        setIsServiceInitialized(false);
      }
    },
    [initialize]
  );

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

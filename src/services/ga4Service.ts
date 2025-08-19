import { useState, useCallback, useEffect } from 'react';

/**
 * Branded type for measurement ID
 */
export type MeasurementId = string & { readonly brand: unique symbol };

/**
 * Branded type for consent state
 */
export type ConsentState = boolean & { readonly brand: unique symbol };

/**
 * Result type for async operations
 */
export type LoadResult =
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
  if (!id || id.trim() === '') {
    throw new Error('Invalid measurement ID');
  }

  // セキュリティチェック：潜在的に危険なパターンを検証
  const dangerousPatterns = [
    /javascript:/i,
    /<script/i,
    /\.\.\//,
    /drop\s+table/i,
    /exec\s+/i,
    /fetch\s*\(/i,
    /[<>"'`]/,
  ];

  if (dangerousPatterns.some((pattern) => pattern.test(id))) {
    throw new Error('Invalid measurement ID');
  }

  return id as MeasurementId;
};

/**
 * @description 型付き同意状態を作成するファクトリー関数
 * @param consent - 真偽値の同意値
 * @returns 同意状態ブランド型
 */
const createConsentState = (consent: boolean): ConsentState => {
  return consent as ConsentState;
};

/**
 * Consent Mode v2の同意設定
 */
export interface ConsentModeSettings {
  analytics_storage: 'granted' | 'denied';
  ad_storage: 'granted' | 'denied';
}

/**
 * Google Analytics gtag関数の型定義（関数オーバーロード）
 */
interface GtagFunction {
  (command: 'js', date: Date): void;
  (
    command: 'config' | 'event' | 'consent',
    targetId: string,
    config?: Record<string, unknown>
  ): void;
}

// グローバルオブジェクトの拡張定義
declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: GtagFunction;
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
  updateConsentMode: (
    settings: ConsentModeSettings,
    regions?: string[]
  ) => void;
}

/**
 * @description 競合状態対策付きでGA4スクリプトを動的に読み込む
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
): Promise<LoadResult> => {
  try {
    // 既に読み込み済みかチェック
    if (window.gtag) {
      return { success: true };
    }

    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;

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
 * Consent Mode v2に対応
 * @returns GA4サービス操作用の関数とステート
 */
export function useGA4Service(): UseGA4ServiceReturn {
  const [isServiceEnabled, setIsServiceEnabled] = useState(false);
  const [consentGiven, setConsentGiven] = useState<ConsentState>(
    createConsentState(false)
  );
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

    let ignore = false;
    try {
      // gtag関数とdataLayerを先に初期化（テスト環境対応）
      window.dataLayer = window.dataLayer || [];

      // テスト環境で既にgtagが設定されている場合はそれを保持
      if (!window.gtag) {
        const gtagFunction: GtagFunction = function (
          command: 'js' | 'config' | 'event' | 'consent',
          ...args: [Date] | [string, Record<string, unknown>?]
        ) {
          window.dataLayer?.push([command, ...args]);
        } as GtagFunction;
        window.gtag = gtagFunction;
      }

      const loadResult = await loadGA4Script(measurementId);

      if (!ignore && loadResult.success) {
        // 現在のgtag関数を取得
        const currentGtag = window.gtag;
        if (currentGtag) {
          // GA4公式スニペット準拠の初期化
          currentGtag('js', new Date());

          // Consent Mode v2の初期設定（全て denied）
          currentGtag('consent', 'default', {
            analytics_storage: 'denied',
            ad_storage: 'denied',
          });

          // GA4プライバシー保護設定
          currentGtag('config', measurementId, {
            anonymize_ip: true,
            allow_google_signals: false,
            allow_ad_personalization_signals: false,
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

    return () => {
      ignore = true;
    };
  }, [consentGiven, measurementId]);

  /**
   * GA4関数の安全な実行ヘルパー
   */
  const executeGA4Command = useCallback(
    (command: 'event' | 'config' | 'consent', ...args: unknown[]): boolean => {
      try {
        // サービスが無効または同意がない場合（consentコマンド以外）
        if (command !== 'consent' && (!isServiceEnabled || !consentGiven)) {
          return false;
        }

        const gtag = window.gtag;
        if (!gtag) {
          return false;
        }

        gtag(command, args[0] as string, args[1] as Record<string, unknown>);
        return true;
      } catch (error) {
        if (import.meta.env.DEV) {
          console.warn(`GA4 ${command} command failed:`, error);
        }
        return false;
      }
    },
    [isServiceEnabled, consentGiven]
  );

  /**
   * 同意状態の変更を処理
   */
  const setConsent = useCallback(
    (consent: boolean) => {
      const consentState = createConsentState(consent);
      setConsentGiven(consentState);
      if (!consent) {
        setIsServiceEnabled(false);
        // 同意取り消し時にConsent Modeを更新
        executeGA4Command('consent', 'update', {
          analytics_storage: 'denied',
          ad_storage: 'denied',
        });
      }
    },
    [executeGA4Command]
  );

  /**
   * カスタムイベントを送信
   */
  const trackEvent = useCallback(
    (eventName: string, parameters?: Record<string, unknown>) => {
      executeGA4Command('event', eventName, parameters);
    },
    [executeGA4Command]
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

  /**
   * Consent Mode v2の設定を更新
   */
  const updateConsentMode = useCallback(
    (settings: ConsentModeSettings, regions?: string[]) => {
      const consentParams: Record<string, unknown> = { ...settings };
      if (regions && regions.length > 0) {
        consentParams.region = regions;
      }
      executeGA4Command('consent', 'update', consentParams);
    },
    [executeGA4Command]
  );

  // 同意状態の変更に応じて初期化を実行
  useEffect(() => {
    if (consentGiven) {
      void initialize();
    }
  }, [initialize, consentGiven]);

  return {
    isEnabled: isServiceEnabled,
    hasConsent: consentGiven,
    setConsent,
    trackEvent,
    trackPageView,
    updateConsentMode,
  };
}

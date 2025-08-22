/**
 * @description アナリティクスサービス共通ロジック（関数型アプローチ）
 * React生態系との一貫性を保つため、クラス継承ではなく関数型で共通化
 */

import { ANALYTICS_CONSTANTS } from '../constants/analytics';

/**
 * アナリティクス関連のエラー種別
 */
export enum AnalyticsErrorType {
  INITIALIZATION_FAILED = 'INITIALIZATION_FAILED',
  TRACKING_FAILED = 'TRACKING_FAILED',
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR',
  SCRIPT_LOAD_FAILED = 'SCRIPT_LOAD_FAILED',
  CONSENT_ERROR = 'CONSENT_ERROR',
}

/**
 * アナリティクス専用エラークラス
 */
export class AnalyticsError extends Error {
  readonly type: AnalyticsErrorType;
  readonly serviceName: string;
  readonly originalError?: Error;

  constructor(
    type: AnalyticsErrorType,
    serviceName: string,
    message: string,
    originalError?: Error
  ) {
    super(message);
    this.name = 'AnalyticsError';
    this.type = type;
    this.serviceName = serviceName;
    this.originalError = originalError;

    // Error クラスの継承で必要
    Object.setPrototypeOf(this, AnalyticsError.prototype);
  }

  /**
   * エラーの詳細情報を構造化して返す
   */
  toJSON() {
    return {
      name: this.name,
      type: this.type,
      serviceName: this.serviceName,
      message: this.message,
      stack: this.stack,
      originalError: this.originalError?.message,
    };
  }
}

/**
 * 非同期操作の結果型（Success型）
 */
export type AnalyticsResult<T = void> =
  | {
      readonly success: true;
      readonly data: T;
    }
  | {
      readonly success: false;
      readonly error: AnalyticsError;
    };

/**
 * アナリティクスサービスの設定型
 */
export interface AnalyticsConfig {
  envVarName: string;
  serviceName: string;
  isInitialized: boolean;
  serviceId: string;
}

/**
 * @description アナリティクスサービスの共通ロジックを提供する関数
 * @param config - サービス設定
 * @returns 共通操作関数群
 */
export const createAnalyticsCore = (config: AnalyticsConfig) => {
  /**
   * @description サービスが実行可能かどうかを判定
   * @returns 実行可能な場合true
   */
  const canExecute = (): boolean => {
    return (
      config.isInitialized &&
      typeof window !== 'undefined' &&
      Boolean(config.serviceId)
    );
  };

  /**
   * @description 初期化が可能かどうかを判定
   * @returns 初期化可能な場合true
   */
  const canInitialize = (): boolean => {
    return !config.isInitialized && Boolean(config.serviceId);
  };

  /**
   * @description 開発環境でのログ出力
   * @param message - ログメッセージ
   * @param data - 追加データ
   */
  const devLog = (message: string, data?: unknown): void => {
    if (import.meta.env.DEV) {
      console.log(`[${config.serviceName}] ${message}`, data || '');
    }
  };

  /**
   * @description 開発環境での警告ログ出力
   * @param message - 警告メッセージ
   * @param error - エラーオブジェクト
   */
  const devWarn = (message: string, error?: unknown): void => {
    if (import.meta.env.DEV) {
      console.warn(`[${config.serviceName}] ${message}`, error || '');
    }
  };

  /**
   * @description 分析機能が無効化されているかチェック
   * @returns 無効化されている場合true
   */
  const isAnalyticsDisabled = (): boolean => {
    // 分析機能が無効化されている場合
    if (import.meta.env.VITE_ANALYTICS_ENABLED === 'false') {
      devLog('Analytics disabled by environment variable');
      return true;
    }

    // Do Not Track設定が有効な場合
    if (navigator.doNotTrack === '1') {
      devLog('Analytics disabled by Do Not Track setting');
      return true;
    }

    return false;
  };

  /**
   * @description 文字列が有効な環境変数値かどうかを判定する型ガード
   * @param value - 判定する値
   * @returns 有効な文字列の場合true
   */
  const isValidEnvString = (value: unknown): value is string => {
    return typeof value === 'string' && value.trim().length > 0;
  };

  /**
   * @description 環境変数からサービスIDを取得
   * @param envVarName - 環境変数名
   * @returns サービスID（見つからない場合は空文字）
   */
  const getServiceId = (envVarName: string): string => {
    if (isAnalyticsDisabled()) {
      devLog('Analytics disabled, returning empty service ID');
      return '';
    }

    const env = import.meta.env;
    const value = (env as Record<string, unknown>)[envVarName];

    if (!isValidEnvString(value)) {
      devWarn(`${envVarName} is not configured properly or is empty`);
      return '';
    }

    return value;
  };

  return {
    canExecute,
    canInitialize,
    devLog,
    devWarn,
    isAnalyticsDisabled,
    getServiceId,
  };
};

/**
 * @description 共通の同意状態管理ロジック
 * @returns 同意状態の管理関数群
 */
export const createConsentManager = () => {
  /**
   * @description 同意状態をローカルストレージから取得
   * @returns 同意済みの場合true
   */
  const getStoredConsent = (): boolean => {
    const v = localStorage.getItem(ANALYTICS_CONSTANTS.CONSENT_KEY);
    return v === ANALYTICS_CONSTANTS.CONSENT_VALUES.ACCEPTED;
  };

  /**
   * @description 同意状態をローカルストレージに保存
   * @param consent - 同意状態
   */
  const storeConsent = (consent: boolean): void => {
    localStorage.setItem(
      ANALYTICS_CONSTANTS.CONSENT_KEY,
      consent
        ? ANALYTICS_CONSTANTS.CONSENT_VALUES.ACCEPTED
        : ANALYTICS_CONSTANTS.CONSENT_VALUES.DECLINED
    );
  };

  return {
    getStoredConsent,
    storeConsent,
  };
};

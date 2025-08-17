/**
 * プライバシー管理に関する型定義
 * ユーザーの同意状態と分析ツールの設定を管理する
 */

/**
 * プライバシー設定の型定義
 * 各分析ツールの有効化状態と同意情報を管理
 */
export interface PrivacySettings {
  /** Google Analytics 4 の有効化状態 */
  googleAnalytics: boolean;
  /** Microsoft Clarity の有効化状態 */
  microsoftClarity: boolean;
  /** 同意取得日時 */
  consentTimestamp: Date;
  /** 同意バージョン */
  consentVersion: string;
}

/**
 * 同意情報の詳細
 * 同意の取得方法と状態を記録
 */
export interface PrivacyConsent {
  /** 同意が付与されているか */
  granted: boolean;
  /** 同意取得日時 */
  timestamp: Date;
  /** 同意バージョン */
  version: string;
  /** 同意取得のソース */
  source: 'banner' | 'settings';
}

/**
 * 同意取得のソース
 *
 * ユーザーがプライバシー設定を変更した方法を示します。
 * - 'banner': 同意バナーからの設定
 * - 'settings': 設定ページからの設定
 */
export type ConsentSource = 'banner' | 'settings';

/**
 * 現在のプライバシーポリシーバージョン
 *
 * プライバシーポリシーの変更を追跡するためのバージョン番号です。
 * ポリシーが更新された場合は、この値を増加させてください。
 */
export const CURRENT_PRIVACY_VERSION = '1.0';

/**
 * デフォルトのプライバシー設定を作成
 *
 * 全ての分析機能を無効化した状態でプライバシー設定を初期化します。
 * これにより、ユーザーが明示的に同意するまで分析ツールは無効になります。
 *
 * @returns 初期化されたプライバシー設定オブジェクト
 *
 * @example
 * ```typescript
 * const defaultSettings = createDefaultPrivacySettings();
 * console.log(defaultSettings.googleAnalytics); // false
 * console.log(defaultSettings.microsoftClarity); // false
 * ```
 */
export function createDefaultPrivacySettings(): PrivacySettings {
  return {
    googleAnalytics: false,
    microsoftClarity: false,
    consentTimestamp: new Date(),
    consentVersion: CURRENT_PRIVACY_VERSION,
  };
}

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
  consentVersion: ConsentVersion;
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
  version: ConsentVersion;
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
 * プライバシー設定バージョン
 * 将来の設定変更に対応するためのバージョン管理
 */
export type ConsentVersion = '1.0' | '1.1' | '2.0';

/**
 * 有効なプライバシー設定バージョンのホワイトリスト
 * XSS攻撃を防ぐため、既知のバージョンのみ許可
 */
export const VALID_CONSENT_VERSIONS: readonly ConsentVersion[] = [
  '1.0',
  '1.1',
  '2.0',
] as const;

/**
 * デフォルトのプライバシー設定バージョン
 */
export const DEFAULT_CONSENT_VERSION: ConsentVersion = '1.0';

/**
 * 現在のプライバシーポリシーバージョン
 *
 * プライバシーポリシーの変更を追跡するためのバージョン番号です。
 * ポリシーが更新された場合は、この値を増加させてください。
 */
export const CURRENT_PRIVACY_VERSION = DEFAULT_CONSENT_VERSION;

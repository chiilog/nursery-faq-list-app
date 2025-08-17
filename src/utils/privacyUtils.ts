/**
 * プライバシー管理関連のユーティリティ関数
 */

import type { ConsentVersion, PrivacySettings } from '../types/privacy';
import {
  VALID_CONSENT_VERSIONS,
  DEFAULT_CONSENT_VERSION,
  CURRENT_PRIVACY_VERSION,
} from '../types/privacy';

/**
 * バージョン文字列のサニタイズとバリデーション
 *
 * 入力されたバージョン文字列がホワイトリストに含まれるかチェックし、
 * XSS攻撃などの悪意ある入力をブロックします。
 *
 * @param version - 検証するバージョン文字列
 * @returns 有効なバージョンの場合はそのまま、無効な場合はデフォルトバージョン
 *
 * @example
 * ```typescript
 * const safeVersion = sanitizeConsentVersion('1.0'); // '1.0'
 * const defaultVersion = sanitizeConsentVersion('<script>alert("xss")</script>'); // '1.0'
 * ```
 */
export function sanitizeConsentVersion(version: unknown): ConsentVersion {
  if (
    typeof version === 'string' &&
    VALID_CONSENT_VERSIONS.includes(version as ConsentVersion)
  ) {
    return version as ConsentVersion;
  }
  return DEFAULT_CONSENT_VERSION;
}

/**
 * デフォルトのプライバシー設定を作成
 *
 * 全ての分析機能を無効化した状態でプライバシー設定を初期化します。
 * この関数はユーザーの初回訪問時（設定なし）および同意操作時に呼び出され、
 * 現在時刻のタイムスタンプが設定されます。
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

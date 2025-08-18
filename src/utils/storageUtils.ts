/**
 * localStorage操作のユーティリティ関数
 * プライバシー設定やCookie同意状態の管理を一元化
 */

import {
  CURRENT_PRIVACY_VERSION,
  CONSENT_TTL_DAYS,
  type PrivacySettings,
  type ConsentVersion,
} from '../types/privacy';

/**
 * Result型: 関数型エラーハンドリングパターン
 */
export type Result<T, E = Error> =
  | { readonly success: true; readonly data: T }
  | { readonly success: false; readonly error: E };

/**
 * localStorage キーの定数
 */
export const STORAGE_KEYS = {
  PRIVACY_SETTINGS: 'privacySettings',
} as const satisfies Record<string, string>;

/**
 * デフォルトのプライバシー設定を取得（外部変更を防ぐため関数形式）
 * 未記録状態を表現し、明示的な同意のみを記録する
 */
const getDefaultPrivacySettings = (): PrivacySettings => ({
  googleAnalytics: false,
  microsoftClarity: false,
  consentTimestamp: null, // 未記録状態
  consentVersion: CURRENT_PRIVACY_VERSION,
  hasExplicitConsent: false, // 明示的同意なし
});

/**
 * localStorageから取得した生データの型
 */
interface RawPrivacySettings {
  googleAnalytics?: boolean;
  microsoftClarity?: boolean;
  consentTimestamp?: string | null;
  consentVersion?: string;
  hasExplicitConsent?: boolean;
}

/**
 * 型ガード: localStorageから取得したデータが有効な形式かチェック
 */
const isValidRawSettings = (obj: unknown): obj is RawPrivacySettings => {
  if (typeof obj !== 'object' || obj === null) return false;

  const candidate = obj as Record<string, unknown>;

  return (
    (candidate.googleAnalytics === undefined ||
      typeof candidate.googleAnalytics === 'boolean') &&
    (candidate.microsoftClarity === undefined ||
      typeof candidate.microsoftClarity === 'boolean') &&
    (candidate.consentTimestamp === undefined ||
      candidate.consentTimestamp === null ||
      typeof candidate.consentTimestamp === 'string') &&
    (candidate.consentVersion === undefined ||
      typeof candidate.consentVersion === 'string') &&
    (candidate.hasExplicitConsent === undefined ||
      typeof candidate.hasExplicitConsent === 'boolean')
  );
};

/**
 * localStorageからプライバシー設定を取得
 * @returns プライバシー設定オブジェクト（未記録の場合はデフォルト設定）
 */
export const getPrivacySettings = (): PrivacySettings => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.PRIVACY_SETTINGS);
    if (!stored) {
      return getDefaultPrivacySettings();
    }

    const parsed: unknown = JSON.parse(stored);

    if (!isValidRawSettings(parsed)) {
      console.warn('[StorageUtils] Invalid settings format, using defaults');
      return getDefaultPrivacySettings();
    }

    // Date型への安全な変換（nullの場合はそのまま維持）
    let timestamp: Date | null = null;
    if (parsed.consentTimestamp) {
      const parsedTimestamp = new Date(parsed.consentTimestamp);
      if (!isNaN(parsedTimestamp.getTime())) {
        timestamp = parsedTimestamp;
      } else {
        console.warn('[StorageUtils] Invalid timestamp format');
      }
    }

    const defaults = getDefaultPrivacySettings();
    return {
      googleAnalytics: parsed.googleAnalytics ?? defaults.googleAnalytics,
      microsoftClarity: parsed.microsoftClarity ?? defaults.microsoftClarity,
      consentTimestamp: timestamp,
      consentVersion: (parsed.consentVersion ??
        defaults.consentVersion) as ConsentVersion,
      hasExplicitConsent:
        parsed.hasExplicitConsent ?? defaults.hasExplicitConsent,
    };
  } catch (error) {
    console.warn('[StorageUtils] Failed to get privacy settings:', error);
    return getDefaultPrivacySettings();
  }
};

/**
 * プライバシー設定をlocalStorageに保存
 * @param settings 更新するプライバシー設定の部分的オブジェクト
 */
export const setPrivacySettings = (
  settings: Partial<PrivacySettings>
): void => {
  try {
    const current = getPrivacySettings();
    const updated: PrivacySettings = {
      ...current,
      ...settings,
      consentTimestamp: new Date(), // 明示的同意の記録
      consentVersion: CURRENT_PRIVACY_VERSION, // 現在バージョンに更新
      hasExplicitConsent: true, // 明示的同意フラグ
    };

    localStorage.setItem(
      STORAGE_KEYS.PRIVACY_SETTINGS,
      JSON.stringify(updated)
    );
  } catch (error) {
    console.error('[StorageUtils] Failed to save privacy settings:', error);
    throw error;
  }
};

/**
 * すべての同意を一括設定
 */
export const setAllConsent = (granted: boolean): void => {
  setPrivacySettings({
    googleAnalytics: granted,
    microsoftClarity: granted,
  });
};

/**
 * 同意が有効期限内かチェック
 * @returns 明示的同意が記録されており、かつ有効期限内の場合のみtrue
 */
export const isConsentValid = (): boolean => {
  try {
    const settings = getPrivacySettings();

    // 明示的な同意が記録されていない場合はfalse
    if (!settings.hasExplicitConsent || !settings.consentTimestamp) {
      return false;
    }

    const daysSinceConsent =
      (new Date().getTime() - settings.consentTimestamp.getTime()) /
      (1000 * 60 * 60 * 24);

    return daysSinceConsent <= CONSENT_TTL_DAYS;
  } catch (error) {
    console.warn('[StorageUtils] Failed to check consent validity:', error);
    return false;
  }
};

/**
 * プライバシー設定をクリア
 */
export const clearPrivacySettings = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEYS.PRIVACY_SETTINGS);
  } catch (error) {
    console.error('[StorageUtils] Failed to clear privacy settings:', error);
  }
};

/**
 * プライバシー設定を安全に取得（Result型を返す）
 */
export const getPrivacySettingsSafe = (): Result<PrivacySettings> => {
  try {
    const settings = getPrivacySettings();
    return { success: true, data: settings };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
};

/**
 * プライバシー設定を安全に保存（Result型を返す）
 * @param settings 更新するプライバシー設定の部分的オブジェクト
 * @returns 成功時はsuccess: true、失敗時はerror情報
 */
export const setPrivacySettingsSafe = (
  settings: Partial<PrivacySettings>
): Result<undefined> => {
  try {
    setPrivacySettings(settings);
    return { success: true, data: undefined };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
};

/**
 * すべての同意を安全に設定（Result型を返す）
 * @param granted すべての分析ツールに対する同意状態
 * @returns 成功時はsuccess: true、失敗時はerror情報
 */
export const setAllConsentSafe = (granted: boolean): Result<undefined> => {
  try {
    setAllConsent(granted);
    return { success: true, data: undefined };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
};

/**
 * localStorage操作のユーティリティ関数
 * プライバシー設定やCookie同意状態の管理を一元化
 */

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
  CONSENT_TIMESTAMP: 'consentTimestamp',
  CONSENT_VERSION: 'consentVersion',
} as const satisfies Record<string, string>;

/**
 * プライバシー設定の型定義
 */
export interface PrivacySettings {
  googleAnalytics: boolean;
  microsoftClarity: boolean;
  consentTimestamp: Date;
  consentVersion: string;
}

/**
 * デフォルトのプライバシー設定
 */
const DEFAULT_PRIVACY_SETTINGS: PrivacySettings = {
  googleAnalytics: false,
  microsoftClarity: false,
  consentTimestamp: new Date(),
  consentVersion: '1.0',
};

/**
 * localStorageから取得した生データの型
 */
interface RawPrivacySettings {
  googleAnalytics?: boolean;
  microsoftClarity?: boolean;
  consentTimestamp?: string;
  consentVersion?: string;
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
      typeof candidate.consentTimestamp === 'string') &&
    (candidate.consentVersion === undefined ||
      typeof candidate.consentVersion === 'string')
  );
};

/**
 * localStorageからプライバシー設定を取得
 */
export const getPrivacySettings = (): PrivacySettings => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.PRIVACY_SETTINGS);
    if (!stored) {
      return DEFAULT_PRIVACY_SETTINGS;
    }

    const parsed: unknown = JSON.parse(stored);

    if (!isValidRawSettings(parsed)) {
      console.warn('[StorageUtils] Invalid settings format, using defaults');
      return DEFAULT_PRIVACY_SETTINGS;
    }

    // Date型への安全な変換
    const timestamp = parsed.consentTimestamp
      ? new Date(parsed.consentTimestamp)
      : DEFAULT_PRIVACY_SETTINGS.consentTimestamp;

    // 無効な日付の場合はデフォルトを使用
    if (isNaN(timestamp.getTime())) {
      console.warn('[StorageUtils] Invalid timestamp, using default');
      return DEFAULT_PRIVACY_SETTINGS;
    }

    return {
      googleAnalytics:
        parsed.googleAnalytics ?? DEFAULT_PRIVACY_SETTINGS.googleAnalytics,
      microsoftClarity:
        parsed.microsoftClarity ?? DEFAULT_PRIVACY_SETTINGS.microsoftClarity,
      consentTimestamp: timestamp,
      consentVersion:
        parsed.consentVersion ?? DEFAULT_PRIVACY_SETTINGS.consentVersion,
    };
  } catch (error) {
    console.warn('[StorageUtils] Failed to get privacy settings:', error);
    return DEFAULT_PRIVACY_SETTINGS;
  }
};

/**
 * プライバシー設定をlocalStorageに保存
 */
export const setPrivacySettings = (
  settings: Partial<PrivacySettings>
): void => {
  try {
    const current = getPrivacySettings();
    const updated = {
      ...current,
      ...settings,
      consentTimestamp: new Date(),
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
 * 同意が有効期限内かチェック（90日）
 */
export const isConsentValid = (): boolean => {
  try {
    const settings = getPrivacySettings();
    const daysSinceConsent =
      (new Date().getTime() - settings.consentTimestamp.getTime()) /
      (1000 * 60 * 60 * 24);

    return daysSinceConsent <= 90;
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
 */
export const setPrivacySettingsSafe = (
  settings: Partial<PrivacySettings>
): Result<void> => {
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
 */
export const setAllConsentSafe = (granted: boolean): Result<void> => {
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

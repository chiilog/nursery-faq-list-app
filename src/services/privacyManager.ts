/**
 * プライバシー管理クラス
 *
 * ユーザーのプライバシー設定を管理し、LocalStorageへの永続化と
 * 分析ツール（Google Analytics、Microsoft Clarity）の同意状態を制御します。
 *
 * @example
 * ```typescript
 * const privacyManager = new PrivacyManager();
 *
 * // 同意状態の確認
 * const settings = privacyManager.getSettings();
 * console.log(settings.googleAnalytics); // false（デフォルト）
 *
 * // 同意を付与
 * privacyManager.setGoogleAnalyticsConsent(true);
 *
 * // 変更イベントの監視
 * const unsubscribe = privacyManager.addChangeListener((event) => {
 *   console.log('設定が変更されました:', event.current);
 * });
 * ```
 */

import type { PrivacySettings } from '../types/privacy';
import {
  createDefaultPrivacySettings,
  sanitizeConsentVersion,
} from '../utils/privacyUtils';

const STORAGE_KEY = 'privacySettings';
const CONSENT_VALID_PERIOD_MS = 365 * 24 * 60 * 60 * 1000; // 1年

/**
 * プライバシー設定の変更イベント
 */
export type PrivacySettingsChangeEvent = {
  previous: PrivacySettings;
  current: PrivacySettings;
  changes: Partial<PrivacySettings>;
};

/**
 * プライバシー設定管理クラス
 * ユーザーの同意状態を管理し、LocalStorageに永続化する
 */
export class PrivacyManager {
  private settings: PrivacySettings;
  private listeners: Array<(event: PrivacySettingsChangeEvent) => void> = [];

  constructor() {
    this.settings = this.loadFromStorage() ?? createDefaultPrivacySettings();
  }

  /**
   * 設定変更イベントのリスナーを追加
   */
  addChangeListener(
    listener: (event: PrivacySettingsChangeEvent) => void
  ): () => void {
    this.listeners.push(listener);

    // アンサブスクライブ関数を返す
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * 現在の設定を取得
   */
  getSettings(): PrivacySettings {
    return { ...this.settings };
  }

  /**
   * 設定を更新
   */
  updateSettings(updates: Partial<PrivacySettings>): void {
    if (!this.isValidSettingsUpdate(updates)) {
      console.warn('Invalid privacy settings update:', updates);
      return;
    }

    const previous = { ...this.settings };

    // consentVersionがある場合はサニタイズを適用
    const sanitizedUpdates = updates.consentVersion
      ? {
          ...updates,
          consentVersion: sanitizeConsentVersion(updates.consentVersion),
        }
      : updates;

    // 実変更のみ抽出し、必要に応じて consentTimestamp を自動更新
    const appliedChanges: Partial<PrivacySettings> = {};
    if (
      'googleAnalytics' in sanitizedUpdates &&
      sanitizedUpdates.googleAnalytics !== previous.googleAnalytics
    ) {
      appliedChanges.googleAnalytics = sanitizedUpdates.googleAnalytics!;
    }
    if (
      'microsoftClarity' in sanitizedUpdates &&
      sanitizedUpdates.microsoftClarity !== previous.microsoftClarity
    ) {
      appliedChanges.microsoftClarity = sanitizedUpdates.microsoftClarity!;
    }
    if (
      'consentVersion' in sanitizedUpdates &&
      sanitizedUpdates.consentVersion !== previous.consentVersion
    ) {
      appliedChanges.consentVersion = sanitizedUpdates.consentVersion!;
    }
    // 明示指定があればそれを採用
    if (
      'consentTimestamp' in sanitizedUpdates &&
      sanitizedUpdates.consentTimestamp !== previous.consentTimestamp
    ) {
      appliedChanges.consentTimestamp = sanitizedUpdates.consentTimestamp!;
    } else if (
      // 同意設定 or バージョンが変わった場合は現在時刻に更新
      'googleAnalytics' in appliedChanges ||
      'microsoftClarity' in appliedChanges ||
      'consentVersion' in appliedChanges
    ) {
      appliedChanges.consentTimestamp = new Date();
    }

    // 実質的に何も変わらない場合は副作用なしで終了
    if (Object.keys(appliedChanges).length === 0) {
      return;
    }

    this.settings = {
      ...this.settings,
      ...appliedChanges,
    };

    this.saveToStorage();
    this.notifyListeners({
      previous,
      current: this.settings,
      // リスナーには「実際に適用された（サニタイズ済み＋暗黙的に補完された）差分」を渡す
      changes: appliedChanges,
    });
  }

  /**
   * 設定変更リスナーに通知
   */
  private notifyListeners(event: PrivacySettingsChangeEvent): void {
    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in privacy settings change listener:', error);
      }
    });
  }

  /**
   * 設定更新の妥当性チェック
   */
  private isValidSettingsUpdate(updates: Partial<PrivacySettings>): boolean {
    if (
      updates.googleAnalytics !== undefined &&
      typeof updates.googleAnalytics !== 'boolean'
    ) {
      return false;
    }
    if (
      updates.microsoftClarity !== undefined &&
      typeof updates.microsoftClarity !== 'boolean'
    ) {
      return false;
    }
    if (
      updates.consentTimestamp !== undefined &&
      !(updates.consentTimestamp instanceof Date)
    ) {
      return false;
    }
    if (
      updates.consentVersion !== undefined &&
      typeof updates.consentVersion !== 'string'
    ) {
      return false;
    }
    return true;
  }

  /**
   * Google Analytics の同意状態を設定
   */
  setGoogleAnalyticsConsent(granted: boolean): void {
    this.updateSettings({ googleAnalytics: granted });
  }

  /**
   * Microsoft Clarity の同意状態を設定
   */
  setMicrosoftClarityConsent(granted: boolean): void {
    this.updateSettings({ microsoftClarity: granted });
  }

  /**
   * 全ての分析ツールの同意状態を一括設定
   */
  setAllConsent(granted: boolean): void {
    this.updateSettings({
      googleAnalytics: granted,
      microsoftClarity: granted,
    });
  }

  /**
   * 同意が有効期限内かどうかを判定
   * 現在は1年を有効期限とする
   */
  isConsentValid(): boolean {
    const now = new Date();
    const consentDate = this.settings.consentTimestamp;

    return now.getTime() - consentDate.getTime() < CONSENT_VALID_PERIOD_MS;
  }

  /**
   * LocalStorage から設定を読み込み
   */
  private loadFromStorage(): PrivacySettings | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;

      const parsed = JSON.parse(stored) as unknown;

      // 型ガードで安全に型チェック
      if (this.isValidStoredSettings(parsed)) {
        // Date オブジェクトを復元し、consentVersionをサニタイズ
        return {
          ...parsed,
          consentTimestamp: new Date(parsed.consentTimestamp),
          consentVersion: sanitizeConsentVersion(parsed.consentVersion),
        };
      }

      return null;
    } catch {
      return null;
    }
  }

  /**
   * 保存されたデータの型チェック
   */
  private isValidStoredSettings(data: unknown): data is Omit<
    PrivacySettings,
    'consentTimestamp'
  > & {
    consentTimestamp: string;
  } {
    if (typeof data !== 'object' || data === null) return false;

    const obj = data as Record<string, unknown>;

    return (
      typeof obj.googleAnalytics === 'boolean' &&
      typeof obj.microsoftClarity === 'boolean' &&
      typeof obj.consentTimestamp === 'string' &&
      typeof obj.consentVersion === 'string'
    );
  }

  /**
   * LocalStorage に設定を保存
   */
  private saveToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
    } catch (error) {
      // 保存エラー時は警告ログを出す（テスト期待：'storage' を含む単一文字列）
      const msg =
        '[privacy] storage write error: ' +
        (error instanceof Error ? error.message : String(error));
      console.warn(msg);
    }
  }
}

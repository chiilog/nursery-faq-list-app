/**
 * プライバシー設定管理カスタムフック
 *
 * プライバシー管理基盤とReactコンポーネントを統合するカスタムフックです。
 * PrivacyManagerと連携して、リアクティブな状態管理とイベント通知機能を提供します。
 *
 * @returns プライバシー設定の状態と操作関数を含むオブジェクト
 *
 * @example
 * ```typescript
 * function PrivacySettingsComponent() {
 *   const {
 *     settings,
 *     setGoogleAnalyticsConsent,
 *     setMicrosoftClarityConsent,
 *     isConsentValid
 *   } = usePrivacySettings();
 *
 *   return (
 *     <div>
 *       <p>Google Analytics: {settings.googleAnalytics ? '有効' : '無効'}</p>
 *       <button onClick={() => setGoogleAnalyticsConsent(true)}>
 *         同意する
 *       </button>
 *       <p>同意の有効性: {isConsentValid() ? '有効' : '期限切れ'}</p>
 *     </div>
 *   );
 * }
 * ```
 */

import { useState, useEffect, useCallback } from 'react';
import { PrivacyManager } from '../services/privacyManager';
import type { PrivacySettings } from '../types/privacy';

/**
 * @description 型安全なPrivacyManagerシングルトンファクトリー
 * 初期化エラーや循環参照を防ぎ、確実に単一インスタンスを管理
 */
const createPrivacyManagerSingleton = (): (() => PrivacyManager) => {
  let instance: PrivacyManager | undefined;
  let isInitializing = false;

  return (): PrivacyManager => {
    // 初期化中の循環参照を防ぐ
    if (isInitializing) {
      throw new Error(
        '[usePrivacySettings] Circular dependency detected during PrivacyManager initialization'
      );
    }

    if (!instance) {
      try {
        isInitializing = true;
        instance = new PrivacyManager();
      } catch (error) {
        console.error(
          '[usePrivacySettings] PrivacyManager initialization failed:',
          error
        );
        throw error; // 呼び出し側でのエラーハンドリングに委ねる
      } finally {
        isInitializing = false;
      }
    }

    return instance;
  };
};

/**
 * @description 型安全なPrivacyManagerシングルトンインスタンスゲッター
 */
const getPrivacyManager = createPrivacyManagerSingleton();

/**
 * usePrivacySettings フックの戻り値の型
 */
export interface UsePrivacySettingsReturn {
  settings: PrivacySettings;
  updateSettings: (updates: Partial<PrivacySettings>) => void;
  setGoogleAnalyticsConsent: (granted: boolean) => void;
  setMicrosoftClarityConsent: (granted: boolean) => void;
  setAllConsent: (granted: boolean) => void;
  isConsentValid: () => boolean;
}

/**
 * @description プライバシー設定を管理するカスタムフック
 * PrivacyManagerと連携してReactコンポーネントでの状態管理を提供
 * @returns プライバシー設定の状態と操作関数を含むオブジェクト
 * @throws {Error} PrivacyManagerの初期化に失敗した場合
 */
export function usePrivacySettings(): UsePrivacySettingsReturn {
  // 軽量なシングルトン取得にはuseMemoは不要
  const privacyManager = getPrivacyManager();

  const [settings, setSettings] = useState(() => privacyManager.getSettings()); // 型推論: PrivacySettings

  useEffect(() => {
    // 設定変更リスナーを登録
    const unsubscribe = privacyManager.addChangeListener((event) => {
      setSettings(event.current);
    });

    return unsubscribe;
  }, [privacyManager]);

  const updateSettings = useCallback(
    (updates: Partial<PrivacySettings>) => {
      privacyManager.updateSettings(updates);
    },
    [privacyManager]
  );

  const setGoogleAnalyticsConsent = useCallback(
    (granted: boolean) => {
      privacyManager.setGoogleAnalyticsConsent(granted);
    },
    [privacyManager]
  );

  const setMicrosoftClarityConsent = useCallback(
    (granted: boolean) => {
      privacyManager.setMicrosoftClarityConsent(granted);
    },
    [privacyManager]
  );

  const setAllConsent = useCallback(
    (granted: boolean) => {
      privacyManager.setAllConsent(granted);
    },
    [privacyManager]
  );

  const isConsentValid = useCallback(() => {
    return privacyManager.isConsentValid();
  }, [privacyManager]);

  // 軽量なオブジェクト作成にはuseMemoは不要
  return {
    settings,
    updateSettings,
    setGoogleAnalyticsConsent,
    setMicrosoftClarityConsent,
    setAllConsent,
    isConsentValid,
  };
}

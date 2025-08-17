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

import { useState, useEffect, useCallback, useMemo } from 'react';
import { PrivacyManager } from '../services/privacyManager';
import type { PrivacySettings } from '../types/privacy';

// シングルトンパターンでPrivacyManagerインスタンスを管理
let privacyManagerInstance: PrivacyManager | null = null;

function getPrivacyManager(): PrivacyManager {
  if (!privacyManagerInstance) {
    privacyManagerInstance = new PrivacyManager();
  }
  return privacyManagerInstance;
}

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
 * プライバシー設定を管理するカスタムフック
 * PrivacyManagerと連携してReactコンポーネントでの状態管理を提供
 */
export function usePrivacySettings(): UsePrivacySettingsReturn {
  const privacyManager = useMemo(() => getPrivacyManager(), []);

  const [settings, setSettings] = useState<PrivacySettings>(() =>
    privacyManager.getSettings()
  );

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

  return {
    settings,
    updateSettings,
    setGoogleAnalyticsConsent,
    setMicrosoftClarityConsent,
    setAllConsent,
    isConsentValid,
  };
}

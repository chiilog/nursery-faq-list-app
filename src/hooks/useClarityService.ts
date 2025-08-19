import { useEffect, useState, useCallback } from 'react';
import {
  createInitialState,
  initializeClarity,
  setConsent as setServiceConsent,
  disableService,
  selectors,
  createSafeAsyncHandler,
  type ClarityServiceState,
} from '../services/clarityService';
import { usePrivacySettings } from './usePrivacySettings';
import type { ImportMeta } from '../types/clarity';

/**
 * @description Microsoft Clarity統合のためのReact Hook（関数型API対応）
 * 新しいコードでは関数型APIの使用を推奨し、クラス版は後方互換性のため保持
 *
 * @returns Clarity統合に必要なプロパティとメソッドを含むオブジェクト
 *
 * @example
 * ```typescript
 * function App() {
 *   const { state, isInitialized, hasConsent } = useClarityService();
 *
 *   return (
 *     <div>
 *       {isInitialized && (
 *         <p>Clarity録画: {hasConsent ? '有効' : '無効'}</p>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */
export const useClarityService = () => {
  const [state, setState] = useState<ClarityServiceState>(createInitialState());
  const { settings: privacySettings } = usePrivacySettings();

  // 関数型API用のメソッド（推奨）
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const initializeClarityFunctional = useCallback(
    createSafeAsyncHandler(async (projectId: string) => {
      // setStateのコールバック形式で現在の状態を取得するためのトリック
      let currentState: ClarityServiceState;
      setState((state) => {
        currentState = state;
        return state;
      });

      const result = await initializeClarity(currentState!, projectId);
      if (result.success) {
        setState(result.data);
        return result;
      } else {
        throw result.error;
      }
    }, 'Clarity initialization'),
    []
  );

  const setConsentFunctional = useCallback((consent: boolean) => {
    setState((currentState) => setServiceConsent(currentState, consent));
  }, []);

  const disableFunctional = useCallback(() => {
    setState((currentState) => disableService(currentState));
  }, []);

  useEffect(() => {
    /**
     * @description Clarityサービスを初期化する（関数型API使用）
     * 環境変数からプロジェクトIDを取得し、初期化を実行
     */
    const initializeClarityService = async () => {
      const projectId = (import.meta as ImportMeta).env
        ?.VITE_CLARITY_PROJECT_ID;

      if (!projectId) {
        console.warn(
          'VITE_CLARITY_PROJECT_ID が設定されていないため、Clarityを初期化できません'
        );
        return;
      }

      // 共通エラーハンドラーで既にエラー処理済みのため、DRY原則に基づき重複除去
      const result = await initializeClarityFunctional(projectId);
      if (result) {
        console.log('Microsoft Clarity が正常に初期化されました');
      }
    };

    void initializeClarityService();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 空依存配列でマウント時のみ実行

  useEffect(() => {
    /**
     * @description プライバシー設定の変更を監視し、Clarity の同意状態を更新
     * privacySettings.microsoftClarity の変更に応じて録画を開始/停止
     */
    if (typeof privacySettings?.microsoftClarity === 'boolean') {
      setConsentFunctional(privacySettings.microsoftClarity);

      if (privacySettings.microsoftClarity) {
        console.log('Microsoft Clarity 録画を開始しました');
      } else {
        console.log('Microsoft Clarity 録画を停止しました');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [privacySettings?.microsoftClarity]); // setConsentFunctionalは安定なため依存配列から除外

  // セレクターを使って状態を取得（関数型API）
  const isInitialized = selectors.isInitialized(state);
  const hasConsent = selectors.hasConsent(state);
  const isDisabled = selectors.isDisabled(state);

  return {
    // 関数型API（推奨）
    /**
     * @description 現在の状態オブジェクト（不変）
     */
    state,

    /**
     * @description 初期化が完了しているかどうか
     */
    isInitialized,

    /**
     * @description ユーザーの同意が得られているかどうか
     */
    hasConsent,

    /**
     * @description サービスが無効化されているかどうか
     */
    isDisabled,

    /**
     * @description 手動でConsent を設定するメソッド（関数型API）
     */
    setConsent: setConsentFunctional,

    /**
     * @description サービスを完全に無効化するメソッド（関数型API）
     */
    disable: disableFunctional,
  };
};

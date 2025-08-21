import type {
  WindowWithClarity,
  ClarityFunction,
  ClarityProjectId,
  Result,
} from '../types/clarity';
import {
  createClarityProjectId,
  ClarityError,
  createSuccess,
  createFailure,
} from '../types/clarity';

/**
 * @description Clarityサービスの状態を表すimmutableなオブジェクト
 */
export interface ClarityServiceState {
  readonly projectId: ClarityProjectId | null;
  readonly isInitialized: boolean;
  readonly hasConsent: boolean;
  readonly isDisabled: boolean;
}

/**
 * @description 初期状態を作成（不変オブジェクト）
 */
export const createInitialState = (): ClarityServiceState =>
  Object.freeze({
    projectId: null,
    isInitialized: false,
    hasConsent: false,
    isDisabled: false,
  });

/**
 * @description 状態を更新（不変性を保持）
 */
export const updateState = (
  currentState: ClarityServiceState,
  updates: Partial<ClarityServiceState>
): ClarityServiceState =>
  Object.freeze({
    ...currentState,
    ...updates,
  });

/**
 * @description 純粋関数による環境判定
 */
const shouldSkipClarityInitialization = (
  importMeta: ImportMeta,
  navigator: Navigator
): boolean => {
  const analyticsEnabled = importMeta.env?.VITE_ANALYTICS_ENABLED;
  if (analyticsEnabled === 'false') {
    return true;
  }

  if (navigator.doNotTrack === '1') {
    return true;
  }

  return false;
};

/**
 * @description プロジェクトID許可リストの取得（純粋関数）
 */
const getAllowedProjectIds = (importMeta: ImportMeta): readonly string[] => {
  const allowListEnv = importMeta.env?.VITE_CLARITY_ALLOWED_PROJECT_IDS;

  if (!allowListEnv || typeof allowListEnv !== 'string') {
    return [];
  }

  // カンマ区切りで許可リストをパース
  return allowListEnv
    .split(',')
    .map((id) => id.trim())
    .filter((id) => id.length > 0);
};

/**
 * @description プロジェクトIDが許可リストに含まれるかチェック（純粋関数）
 */
const isAllowedProjectId = (
  projectId: ClarityProjectId,
  importMeta: ImportMeta
): boolean => {
  const allowedIds = getAllowedProjectIds(importMeta);

  // 許可リストが空の場合は、全ての有効なIDを許可
  if (allowedIds.length === 0) {
    return true;
  }

  // 許可リストに含まれるかチェック
  return allowedIds.includes(projectId);
};

/**
 * @description 純粋関数による既存スクリプト検出
 */
const hasExistingClarityScript = (
  projectId: ClarityProjectId,
  scripts: readonly HTMLScriptElement[]
): boolean => {
  const clarityUrl = `https://www.clarity.ms/tag/${projectId}`;
  return scripts.some(
    (script) =>
      script.src === clarityUrl ||
      script.getAttribute('data-clarity-id') === projectId
  );
};

/**
 * @description 純粋関数による重複初期化判定
 */
const isDuplicateInitialization = (
  currentState: ClarityServiceState,
  projectId: ClarityProjectId
): boolean => {
  return currentState.isInitialized && currentState.projectId === projectId;
};

/**
 * @description window.clarityが利用可能かチェック（純粋関数）
 */
const isWindowClarityAvailable = (): boolean => {
  const windowWithClarity = window as WindowWithClarity;
  return typeof windowWithClarity.clarity === 'function';
};

/**
 * @description Clarityの同意状態を設定（副作用を含む関数）
 */
const setClarityConsent = (consent: boolean): void => {
  if (isWindowClarityAvailable()) {
    const windowWithClarity = window as WindowWithClarity;
    windowWithClarity.clarity?.('consent', consent);
  }
};

/**
 * @description Clarityを停止（副作用を含む関数）
 */
const stopClarity = (): void => {
  if (isWindowClarityAvailable()) {
    const windowWithClarity = window as WindowWithClarity;
    windowWithClarity.clarity?.('stop');
  }
};

/**
 * @description センシティブなデータのマスキングを設定（副作用を含む関数）
 */
const setupDataMasking = (): void => {
  const sensitiveSelectors: readonly string[] = Object.freeze([
    'input[type="text"]',
    'input[type="email"]',
    'input[type="tel"]',
    'input[type="password"]',
    'input[type="date"]',
    'input[type="datetime-local"]',
    'textarea',
    '[data-sensitive]',
  ]);

  sensitiveSelectors.forEach((selector) => {
    document.querySelectorAll(selector).forEach((element) => {
      element.setAttribute('data-clarity-mask', 'true');
    });
  });

  if (isWindowClarityAvailable()) {
    const windowWithClarity = window as WindowWithClarity;
    windowWithClarity.clarity?.('set', 'maskText', true);
  }
};

/**
 * @description Clarityスクリプトを動的に読み込む（副作用を含む関数）
 */
const loadClarityScript = async (
  projectId: ClarityProjectId
): Promise<Result<void>> => {
  try {
    return await new Promise((resolve, reject) => {
      // 既存スクリプトのチェック（document全体を検索）
      const existingScripts = Array.from(
        document.querySelectorAll('script')
      ) as readonly HTMLScriptElement[];

      if (hasExistingClarityScript(projectId, existingScripts)) {
        resolve(createSuccess(undefined));
        return;
      }

      const script = document.createElement('script');

      // 外部スクリプトとして設定（CSP対応・セキュリティ向上）
      script.src = `https://www.clarity.ms/tag/${projectId}`;
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.setAttribute('data-clarity-id', projectId);

      // テスト環境での処理
      const isTestEnv =
        typeof globalThis !== 'undefined' &&
        (globalThis as { process?: { env?: { NODE_ENV?: string } } }).process
          ?.env?.NODE_ENV === 'test';

      if (isTestEnv) {
        document.head.appendChild(script);
        const windowWithClarity = window as WindowWithClarity;
        if (!windowWithClarity.clarity) {
          windowWithClarity.clarity = (() => {}) as ClarityFunction;
        }
        resolve(createSuccess(undefined));
        return;
      }

      // ロード成功ハンドラー
      script.onload = () => {
        resolve(createSuccess(undefined));
      };

      // エラーハンドラー
      script.onerror = (errorEvent) => {
        const error =
          errorEvent instanceof ErrorEvent
            ? new Error(errorEvent.message)
            : new Error('スクリプト読み込みエラー');

        const clarityError = new ClarityError(
          'SCRIPT_LOAD_FAILED',
          'Clarityスクリプトの読み込みに失敗しました',
          error
        );
        reject(clarityError);
      };

      document.head.appendChild(script);
    });
  } catch (error) {
    return createFailure(
      error instanceof ClarityError
        ? error
        : new ClarityError(
            'SCRIPT_LOAD_FAILED',
            'Clarityスクリプトの読み込みに失敗しました',
            error instanceof Error ? error : undefined
          )
    );
  }
};

/**
 * @description Clarity初期化の純粋関数部分（副作用なし）
 */
export const computeClarityInitializationPlan = (
  currentState: ClarityServiceState,
  projectId: string,
  importMeta: ImportMeta,
  navigatorObj: Navigator
): Result<{
  shouldSkip: boolean;
  validatedProjectId: ClarityProjectId | null;
  newState: ClarityServiceState;
}> => {
  try {
    // バリデーション（純粋関数）
    const validatedProjectId = createClarityProjectId(projectId);

    // プロジェクトID許可リストチェック
    if (!isAllowedProjectId(validatedProjectId, importMeta)) {
      throw new ClarityError(
        'INVALID_PROJECT_ID',
        '許可されていないプロジェクトIDです'
      );
    }

    // 環境判定（純粋関数）
    if (shouldSkipClarityInitialization(importMeta, navigatorObj)) {
      return createSuccess({
        shouldSkip: true,
        validatedProjectId: null,
        newState: currentState,
      });
    }

    // 重複初期化判定（純粋関数）
    if (isDuplicateInitialization(currentState, validatedProjectId)) {
      return createSuccess({
        shouldSkip: true,
        validatedProjectId,
        newState: currentState,
      });
    }

    // 新しい状態を計算（純粋関数）
    const newState = updateState(currentState, {
      projectId: validatedProjectId,
      isInitialized: true,
    });

    return createSuccess({ shouldSkip: false, validatedProjectId, newState });
  } catch (error) {
    return createFailure(
      error instanceof ClarityError
        ? error
        : new ClarityError(
            'INITIALIZATION_FAILED',
            'Clarityの初期化計算に失敗しました',
            error instanceof Error ? error : undefined
          )
    );
  }
};

/**
 * @description Clarity初期化の副作用実行部分
 */
export const executeClarityInitializationEffects = async (
  validatedProjectId: ClarityProjectId
): Promise<Result<void>> => {
  try {
    // 副作用処理（スクリプト読み込み）
    try {
      const loadResult = await loadClarityScript(validatedProjectId);
      if (!loadResult.success) {
        return loadResult;
      }
    } catch (clarityError) {
      return createFailure(
        clarityError instanceof ClarityError
          ? clarityError
          : new ClarityError(
              'SCRIPT_LOAD_FAILED',
              'Clarityスクリプトの読み込みに失敗しました',
              clarityError instanceof Error ? clarityError : undefined
            )
      );
    }

    // 副作用処理（データマスキング設定）
    setupDataMasking();

    // 副作用処理（初期同意状態設定）
    setClarityConsent(false);

    return createSuccess(undefined);
  } catch (error) {
    return createFailure(
      error instanceof ClarityError
        ? error
        : new ClarityError(
            'SCRIPT_LOAD_FAILED',
            'Clarity副作用の実行に失敗しました',
            error instanceof Error ? error : undefined
          )
    );
  }
};

/**
 * @description Clarityサービスを初期化（純粋関数 + 副作用分離済み）
 */
export const initializeClarity = async (
  currentState: ClarityServiceState,
  projectId: string
): Promise<Result<ClarityServiceState>> => {
  // 純粋関数部分の実行
  const planResult = computeClarityInitializationPlan(
    currentState,
    projectId,
    import.meta,
    navigator
  );

  if (!planResult.success) {
    return planResult;
  }

  const { shouldSkip, validatedProjectId, newState } = planResult.data;

  if (shouldSkip) {
    return createSuccess(newState);
  }

  // 副作用部分の実行
  const effectsResult = await executeClarityInitializationEffects(
    validatedProjectId!
  );

  if (!effectsResult.success) {
    return effectsResult;
  }

  return createSuccess(newState);
};

/**
 * @description 同意状態設定の純粋関数部分
 */
export const computeConsentChange = (
  currentState: ClarityServiceState,
  consent: boolean
): ClarityServiceState => {
  if (currentState.isDisabled) {
    return currentState;
  }

  // 新しい状態を返す（純粋関数）
  return updateState(currentState, { hasConsent: consent });
};

/**
 * @description 同意状態変更の副作用実行部分
 */
export const executeConsentEffects = (consent: boolean): void => {
  // 副作用処理（Clarity設定）
  setClarityConsent(consent);

  // 拒否時の録画停止（副作用処理）
  if (!consent) {
    stopClarity();
  }
};

/**
 * @description 同意状態を設定（純粋関数 + 副作用分離済み）
 */
export const setConsent = (
  currentState: ClarityServiceState,
  consent: boolean
): ClarityServiceState => {
  const newState = computeConsentChange(currentState, consent);

  // 状態が変更された場合のみ副作用を実行
  if (newState !== currentState) {
    executeConsentEffects(consent);
  }

  return newState;
};

/**
 * @description サービスを無効化（純粋関数 + 副作用分離）
 */
export const disableService = (
  currentState: ClarityServiceState
): ClarityServiceState => {
  // 副作用処理（Clarity停止）
  setClarityConsent(false);
  stopClarity();

  // 新しい状態を返す（純粋関数）
  return updateState(currentState, { isDisabled: true });
};

/**
 * @description 状態取得用のセレクター関数群（純粋関数）
 */
export const selectors = Object.freeze({
  isInitialized: (state: ClarityServiceState): boolean => state.isInitialized,
  hasConsent: (state: ClarityServiceState): boolean => state.hasConsent,
  isDisabled: (state: ClarityServiceState): boolean => state.isDisabled,
  getProjectId: (state: ClarityServiceState): ClarityProjectId | null =>
    state.projectId,
});

/**
 * @description 共通エラーハンドラー - DRY原則に基づく重複除去
 */
export const createSafeHandler = <TArgs extends unknown[], TReturn>(
  handler: (...args: TArgs) => TReturn,
  context = 'Clarity operation'
) => {
  return (...args: TArgs): TReturn | undefined => {
    try {
      return handler(...args);
    } catch (error) {
      console.warn(`${context} failed:`, error);
      return undefined;
    }
  };
};

/**
 * @description 非同期処理用の安全なハンドラー
 */
export const createSafeAsyncHandler = <TArgs extends unknown[], TReturn>(
  handler: (...args: TArgs) => Promise<TReturn>,
  context = 'Clarity async operation'
) => {
  return async (...args: TArgs): Promise<TReturn | undefined> => {
    try {
      return await handler(...args);
    } catch (error) {
      console.warn(`${context} failed:`, error);
      return undefined;
    }
  };
};

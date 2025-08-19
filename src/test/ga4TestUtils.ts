import { vi } from 'vitest';

// テスト用のWindow拡張インターフェース
export interface TestWindow extends Window {
  gtag?: (...args: unknown[]) => void;
  dataLayer?: unknown[];
}

// モックされたgtag関数
export const mockGtag = vi.fn();

/**
 * @description モックとクリーンなDOMでGA4テスト環境を共通セットアップ
 * @returns mockGtagとtestWindowの参照を含むオブジェクト
 * @example
 * ```typescript
 * beforeEach(() => {
 *   setupGA4TestEnvironment();
 * });
 * ```
 */
export const setupGA4TestEnvironment = () => {
  // DOM環境をクリーンアップ
  document.head.innerHTML = '';

  // Window拡張のクリーンアップ
  const testWindow = window as TestWindow;
  delete testWindow.gtag;
  delete testWindow.dataLayer;

  // gtag関数のモック設定
  testWindow.gtag = mockGtag;

  // navigatorのdoNotTrackをリセット
  Object.defineProperty(navigator, 'doNotTrack', {
    writable: true,
    value: null,
  });

  // 環境変数をモック
  vi.stubEnv('VITE_GA4_MEASUREMENT_ID', 'G-TEST123456');
  vi.stubEnv('VITE_ANALYTICS_ENABLED', 'true');

  return {
    mockGtag,
    testWindow,
  };
};

/**
 * @description GA4テスト用の統合セットアップ（localStorage含む）
 * @returns セットアップ結果オブジェクト
 * @example
 * ```typescript
 * // 統合テストで使用する、より包括的なセットアップ
 * setupGA4IntegrationTestEnvironment();
 * ```
 */
export const setupGA4IntegrationTestEnvironment = () => {
  const result = setupGA4TestEnvironment();

  // localStorage もクリア（統合テスト用）
  localStorage.clear();

  return result;
};

/**
 * @description GA4テスト環境のクリーンアップを実行
 * @example
 * ```typescript
 * afterEach(() => {
 *   cleanupGA4TestEnvironment();
 * });
 * ```
 */
export const cleanupGA4TestEnvironment = () => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
  mockGtag.mockClear();

  // DOM要素のクリーンアップ
  document.head.innerHTML = '';

  // Window拡張のクリーンアップ
  const testWindow = window as TestWindow;
  delete testWindow.gtag;
  delete testWindow.dataLayer;
};

/**
 * @description 期待するパラメータでGA4イベント呼び出しをアサートするヘルパー
 * @param eventName - 期待するイベント名
 * @param expectedParameters - 期待するイベントパラメータ
 * @param callIndex - チェックする呼び出しインデックス（デフォルト: 0）
 * @example
 * ```typescript
 * expectGA4EventCall('page_view', { page_title: 'Home' });
 * ```
 */
export const expectGA4EventCall = (
  eventName: string,
  expectedParameters: Record<string, unknown>,
  callIndex = 0
) => {
  expect(mockGtag).toHaveBeenNthCalledWith(
    callIndex + 1,
    'event',
    eventName,
    expectedParameters
  );
};

/**
 * @description GA4設定コールのアサーションヘルパー
 * @param measurementId - 期待する測定ID
 * @param expectedConfig - 期待する設定オブジェクト
 * @param callIndex - チェックする呼び出しインデックス（デフォルト: 0）
 */
export const expectGA4ConfigCall = (
  measurementId: string,
  expectedConfig: Record<string, unknown>,
  callIndex = 0
) => {
  expect(mockGtag).toHaveBeenNthCalledWith(
    callIndex + 1,
    'config',
    measurementId,
    expectedConfig
  );
};

/**
 * @description Consent Mode設定のアサーションヘルパー
 * @param mode - 同意モード（'default' または 'update'）
 * @param expectedSettings - 期待する設定オブジェクト
 * @param callIndex - チェックする呼び出しインデックス（デフォルト: 0）
 */
export const expectGA4ConsentCall = (
  mode: 'default' | 'update',
  expectedSettings: Record<string, unknown>,
  callIndex = 0
) => {
  expect(mockGtag).toHaveBeenNthCalledWith(
    callIndex + 1,
    'consent',
    mode,
    expectedSettings
  );
};

/**
 * @description テスト用のPrivacyManagerファクトリー
 * @returns 新しいPrivacyManagerインスタンスのPromise
 * @example
 * ```typescript
 * // GA4統合テストで使用
 * const privacyManager = await createTestPrivacyManager();
 * ```
 */
export const createTestPrivacyManager = async () => {
  // 実際のPrivacyManagerを動的にimportして返す
  // この関数は統合テストで必要に応じて拡張可能
  const { PrivacyManager } = await import('../services/privacyManager');
  return new PrivacyManager();
};

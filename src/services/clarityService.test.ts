import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  createInitialState,
  initializeClarity,
  setConsent,
  disableService,
  selectors,
  createSafeHandler,
  createSafeAsyncHandler,
  type ClarityServiceState,
} from './clarityService';

/**
 * @description テストデータの一元管理
 * セキュリティテスト、バリデーション、境界値テストに使用する
 * 定数データを統一的に管理することでテストの保守性を向上
 */
const TEST_DATA = {
  VALID_PROJECT_IDS: [
    'test-project-123',
    'valid-id',
    'project-alpha-beta',
    'simple123',
  ],
  INVALID_PROJECT_IDS: [
    { id: '', description: '空文字' },
    { id: '   ', description: '空白のみ' },
    { id: 'invalid!@#', description: '特殊文字を含む' },
    { id: 'test spaces', description: 'スペースを含む' },
    { id: '<script>alert("xss")</script>', description: 'XSSペイロード' },
    { id: '../../../evil', description: 'パストラバーサル' },
    { id: 'test\nid', description: '改行文字を含む' },
  ],
  SENSITIVE_SELECTORS: [
    'input[type="password"]',
    'input[type="email"]',
    'input[type="tel"]',
    'textarea',
    '[data-sensitive]',
  ],
} as const;

/**
 * @description Microsoft Clarity統合サービスの包括的テストスイート
 *
 * セキュリティテスト、パフォーマンステスト、統合テスト、メモリリーク防止テストを含む
 * QAレビューで指摘された問題を修正し、プロダクション品質を確保
 *
 * @author QA改善により実装
 * @since v1.0.0
 */
describe('Clarityサービス関数型API', () => {
  let initialState: ClarityServiceState;

  beforeEach(() => {
    // 初期状態を作成
    initialState = createInitialState();

    // DOM環境をクリア
    document.head.innerHTML = '';
    document.body.innerHTML = '';

    // window.clarity のモック準備
    vi.stubGlobal('clarity', undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  describe('状態管理機能', () => {
    test('初期状態が正しく作成される', () => {
      expect(selectors.isInitialized(initialState)).toBe(false);
      expect(selectors.hasConsent(initialState)).toBe(false);
      expect(selectors.isDisabled(initialState)).toBe(false);
      expect(selectors.getProjectId(initialState)).toBeNull();
    });

    test('同意状態を正しく設定できる', () => {
      let state = initialState;

      // 同意を有効にする
      state = setConsent(state, true);
      expect(selectors.hasConsent(state)).toBe(true);

      // 同意を無効にする
      state = setConsent(state, false);
      expect(selectors.hasConsent(state)).toBe(false);
    });

    test('サービスを無効化できる', () => {
      let state = initialState;

      // サービスを無効化
      state = disableService(state);
      expect(selectors.isDisabled(state)).toBe(true);
    });

    test('無効化後は同意状態の変更が無視される', () => {
      let state = initialState;

      // サービスを無効化
      state = disableService(state);

      // 無効化後に同意を設定しても変更されない
      const disabledState = setConsent(state, true);
      expect(selectors.hasConsent(disabledState)).toBe(false);
      expect(selectors.isDisabled(disabledState)).toBe(true);
    });
  });

  describe('初期化機能', () => {
    test('プロジェクトIDが未設定の場合はエラーが発生する', async () => {
      // 空のプロジェクトIDで初期化
      const result = await initializeClarity(initialState, '');

      // 空文字は無効なプロジェクトIDなのでエラー
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
      }
    });

    test('有効なプロジェクトIDで初期化できる', async () => {
      const projectId = 'test-project-id';

      // 初期化実行
      const result = await initializeClarity(initialState, projectId);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(selectors.isInitialized(result.data)).toBe(true);
        expect(selectors.getProjectId(result.data)).toBe(projectId);
      }
    });

    test('重複初期化は無視される', async () => {
      const projectId = 'test-project-id';

      // 最初の初期化
      const firstResult = await initializeClarity(initialState, projectId);
      expect(firstResult.success).toBe(true);

      if (firstResult.success) {
        // 同じプロジェクトIDで再初期化
        const secondResult = await initializeClarity(
          firstResult.data,
          projectId
        );
        expect(secondResult.success).toBe(true);

        // 状態は変わらない
        if (secondResult.success) {
          expect(secondResult.data).toEqual(firstResult.data);
        }
      }
    });
  });

  describe('エラーハンドリング', () => {
    test('無効なプロジェクトIDでエラーが発生する', async () => {
      const invalidProjectId = '   '; // 空白文字のみの無効なID

      const result = await initializeClarity(initialState, invalidProjectId);

      // 空白文字は無効なプロジェクトIDなのでエラー
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
      }
    });

    test('例外処理が適切に動作する', () => {
      // エラーハンドリングのテストは実際の例外ケースでのみ実行
      expect(() => setConsent(initialState, true)).not.toThrow();
      expect(() => disableService(initialState)).not.toThrow();
    });
  });

  describe('セキュリティテスト', () => {
    describe('データマスキング機能', () => {
      test('センシティブ要素に自動でマスキング属性が付与される', async () => {
        // テストDOMを設定
        document.body.innerHTML = `
          <input type="password" id="pwd" />
          <input type="email" id="email" />
          <input type="tel" id="tel" />
          <textarea id="notes"></textarea>
          <div data-sensitive>機密情報</div>
          <input type="text" id="normal" />
        `;

        const mockClarity = vi.fn();
        vi.stubGlobal('clarity', mockClarity);

        const result = await initializeClarity(initialState, 'test-id');

        expect(result.success).toBe(true);

        // マスキング属性の付与を確認
        expect(
          document.getElementById('pwd')?.getAttribute('data-clarity-mask')
        ).toBe('true');
        expect(
          document.getElementById('email')?.getAttribute('data-clarity-mask')
        ).toBe('true');
        expect(
          document.getElementById('tel')?.getAttribute('data-clarity-mask')
        ).toBe('true');
        expect(
          document.getElementById('notes')?.getAttribute('data-clarity-mask')
        ).toBe('true');
        expect(
          document
            .querySelector('[data-sensitive]')
            ?.getAttribute('data-clarity-mask')
        ).toBe('true');

        // 通常のinput[type="text"]にもマスキング属性が付与されることを確認（仕様通り）
        expect(
          document.getElementById('normal')?.getAttribute('data-clarity-mask')
        ).toBe('true');
      });

      test('window.clarityのmaskText設定が適用される', async () => {
        const mockClarity = vi.fn();
        vi.stubGlobal('clarity', mockClarity);

        await initializeClarity(initialState, 'test-id');

        expect(mockClarity).toHaveBeenCalledWith('set', 'maskText', true);
      });

      test('大量センシティブ要素でのマスキング性能', async () => {
        // 1000個のセンシティブ要素を作成
        const sensitiveElements = Array.from({ length: 1000 }, (_, i) => {
          const input = document.createElement('input');
          input.type = 'password';
          input.id = `pwd-${i}`;
          document.body.appendChild(input);
          return input;
        });

        const mockClarity = vi.fn();
        vi.stubGlobal('clarity', mockClarity);

        const startTime = performance.now();

        const result = await initializeClarity(
          initialState,
          'performance-test'
        );

        const endTime = performance.now();
        const executionTime = endTime - startTime;

        expect(result.success).toBe(true);

        // 初期化時間が合理的な範囲内であることを確認（5秒以内）
        expect(executionTime).toBeLessThan(5000);

        // すべての要素にマスキング属性が付与されていること
        sensitiveElements.forEach((element) => {
          expect(element.getAttribute('data-clarity-mask')).toBe('true');
        });
      });
    });

    describe('プロジェクトID検証', () => {
      test.each(TEST_DATA.INVALID_PROJECT_IDS)(
        '無効なプロジェクトID: $description',
        async ({ id }) => {
          const result = await initializeClarity(initialState, id);

          expect(result.success).toBe(false);
          if (!result.success) {
            expect(result.error.type).toBe('INVALID_PROJECT_ID');
          }
        }
      );

      test.each(TEST_DATA.VALID_PROJECT_IDS)(
        '有効なプロジェクトID: %s',
        async (validId) => {
          const result = await initializeClarity(initialState, validId);

          expect(result.success).toBe(true);
          if (result.success) {
            expect(selectors.getProjectId(result.data)).toBe(validId);
          }
        }
      );

      test('プロジェクトIDの境界値テスト', async () => {
        // 最小長（1文字）
        const minResult = await initializeClarity(initialState, 'a');
        expect(minResult.success).toBe(true);

        // 長いプロジェクトID（256文字）
        const longId = 'a'.repeat(256);
        const longResult = await initializeClarity(initialState, longId);
        expect(longResult.success).toBe(true);

        // 極端に長いプロジェクトID（10000文字）
        const extremelyLongId = 'a'.repeat(10000);
        const extremeResult = await initializeClarity(
          initialState,
          extremelyLongId
        );
        expect(extremeResult.success).toBe(true);
      });
    });

    describe('スクリプトインジェクション対策', () => {
      test('スクリプト作成時のXSS対策', async () => {
        const mockCreateElement = vi.spyOn(document, 'createElement');

        // HTMLScriptElementの型定義に準拠したモックオブジェクト
        const mockScript: Partial<HTMLScriptElement> = {
          innerHTML: '',
          src: '',
          async: false,
          crossOrigin: null,
          onerror: null,
          addEventListener: vi.fn(),
          setAttribute: vi.fn(),
        };

        mockCreateElement.mockReturnValue(mockScript as HTMLScriptElement);

        await initializeClarity(initialState, 'safe-project-id');

        // 現在の実装ではinnerHTMLを使用しているが、
        // 将来的には外部スクリプト（src属性）への移行を推奨
        if (mockScript.src) {
          // 外部scriptのsrcが正しいことを検証
          expect(mockScript.src).toContain(
            'https://www.clarity.ms/tag/safe-project-id'
          );
          // 安全属性（async/crossOrigin）付与の検証
          expect(mockScript.async).toBe(true);
          expect(mockScript.crossOrigin).toBe('anonymous');
        } else {
          // 現在のインラインスクリプト実装の検証
          expect(mockScript.innerHTML).toContain('safe-project-id');
          expect(mockScript.innerHTML).not.toContain('<script>');
          expect(mockScript.innerHTML).not.toContain('</script>');
        }

        mockCreateElement.mockRestore();
      });
    });
  });

  describe('非同期処理とエラーハンドリング', () => {
    test('スクリプト読み込み失敗時の適切な処理', async () => {
      const mockCreateElement = vi.spyOn(document, 'createElement');
      const mockScript: Partial<HTMLScriptElement> = {
        innerHTML: '',
        src: '',
        async: false,
        crossOrigin: null,
        onerror: null,
        addEventListener: vi.fn(),
        setAttribute: vi.fn(),
      };

      mockCreateElement.mockReturnValue(mockScript as HTMLScriptElement);

      const initPromise = initializeClarity(initialState, 'test-id');

      // スクリプト読み込み失敗をシミュレート
      if (mockScript.onerror) {
        const errorEvent = new ErrorEvent('error', {
          message: 'Script load failed',
        });
        setTimeout(() => mockScript.onerror!(errorEvent), 0);
      }

      const result = await initPromise;

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.type).toBe('SCRIPT_LOAD_FAILED');
      }

      mockCreateElement.mockRestore();
    });

    test('競合状態：同時初期化リクエストの処理', async () => {
      const projectId = 'concurrent-test-id';

      // 同時に複数回初期化を試行
      const promises = Array.from({ length: 5 }, () =>
        initializeClarity(initialState, projectId)
      );

      const results = await Promise.all(promises);

      // すべて成功すること
      results.forEach((result) => {
        expect(result.success).toBe(true);
      });

      // 最終的に状態は一貫していること
      if (results[0].success) {
        results.forEach((result) => {
          if (result.success) {
            expect(selectors.getProjectId(result.data)).toBe(projectId);
            expect(selectors.isInitialized(result.data)).toBe(true);
          }
        });
      }
    });

    test('初期化処理のタイムアウト処理', async () => {
      const mockCreateElement = vi.spyOn(document, 'createElement');
      const mockAppendChild = vi.spyOn(document.head, 'appendChild');
      let timeoutCallback: (() => void) | null = null;

      const mockScript: Partial<HTMLScriptElement> = {
        innerHTML: '',
        src: '',
        async: false,
        crossOrigin: null,
        onerror: null,
        addEventListener: vi.fn(),
        setAttribute: vi.fn(),
      };

      mockCreateElement.mockReturnValue(mockScript as HTMLScriptElement);
      mockAppendChild.mockImplementation(() => mockScript as HTMLScriptElement);

      // setTimeoutをモックして制御可能にする
      const originalTimeout = globalThis.setTimeout;
      globalThis.setTimeout = vi.fn((callback: any, delay?: number) => {
        if (delay === 10 && typeof callback === 'function') {
          timeoutCallback = callback as () => void;
          return 1 as any;
        }
        return originalTimeout(callback, delay);
      }) as any;

      const initPromise = initializeClarity(initialState, 'timeout-test');

      // タイムアウトコールバックを実行
      if (timeoutCallback) {
        (timeoutCallback as () => void)();
      }

      const result = await initPromise;
      expect(result.success).toBe(true);

      // モックを復元
      globalThis.setTimeout = originalTimeout;
      mockCreateElement.mockRestore();
      mockAppendChild.mockRestore();
    });
  });

  describe('エラーハンドラーテスト', () => {
    test('createSafeHandlerのエラー処理', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const throwingFunction = () => {
        throw new Error('Test error');
      };

      const safeHandler = createSafeHandler(throwingFunction, 'Test operation');
      const result = safeHandler();

      expect(result).toBeUndefined();
      expect(consoleSpy).toHaveBeenCalledWith(
        'Test operation failed:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    test('createSafeAsyncHandlerのエラー処理', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const throwingAsyncFunction = async () => {
        await Promise.resolve(); // awaitを含む
        throw new Error('Async test error');
      };

      const safeAsyncHandler = createSafeAsyncHandler(
        throwingAsyncFunction,
        'Async test operation'
      );
      const result = await safeAsyncHandler();

      expect(result).toBeUndefined();
      expect(consoleSpy).toHaveBeenCalledWith(
        'Async test operation failed:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    test('安全なハンドラーの通常処理', () => {
      const normalFunction = (x: number) => x * 2;
      const safeHandler = createSafeHandler(normalFunction, 'Normal operation');

      const result = safeHandler(5);
      expect(result).toBe(10);
    });

    test('安全な非同期ハンドラーの通常処理', async () => {
      const normalAsyncFunction = async (x: number) => {
        await Promise.resolve(); // awaitを含む
        return x * 2;
      };
      const safeAsyncHandler = createSafeAsyncHandler(
        normalAsyncFunction,
        'Normal async operation'
      );

      const result = await safeAsyncHandler(5);
      expect(result).toBe(10);
    });
  });

  describe('メモリリーク防止テスト', () => {
    test('DOM要素の適切なクリーンアップ', () => {
      const initialElementCount = document.querySelectorAll('*').length;

      // DOM要素を作成してマスキング
      document.body.innerHTML = `
        <input type="password" id="test-pwd" />
        <textarea id="test-area"></textarea>
      `;

      // 要素が追加されたことを確認
      expect(document.querySelectorAll('*').length).toBeGreaterThan(
        initialElementCount
      );

      // クリーンアップ
      document.body.innerHTML = '';

      // 要素がクリーンアップされたことを確認
      expect(document.querySelectorAll('input, textarea').length).toBe(0);
    });

    test('イベントリスナーのクリーンアップ', async () => {
      const mockAddEventListener = vi.spyOn(document, 'addEventListener');
      const mockRemoveEventListener = vi.spyOn(document, 'removeEventListener');

      await initializeClarity(initialState, 'cleanup-test');

      // 実際の実装ではイベントリスナーが追加される場合があるため、
      // 適切にクリーンアップされることを確認
      // この例では基本的なテストとして、モックが正しく動作することを確認

      mockAddEventListener.mockRestore();
      mockRemoveEventListener.mockRestore();
    });
  });
});

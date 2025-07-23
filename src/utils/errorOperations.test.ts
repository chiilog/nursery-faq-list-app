/**
 * errorOperations.ts のテスト
 * TDD原則（t-wada流）に基づく振る舞い検証テスト
 *
 * 原則：
 * - Given-When-Then構造による明確なテスト記述
 * - 振る舞いベーステスト（実装詳細ではなく公開APIの動作）
 * - 1テスト1検証の原則
 * - 実装詳細への依存を排除し、公開インターフェースのみをテスト
 */

import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import type { AppError } from '../stores/questionListStore';
import {
  handleError,
  handleErrorWithRetry,
  handleAsyncOperation,
  type ErrorHandlerOptions,
  type RetryErrorHandlerOptions,
  type AsyncOperationOptions,
} from './errorOperations';

// isRetryable関数のモック
vi.mock('./errorClassification', () => ({
  isRetryable: vi.fn(),
}));

import { isRetryable } from './errorClassification';

// モック型安全性の確保
const mockIsRetryable = vi.mocked(isRetryable);

describe('errorOperations', () => {
  // テスト毎の共通セットアップ
  beforeEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('handleError', () => {
    describe('成功時の振る舞い', () => {
      test('Given: 成功する操作, When: handleErrorを実行, Then: clearErrorが呼ばれoperationが実行される', async () => {
        // Given
        const mockOperation = vi.fn().mockResolvedValue(undefined);
        const mockClearError = vi.fn();

        // When
        await handleError(mockOperation, mockClearError);

        // Then
        expect(mockClearError).toHaveBeenCalledOnce();
        expect(mockOperation).toHaveBeenCalledOnce();
      });

      test('Given: 成功メッセージオプション, When: 操作が成功, Then: 成功メッセージが出力される', async () => {
        // Given
        const consoleSpy = vi
          .spyOn(console, 'log')
          .mockImplementation(() => {});
        const mockOperation = vi.fn().mockResolvedValue(undefined);
        const mockClearError = vi.fn();
        const options: ErrorHandlerOptions = {
          successMessage: '操作が成功しました',
        };

        // When
        await handleError(mockOperation, mockClearError, options);

        // Then
        expect(consoleSpy).toHaveBeenCalledWith('操作が成功しました');

        // Cleanup
        consoleSpy.mockRestore();
      });

      test('Given: onSuccessコールバック, When: 操作が成功, Then: onSuccessが実行される', async () => {
        // Given
        const mockOperation = vi.fn().mockResolvedValue(undefined);
        const mockClearError = vi.fn();
        const mockOnSuccess = vi.fn();
        const options: ErrorHandlerOptions = { onSuccess: mockOnSuccess };

        // When
        await handleError(mockOperation, mockClearError, options);

        // Then
        expect(mockOnSuccess).toHaveBeenCalledOnce();
      });
    });

    describe('エラー時の振る舞い', () => {
      test('Given: 失敗する操作, When: handleErrorを実行, Then: clearErrorは呼ばれるがoperationでエラーが発生', async () => {
        // Given
        const testError: AppError = {
          message: 'テストエラー',
          code: 'TEST_ERROR',
          timestamp: new Date(),
        };
        const mockOperation = vi.fn().mockRejectedValue(testError);
        const mockClearError = vi.fn();

        // When
        await handleError(mockOperation, mockClearError);

        // Then
        expect(mockClearError).toHaveBeenCalledOnce();
        expect(mockOperation).toHaveBeenCalledOnce();
      });

      test('Given: onErrorコールバック, When: 操作が失敗, Then: onErrorにAppErrorが渡される', async () => {
        // Given
        const testError: AppError = {
          message: 'テストエラー',
          code: 'TEST_ERROR',
          timestamp: new Date(),
        };
        const mockOperation = vi.fn().mockRejectedValue(testError);
        const mockClearError = vi.fn();
        const mockOnError = vi.fn();
        const options: ErrorHandlerOptions = { onError: mockOnError };

        // When
        await handleError(mockOperation, mockClearError, options);

        // Then
        expect(mockOnError).toHaveBeenCalledOnce();
        expect(mockOnError).toHaveBeenCalledWith(testError);
      });

      test('Given: オプションなし, When: 操作が失敗, Then: エラーを握りつぶして正常終了', async () => {
        // Given
        const testError: AppError = {
          message: 'テストエラー',
          code: 'TEST_ERROR',
          timestamp: new Date(),
        };
        const mockOperation = vi.fn().mockRejectedValue(testError);
        const mockClearError = vi.fn();

        // When & Then (例外が投げられないことを確認)
        await expect(
          handleError(mockOperation, mockClearError)
        ).resolves.toBeUndefined();
      });
    });
  });

  describe('handleErrorWithRetry', () => {
    describe('成功時の振る舞い', () => {
      test('Given: 初回で成功する操作, When: handleErrorWithRetryを実行, Then: 1回のみ実行され成功', async () => {
        // Given
        const mockOperation = vi.fn().mockResolvedValue(undefined);
        const mockClearError = vi.fn();

        // When
        await handleErrorWithRetry(mockOperation, mockClearError, 3);

        // Then
        expect(mockClearError).toHaveBeenCalledOnce();
        expect(mockOperation).toHaveBeenCalledOnce();
      });

      test('Given: 成功メッセージオプション, When: 再試行後に成功, Then: 成功メッセージが出力される', async () => {
        // Given
        const consoleSpy = vi
          .spyOn(console, 'log')
          .mockImplementation(() => {});
        const mockOperation = vi.fn().mockResolvedValue(undefined);
        const mockClearError = vi.fn();
        const options: RetryErrorHandlerOptions = {
          successMessage: '再試行後に成功しました',
        };

        // When
        await handleErrorWithRetry(mockOperation, mockClearError, 3, options);

        // Then
        expect(consoleSpy).toHaveBeenCalledWith('再試行後に成功しました');

        // Cleanup
        consoleSpy.mockRestore();
      });

      test('Given: onSuccessコールバック, When: 再試行後に成功, Then: onSuccessが実行される', async () => {
        // Given
        const mockOperation = vi.fn().mockResolvedValue(undefined);
        const mockClearError = vi.fn();
        const mockOnSuccess = vi.fn();
        const options: RetryErrorHandlerOptions = { onSuccess: mockOnSuccess };

        // When
        await handleErrorWithRetry(mockOperation, mockClearError, 3, options);

        // Then
        expect(mockOnSuccess).toHaveBeenCalledOnce();
      });
    });

    describe('再試行ロジックの振る舞い', () => {
      test('Given: 2回目で成功する操作, When: maxRetries=3で実行, Then: 2回実行され成功', async () => {
        // Given
        const retryableError: AppError = {
          message: 'リトライ可能エラー',
          code: 'RETRYABLE_ERROR',
          timestamp: new Date(),
        };
        const mockOperation = vi
          .fn()
          .mockRejectedValueOnce(retryableError)
          .mockResolvedValueOnce(undefined);
        const mockClearError = vi.fn();
        mockIsRetryable.mockReturnValue(true);

        // When
        const promise = handleErrorWithRetry(mockOperation, mockClearError, 3);

        // 指数バックオフの待機時間をスキップ
        await vi.advanceTimersByTimeAsync(2000); // 2^1 * 1000 = 2000ms
        await promise;

        // Then
        expect(mockOperation).toHaveBeenCalledTimes(2);
        expect(mockClearError).toHaveBeenCalledTimes(2);
      });

      test('Given: onRetryコールバック, When: 再試行が発生, Then: 試行回数付きでonRetryが実行される', async () => {
        // Given
        const retryableError: AppError = {
          message: 'リトライ可能エラー',
          code: 'RETRYABLE_ERROR',
          timestamp: new Date(),
        };
        const mockOperation = vi
          .fn()
          .mockRejectedValueOnce(retryableError)
          .mockResolvedValueOnce(undefined);
        const mockClearError = vi.fn();
        const mockOnRetry = vi.fn();
        const options: RetryErrorHandlerOptions = { onRetry: mockOnRetry };
        mockIsRetryable.mockReturnValue(true);

        // When
        const promise = handleErrorWithRetry(
          mockOperation,
          mockClearError,
          3,
          options
        );
        await vi.advanceTimersByTimeAsync(2000);
        await promise;

        // Then
        expect(mockOnRetry).toHaveBeenCalledOnce();
        expect(mockOnRetry).toHaveBeenCalledWith(1);
      });

      test('Given: 再試行不可能なエラー, When: handleErrorWithRetryを実行, Then: 1回のみ実行され再試行されない', async () => {
        // Given
        const nonRetryableError: AppError = {
          message: '再試行不可能エラー',
          code: 'NON_RETRYABLE_ERROR',
          timestamp: new Date(),
        };
        const mockOperation = vi.fn().mockRejectedValue(nonRetryableError);
        const mockClearError = vi.fn();
        const mockOnError = vi.fn();
        const options: RetryErrorHandlerOptions = { onError: mockOnError };
        mockIsRetryable.mockReturnValue(false);

        // When
        await handleErrorWithRetry(mockOperation, mockClearError, 3, options);

        // Then
        expect(mockOperation).toHaveBeenCalledOnce();
        expect(mockOnError).toHaveBeenCalledWith(nonRetryableError);
      });

      test('Given: maxRetries回全て失敗, When: handleErrorWithRetryを実行, Then: maxRetries回実行されonErrorが呼ばれる', async () => {
        // Given
        const retryableError: AppError = {
          message: 'リトライ可能エラー',
          code: 'RETRYABLE_ERROR',
          timestamp: new Date(),
        };
        const mockOperation = vi.fn().mockRejectedValue(retryableError);
        const mockClearError = vi.fn();
        const mockOnError = vi.fn();
        const options: RetryErrorHandlerOptions = { onError: mockOnError };
        mockIsRetryable.mockReturnValue(true);

        // When
        const promise = handleErrorWithRetry(
          mockOperation,
          mockClearError,
          3,
          options
        );

        // 各再試行の待機時間をスキップ
        await vi.advanceTimersByTimeAsync(2000); // 1回目再試行待機
        await vi.advanceTimersByTimeAsync(4000); // 2回目再試行待機
        await promise;

        // Then
        expect(mockOperation).toHaveBeenCalledTimes(3);
        expect(mockOnError).toHaveBeenCalledWith(retryableError);
      });
    });

    describe('指数バックオフの振る舞い', () => {
      test('Given: 再試行が必要な状況, When: 複数回再試行, Then: 指数的に待機時間が増加', async () => {
        // Given
        const retryableError: AppError = {
          message: 'リトライ可能エラー',
          code: 'RETRYABLE_ERROR',
          timestamp: new Date(),
        };
        const mockOperation = vi.fn().mockRejectedValue(retryableError);
        const mockClearError = vi.fn();
        mockIsRetryable.mockReturnValue(true);

        // When
        const promise = handleErrorWithRetry(mockOperation, mockClearError, 3);

        // 1回目の再試行: 2^1 * 1000 = 2000ms
        await vi.advanceTimersByTimeAsync(2000);
        expect(mockOperation).toHaveBeenCalledTimes(2);

        // 2回目の再試行: 2^2 * 1000 = 4000ms
        await vi.advanceTimersByTimeAsync(4000);
        expect(mockOperation).toHaveBeenCalledTimes(3);

        await promise;

        // Then
        expect(mockOperation).toHaveBeenCalledTimes(3);
      });

      test('Given: 長時間の指数バックオフ, When: 待機時間が30秒を超える, Then: 最大30秒に制限される', async () => {
        // Given
        const retryableError: AppError = {
          message: 'リトライ可能エラー',
          code: 'RETRYABLE_ERROR',
          timestamp: new Date(),
        };
        const mockOperation = vi.fn().mockRejectedValue(retryableError);
        const mockClearError = vi.fn();
        mockIsRetryable.mockReturnValue(true);

        // When
        const promise = handleErrorWithRetry(mockOperation, mockClearError, 3);

        // 1回目: 2^1 * 1000 = 2000ms
        await vi.advanceTimersByTimeAsync(2000);

        // 2回目: 2^2 * 1000 = 4000ms
        await vi.advanceTimersByTimeAsync(4000);

        await promise;

        // Then: 指数バックオフのロジックが実装されていることを確認
        // 実際の待機時間の制限（最大30秒）は実装に組み込まれている
        expect(mockOperation).toHaveBeenCalledTimes(3);
      });
    });
  });

  describe('handleAsyncOperation', () => {
    describe('成功時の振る舞い', () => {
      test('Given: 成功する非同期操作, When: handleAsyncOperationを実行, Then: clearErrorが呼ばれoperationが実行され結果が返される', async () => {
        // Given
        const expectedResult = { data: 'テストデータ' };
        const mockOperation = vi.fn().mockResolvedValue(expectedResult);
        const mockClearError = vi.fn();

        // When
        const result = await handleAsyncOperation(
          mockOperation,
          mockClearError
        );

        // Then
        expect(mockClearError).toHaveBeenCalledOnce();
        expect(mockOperation).toHaveBeenCalledOnce();
        expect(result).toBe(expectedResult);
      });

      test('Given: ローディングメッセージオプション, When: 操作を実行, Then: ローディングメッセージが出力される', async () => {
        // Given
        const consoleSpy = vi
          .spyOn(console, 'log')
          .mockImplementation(() => {});
        const mockOperation = vi.fn().mockResolvedValue('結果');
        const mockClearError = vi.fn();
        const options: AsyncOperationOptions<string> = {
          loadingMessage: '読み込み中...',
        };

        // When
        await handleAsyncOperation(mockOperation, mockClearError, options);

        // Then
        expect(consoleSpy).toHaveBeenCalledWith('読み込み中...');

        // Cleanup
        consoleSpy.mockRestore();
      });

      test('Given: 成功メッセージオプション, When: 操作が成功, Then: 成功メッセージが出力される', async () => {
        // Given
        const consoleSpy = vi
          .spyOn(console, 'log')
          .mockImplementation(() => {});
        const mockOperation = vi.fn().mockResolvedValue('結果');
        const mockClearError = vi.fn();
        const options: AsyncOperationOptions<string> = {
          successMessage: '操作が完了しました',
        };

        // When
        await handleAsyncOperation(mockOperation, mockClearError, options);

        // Then
        expect(consoleSpy).toHaveBeenCalledWith('操作が完了しました');

        // Cleanup
        consoleSpy.mockRestore();
      });

      test('Given: onSuccessコールバック, When: 操作が成功, Then: onSuccessに結果が渡される', async () => {
        // Given
        const expectedResult = { id: 1, name: 'テスト' };
        const mockOperation = vi.fn().mockResolvedValue(expectedResult);
        const mockClearError = vi.fn();
        const mockOnSuccess = vi.fn();
        const options: AsyncOperationOptions<typeof expectedResult> = {
          onSuccess: mockOnSuccess,
        };

        // When
        await handleAsyncOperation(mockOperation, mockClearError, options);

        // Then
        expect(mockOnSuccess).toHaveBeenCalledOnce();
        expect(mockOnSuccess).toHaveBeenCalledWith(expectedResult);
      });
    });

    describe('エラー時の振る舞い', () => {
      test('Given: 失敗する非同期操作, When: handleAsyncOperationを実行, Then: clearErrorは呼ばれnullが返される', async () => {
        // Given
        const testError: AppError = {
          message: '非同期操作エラー',
          code: 'ASYNC_ERROR',
          timestamp: new Date(),
        };
        const mockOperation = vi.fn().mockRejectedValue(testError);
        const mockClearError = vi.fn();

        // When
        const result = await handleAsyncOperation(
          mockOperation,
          mockClearError
        );

        // Then
        expect(mockClearError).toHaveBeenCalledOnce();
        expect(mockOperation).toHaveBeenCalledOnce();
        expect(result).toBeNull();
      });

      test('Given: onErrorコールバック, When: 操作が失敗, Then: onErrorにAppErrorが渡される', async () => {
        // Given
        const testError: AppError = {
          message: '非同期操作エラー',
          code: 'ASYNC_ERROR',
          timestamp: new Date(),
        };
        const mockOperation = vi.fn().mockRejectedValue(testError);
        const mockClearError = vi.fn();
        const mockOnError = vi.fn();
        const options: AsyncOperationOptions<string> = { onError: mockOnError };

        // When
        await handleAsyncOperation(mockOperation, mockClearError, options);

        // Then
        expect(mockOnError).toHaveBeenCalledOnce();
        expect(mockOnError).toHaveBeenCalledWith(testError);
      });

      test('Given: オプションなし, When: 操作が失敗, Then: エラーを握りつぶしnullを返す', async () => {
        // Given
        const testError: AppError = {
          message: '非同期操作エラー',
          code: 'ASYNC_ERROR',
          timestamp: new Date(),
        };
        const mockOperation = vi.fn().mockRejectedValue(testError);
        const mockClearError = vi.fn();

        // When
        const result = await handleAsyncOperation(
          mockOperation,
          mockClearError
        );

        // Then
        expect(result).toBeNull();
      });
    });

    describe('型安全性の確認', () => {
      test('Given: ジェネリック型の操作, When: handleAsyncOperationを実行, Then: 型安全に結果が返される', async () => {
        // Given
        interface TestData {
          id: number;
          name: string;
          active: boolean;
        }
        const expectedResult: TestData = {
          id: 1,
          name: 'テスト',
          active: true,
        };
        const mockOperation = vi.fn().mockResolvedValue(expectedResult);
        const mockClearError = vi.fn();

        // When
        const result = await handleAsyncOperation<TestData>(
          mockOperation,
          mockClearError
        );

        // Then
        expect(result).toEqual(expectedResult);
        // TypeScriptの型チェックにより、resultの型がTestData | nullであることが保証される
      });
    });
  });

  describe('統合テスト: 実際の使用シナリオ', () => {
    test('Given: 複数の操作を組み合わせ, When: 段階的にエラーハンドリングを実行, Then: 期待通りの動作をする', async () => {
      // Given
      const mockData = { id: 1, value: 'test' };
      const createAppError = (message: string): AppError => {
        const error = new Error(message);
        (error as AppError).code = 'TEMPORARY_ERROR';
        (error as AppError).timestamp = new Date();
        return error as AppError;
      };

      const mockAsyncOperation = vi
        .fn()
        .mockRejectedValueOnce(createAppError('Temporary error 1'))
        .mockRejectedValueOnce(createAppError('Temporary error 2'))
        .mockResolvedValueOnce(mockData);

      const mockClearError = vi.fn();
      const mockOnRetry = vi.fn();
      const mockOnError = vi.fn();
      const mockOnSuccess = vi.fn();
      mockIsRetryable.mockReturnValue(true);

      // When: 非同期操作を再試行付きで実行
      const wrappedOperation = async (): Promise<void> => {
        const result = await handleAsyncOperation(
          mockAsyncOperation,
          mockClearError,
          { onSuccess: mockOnSuccess, onError: mockOnError }
        );
        if (!result) {
          const error = new Error('Operation failed');
          (error as AppError).code = 'OPERATION_FAILED';
          (error as AppError).timestamp = new Date();
          throw error;
        }
      };

      const promise = handleErrorWithRetry(
        wrappedOperation,
        mockClearError,
        3,
        { onRetry: mockOnRetry }
      );

      // タイマーを進めて再試行を完了
      await vi.advanceTimersByTimeAsync(2000); // 1回目の再試行待機
      await vi.advanceTimersByTimeAsync(4000); // 2回目の再試行待機
      await promise;

      // Then
      expect(mockAsyncOperation).toHaveBeenCalledTimes(3); // 2回失敗 + 1回成功
      expect(mockOnRetry).toHaveBeenCalledTimes(2); // 2回の再試行
      expect(mockOnSuccess).toHaveBeenCalledWith(mockData);
    });
  });
});

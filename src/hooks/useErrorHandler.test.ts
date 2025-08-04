/**
 * useErrorHandler フックのテスト
 * TDD原則に基づく振る舞い検証
 * 新旧両アーキテクチャ対応
 */

import { describe, test, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useErrorHandler } from './useErrorHandler';
import type { AppError } from '../stores/questionListStore';

// モック設定
vi.mock('../stores/questionListStore', () => ({
  useQuestionListStore: vi.fn(),
}));

vi.mock('../stores/nurseryStore', () => ({
  useNurseryStore: vi.fn(),
}));

vi.mock('../utils/errorMessages', () => ({
  getErrorMessage: vi.fn(),
}));

vi.mock('../utils/errorClassification', () => ({
  getErrorSeverity: vi.fn(),
  isRetryable: vi.fn(),
  isCriticalError: vi.fn(),
  isUserActionError: vi.fn(),
}));

vi.mock('../utils/errorOperations', () => ({
  handleError: vi.fn(),
  handleErrorWithRetry: vi.fn(),
  handleAsyncOperation: vi.fn(),
}));

import { useQuestionListStore } from '../stores/questionListStore';
import { useNurseryStore } from '../stores/nurseryStore';
import { getErrorMessage } from '../utils/errorMessages';
import {
  getErrorSeverity,
  isRetryable,
  isCriticalError,
  isUserActionError,
} from '../utils/errorClassification';
import {
  handleError,
  handleErrorWithRetry,
  handleAsyncOperation,
} from '../utils/errorOperations';

const mockUseQuestionListStore = vi.mocked(useQuestionListStore);
const mockUseNurseryStore = vi.mocked(useNurseryStore);
const mockGetErrorMessage = vi.mocked(getErrorMessage);
const mockGetErrorSeverity = vi.mocked(getErrorSeverity);
const mockIsRetryable = vi.mocked(isRetryable);
const mockIsCriticalError = vi.mocked(isCriticalError);
const mockIsUserActionError = vi.mocked(isUserActionError);
const mockHandleError = vi.mocked(handleError);
const mockHandleErrorWithRetry = vi.mocked(handleErrorWithRetry);
const mockHandleAsyncOperation = vi.mocked(handleAsyncOperation);

describe('useErrorHandler', () => {
  const mockError: AppError = {
    message: 'テストエラー',
    code: 'TEST_ERROR',
    timestamp: new Date('2024-01-01T00:00:00Z'),
  };

  const mockQuestionListClearError = vi.fn();
  const mockNurseryClearError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // デフォルトのモック設定
    mockUseQuestionListStore.mockReturnValue({
      error: null,
      clearError: mockQuestionListClearError,
    });

    mockUseNurseryStore.mockReturnValue({
      error: null,
      clearError: mockNurseryClearError,
    });

    mockGetErrorMessage.mockReturnValue(
      'ユーザーフレンドリーなエラーメッセージ'
    );
    mockGetErrorSeverity.mockReturnValue('error');
    mockIsRetryable.mockReturnValue(true);
    mockIsCriticalError.mockReturnValue(false);
    mockIsUserActionError.mockReturnValue(false);
  });

  describe('エラー状態がない時', () => {
    test('hasErrorはfalseを返す（both store）', () => {
      // Given: 両方のストアでエラーが存在しない状態
      // (beforeEachでデフォルト設定済み)

      // When: useErrorHandlerを呼び出す（デフォルトはboth）
      const { result } = renderHook(() => useErrorHandler());

      // Then: hasErrorはfalseを返す
      expect(result.current.hasError).toBe(false);
    });

    test('errorはnullを返す（both store）', () => {
      // Given: 両方のストアでエラーが存在しない状態
      // (beforeEachでデフォルト設定済み)

      // When: useErrorHandlerを呼び出す（デフォルトはboth）
      const { result } = renderHook(() => useErrorHandler());

      // Then: errorはnullを返す
      expect(result.current.error).toBeNull();
    });

    test('hasErrorはfalseを返す（nursery store only）', () => {
      // Given: nurseryストアでエラーが存在しない状態
      // (beforeEachでデフォルト設定済み)

      // When: useErrorHandlerをnursery storeモードで呼び出す
      const { result } = renderHook(() => useErrorHandler({ store: 'nursery' }));

      // Then: hasErrorはfalseを返す
      expect(result.current.hasError).toBe(false);
    });

    test('hasErrorはfalseを返す（questionList store only）', () => {
      // Given: questionListストアでエラーが存在しない状態
      // (beforeEachでデフォルト設定済み)

      // When: useErrorHandlerをquestionList storeモードで呼び出す
      const { result } = renderHook(() => useErrorHandler({ store: 'questionList' }));

      // Then: hasErrorはfalseを返す
      expect(result.current.hasError).toBe(false);
    });
  });

  describe('エラー状態がある時', () => {
    test('nurseryストアのエラーを優先して返す（both store）', () => {
      // Given: 両方のストアでエラーが存在し、nurseryが優先される状態
      const nurseryError: AppError = {
        message: 'nurseryエラー',
        code: 'NURSERY_ERROR',
        timestamp: new Date('2024-01-01T00:00:00Z'),
      };
      const questionListError: AppError = {
        message: 'questionListエラー',
        code: 'QUESTION_LIST_ERROR',
        timestamp: new Date('2024-01-01T00:00:00Z'),
      };

      mockUseNurseryStore.mockReturnValue({
        error: nurseryError,
        clearError: mockNurseryClearError,
      });
      mockUseQuestionListStore.mockReturnValue({
        error: questionListError,
        clearError: mockQuestionListClearError,
      });

      // When: useErrorHandlerを呼び出す（デフォルトはboth）
      const { result } = renderHook(() => useErrorHandler());

      // Then: nurseryストアのエラーが優先される
      expect(result.current.hasError).toBe(true);
      expect(result.current.error).toBe(nurseryError);
    });

    test('questionListストアのエラーを返す（nurseryにエラーがない場合）', () => {
      // Given: questionListストアのみにエラーが存在する状態
      mockUseQuestionListStore.mockReturnValue({
        error: mockError,
        clearError: mockQuestionListClearError,
      });

      // When: useErrorHandlerを呼び出す（デフォルトはboth）
      const { result } = renderHook(() => useErrorHandler());

      // Then: questionListストアのエラーが返される
      expect(result.current.hasError).toBe(true);
      expect(result.current.error).toBe(mockError);
    });

    test('nurseryストアのエラーのみを返す（nursery store only）', () => {
      // Given: nurseryストアにエラーが存在する状態
      mockUseNurseryStore.mockReturnValue({
        error: mockError,
        clearError: mockNurseryClearError,
      });

      // When: useErrorHandlerをnursery storeモードで呼び出す
      const { result } = renderHook(() => useErrorHandler({ store: 'nursery' }));

      // Then: nurseryストアのエラーが返される
      expect(result.current.hasError).toBe(true);
      expect(result.current.error).toBe(mockError);
    });

    test('questionListストアのエラーのみを返す（questionList store only）', () => {
      // Given: questionListストアにエラーが存在する状態
      mockUseQuestionListStore.mockReturnValue({
        error: mockError,
        clearError: mockQuestionListClearError,
      });

      // When: useErrorHandlerをquestionList storeモードで呼び出す
      const { result } = renderHook(() => useErrorHandler({ store: 'questionList' }));

      // Then: questionListストアのエラーが返される
      expect(result.current.hasError).toBe(true);
      expect(result.current.error).toBe(mockError);
    });
  });

  describe('エラーメッセージを取得する時', () => {
    test('ユーザーフレンドリーなメッセージを返す', () => {
      // Given: エラーハンドラーが利用可能な状態
      const { result } = renderHook(() => useErrorHandler());

      // When: エラーメッセージを取得する
      const message = result.current.getErrorMessage(mockError);

      // Then: ユーザーフレンドリーなメッセージを返す
      expect(message).toBe('ユーザーフレンドリーなエラーメッセージ');
    });
  });

  describe('エラー分類機能', () => {
    test('エラー重要度判定機能を提供する', () => {
      // Given: エラーハンドラーが利用可能な状態
      const { result } = renderHook(() => useErrorHandler());

      // When: エラー重要度判定機能にアクセスする
      // Then: 機能が利用可能である
      expect(result.current.getErrorSeverity).toBeDefined();
      expect(typeof result.current.getErrorSeverity).toBe('function');
    });

    test('再試行可能性判定機能を提供する', () => {
      // Given: エラーハンドラーが利用可能な状態
      const { result } = renderHook(() => useErrorHandler());

      // When: 再試行可能性判定機能にアクセスする
      // Then: 機能が利用可能である
      expect(result.current.isRetryable).toBeDefined();
      expect(typeof result.current.isRetryable).toBe('function');
    });

    test('重要エラー判定機能を提供する', () => {
      // Given: エラーハンドラーが利用可能な状態
      const { result } = renderHook(() => useErrorHandler());

      // When: 重要エラー判定機能にアクセスする
      // Then: 機能が利用可能である
      expect(result.current.isCriticalError).toBeDefined();
      expect(typeof result.current.isCriticalError).toBe('function');
    });

    test('ユーザーアクションエラー判定機能を提供する', () => {
      // Given: エラーハンドラーが利用可能な状態
      const { result } = renderHook(() => useErrorHandler());

      // When: ユーザーアクションエラー判定機能にアクセスする
      // Then: 機能が利用可能である
      expect(result.current.isUserActionError).toBeDefined();
      expect(typeof result.current.isUserActionError).toBe('function');
    });
  });

  describe('エラークリア機能', () => {
    test('両方のストアのエラーをクリアする（both store）', () => {
      // Given: 両方のストアでエラーが存在する状態
      mockUseNurseryStore.mockReturnValue({
        error: mockError,
        clearError: mockNurseryClearError,
      });
      mockUseQuestionListStore.mockReturnValue({
        error: mockError,
        clearError: mockQuestionListClearError,
      });

      // When: useErrorHandlerを呼び出し、clearErrorを実行する
      const { result } = renderHook(() => useErrorHandler({ store: 'both' }));
      result.current.clearError();

      // Then: 両方のストアのclearErrorが呼ばれる
      expect(mockNurseryClearError).toHaveBeenCalled();
      expect(mockQuestionListClearError).toHaveBeenCalled();
    });

    test('nurseryストアのエラーのみをクリアする（nursery store only）', () => {
      // Given: nurseryストアでエラーが存在する状態
      mockUseNurseryStore.mockReturnValue({
        error: mockError,
        clearError: mockNurseryClearError,
      });

      // When: useErrorHandlerをnursery storeモードで呼び出し、clearErrorを実行する
      const { result } = renderHook(() => useErrorHandler({ store: 'nursery' }));
      result.current.clearError();

      // Then: nurseryストアのclearErrorのみが呼ばれる
      expect(mockNurseryClearError).toHaveBeenCalled();
      expect(mockQuestionListClearError).not.toHaveBeenCalled();
    });

    test('questionListストアのエラーのみをクリアする（questionList store only）', () => {
      // Given: questionListストアでエラーが存在する状態
      mockUseQuestionListStore.mockReturnValue({
        error: mockError,
        clearError: mockQuestionListClearError,
      });

      // When: useErrorHandlerをquestionList storeモードで呼び出し、clearErrorを実行する
      const { result } = renderHook(() => useErrorHandler({ store: 'questionList' }));
      result.current.clearError();

      // Then: questionListストアのclearErrorのみが呼ばれる
      expect(mockQuestionListClearError).toHaveBeenCalled();
      expect(mockNurseryClearError).not.toHaveBeenCalled();
    });
  });

  describe('基本エラー処理を実行する時', () => {
    test('エラー処理操作を実行できる（both store）', async () => {
      // Given: エラーハンドラーが利用可能な状態
      const { result } = renderHook(() => useErrorHandler());
      const mockOperation = vi.fn().mockResolvedValue(undefined);

      // When: エラー処理操作を実行する
      await result.current.handleError(mockOperation);

      // Then: 両方のストアをクリアする関数で操作が実行される
      expect(mockHandleError).toHaveBeenCalledWith(
        mockOperation,
        expect.any(Function), // clearAllErrors function
        undefined
      );
    });

    test('オプション付きでエラー処理操作を実行できる（nursery store only）', async () => {
      // Given: nursery storeモードのエラーハンドラーが利用可能な状態
      const { result } = renderHook(() => useErrorHandler({ store: 'nursery' }));
      const mockOperation = vi.fn().mockResolvedValue(undefined);
      const mockOptions = { successMessage: '成功しました' };

      // When: オプション付きでエラー処理操作を実行する
      await result.current.handleError(mockOperation, mockOptions);

      // Then: nurseryストアのclearErrorでオプションが適用されて操作が実行される
      expect(mockHandleError).toHaveBeenCalledWith(
        mockOperation,
        mockNurseryClearError,
        mockOptions
      );
    });
  });

  describe('再試行付きエラー処理を実行する時', () => {
    test('デフォルト再試行回数でエラー処理操作を実行できる（questionList store only）', async () => {
      // Given: questionList storeモードのエラーハンドラーが利用可能な状態
      const { result } = renderHook(() => useErrorHandler({ store: 'questionList' }));
      const mockOperation = vi.fn().mockResolvedValue(undefined);

      // When: 再試行付きエラー処理操作を実行する
      await result.current.handleErrorWithRetry(mockOperation);

      // Then: デフォルト再試行回数（3回）で操作が実行される
      expect(mockHandleErrorWithRetry).toHaveBeenCalledWith(
        mockOperation,
        mockQuestionListClearError,
        3,
        undefined
      );
    });

    test('指定した再試行回数でエラー処理操作を実行できる（both store）', async () => {
      // Given: エラーハンドラーが利用可能な状態
      const { result } = renderHook(() => useErrorHandler());
      const mockOperation = vi.fn().mockResolvedValue(undefined);
      const maxRetries = 5;

      // When: 指定した再試行回数でエラー処理操作を実行する
      await result.current.handleErrorWithRetry(mockOperation, maxRetries);

      // Then: 指定した再試行回数で操作が実行される
      expect(mockHandleErrorWithRetry).toHaveBeenCalledWith(
        mockOperation,
        expect.any(Function), // clearAllErrors function
        maxRetries,
        undefined
      );
    });
  });

  describe('非同期操作処理を実行する時', () => {
    test('非同期操作を実行できる（nursery store only）', async () => {
      // Given: nursery storeモードのエラーハンドラーが利用可能な状態
      const { result } = renderHook(() => useErrorHandler({ store: 'nursery' }));
      const mockOperation = vi.fn().mockResolvedValue('結果');

      // When: 非同期操作を実行する
      await result.current.handleAsyncOperation(mockOperation);

      // Then: 操作が実行される
      expect(mockHandleAsyncOperation).toHaveBeenCalledWith(
        mockOperation,
        mockNurseryClearError,
        undefined
      );
    });

    test('オプション付きで非同期操作を実行できる（both store）', async () => {
      // Given: エラーハンドラーが利用可能な状態
      const { result } = renderHook(() => useErrorHandler());
      const mockOperation = vi.fn().mockResolvedValue('結果');
      const mockOptions = { loadingMessage: '処理中...' };

      // When: オプション付きで非同期操作を実行する
      await result.current.handleAsyncOperation(mockOperation, mockOptions);

      // Then: オプションが適用されて操作が実行される
      expect(mockHandleAsyncOperation).toHaveBeenCalledWith(
        mockOperation,
        expect.any(Function), // clearAllErrors function
        mockOptions
      );
    });
  });

  describe('エラーハンドリングの完全な流れ', () => {
    test('エラー検知から解決まで一貫して処理できる（複数ストア対応）', () => {
      // Given: 両方のストアでエラーが発生している状態
      const nurseryError: AppError = {
        message: 'nurseryエラー',
        code: 'NURSERY_ERROR',
        timestamp: new Date('2024-01-01T00:00:00Z'),
      };
      
      mockUseNurseryStore.mockReturnValue({
        error: nurseryError,
        clearError: mockNurseryClearError,
      });
      mockUseQuestionListStore.mockReturnValue({
        error: mockError,
        clearError: mockQuestionListClearError,
      });

      // When: useErrorHandlerを使用してエラー処理を行う
      const { result } = renderHook(() => useErrorHandler());

      // Then: エラー状態を検知できる（nurseryが優先）
      expect(result.current.hasError).toBe(true);
      expect(result.current.error).toBe(nurseryError);

      // And: ユーザーフレンドリーなメッセージを取得できる
      const message = result.current.getErrorMessage(nurseryError);
      expect(message).toBe('ユーザーフレンドリーなエラーメッセージ');

      // And: エラーをクリアできる（両方のストア）
      result.current.clearError();
      expect(mockNurseryClearError).toHaveBeenCalled();
      expect(mockQuestionListClearError).toHaveBeenCalled();
    });

    test('単一ストアモードでも正しく動作する', () => {
      // Given: questionListストアでのみエラーが発生している状態
      mockUseQuestionListStore.mockReturnValue({
        error: mockError,
        clearError: mockQuestionListClearError,
      });

      // When: questionList storeモードでuseErrorHandlerを使用する
      const { result } = renderHook(() => useErrorHandler({ store: 'questionList' }));

      // Then: エラー状態を検知できる
      expect(result.current.hasError).toBe(true);
      expect(result.current.error).toBe(mockError);

      // And: エラーをクリアできる（questionListストアのみ）
      result.current.clearError();
      expect(mockQuestionListClearError).toHaveBeenCalled();
      expect(mockNurseryClearError).not.toHaveBeenCalled();
    });
  });
});

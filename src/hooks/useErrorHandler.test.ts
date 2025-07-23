/**
 * useErrorHandler フックのテスト
 * TDD原則に基づく振る舞い検証
 */

import { describe, test, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useErrorHandler } from './useErrorHandler';
import type { AppError } from '../stores/questionListStore';

// モック設定
vi.mock('../stores/questionListStore', () => ({
  useQuestionListStore: vi.fn(),
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

  const mockClearError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // デフォルトのモック設定
    mockUseQuestionListStore.mockReturnValue({
      error: null,
      clearError: mockClearError,
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
    test('hasErrorはfalseを返す', () => {
      // Given: エラーが存在しない状態
      mockUseQuestionListStore.mockReturnValue({
        error: null,
        clearError: mockClearError,
      });

      // When: useErrorHandlerを呼び出す
      const { result } = renderHook(() => useErrorHandler());

      // Then: hasErrorはfalseを返す
      expect(result.current.hasError).toBe(false);
    });

    test('errorはnullを返す', () => {
      // Given: エラーが存在しない状態
      mockUseQuestionListStore.mockReturnValue({
        error: null,
        clearError: mockClearError,
      });

      // When: useErrorHandlerを呼び出す
      const { result } = renderHook(() => useErrorHandler());

      // Then: errorはnullを返す
      expect(result.current.error).toBeNull();
    });
  });

  describe('エラー状態がある時', () => {
    test('hasErrorはtrueを返す', () => {
      // Given: エラーが存在する状態
      mockUseQuestionListStore.mockReturnValue({
        error: mockError,
        clearError: mockClearError,
      });

      // When: useErrorHandlerを呼び出す
      const { result } = renderHook(() => useErrorHandler());

      // Then: hasErrorはtrueを返す
      expect(result.current.hasError).toBe(true);
    });

    test('errorはエラー情報を返す', () => {
      // Given: エラーが存在する状態
      mockUseQuestionListStore.mockReturnValue({
        error: mockError,
        clearError: mockClearError,
      });

      // When: useErrorHandlerを呼び出す
      const { result } = renderHook(() => useErrorHandler());

      // Then: errorはエラー情報を返す
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
    test('エラーをクリアする機能を提供する', () => {
      // Given: エラーハンドラーが利用可能な状態
      const { result } = renderHook(() => useErrorHandler());

      // When: clearError機能にアクセスする
      // Then: 機能が利用可能である
      expect(result.current.clearError).toBeDefined();
      expect(typeof result.current.clearError).toBe('function');
    });
  });

  describe('基本エラー処理を実行する時', () => {
    test('エラー処理操作を実行できる', async () => {
      // Given: エラーハンドラーが利用可能な状態
      const { result } = renderHook(() => useErrorHandler());
      const mockOperation = vi.fn().mockResolvedValue(undefined);

      // When: エラー処理操作を実行する
      await result.current.handleError(mockOperation);

      // Then: 操作が実行される
      expect(mockHandleError).toHaveBeenCalledWith(
        mockOperation,
        mockClearError,
        undefined
      );
    });

    test('オプション付きでエラー処理操作を実行できる', async () => {
      // Given: エラーハンドラーが利用可能な状態
      const { result } = renderHook(() => useErrorHandler());
      const mockOperation = vi.fn().mockResolvedValue(undefined);
      const mockOptions = { successMessage: '成功しました' };

      // When: オプション付きでエラー処理操作を実行する
      await result.current.handleError(mockOperation, mockOptions);

      // Then: オプションが適用されて操作が実行される
      expect(mockHandleError).toHaveBeenCalledWith(
        mockOperation,
        mockClearError,
        mockOptions
      );
    });
  });

  describe('再試行付きエラー処理を実行する時', () => {
    test('デフォルト再試行回数でエラー処理操作を実行できる', async () => {
      // Given: エラーハンドラーが利用可能な状態
      const { result } = renderHook(() => useErrorHandler());
      const mockOperation = vi.fn().mockResolvedValue(undefined);

      // When: 再試行付きエラー処理操作を実行する
      await result.current.handleErrorWithRetry(mockOperation);

      // Then: デフォルト再試行回数（3回）で操作が実行される
      expect(mockHandleErrorWithRetry).toHaveBeenCalledWith(
        mockOperation,
        mockClearError,
        3,
        undefined
      );
    });

    test('指定した再試行回数でエラー処理操作を実行できる', async () => {
      // Given: エラーハンドラーが利用可能な状態
      const { result } = renderHook(() => useErrorHandler());
      const mockOperation = vi.fn().mockResolvedValue(undefined);
      const maxRetries = 5;

      // When: 指定した再試行回数でエラー処理操作を実行する
      await result.current.handleErrorWithRetry(mockOperation, maxRetries);

      // Then: 指定した再試行回数で操作が実行される
      expect(mockHandleErrorWithRetry).toHaveBeenCalledWith(
        mockOperation,
        mockClearError,
        maxRetries,
        undefined
      );
    });
  });

  describe('非同期操作処理を実行する時', () => {
    test('非同期操作を実行できる', async () => {
      // Given: エラーハンドラーが利用可能な状態
      const { result } = renderHook(() => useErrorHandler());
      const mockOperation = vi.fn().mockResolvedValue('結果');

      // When: 非同期操作を実行する
      await result.current.handleAsyncOperation(mockOperation);

      // Then: 操作が実行される
      expect(mockHandleAsyncOperation).toHaveBeenCalledWith(
        mockOperation,
        mockClearError,
        undefined
      );
    });

    test('オプション付きで非同期操作を実行できる', async () => {
      // Given: エラーハンドラーが利用可能な状態
      const { result } = renderHook(() => useErrorHandler());
      const mockOperation = vi.fn().mockResolvedValue('結果');
      const mockOptions = { loadingMessage: '処理中...' };

      // When: オプション付きで非同期操作を実行する
      await result.current.handleAsyncOperation(mockOperation, mockOptions);

      // Then: オプションが適用されて操作が実行される
      expect(mockHandleAsyncOperation).toHaveBeenCalledWith(
        mockOperation,
        mockClearError,
        mockOptions
      );
    });
  });

  describe('エラーハンドリングの完全な流れ', () => {
    test('エラー検知から解決まで一貫して処理できる', () => {
      // Given: エラーが発生している状態
      mockUseQuestionListStore.mockReturnValue({
        error: mockError,
        clearError: mockClearError,
      });

      // When: useErrorHandlerを使用してエラー処理を行う
      const { result } = renderHook(() => useErrorHandler());

      // Then: エラー状態を検知できる
      expect(result.current.hasError).toBe(true);
      expect(result.current.error).toBe(mockError);

      // And: ユーザーフレンドリーなメッセージを取得できる
      const message = result.current.getErrorMessage(mockError);
      expect(message).toBe('ユーザーフレンドリーなエラーメッセージ');

      // And: エラーをクリアできる
      result.current.clearError();
      expect(mockClearError).toHaveBeenCalled();
    });
  });
});

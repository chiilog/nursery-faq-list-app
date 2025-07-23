/**
 * errorClassification ユーティリティのテスト
 * TDD原則に基づく振る舞い検証
 */

import { describe, test, expect } from 'vitest';
import {
  getErrorSeverity,
  isRetryable,
  isCriticalError,
  isUserActionError,
  type ErrorSeverity,
} from './errorClassification';
import type { AppError } from '../stores/questionListStore';

describe('getErrorSeverity', () => {
  describe('Given an error without code', () => {
    test('When getting error severity, Then should return error level', () => {
      // Given: エラーコードがないエラー
      const error: AppError = {
        message: 'Unknown error',
        timestamp: new Date(),
      };

      // When: エラー重要度を取得
      const result: ErrorSeverity = getErrorSeverity(error);

      // Then: errorレベルを返す
      expect(result).toBe('error');
    });

    test('When error code is undefined, Then should return error level', () => {
      // Given: エラーコードがundefinedのエラー
      const error: AppError = {
        message: 'Error with undefined code',
        code: undefined,
        timestamp: new Date(),
      };

      // When: エラー重要度を取得
      const result: ErrorSeverity = getErrorSeverity(error);

      // Then: errorレベルを返す
      expect(result).toBe('error');
    });
  });

  describe('Given warning level error codes', () => {
    test('When error code is DUPLICATE_TITLE, Then should return warning level', () => {
      // Given: DUPLICATE_TITLEエラー
      const error: AppError = {
        message: 'Duplicate title found',
        code: 'DUPLICATE_TITLE',
        timestamp: new Date(),
      };

      // When: エラー重要度を取得
      const result: ErrorSeverity = getErrorSeverity(error);

      // Then: warningレベルを返す
      expect(result).toBe('warning');
    });

    test('When error code is NOT_FOUND, Then should return warning level', () => {
      // Given: NOT_FOUNDエラー
      const error: AppError = {
        message: 'Resource not found',
        code: 'NOT_FOUND',
        timestamp: new Date(),
      };

      // When: エラー重要度を取得
      const result: ErrorSeverity = getErrorSeverity(error);

      // Then: warningレベルを返す
      expect(result).toBe('warning');
    });

    test('When error code is LIST_NOT_FOUND, Then should return warning level', () => {
      // Given: LIST_NOT_FOUNDエラー
      const error: AppError = {
        message: 'List not found',
        code: 'LIST_NOT_FOUND',
        timestamp: new Date(),
      };

      // When: エラー重要度を取得
      const result: ErrorSeverity = getErrorSeverity(error);

      // Then: warningレベルを返す
      expect(result).toBe('warning');
    });

    test('When error code is QUESTION_NOT_FOUND, Then should return warning level', () => {
      // Given: QUESTION_NOT_FOUNDエラー
      const error: AppError = {
        message: 'Question not found',
        code: 'QUESTION_NOT_FOUND',
        timestamp: new Date(),
      };

      // When: エラー重要度を取得
      const result: ErrorSeverity = getErrorSeverity(error);

      // Then: warningレベルを返す
      expect(result).toBe('warning');
    });

    test('When error code is TEMPLATE_NOT_FOUND, Then should return warning level', () => {
      // Given: TEMPLATE_NOT_FOUNDエラー
      const error: AppError = {
        message: 'Template not found',
        code: 'TEMPLATE_NOT_FOUND',
        timestamp: new Date(),
      };

      // When: エラー重要度を取得
      const result: ErrorSeverity = getErrorSeverity(error);

      // Then: warningレベルを返す
      expect(result).toBe('warning');
    });

    test('When error code is NOT_TEMPLATE, Then should return warning level', () => {
      // Given: NOT_TEMPLATEエラー
      const error: AppError = {
        message: 'Not a template',
        code: 'NOT_TEMPLATE',
        timestamp: new Date(),
      };

      // When: エラー重要度を取得
      const result: ErrorSeverity = getErrorSeverity(error);

      // Then: warningレベルを返す
      expect(result).toBe('warning');
    });
  });

  describe('Given info level error codes', () => {
    test('When error code is VALIDATION_FAILED, Then should return info level', () => {
      // Given: VALIDATION_FAILEDエラー
      const error: AppError = {
        message: 'Validation failed',
        code: 'VALIDATION_FAILED',
        timestamp: new Date(),
      };

      // When: エラー重要度を取得
      const result: ErrorSeverity = getErrorSeverity(error);

      // Then: infoレベルを返す
      expect(result).toBe('info');
    });
  });

  describe('Given unrecognized error codes', () => {
    test('When error code is not in predefined categories, Then should return error level', () => {
      // Given: 未定義のエラーコード
      const error: AppError = {
        message: 'Unknown error type',
        code: 'UNKNOWN_ERROR_CODE',
        timestamp: new Date(),
      };

      // When: エラー重要度を取得
      const result: ErrorSeverity = getErrorSeverity(error);

      // Then: errorレベルを返す
      expect(result).toBe('error');
    });
  });
});

describe('isRetryable', () => {
  describe('Given an error without code', () => {
    test('When checking retry possibility, Then should return false', () => {
      // Given: エラーコードがないエラー
      const error: AppError = {
        message: 'Unknown error',
        timestamp: new Date(),
      };

      // When: 再試行可能性を確認
      const result: boolean = isRetryable(error);

      // Then: falseを返す
      expect(result).toBe(false);
    });

    test('When error code is undefined, Then should return false', () => {
      // Given: エラーコードがundefinedのエラー
      const error: AppError = {
        message: 'Error with undefined code',
        code: undefined,
        timestamp: new Date(),
      };

      // When: 再試行可能性を確認
      const result: boolean = isRetryable(error);

      // Then: falseを返す
      expect(result).toBe(false);
    });
  });

  describe('Given retryable error codes', () => {
    test('When error code is LOAD_FAILED, Then should return true', () => {
      // Given: LOAD_FAILEDエラー
      const error: AppError = {
        message: 'Load operation failed',
        code: 'LOAD_FAILED',
        timestamp: new Date(),
      };

      // When: 再試行可能性を確認
      const result: boolean = isRetryable(error);

      // Then: trueを返す
      expect(result).toBe(true);
    });

    test('When error code is SAVE_FAILED, Then should return true', () => {
      // Given: SAVE_FAILEDエラー
      const error: AppError = {
        message: 'Save operation failed',
        code: 'SAVE_FAILED',
        timestamp: new Date(),
      };

      // When: 再試行可能性を確認
      const result: boolean = isRetryable(error);

      // Then: trueを返す
      expect(result).toBe(true);
    });

    test('When error code is CREATE_FAILED, Then should return true', () => {
      // Given: CREATE_FAILEDエラー
      const error: AppError = {
        message: 'Create operation failed',
        code: 'CREATE_FAILED',
        timestamp: new Date(),
      };

      // When: 再試行可能性を確認
      const result: boolean = isRetryable(error);

      // Then: trueを返す
      expect(result).toBe(true);
    });

    test('When error code is UPDATE_FAILED, Then should return true', () => {
      // Given: UPDATE_FAILEDエラー
      const error: AppError = {
        message: 'Update operation failed',
        code: 'UPDATE_FAILED',
        timestamp: new Date(),
      };

      // When: 再試行可能性を確認
      const result: boolean = isRetryable(error);

      // Then: trueを返す
      expect(result).toBe(true);
    });

    test('When error code is DELETE_FAILED, Then should return true', () => {
      // Given: DELETE_FAILEDエラー
      const error: AppError = {
        message: 'Delete operation failed',
        code: 'DELETE_FAILED',
        timestamp: new Date(),
      };

      // When: 再試行可能性を確認
      const result: boolean = isRetryable(error);

      // Then: trueを返す
      expect(result).toBe(true);
    });

    test('When error code is STORAGE_SAVE_FAILED, Then should return true', () => {
      // Given: STORAGE_SAVE_FAILEDエラー
      const error: AppError = {
        message: 'Storage save failed',
        code: 'STORAGE_SAVE_FAILED',
        timestamp: new Date(),
      };

      // When: 再試行可能性を確認
      const result: boolean = isRetryable(error);

      // Then: trueを返す
      expect(result).toBe(true);
    });

    test('When error code is STORAGE_LOAD_FAILED, Then should return true', () => {
      // Given: STORAGE_LOAD_FAILEDエラー
      const error: AppError = {
        message: 'Storage load failed',
        code: 'STORAGE_LOAD_FAILED',
        timestamp: new Date(),
      };

      // When: 再試行可能性を確認
      const result: boolean = isRetryable(error);

      // Then: trueを返す
      expect(result).toBe(true);
    });

    test('When error code is NETWORK_ERROR, Then should return true', () => {
      // Given: NETWORK_ERRORエラー
      const error: AppError = {
        message: 'Network error occurred',
        code: 'NETWORK_ERROR',
        timestamp: new Date(),
      };

      // When: 再試行可能性を確認
      const result: boolean = isRetryable(error);

      // Then: trueを返す
      expect(result).toBe(true);
    });

    test('When error code is SYNC_FAILED, Then should return true', () => {
      // Given: SYNC_FAILEDエラー
      const error: AppError = {
        message: 'Sync operation failed',
        code: 'SYNC_FAILED',
        timestamp: new Date(),
      };

      // When: 再試行可能性を確認
      const result: boolean = isRetryable(error);

      // Then: trueを返す
      expect(result).toBe(true);
    });
  });

  describe('Given non-retryable error codes', () => {
    test('When error code is not retryable, Then should return false', () => {
      // Given: 再試行不可能なエラーコード
      const error: AppError = {
        message: 'Validation failed',
        code: 'VALIDATION_FAILED',
        timestamp: new Date(),
      };

      // When: 再試行可能性を確認
      const result: boolean = isRetryable(error);

      // Then: falseを返す
      expect(result).toBe(false);
    });
  });
});

describe('isCriticalError', () => {
  describe('Given an error without code', () => {
    test('When checking critical status, Then should return true', () => {
      // Given: エラーコードがないエラー
      const error: AppError = {
        message: 'Unknown error',
        timestamp: new Date(),
      };

      // When: 致命的エラーかどうかを確認
      const result: boolean = isCriticalError(error);

      // Then: trueを返す（コードなしは致命的と判定）
      expect(result).toBe(true);
    });

    test('When error code is undefined, Then should return true', () => {
      // Given: エラーコードがundefinedのエラー
      const error: AppError = {
        message: 'Error with undefined code',
        code: undefined,
        timestamp: new Date(),
      };

      // When: 致命的エラーかどうかを確認
      const result: boolean = isCriticalError(error);

      // Then: trueを返す（undefinedは致命的と判定）
      expect(result).toBe(true);
    });
  });

  describe('Given critical error codes', () => {
    test('When error code is ENCRYPTION_FAILED, Then should return true', () => {
      // Given: ENCRYPTION_FAILEDエラー
      const error: AppError = {
        message: 'Encryption failed',
        code: 'ENCRYPTION_FAILED',
        timestamp: new Date(),
      };

      // When: 致命的エラーかどうかを確認
      const result: boolean = isCriticalError(error);

      // Then: trueを返す
      expect(result).toBe(true);
    });

    test('When error code is DECRYPTION_FAILED, Then should return true', () => {
      // Given: DECRYPTION_FAILEDエラー
      const error: AppError = {
        message: 'Decryption failed',
        code: 'DECRYPTION_FAILED',
        timestamp: new Date(),
      };

      // When: 致命的エラーかどうかを確認
      const result: boolean = isCriticalError(error);

      // Then: trueを返す
      expect(result).toBe(true);
    });

    test('When error code is STORAGE_LOAD_FAILED, Then should return true', () => {
      // Given: STORAGE_LOAD_FAILEDエラー
      const error: AppError = {
        message: 'Storage load failed',
        code: 'STORAGE_LOAD_FAILED',
        timestamp: new Date(),
      };

      // When: 致命的エラーかどうかを確認
      const result: boolean = isCriticalError(error);

      // Then: trueを返す
      expect(result).toBe(true);
    });
  });

  describe('Given non-critical error codes', () => {
    test('When error code is not critical, Then should return false', () => {
      // Given: 致命的でないエラーコード
      const error: AppError = {
        message: 'Validation failed',
        code: 'VALIDATION_FAILED',
        timestamp: new Date(),
      };

      // When: 致命的エラーかどうかを確認
      const result: boolean = isCriticalError(error);

      // Then: falseを返す
      expect(result).toBe(false);
    });
  });
});

describe('isUserActionError', () => {
  describe('Given an error without code', () => {
    test('When checking user action origin, Then should return false', () => {
      // Given: エラーコードがないエラー
      const error: AppError = {
        message: 'Unknown error',
        timestamp: new Date(),
      };

      // When: ユーザーアクション由来かどうかを確認
      const result: boolean = isUserActionError(error);

      // Then: falseを返す
      expect(result).toBe(false);
    });

    test('When error code is undefined, Then should return false', () => {
      // Given: エラーコードがundefinedのエラー
      const error: AppError = {
        message: 'Error with undefined code',
        code: undefined,
        timestamp: new Date(),
      };

      // When: ユーザーアクション由来かどうかを確認
      const result: boolean = isUserActionError(error);

      // Then: falseを返す
      expect(result).toBe(false);
    });
  });

  describe('Given user action error codes', () => {
    test('When error code is VALIDATION_FAILED, Then should return true', () => {
      // Given: VALIDATION_FAILEDエラー
      const error: AppError = {
        message: 'Validation failed',
        code: 'VALIDATION_FAILED',
        timestamp: new Date(),
      };

      // When: ユーザーアクション由来かどうかを確認
      const result: boolean = isUserActionError(error);

      // Then: trueを返す
      expect(result).toBe(true);
    });

    test('When error code is DUPLICATE_TITLE, Then should return true', () => {
      // Given: DUPLICATE_TITLEエラー
      const error: AppError = {
        message: 'Duplicate title found',
        code: 'DUPLICATE_TITLE',
        timestamp: new Date(),
      };

      // When: ユーザーアクション由来かどうかを確認
      const result: boolean = isUserActionError(error);

      // Then: trueを返す
      expect(result).toBe(true);
    });

    test('When error code is NOT_FOUND, Then should return true', () => {
      // Given: NOT_FOUNDエラー
      const error: AppError = {
        message: 'Resource not found',
        code: 'NOT_FOUND',
        timestamp: new Date(),
      };

      // When: ユーザーアクション由来かどうかを確認
      const result: boolean = isUserActionError(error);

      // Then: trueを返す
      expect(result).toBe(true);
    });

    test('When error code is LIST_NOT_FOUND, Then should return true', () => {
      // Given: LIST_NOT_FOUNDエラー
      const error: AppError = {
        message: 'List not found',
        code: 'LIST_NOT_FOUND',
        timestamp: new Date(),
      };

      // When: ユーザーアクション由来かどうかを確認
      const result: boolean = isUserActionError(error);

      // Then: trueを返す
      expect(result).toBe(true);
    });

    test('When error code is QUESTION_NOT_FOUND, Then should return true', () => {
      // Given: QUESTION_NOT_FOUNDエラー
      const error: AppError = {
        message: 'Question not found',
        code: 'QUESTION_NOT_FOUND',
        timestamp: new Date(),
      };

      // When: ユーザーアクション由来かどうかを確認
      const result: boolean = isUserActionError(error);

      // Then: trueを返す
      expect(result).toBe(true);
    });

    test('When error code is TEMPLATE_NOT_FOUND, Then should return true', () => {
      // Given: TEMPLATE_NOT_FOUNDエラー
      const error: AppError = {
        message: 'Template not found',
        code: 'TEMPLATE_NOT_FOUND',
        timestamp: new Date(),
      };

      // When: ユーザーアクション由来かどうかを確認
      const result: boolean = isUserActionError(error);

      // Then: trueを返す
      expect(result).toBe(true);
    });

    test('When error code is NOT_TEMPLATE, Then should return true', () => {
      // Given: NOT_TEMPLATEエラー
      const error: AppError = {
        message: 'Not a template',
        code: 'NOT_TEMPLATE',
        timestamp: new Date(),
      };

      // When: ユーザーアクション由来かどうかを確認
      const result: boolean = isUserActionError(error);

      // Then: trueを返す
      expect(result).toBe(true);
    });
  });

  describe('Given non-user action error codes', () => {
    test('When error code is not from user action, Then should return false', () => {
      // Given: ユーザーアクション由来でないエラーコード
      const error: AppError = {
        message: 'Network error occurred',
        code: 'NETWORK_ERROR',
        timestamp: new Date(),
      };

      // When: ユーザーアクション由来かどうかを確認
      const result: boolean = isUserActionError(error);

      // Then: falseを返す
      expect(result).toBe(false);
    });
  });
});

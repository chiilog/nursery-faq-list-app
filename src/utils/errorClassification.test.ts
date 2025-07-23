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
  describe('エラーコードがないエラー', () => {
    test('エラー重要度を取得するとerrorレベルを返す', () => {
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

    test('エラーコードがundefinedの場合はerrorレベルを返す', () => {
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

  describe('warningレベルのエラーコード', () => {
    test('DUPLICATE_TITLEエラーの場合はwarningレベルを返す', () => {
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

    test('NOT_FOUNDエラーの場合はwarningレベルを返す', () => {
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

    test('LIST_NOT_FOUNDエラーの場合はwarningレベルを返す', () => {
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

    test('QUESTION_NOT_FOUNDエラーの場合はwarningレベルを返す', () => {
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

    test('TEMPLATE_NOT_FOUNDエラーの場合はwarningレベルを返す', () => {
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

    test('NOT_TEMPLATEエラーの場合はwarningレベルを返す', () => {
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

  describe('infoレベルのエラーコード', () => {
    test('VALIDATION_FAILEDエラーの場合はinfoレベルを返す', () => {
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

  describe('未定義のエラーコード', () => {
    test('事前定義のカテゴリにないエラーコードの場合はerrorレベルを返す', () => {
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
  describe('エラーコードがないエラー', () => {
    test('再試行可能性を確認するとfalseを返す', () => {
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

    test('エラーコードがundefinedの場合はfalseを返す', () => {
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

  describe('再試行可能なエラーコード', () => {
    test('LOAD_FAILEDエラーの場合はtrueを返す', () => {
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

    test('SAVE_FAILEDエラーの場合はtrueを返す', () => {
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

    test('CREATE_FAILEDエラーの場合はtrueを返す', () => {
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

    test('UPDATE_FAILEDエラーの場合はtrueを返す', () => {
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

    test('DELETE_FAILEDエラーの場合はtrueを返す', () => {
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

    test('STORAGE_SAVE_FAILEDエラーの場合はtrueを返す', () => {
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

    test('STORAGE_LOAD_FAILEDエラーの場合はtrueを返す', () => {
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

    test('NETWORK_ERRORエラーの場合はtrueを返す', () => {
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

    test('SYNC_FAILEDエラーの場合はtrueを返す', () => {
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

  describe('再試行不可能なエラーコード', () => {
    test('再試行不可能なエラーコードの場合はfalseを返す', () => {
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
  describe('エラーコードがないエラー', () => {
    test('致命的エラーかどうかを確認するとtrueを返す', () => {
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

    test('エラーコードがundefinedの場合はtrueを返す', () => {
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

  describe('致命的エラーコード', () => {
    test('ENCRYPTION_FAILEDエラーの場合はtrueを返す', () => {
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

    test('DECRYPTION_FAILEDエラーの場合はtrueを返す', () => {
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

    test('STORAGE_LOAD_FAILEDエラーの場合はtrueを返す', () => {
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

  describe('致命的でないエラーコード', () => {
    test('致命的でないエラーコードの場合はfalseを返す', () => {
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
  describe('エラーコードがないエラー', () => {
    test('ユーザーアクション由来かどうかを確認するとfalseを返す', () => {
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

    test('エラーコードがundefinedの場合はfalseを返す', () => {
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

  describe('ユーザーアクション由来のエラーコード', () => {
    test('VALIDATION_FAILEDエラーの場合はtrueを返す', () => {
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

    test('DUPLICATE_TITLEエラーの場合はtrueを返す', () => {
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

    test('NOT_FOUNDエラーの場合はtrueを返す', () => {
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

    test('LIST_NOT_FOUNDエラーの場合はtrueを返す', () => {
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

    test('QUESTION_NOT_FOUNDエラーの場合はtrueを返す', () => {
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

    test('TEMPLATE_NOT_FOUNDエラーの場合はtrueを返す', () => {
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

    test('NOT_TEMPLATEエラーの場合はtrueを返す', () => {
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

  describe('ユーザーアクション由来でないエラーコード', () => {
    test('ユーザーアクション由来でないエラーコードの場合はfalseを返す', () => {
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

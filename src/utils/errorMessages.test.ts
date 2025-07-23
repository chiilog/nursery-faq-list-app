/**
 * errorMessages モジュールのテスト
 * TDD原則に基づく振る舞い検証
 */

import { describe, test, expect } from 'vitest';
import { ERROR_MESSAGES, getErrorMessage } from './errorMessages';

describe('ERROR_MESSAGES', () => {
  describe('バリデーションエラー', () => {
    test('VALIDATION_FAILEDメッセージが定義されている', () => {
      // Given: ERROR_MESSAGES定数
      // When: VALIDATION_FAILEDコードのメッセージを確認する
      const message = ERROR_MESSAGES.VALIDATION_FAILED;

      // Then: 適切なメッセージが定義されている
      expect(message).toBe('入力内容に問題があります。確認してください。');
      expect(message).not.toBe('');
      expect(typeof message).toBe('string');
    });
  });

  describe('データストアエラー', () => {
    test('DUPLICATE_TITLEメッセージが定義されている', () => {
      // Given: ERROR_MESSAGES定数
      // When: DUPLICATE_TITLEコードのメッセージを確認する
      const message = ERROR_MESSAGES.DUPLICATE_TITLE;

      // Then: 適切なメッセージが定義されている
      expect(message).toBe('同じ名前の質問リストが既に存在します。');
      expect(message).not.toBe('');
      expect(typeof message).toBe('string');
    });

    test('NOT_FOUNDメッセージが定義されている', () => {
      // Given: ERROR_MESSAGES定数
      // When: NOT_FOUNDコードのメッセージを確認する
      const message = ERROR_MESSAGES.NOT_FOUND;

      // Then: 適切なメッセージが定義されている
      expect(message).toBe('指定されたデータが見つかりません。');
      expect(message).not.toBe('');
      expect(typeof message).toBe('string');
    });

    test('LIST_NOT_FOUNDメッセージが定義されている', () => {
      // Given: ERROR_MESSAGES定数
      // When: LIST_NOT_FOUNDコードのメッセージを確認する
      const message = ERROR_MESSAGES.LIST_NOT_FOUND;

      // Then: 適切なメッセージが定義されている
      expect(message).toBe('質問リストが見つかりません。');
      expect(message).not.toBe('');
      expect(typeof message).toBe('string');
    });

    test('QUESTION_NOT_FOUNDメッセージが定義されている', () => {
      // Given: ERROR_MESSAGES定数
      // When: QUESTION_NOT_FOUNDコードのメッセージを確認する
      const message = ERROR_MESSAGES.QUESTION_NOT_FOUND;

      // Then: 適切なメッセージが定義されている
      expect(message).toBe('指定された質問が見つかりません。');
      expect(message).not.toBe('');
      expect(typeof message).toBe('string');
    });

    test('TEMPLATE_NOT_FOUNDメッセージが定義されている', () => {
      // Given: ERROR_MESSAGES定数
      // When: TEMPLATE_NOT_FOUNDコードのメッセージを確認する
      const message = ERROR_MESSAGES.TEMPLATE_NOT_FOUND;

      // Then: 適切なメッセージが定義されている
      expect(message).toBe('指定されたテンプレートが見つかりません。');
      expect(message).not.toBe('');
      expect(typeof message).toBe('string');
    });

    test('NOT_TEMPLATEメッセージが定義されている', () => {
      // Given: ERROR_MESSAGES定数
      // When: NOT_TEMPLATEコードのメッセージを確認する
      const message = ERROR_MESSAGES.NOT_TEMPLATE;

      // Then: 適切なメッセージが定義されている
      expect(message).toBe('選択されたリストはテンプレートではありません。');
      expect(message).not.toBe('');
      expect(typeof message).toBe('string');
    });
  });

  describe('操作エラー', () => {
    test('CREATE_FAILEDメッセージが定義されている', () => {
      // Given: ERROR_MESSAGES定数
      // When: CREATE_FAILEDコードのメッセージを確認する
      const message = ERROR_MESSAGES.CREATE_FAILED;

      // Then: 適切なメッセージが定義されている
      expect(message).toBe('作成に失敗しました。もう一度お試しください。');
      expect(message).not.toBe('');
      expect(typeof message).toBe('string');
    });

    test('UPDATE_FAILEDメッセージが定義されている', () => {
      // Given: ERROR_MESSAGES定数
      // When: UPDATE_FAILEDコードのメッセージを確認する
      const message = ERROR_MESSAGES.UPDATE_FAILED;

      // Then: 適切なメッセージが定義されている
      expect(message).toBe('更新に失敗しました。もう一度お試しください。');
      expect(message).not.toBe('');
      expect(typeof message).toBe('string');
    });

    test('DELETE_FAILEDメッセージが定義されている', () => {
      // Given: ERROR_MESSAGES定数
      // When: DELETE_FAILEDコードのメッセージを確認する
      const message = ERROR_MESSAGES.DELETE_FAILED;

      // Then: 適切なメッセージが定義されている
      expect(message).toBe('削除に失敗しました。もう一度お試しください。');
      expect(message).not.toBe('');
      expect(typeof message).toBe('string');
    });

    test('LOAD_FAILEDメッセージが定義されている', () => {
      // Given: ERROR_MESSAGES定数
      // When: LOAD_FAILEDコードのメッセージを確認する
      const message = ERROR_MESSAGES.LOAD_FAILED;

      // Then: 適切なメッセージが定義されている
      expect(message).toBe('データの読み込みに失敗しました。');
      expect(message).not.toBe('');
      expect(typeof message).toBe('string');
    });

    test('SAVE_FAILEDメッセージが定義されている', () => {
      // Given: ERROR_MESSAGES定数
      // When: SAVE_FAILEDコードのメッセージを確認する
      const message = ERROR_MESSAGES.SAVE_FAILED;

      // Then: 適切なメッセージが定義されている
      expect(message).toBe('データの保存に失敗しました。');
      expect(message).not.toBe('');
      expect(typeof message).toBe('string');
    });
  });

  describe('ストレージエラー', () => {
    test('STORAGE_SAVE_FAILEDメッセージが定義されている', () => {
      // Given: ERROR_MESSAGES定数
      // When: STORAGE_SAVE_FAILEDコードのメッセージを確認する
      const message = ERROR_MESSAGES.STORAGE_SAVE_FAILED;

      // Then: 適切なメッセージが定義されている
      expect(message).toBe(
        'データの保存に失敗しました。ストレージの容量を確認してください。'
      );
      expect(message).not.toBe('');
      expect(typeof message).toBe('string');
    });

    test('STORAGE_LOAD_FAILEDメッセージが定義されている', () => {
      // Given: ERROR_MESSAGES定数
      // When: STORAGE_LOAD_FAILEDコードのメッセージを確認する
      const message = ERROR_MESSAGES.STORAGE_LOAD_FAILED;

      // Then: 適切なメッセージが定義されている
      expect(message).toBe(
        'データの読み込みに失敗しました。データが破損している可能性があります。'
      );
      expect(message).not.toBe('');
      expect(typeof message).toBe('string');
    });

    test('ENCRYPTION_FAILEDメッセージが定義されている', () => {
      // Given: ERROR_MESSAGES定数
      // When: ENCRYPTION_FAILEDコードのメッセージを確認する
      const message = ERROR_MESSAGES.ENCRYPTION_FAILED;

      // Then: 適切なメッセージが定義されている
      expect(message).toBe('データの暗号化に失敗しました。');
      expect(message).not.toBe('');
      expect(typeof message).toBe('string');
    });

    test('DECRYPTION_FAILEDメッセージが定義されている', () => {
      // Given: ERROR_MESSAGES定数
      // When: DECRYPTION_FAILEDコードのメッセージを確認する
      const message = ERROR_MESSAGES.DECRYPTION_FAILED;

      // Then: 適切なメッセージが定義されている
      expect(message).toBe(
        'データの復号化に失敗しました。データが破損している可能性があります。'
      );
      expect(message).not.toBe('');
      expect(typeof message).toBe('string');
    });
  });

  describe('ネットワークエラー', () => {
    test('NETWORK_ERRORメッセージが定義されている', () => {
      // Given: ERROR_MESSAGES定数
      // When: NETWORK_ERRORコードのメッセージを確認する
      const message = ERROR_MESSAGES.NETWORK_ERROR;

      // Then: 適切なメッセージが定義されている
      expect(message).toBe(
        'ネットワークエラーが発生しました。接続を確認してください。'
      );
      expect(message).not.toBe('');
      expect(typeof message).toBe('string');
    });

    test('SYNC_FAILEDメッセージが定義されている', () => {
      // Given: ERROR_MESSAGES定数
      // When: SYNC_FAILEDコードのメッセージを確認する
      const message = ERROR_MESSAGES.SYNC_FAILED;

      // Then: 適切なメッセージが定義されている
      expect(message).toBe('データの同期に失敗しました。');
      expect(message).not.toBe('');
      expect(typeof message).toBe('string');
    });
  });

  describe('その他のエラー', () => {
    test('UNKNOWN_ERRORメッセージが定義されている', () => {
      // Given: ERROR_MESSAGES定数
      // When: UNKNOWN_ERRORコードのメッセージを確認する
      const message = ERROR_MESSAGES.UNKNOWN_ERROR;

      // Then: 適切なメッセージが定義されている
      expect(message).toBe('予期しないエラーが発生しました。');
      expect(message).not.toBe('');
      expect(typeof message).toBe('string');
    });
  });

  describe('全エラーコードの網羅性確認', () => {
    test('全エラーメッセージが空文字でない', () => {
      // Given: ERROR_MESSAGES定数のすべてのエラーコード
      const errorCodes = Object.keys(ERROR_MESSAGES);

      // When: 各エラーコードのメッセージを確認する
      // Then: すべてのメッセージが空文字でない
      errorCodes.forEach((code) => {
        const message = ERROR_MESSAGES[code];
        expect(message).not.toBe('');
        expect(message.length).toBeGreaterThan(0);
        expect(typeof message).toBe('string');
      });
    });

    test('期待される全エラーコードが定義されている', () => {
      // Given: 期待されるエラーコードのリスト
      const expectedErrorCodes = [
        'VALIDATION_FAILED',
        'DUPLICATE_TITLE',
        'NOT_FOUND',
        'LIST_NOT_FOUND',
        'QUESTION_NOT_FOUND',
        'TEMPLATE_NOT_FOUND',
        'NOT_TEMPLATE',
        'CREATE_FAILED',
        'UPDATE_FAILED',
        'DELETE_FAILED',
        'LOAD_FAILED',
        'SAVE_FAILED',
        'STORAGE_SAVE_FAILED',
        'STORAGE_LOAD_FAILED',
        'ENCRYPTION_FAILED',
        'DECRYPTION_FAILED',
        'NETWORK_ERROR',
        'SYNC_FAILED',
        'UNKNOWN_ERROR',
      ];

      // When: ERROR_MESSAGESの定義済みコードを確認する
      const definedCodes = Object.keys(ERROR_MESSAGES);

      // Then: すべての期待されるコードが定義されている
      expectedErrorCodes.forEach((expectedCode) => {
        expect(definedCodes).toContain(expectedCode);
        expect(ERROR_MESSAGES[expectedCode]).toBeDefined();
      });
    });

    test('メッセージに適切な日本語が使用されている', () => {
      // Given: ERROR_MESSAGES定数のすべてのメッセージ
      const messages = Object.values(ERROR_MESSAGES);

      // When: 各メッセージの内容を確認する
      // Then: すべてのメッセージが適切な日本語を含んでいる
      messages.forEach((message) => {
        expect(message).toMatch(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/); // ひらがな、カタカナ、漢字を含む
        expect(message.trim()).toBe(message); // 前後の空白がない
      });
    });
  });
});

describe('getErrorMessage', () => {
  describe('有効なエラーコードが指定された時', () => {
    test('対応するエラーメッセージを返す', () => {
      // Given: 有効なエラーコード
      const errorCode = 'VALIDATION_FAILED';

      // When: getErrorMessageを呼び出す
      const result = getErrorMessage(errorCode);

      // Then: 対応するメッセージを返す
      expect(result).toBe('入力内容に問題があります。確認してください。');
    });

    test('別の有効なエラーコードでも対応するメッセージを返す', () => {
      // Given: 別の有効なエラーコード
      const errorCode = 'CREATE_FAILED';

      // When: getErrorMessageを呼び出す
      const result = getErrorMessage(errorCode);

      // Then: 対応するメッセージを返す
      expect(result).toBe('作成に失敗しました。もう一度お試しください。');
    });

    test('フォールバックメッセージが指定されていても対応するメッセージを返す', () => {
      // Given: 有効なエラーコードとフォールバックメッセージ
      const errorCode = 'NOT_FOUND';
      const fallbackMessage = 'カスタムエラーメッセージ';

      // When: getErrorMessageを呼び出す
      const result = getErrorMessage(errorCode, fallbackMessage);

      // Then: 対応するメッセージを返す（フォールバックではない）
      expect(result).toBe('指定されたデータが見つかりません。');
      expect(result).not.toBe(fallbackMessage);
    });
  });

  describe('無効なエラーコードが指定された時', () => {
    test('フォールバックメッセージが指定されている場合はそれを返す', () => {
      // Given: 無効なエラーコードとフォールバックメッセージ
      const errorCode = 'INVALID_ERROR_CODE';
      const fallbackMessage = 'カスタムエラーメッセージ';

      // When: getErrorMessageを呼び出す
      const result = getErrorMessage(errorCode, fallbackMessage);

      // Then: フォールバックメッセージを返す
      expect(result).toBe(fallbackMessage);
    });

    test('フォールバックメッセージが指定されていない場合はデフォルトメッセージを返す', () => {
      // Given: 無効なエラーコード
      const errorCode = 'INVALID_ERROR_CODE';

      // When: getErrorMessageを呼び出す
      const result = getErrorMessage(errorCode);

      // Then: デフォルトメッセージ（UNKNOWN_ERROR）を返す
      expect(result).toBe('予期しないエラーが発生しました。');
    });
  });

  describe('nullまたはundefinedが指定された時', () => {
    test('undefinedが指定された場合はデフォルトメッセージを返す', () => {
      // Given: undefinedのエラーコード
      const errorCode = undefined;

      // When: getErrorMessageを呼び出す
      const result = getErrorMessage(errorCode);

      // Then: デフォルトメッセージを返す
      expect(result).toBe('予期しないエラーが発生しました。');
    });

    test('undefinedとフォールバックメッセージが指定された場合はフォールバックメッセージを返す', () => {
      // Given: undefinedのエラーコードとフォールバックメッセージ
      const errorCode = undefined;
      const fallbackMessage = 'カスタムエラーメッセージ';

      // When: getErrorMessageを呼び出す
      const result = getErrorMessage(errorCode, fallbackMessage);

      // Then: フォールバックメッセージを返す
      expect(result).toBe(fallbackMessage);
    });
  });

  describe('空文字が指定された時', () => {
    test('空文字が指定された場合はデフォルトメッセージを返す', () => {
      // Given: 空文字のエラーコード
      const errorCode = '';

      // When: getErrorMessageを呼び出す
      const result = getErrorMessage(errorCode);

      // Then: デフォルトメッセージを返す
      expect(result).toBe('予期しないエラーが発生しました。');
    });

    test('空文字とフォールバックメッセージが指定された場合はフォールバックメッセージを返す', () => {
      // Given: 空文字のエラーコードとフォールバックメッセージ
      const errorCode = '';
      const fallbackMessage = 'カスタムエラーメッセージ';

      // When: getErrorMessageを呼び出す
      const result = getErrorMessage(errorCode, fallbackMessage);

      // Then: フォールバックメッセージを返す
      expect(result).toBe(fallbackMessage);
    });
  });

  describe('フォールバックメッセージのnull/undefined処理', () => {
    test('フォールバックメッセージがundefinedの場合はデフォルトメッセージを返す', () => {
      // Given: 無効なエラーコードとundefinedのフォールバックメッセージ
      const errorCode = 'INVALID_ERROR_CODE';
      const fallbackMessage = undefined;

      // When: getErrorMessageを呼び出す
      const result = getErrorMessage(errorCode, fallbackMessage);

      // Then: デフォルトメッセージを返す
      expect(result).toBe('予期しないエラーが発生しました。');
    });

    test('フォールバックメッセージが空文字の場合はデフォルトメッセージを返す', () => {
      // Given: 無効なエラーコードと空文字のフォールバックメッセージ
      const errorCode = 'INVALID_ERROR_CODE';
      const fallbackMessage = '';

      // When: getErrorMessageを呼び出す
      const result = getErrorMessage(errorCode, fallbackMessage);

      // Then: デフォルトメッセージを返す（空文字はfalsyなため）
      expect(result).toBe('予期しないエラーが発生しました。');
    });
  });

  describe('型安全性の確認', () => {
    test('戻り值は常に文字列型である', () => {
      // Given: 様々なケースのテストデータ
      const testCases = [
        ['VALIDATION_FAILED', undefined],
        ['INVALID_CODE', 'fallback'],
        [undefined, undefined],
        ['', 'fallback'],
      ] as const;

      testCases.forEach(([errorCode, fallbackMessage]) => {
        // When: getErrorMessageを呼び出す
        const result = getErrorMessage(errorCode, fallbackMessage);

        // Then: 戻り値が文字列型である
        expect(typeof result).toBe('string');
      });
    });

    test('空の結果を返すことはない', () => {
      // Given: 無効なエラーコード
      const errorCode = 'INVALID_ERROR_CODE';

      // When: getErrorMessageを呼び出す
      const result = getErrorMessage(errorCode);

      // Then: 空でない文字列を返す
      expect(result).not.toBe(null);
      expect(result).not.toBe(undefined);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('エラーメッセージの一貫性', () => {
    test('同じエラーコードに対して常に同じメッセージを返す', () => {
      // Given: 同じエラーコード
      const errorCode = 'VALIDATION_FAILED';

      // When: 複数回getErrorMessageを呼び出す
      const result1 = getErrorMessage(errorCode);
      const result2 = getErrorMessage(errorCode);
      const result3 = getErrorMessage(errorCode);

      // Then: 常に同じメッセージを返す
      expect(result1).toBe(result2);
      expect(result2).toBe(result3);
      expect(result1).toBe('入力内容に問題があります。確認してください。');
    });

    test('全エラーコードで一貫したメッセージを返す', () => {
      // Given: すべてのエラーコード
      const errorCodes = Object.keys(ERROR_MESSAGES);

      errorCodes.forEach((errorCode) => {
        // When: 各エラーコードでgetErrorMessageを呼び出す
        const result = getErrorMessage(errorCode);

        // Then: ERROR_MESSAGESの値と一致する
        expect(result).toBe(ERROR_MESSAGES[errorCode]);
      });
    });
  });
});

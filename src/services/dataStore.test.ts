/**
 * DataStore サービスのテスト
 * TDD原則に基づく振る舞い検証
 */

import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { DataStore, DataStoreError } from './dataStore';
import type {
  QuestionList,
  CreateQuestionListInput,
  UpdateQuestionListInput,
  CreateQuestionInput,
  UpdateQuestionInput,
} from '../types/data';

// バリデーション関数のモック
vi.mock('../utils/validation', () => ({
  validateCreateQuestionListInput: vi.fn(),
  validateUpdateQuestionListInput: vi.fn(),
  validateCreateQuestionInput: vi.fn(),
  validateUpdateQuestionInput: vi.fn(),
}));

// データユーティリティ関数のモック
vi.mock('../utils/data', () => ({
  createQuestionList: vi.fn(),
  createQuestion: vi.fn(),
  updateQuestionListTimestamp: vi.fn(),
  addQuestionToList: vi.fn(),
  removeQuestionFromList: vi.fn(),
  updateQuestionInList: vi.fn(),
}));

// Web Crypto API のモック
const mockCrypto = {
  getRandomValues: vi.fn((array: Uint8Array) => {
    for (let i = 0; i < array.length; i++) {
      array[i] = i % 256;
    }
    return array;
  }),
  subtle: {
    importKey: vi.fn().mockResolvedValue('mock-base-key'),
    deriveKey: vi.fn().mockResolvedValue('mock-crypto-key'),
    encrypt: vi.fn().mockResolvedValue(new ArrayBuffer(32)),
    decrypt: vi
      .fn()
      .mockResolvedValue(new TextEncoder().encode(JSON.stringify([]))),
  },
};

// LocalStorage のモック
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn().mockImplementation(() => undefined), // 正常終了を明示
  removeItem: vi.fn(),
  clear: vi.fn(),
};

// Navigator のモック
const mockNavigator = {
  userAgent: 'test-user-agent',
  language: 'ja-JP',
};

// モックデータ
const mockQuestionListInput: CreateQuestionListInput = {
  title: 'テスト保育園見学リスト',
  nurseryName: 'テスト保育園',
  isTemplate: false,
};

const mockQuestionList: QuestionList = {
  id: 'list-1',
  title: 'テスト保育園見学リスト',
  nurseryName: 'テスト保育園',
  isTemplate: false,
  questions: [],
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-01T00:00:00Z'),
};

const mockQuestionInput: CreateQuestionInput = {
  text: '保育時間を教えてください',
  category: '基本情報',
  priority: 'medium',
};

describe('DataStore', () => {
  let dataStore: DataStore;

  beforeEach(async () => {
    // グローバルオブジェクトのモック設定
    vi.stubGlobal('crypto', mockCrypto);
    vi.stubGlobal('localStorage', mockLocalStorage);
    vi.stubGlobal('navigator', mockNavigator);
    vi.stubGlobal('btoa', () => 'encoded-data');
    vi.stubGlobal('atob', () => '[]');

    // Date.now のモック
    vi.spyOn(Date, 'now').mockReturnValue(1704067200000);
    vi.spyOn(Math, 'random').mockReturnValue(0.5);

    // バリデーション関数のモック設定
    const {
      validateCreateQuestionListInput,
      validateUpdateQuestionListInput,
      validateCreateQuestionInput,
      validateUpdateQuestionInput,
    } = await import('../utils/validation');

    vi.mocked(validateCreateQuestionListInput).mockReturnValue({
      isValid: true,
      errors: [],
    });
    vi.mocked(validateUpdateQuestionListInput).mockReturnValue({
      isValid: true,
      errors: [],
    });
    vi.mocked(validateCreateQuestionInput).mockReturnValue({
      isValid: true,
      errors: [],
    });
    vi.mocked(validateUpdateQuestionInput).mockReturnValue({
      isValid: true,
      errors: [],
    });

    // データユーティリティ関数のモック設定
    const {
      createQuestionList,
      createQuestion,
      updateQuestionListTimestamp,
      addQuestionToList,
      removeQuestionFromList,
      updateQuestionInList,
    } = await import('../utils/data');

    vi.mocked(createQuestionList).mockReturnValue(mockQuestionList);
    vi.mocked(createQuestion).mockReturnValue({
      id: 'question-1',
      text: '保育時間を教えてください',
      answer: '',
      category: '基本情報',
      isAnswered: false,
      priority: 'medium',
      order: 0,
    });
    vi.mocked(updateQuestionListTimestamp).mockImplementation(
      (list: QuestionList) => ({
        ...list,
        updatedAt: new Date('2024-01-02T00:00:00Z'),
      })
    );
    vi.mocked(addQuestionToList).mockImplementation((list: QuestionList) => ({
      ...list,
      questions: [
        ...list.questions,
        {
          id: 'question-1',
          text: '保育時間を教えてください',
          answer: '',
          category: '基本情報',
          isAnswered: false,
          priority: 'medium',
          order: 0,
        },
      ],
    }));
    vi.mocked(removeQuestionFromList).mockImplementation(
      (list: QuestionList) => ({
        ...list,
        questions: [],
      })
    );
    vi.mocked(updateQuestionInList).mockImplementation(
      (list: QuestionList) => list
    );

    dataStore = new DataStore();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  describe('空のデータストアの場合', () => {
    test('全ての質問リストの取得で空配列を返す', async () => {
      // Given: 空のローカルストレージ
      mockLocalStorage.getItem.mockReturnValue(null);

      // When: 全ての質問リストを取得する
      const result = await dataStore.getAllQuestionLists();

      // Then: 空配列を返す
      expect(result).toEqual([]);
    });

    test('存在しない質問リストの取得でnullを返す', async () => {
      // Given: 空のローカルストレージ
      mockLocalStorage.getItem.mockReturnValue(null);

      // When: 存在しない質問リストを取得する
      const result = await dataStore.getQuestionList('nonexistent-id');

      // Then: nullを返す
      expect(result).toBeNull();
    });

    test('テンプレートの取得で空配列を返す', async () => {
      // Given: 空のローカルストレージ
      mockLocalStorage.getItem.mockReturnValue(null);

      // When: テンプレートを取得する
      const result = await dataStore.getTemplates();

      // Then: 空配列を返す
      expect(result).toEqual([]);
    });
  });

  describe('質問リストを作成する時', () => {
    test.skip('有効な入力で質問リストのIDを返す', async () => {
      // Given: 空のローカルストレージ
      mockLocalStorage.getItem.mockReturnValue(null);

      // When: 有効な入力で質問リストを作成する
      const result = await dataStore.createQuestionList(mockQuestionListInput);

      // Then: 質問リストのIDを返す
      expect(result).toBe('list-1');
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });

    test('バリデーションエラーの場合エラーを投げる', async () => {
      // Given: バリデーションが失敗する状態
      const { validateCreateQuestionListInput } = await import(
        '../utils/validation'
      );
      vi.mocked(validateCreateQuestionListInput).mockReturnValue({
        isValid: false,
        errors: ['タイトルが空です'],
      });

      // When: 無効な入力で質問リストを作成しようとする
      // Then: VALIDATION_FAILEDエラーを投げる
      await expect(
        dataStore.createQuestionList(mockQuestionListInput)
      ).rejects.toThrow(DataStoreError);
      await expect(
        dataStore.createQuestionList(mockQuestionListInput)
      ).rejects.toThrow('入力データが無効です');
    });
  });

  describe('質問リストを取得する時', () => {
    test('空のIDでエラーを投げる', async () => {
      // Given: データストアが利用可能な状態
      // When: 空のIDで質問リストを取得しようとする
      // Then: INVALID_IDエラーを投げる
      await expect(dataStore.getQuestionList('')).rejects.toThrow(
        DataStoreError
      );
      await expect(dataStore.getQuestionList('')).rejects.toThrow(
        'IDが指定されていません'
      );
    });
  });

  describe('質問リストを更新する時', () => {
    test('空のIDでエラーを投げる', async () => {
      // Given: データストアが利用可能な状態
      const updates: UpdateQuestionListInput = {
        title: '更新されたタイトル',
      };

      // When: 空のIDで質問リストを更新しようとする
      // Then: INVALID_IDエラーを投げる
      await expect(dataStore.updateQuestionList('', updates)).rejects.toThrow(
        DataStoreError
      );
      await expect(dataStore.updateQuestionList('', updates)).rejects.toThrow(
        'IDが指定されていません'
      );
    });

    test('存在しない質問リストのIDでエラーを投げる', async () => {
      // Given: 空のローカルストレージ
      mockLocalStorage.getItem.mockReturnValue(null);

      const updates: UpdateQuestionListInput = {
        title: '更新されたタイトル',
      };

      // When: 存在しない質問リストを更新しようとする
      // Then: NOT_FOUNDエラーを投げる
      await expect(
        dataStore.updateQuestionList('nonexistent-id', updates)
      ).rejects.toThrow(DataStoreError);
      await expect(
        dataStore.updateQuestionList('nonexistent-id', updates)
      ).rejects.toThrow('指定された質問リストが見つかりません');
    });
  });

  describe('質問リストを削除する時', () => {
    test('空のIDでエラーを投げる', async () => {
      // Given: データストアが利用可能な状態
      // When: 空のIDで質問リストを削除しようとする
      // Then: INVALID_IDエラーを投げる
      await expect(dataStore.deleteQuestionList('')).rejects.toThrow(
        DataStoreError
      );
      await expect(dataStore.deleteQuestionList('')).rejects.toThrow(
        'IDが指定されていません'
      );
    });

    test('存在しない質問リストのIDでエラーを投げる', async () => {
      // Given: 空のローカルストレージ
      mockLocalStorage.getItem.mockReturnValue(null);

      // When: 存在しない質問リストを削除しようとする
      // Then: NOT_FOUNDエラーを投げる
      await expect(
        dataStore.deleteQuestionList('nonexistent-id')
      ).rejects.toThrow(DataStoreError);
      await expect(
        dataStore.deleteQuestionList('nonexistent-id')
      ).rejects.toThrow('指定された質問リストが見つかりません');
    });
  });

  describe('質問を追加する時', () => {
    test('空のリストIDでエラーを投げる', async () => {
      // Given: データストアが利用可能な状態
      // When: 空のリストIDで質問を追加しようとする
      // Then: INVALID_LIST_IDエラーを投げる
      await expect(
        dataStore.addQuestion('', mockQuestionInput)
      ).rejects.toThrow(DataStoreError);
      await expect(
        dataStore.addQuestion('', mockQuestionInput)
      ).rejects.toThrow('リストIDが指定されていません');
    });

    test('存在しない質問リストのIDでエラーを投げる', async () => {
      // Given: 空のローカルストレージ
      mockLocalStorage.getItem.mockReturnValue(null);

      // When: 存在しない質問リストに質問を追加しようとする
      // Then: LIST_NOT_FOUNDエラーを投げる
      await expect(
        dataStore.addQuestion('nonexistent-id', mockQuestionInput)
      ).rejects.toThrow(DataStoreError);
      await expect(
        dataStore.addQuestion('nonexistent-id', mockQuestionInput)
      ).rejects.toThrow('指定された質問リストが見つかりません');
    });
  });

  describe('質問を更新する時', () => {
    test('空のリストIDでエラーを投げる', async () => {
      // Given: データストアが利用可能な状態
      const updates: UpdateQuestionInput = {
        answer: '7:00-19:00',
      };

      // When: 空のリストIDで質問を更新しようとする
      // Then: INVALID_LIST_IDエラーを投げる
      await expect(
        dataStore.updateQuestion('', 'question-1', updates)
      ).rejects.toThrow(DataStoreError);
      await expect(
        dataStore.updateQuestion('', 'question-1', updates)
      ).rejects.toThrow('リストIDが指定されていません');
    });

    test('空の質問IDでエラーを投げる', async () => {
      // Given: データストアが利用可能な状態
      const updates: UpdateQuestionInput = {
        answer: '7:00-19:00',
      };

      // When: 空の質問IDで質問を更新しようとする
      // Then: INVALID_QUESTION_IDエラーを投げる
      await expect(
        dataStore.updateQuestion('list-1', '', updates)
      ).rejects.toThrow(DataStoreError);
      await expect(
        dataStore.updateQuestion('list-1', '', updates)
      ).rejects.toThrow('質問IDが指定されていません');
    });
  });

  describe('質問を削除する時', () => {
    test('空のリストIDでエラーを投げる', async () => {
      // Given: データストアが利用可能な状態
      // When: 空のリストIDで質問を削除しようとする
      // Then: INVALID_LIST_IDエラーを投げる
      await expect(dataStore.deleteQuestion('', 'question-1')).rejects.toThrow(
        DataStoreError
      );
      await expect(dataStore.deleteQuestion('', 'question-1')).rejects.toThrow(
        'リストIDが指定されていません'
      );
    });

    test('空の質問IDでエラーを投げる', async () => {
      // Given: データストアが利用可能な状態
      // When: 空の質問IDで質問を削除しようとする
      // Then: INVALID_QUESTION_IDエラーを投げる
      await expect(dataStore.deleteQuestion('list-1', '')).rejects.toThrow(
        DataStoreError
      );
      await expect(dataStore.deleteQuestion('list-1', '')).rejects.toThrow(
        '質問IDが指定されていません'
      );
    });
  });

  describe('テンプレートから質問リストを作成する時', () => {
    test('空のテンプレートIDでエラーを投げる', async () => {
      // Given: データストアが利用可能な状態
      const customizations: CreateQuestionListInput = {
        title: 'テンプレートから作成されたリスト',
        nurseryName: 'カスタム保育園',
        isTemplate: false,
      };

      // When: 空のテンプレートIDで質問リストを作成しようとする
      // Then: INVALID_TEMPLATE_IDエラーを投げる
      await expect(
        dataStore.createFromTemplate('', customizations)
      ).rejects.toThrow(DataStoreError);
      await expect(
        dataStore.createFromTemplate('', customizations)
      ).rejects.toThrow('テンプレートIDが指定されていません');
    });
  });

  describe('質問を一括更新する時', () => {
    test('空のリストIDでエラーを投げる', async () => {
      // Given: データストアが利用可能な状態
      const updates = [
        {
          questionId: 'question-1',
          updates: { answer: '7:00-19:00', isAnswered: true },
        },
      ];

      // When: 空のリストIDで一括更新しようとする
      // Then: INVALID_LIST_IDエラーを投げる
      await expect(dataStore.updateQuestionsBatch('', updates)).rejects.toThrow(
        DataStoreError
      );
      await expect(dataStore.updateQuestionsBatch('', updates)).rejects.toThrow(
        'リストIDが指定されていません'
      );
    });

    test('空の更新配列で何も実行しない', async () => {
      // Given: データストアが利用可能な状態
      // When: 空の更新配列で一括更新する
      await dataStore.updateQuestionsBatch('list-1', []);

      // Then: ストレージへの保存は実行されない
      expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
    });
  });

  describe('全データを削除する時', () => {
    test('ローカルストレージから全データを削除する', async () => {
      // Given: データストアが利用可能な状態
      // When: 全データを削除する
      await dataStore.clearAllData();

      // Then: ローカルストレージからデータが削除される
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(
        'nursery-qa-question-lists'
      );
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(
        'nursery-qa-key-salt'
      );
    });
  });

  describe('データをエクスポートする時', () => {
    test('JSON形式でデータを返す', async () => {
      // Given: 空のローカルストレージ
      mockLocalStorage.getItem.mockReturnValue(null);

      // When: データをエクスポートする
      const result = await dataStore.exportData();

      // Then: JSON形式でデータを返す
      expect(result).toBe(JSON.stringify([], null, 2));
    });
  });

  describe('DataStoreErrorの場合', () => {
    test('カスタムエラーコードを持つエラーを作成できる', () => {
      // Given: エラーメッセージとコード
      const message = 'テストエラー';
      const code = 'TEST_ERROR';

      // When: DataStoreErrorを作成する
      const error = new DataStoreError(message, code);

      // Then: 正しいプロパティを持つエラーオブジェクトを作成する
      expect(error.message).toBe(message);
      expect(error.code).toBe(code);
      expect(error.name).toBe('DataStoreError');
      expect(error).toBeInstanceOf(Error);
    });
  });
});

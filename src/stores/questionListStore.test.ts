/**
 * QuestionListStore のテスト
 * TDD原則に基づく振る舞い検証
 */

import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { act } from '@testing-library/react';
import { useQuestionListStore } from './questionListStore';
import type { AppError, LoadingState } from './questionListStore';
import type {
  QuestionList,
  CreateQuestionListInput,
  UpdateQuestionListInput,
  UpdateQuestionInput,
} from '../types/data';
import {
  createQuestionMock,
  createCreateQuestionInputMock,
} from '../test/test-utils';

// DataStore のモック
vi.mock('../services/dataStore', () => ({
  dataStore: {
    getAllQuestionLists: vi.fn(),
    createQuestionList: vi.fn(),
    updateQuestionList: vi.fn(),
    deleteQuestionList: vi.fn(),
    getQuestionList: vi.fn(),
    addQuestion: vi.fn(),
    updateQuestion: vi.fn(),
    deleteQuestion: vi.fn(),
    updateQuestionsBatch: vi.fn(),
    getTemplates: vi.fn(),
    createFromTemplate: vi.fn(),
    clearAllData: vi.fn(),
  },
  DataStoreError: class DataStoreError extends Error {
    constructor(
      message: string,
      public code?: string
    ) {
      super(message);
      this.name = 'DataStoreError';
    }
  },
}));

// Data utilities のモック
vi.mock('../utils/data', () => ({
  getQuestionListStats: vi.fn(),
}));

import { dataStore, DataStoreError } from '../services/dataStore';
import { getQuestionListStats } from '../utils/data';

// モックデータ
const mockQuestionList: QuestionList = {
  id: 'list-1',
  title: 'テスト質問リスト',
  nurseryName: 'テスト保育園',
  isTemplate: false,
  questions: [
    createQuestionMock({
      id: 'q1',
      text: '保育時間を教えてください',
      answer: '7:00-19:00',
      isAnswered: true,
      category: '基本情報',
    }),
    createQuestionMock({
      id: 'q2',
      text: '給食はありますか',
      answer: '',
      isAnswered: false,
      category: '食事',
    }),
  ],
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

const mockCreateInput: CreateQuestionListInput = {
  title: 'テスト質問リスト',
  nurseryName: 'テスト保育園',
  isTemplate: false,
};

const mockQuestionInput = createCreateQuestionInputMock({
  text: '新しい質問',
  category: 'テスト',
});

describe('useQuestionListStore', () => {
  beforeEach(() => {
    // Zustandストアをリセット
    useQuestionListStore.setState({
      questionLists: [],
      currentList: null,
      templates: [],
      loading: { isLoading: false },
      error: null,
      syncState: { isOnline: true, pendingChanges: 0 },
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('初期状態の場合', () => {
    test('空の質問リストを持つ', () => {
      // Given: 初期化されたストア
      // When: ストアの状態を取得する
      const state = useQuestionListStore.getState();

      // Then: 空の状態を持つ
      expect(state.questionLists).toEqual([]);
      expect(state.currentList).toBeNull();
      expect(state.templates).toEqual([]);
      expect(state.loading.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('質問リストを読み込む時', () => {
    test('成功時にリストを設定する', async () => {
      // Given: データストアが質問リストを返す状態
      const mockedGetAllQuestionLists = vi.mocked(
        dataStore.getAllQuestionLists
      );
      mockedGetAllQuestionLists.mockResolvedValue([mockQuestionList]);

      // When: 質問リストを読み込む
      await act(async () => {
        await useQuestionListStore.getState().loadQuestionLists();
      });

      // Then: 質問リストが設定される
      const state = useQuestionListStore.getState();
      expect(state.questionLists).toEqual([mockQuestionList]);
      expect(state.loading.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    test('失敗時にエラーを設定する', async () => {
      // Given: データストアがエラーを投げる状態
      const error = new DataStoreError('読み込みエラー', 'LOAD_FAILED');
      const mockedGetAllQuestionLists = vi.mocked(
        dataStore.getAllQuestionLists
      );
      mockedGetAllQuestionLists.mockRejectedValue(error);

      // When: 質問リストを読み込む
      await act(async () => {
        await useQuestionListStore.getState().loadQuestionLists();
      });

      // Then: エラーが設定される
      const state = useQuestionListStore.getState();
      expect(state.error).toEqual({
        message: '読み込みエラー',
        code: 'LOAD_FAILED',
        timestamp: expect.any(Date) as Date,
      });
      expect(state.loading.isLoading).toBe(false);
    });

    test('読み込み中のローディング状態を設定する', async () => {
      // Given: データストアが長時間かかる状態
      let resolvePromise: (value: QuestionList[]) => void;
      const promise = new Promise<QuestionList[]>((resolve) => {
        resolvePromise = resolve;
      });
      const mockedGetAllQuestionLists = vi.mocked(
        dataStore.getAllQuestionLists
      );
      mockedGetAllQuestionLists.mockReturnValue(promise);

      // When: 質問リストを読み込み開始する
      const loadPromise = act(async () => {
        await useQuestionListStore.getState().loadQuestionLists();
      });

      // Then: ローディング状態になる
      const loadingState = useQuestionListStore.getState();
      expect(loadingState.loading.isLoading).toBe(true);
      expect(loadingState.loading.operation).toBe('質問リストを読み込み中...');

      // 完了させる
      resolvePromise!([]);
      await loadPromise;
    });
  });

  describe('質問リストを作成する時', () => {
    test('成功時に新しいIDを返す', async () => {
      // Given: データストアが成功する状態
      const mockedCreateQuestionList = vi.mocked(dataStore.createQuestionList);
      const mockedGetAllQuestionLists = vi.mocked(
        dataStore.getAllQuestionLists
      );
      mockedCreateQuestionList.mockResolvedValue('new-list-id');
      mockedGetAllQuestionLists.mockResolvedValue([mockQuestionList]);

      // When: 質問リストを作成する
      let result: string;
      await act(async () => {
        result = await useQuestionListStore
          .getState()
          .createQuestionList(mockCreateInput);
      });

      // Then: 新しいIDを返す
      expect(result!).toBe('new-list-id');
      expect(mockedCreateQuestionList).toHaveBeenCalledWith(mockCreateInput);
    });

    test('失敗時にエラーを投げる', async () => {
      // Given: データストアがエラーを投げる状態
      const error = new DataStoreError('作成エラー', 'CREATE_FAILED');
      const mockedCreateQuestionList = vi.mocked(dataStore.createQuestionList);
      mockedCreateQuestionList.mockRejectedValue(error);

      // When: 質問リストを作成する
      // Then: エラーを投げる
      await act(async () => {
        await expect(
          useQuestionListStore.getState().createQuestionList(mockCreateInput)
        ).rejects.toThrow(error);
      });

      const state = useQuestionListStore.getState();
      expect(state.error).toEqual({
        message: '作成エラー',
        code: 'CREATE_FAILED',
        timestamp: expect.any(Date) as Date,
      });
    });
  });

  describe('質問リストを更新する時', () => {
    test('成功時にリストを再読み込みする', async () => {
      // Given: データストアが成功する状態
      const mockedUpdateQuestionList = vi.mocked(dataStore.updateQuestionList);
      const mockedGetAllQuestionLists = vi.mocked(
        dataStore.getAllQuestionLists
      );
      mockedUpdateQuestionList.mockResolvedValue();
      mockedGetAllQuestionLists.mockResolvedValue([mockQuestionList]);

      const updates: UpdateQuestionListInput = { title: '更新されたタイトル' };

      // When: 質問リストを更新する
      await act(async () => {
        await useQuestionListStore
          .getState()
          .updateQuestionList('list-1', updates);
      });

      // Then: 更新処理が呼ばれる
      expect(mockedUpdateQuestionList).toHaveBeenCalledWith('list-1', updates);
      expect(mockedGetAllQuestionLists).toHaveBeenCalled();
    });

    test('失敗時にエラーを投げる', async () => {
      // Given: データストアがエラーを投げる状態
      const error = new DataStoreError('更新エラー', 'UPDATE_FAILED');
      const mockedUpdateQuestionList = vi.mocked(dataStore.updateQuestionList);
      mockedUpdateQuestionList.mockRejectedValue(error);

      const updates: UpdateQuestionListInput = { title: '更新されたタイトル' };

      // When: 質問リストを更新する
      // Then: エラーを投げる
      await act(async () => {
        await expect(
          useQuestionListStore.getState().updateQuestionList('list-1', updates)
        ).rejects.toThrow(error);
      });
    });
  });

  describe('質問リストを削除する時', () => {
    test('成功時にリストを再読み込みする', async () => {
      // Given: データストアが成功する状態
      const mockedDeleteQuestionList = vi.mocked(dataStore.deleteQuestionList);
      const mockedGetAllQuestionLists = vi.mocked(
        dataStore.getAllQuestionLists
      );
      mockedDeleteQuestionList.mockResolvedValue();
      mockedGetAllQuestionLists.mockResolvedValue([]);

      // When: 質問リストを削除する
      await act(async () => {
        await useQuestionListStore.getState().deleteQuestionList('list-1');
      });

      // Then: 削除処理が呼ばれる
      expect(mockedDeleteQuestionList).toHaveBeenCalledWith('list-1');
      expect(mockedGetAllQuestionLists).toHaveBeenCalled();
    });

    test('現在のリストが削除される時にクリアする', async () => {
      // Given: 現在のリストが設定されており、それを削除する状態
      useQuestionListStore.setState({ currentList: mockQuestionList });
      const mockedDeleteQuestionList = vi.mocked(dataStore.deleteQuestionList);
      const mockedGetAllQuestionLists = vi.mocked(
        dataStore.getAllQuestionLists
      );
      mockedDeleteQuestionList.mockResolvedValue();
      mockedGetAllQuestionLists.mockResolvedValue([]);

      // When: 現在のリストを削除する
      await act(async () => {
        await useQuestionListStore.getState().deleteQuestionList('list-1');
      });

      // Then: 現在のリストがクリアされる
      const state = useQuestionListStore.getState();
      expect(state.currentList).toBeNull();
    });
  });

  describe('現在のリストを設定する時', () => {
    test('nullの場合にクリアする', async () => {
      // Given: 現在のリストが設定されている状態
      useQuestionListStore.setState({ currentList: mockQuestionList });

      // When: nullを設定する
      await act(async () => {
        await useQuestionListStore.getState().setCurrentList(null);
      });

      // Then: 現在のリストがクリアされる
      const state = useQuestionListStore.getState();
      expect(state.currentList).toBeNull();
    });

    test('有効なIDの場合にリストを設定する', async () => {
      // Given: データストアがリストを返す状態
      const mockedGetQuestionList = vi.mocked(dataStore.getQuestionList);
      mockedGetQuestionList.mockResolvedValue(mockQuestionList);

      // When: 有効なIDを設定する
      await act(async () => {
        await useQuestionListStore.getState().setCurrentList('list-1');
      });

      // Then: 現在のリストが設定される
      const state = useQuestionListStore.getState();
      expect(state.currentList).toEqual(mockQuestionList);
      expect(mockedGetQuestionList).toHaveBeenCalledWith('list-1');
    });

    test('失敗時にエラーを設定する', async () => {
      // Given: データストアがエラーを投げる状態
      const error = new DataStoreError('リスト取得エラー', 'GET_FAILED');
      const mockedGetQuestionList = vi.mocked(dataStore.getQuestionList);
      mockedGetQuestionList.mockRejectedValue(error);

      // When: 現在のリストを設定する
      await act(async () => {
        await useQuestionListStore.getState().setCurrentList('list-1');
      });

      // Then: エラーが設定される
      const state = useQuestionListStore.getState();
      expect(state.error).toEqual({
        message: 'リスト取得エラー',
        code: 'GET_FAILED',
        timestamp: expect.any(Date) as Date,
      });
    });
  });

  describe('質問を追加する時', () => {
    test('成功時に質問IDを返す', async () => {
      // Given: データストアが成功する状態
      const mockedAddQuestion = vi.mocked(dataStore.addQuestion);
      const mockedGetQuestionList = vi.mocked(dataStore.getQuestionList);
      mockedAddQuestion.mockResolvedValue('new-question-id');
      mockedGetQuestionList.mockResolvedValue(mockQuestionList);

      // When: 質問を追加する
      let result: string;
      await act(async () => {
        result = await useQuestionListStore
          .getState()
          .addQuestion('list-1', mockQuestionInput);
      });

      // Then: 質問IDを返す
      expect(result!).toBe('new-question-id');
      expect(mockedAddQuestion).toHaveBeenCalledWith(
        'list-1',
        mockQuestionInput
      );
    });

    test('失敗時にエラーを投げる', async () => {
      // Given: データストアがエラーを投げる状態
      const error = new DataStoreError('質問追加エラー', 'ADD_FAILED');
      const mockedAddQuestion = vi.mocked(dataStore.addQuestion);
      mockedAddQuestion.mockRejectedValue(error);

      // When: 質問を追加する
      // Then: エラーを投げる
      await act(async () => {
        await expect(
          useQuestionListStore
            .getState()
            .addQuestion('list-1', mockQuestionInput)
        ).rejects.toThrow(error);
      });
    });
  });

  describe('質問を更新する時', () => {
    test('成功時に現在のリストを更新する', async () => {
      // Given: データストアが成功する状態
      const mockedUpdateQuestion = vi.mocked(dataStore.updateQuestion);
      const mockedGetQuestionList = vi.mocked(dataStore.getQuestionList);
      mockedUpdateQuestion.mockResolvedValue();
      mockedGetQuestionList.mockResolvedValue(mockQuestionList);

      const updates: UpdateQuestionInput = { answer: '更新された回答' };

      // When: 質問を更新する
      await act(async () => {
        await useQuestionListStore
          .getState()
          .updateQuestion('list-1', 'q1', updates);
      });

      // Then: 更新処理が呼ばれる
      expect(mockedUpdateQuestion).toHaveBeenCalledWith(
        'list-1',
        'q1',
        updates
      );
      expect(mockedGetQuestionList).toHaveBeenCalledWith('list-1');
    });
  });

  describe('質問を削除する時', () => {
    test('成功時に現在のリストを更新する', async () => {
      // Given: データストアが成功する状態
      const mockedDeleteQuestion = vi.mocked(dataStore.deleteQuestion);
      const mockedGetQuestionList = vi.mocked(dataStore.getQuestionList);
      mockedDeleteQuestion.mockResolvedValue();
      mockedGetQuestionList.mockResolvedValue(mockQuestionList);

      // When: 質問を削除する
      await act(async () => {
        await useQuestionListStore.getState().deleteQuestion('list-1', 'q1');
      });

      // Then: 削除処理が呼ばれる
      expect(mockedDeleteQuestion).toHaveBeenCalledWith('list-1', 'q1');
      expect(mockedGetQuestionList).toHaveBeenCalledWith('list-1');
    });
  });

  describe('質問に回答する時', () => {
    test('質問の更新処理を呼ぶ', async () => {
      // Given: データストアが成功する状態
      const mockedUpdateQuestion = vi.mocked(dataStore.updateQuestion);
      const mockedGetQuestionList = vi.mocked(dataStore.getQuestionList);
      mockedUpdateQuestion.mockResolvedValue();
      mockedGetQuestionList.mockResolvedValue(mockQuestionList);

      // When: 質問に回答する
      await act(async () => {
        await useQuestionListStore
          .getState()
          .answerQuestion('list-1', 'q1', '新しい回答');
      });

      // Then: 更新処理が呼ばれる
      expect(mockedUpdateQuestion).toHaveBeenCalledWith('list-1', 'q1', {
        answer: '新しい回答',
      });
    });
  });

  describe('テンプレートを読み込む時', () => {
    test('成功時にテンプレートを設定する', async () => {
      // Given: データストアがテンプレートを返す状態
      const templates = [{ ...mockQuestionList, isTemplate: true }];
      const mockedGetTemplates = vi.mocked(dataStore.getTemplates);
      mockedGetTemplates.mockResolvedValue(templates);

      // When: テンプレートを読み込む
      await act(async () => {
        await useQuestionListStore.getState().loadTemplates();
      });

      // Then: テンプレートが設定される
      const state = useQuestionListStore.getState();
      expect(state.templates).toEqual(templates);
    });
  });

  describe('テンプレートから作成する時', () => {
    test('成功時に新しいIDを返す', async () => {
      // Given: データストアが成功する状態
      const mockedCreateFromTemplate = vi.mocked(dataStore.createFromTemplate);
      const mockedGetAllQuestionLists = vi.mocked(
        dataStore.getAllQuestionLists
      );
      mockedCreateFromTemplate.mockResolvedValue('new-list-id');
      mockedGetAllQuestionLists.mockResolvedValue([mockQuestionList]);

      // When: テンプレートから作成する
      let result: string;
      await act(async () => {
        result = await useQuestionListStore
          .getState()
          .createFromTemplate('template-1', mockCreateInput);
      });

      // Then: 新しいIDを返す
      expect(result!).toBe('new-list-id');
      expect(mockedCreateFromTemplate).toHaveBeenCalledWith(
        'template-1',
        mockCreateInput
      );
    });
  });

  describe('エラーをクリアする時', () => {
    test('エラー状態をnullに設定する', () => {
      // Given: エラーが設定されている状態
      const error: AppError = {
        message: 'テストエラー',
        code: 'TEST_ERROR',
        timestamp: new Date(),
      };
      useQuestionListStore.setState({ error });

      // When: エラーをクリアする
      act(() => {
        useQuestionListStore.getState().clearError();
      });

      // Then: エラーがクリアされる
      const state = useQuestionListStore.getState();
      expect(state.error).toBeNull();
    });
  });

  describe('ローディング状態を設定する時', () => {
    test('指定されたローディング状態を設定する', () => {
      // Given: 初期状態のストア
      const loadingState: LoadingState = {
        isLoading: true,
        operation: 'テスト操作中...',
      };

      // When: ローディング状態を設定する
      act(() => {
        useQuestionListStore.getState().setLoading(loadingState);
      });

      // Then: ローディング状態が設定される
      const state = useQuestionListStore.getState();
      expect(state.loading).toEqual(loadingState);
    });
  });

  describe('全データを削除する時', () => {
    test('成功時に初期状態にリセットする', async () => {
      // Given: データとエラーが設定されている状態
      useQuestionListStore.setState({
        questionLists: [mockQuestionList],
        currentList: mockQuestionList,
        error: { message: 'エラー', timestamp: new Date() },
      });
      const mockedClearAllData = vi.mocked(dataStore.clearAllData);
      mockedClearAllData.mockResolvedValue();

      // When: 全データを削除する
      await act(async () => {
        await useQuestionListStore.getState().clearAllData();
      });

      // Then: 初期状態にリセットされる
      const state = useQuestionListStore.getState();
      expect(state.questionLists).toEqual([]);
      expect(state.currentList).toBeNull();
      expect(state.error).toBeNull();
    });
  });

  describe('質問リストの統計を取得する時', () => {
    test('現在のリストの統計を返す', () => {
      // Given: 現在のリストが設定されており、統計関数がモックされている状態
      useQuestionListStore.setState({ currentList: mockQuestionList });
      const mockStats = { total: 2, answered: 1, unanswered: 1, progress: 50 };
      const mockedGetQuestionListStats = vi.mocked(getQuestionListStats);
      mockedGetQuestionListStats.mockReturnValue(mockStats);

      // When: 統計を取得する
      const result = useQuestionListStore
        .getState()
        .getQuestionListStats('list-1');

      // Then: 統計を返す
      expect(result).toEqual(mockStats);
      expect(mockedGetQuestionListStats).toHaveBeenCalledWith(mockQuestionList);
    });

    test('存在しないリストの場合nullを返す', () => {
      // Given: 空のストア状態
      // When: 存在しないリストの統計を取得する
      const result = useQuestionListStore
        .getState()
        .getQuestionListStats('nonexistent');

      // Then: nullを返す
      expect(result).toBeNull();
    });
  });
});

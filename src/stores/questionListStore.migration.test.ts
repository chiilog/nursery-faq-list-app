/**
 * QuestionListStore の nurseryDataStore 統合テスト
 * TDD原則に従って、実装前にテストを作成
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useQuestionListStore } from './questionListStore';
import type {
  QuestionList,
  CreateQuestionListInput,
  UpdateQuestionListInput,
  CreateQuestionInput,
} from '../types/data';

// nurseryDataStoreをモック
vi.mock('../services/nurseryDataStore', () => ({
  nurseryDataStore: {
    getAllQuestionListsCompat: vi.fn(),
    createQuestionListCompat: vi.fn(),
    updateQuestionListCompat: vi.fn(),
    // 他のメソッドは直接使用されないためモック不要
  },
  NurseryDataStoreError: class extends Error {
    constructor(
      message: string,
      public code: string
    ) {
      super(message);
      this.name = 'NurseryDataStoreError';
    }
  },
}));

// 旧dataStoreもモック（段階的移行中のため）
vi.mock('../services/dataStore', () => ({
  dataStore: {
    getAllQuestionLists: vi.fn(),
    getQuestionList: vi.fn(),
    createQuestionList: vi.fn(),
    updateQuestionList: vi.fn(),
    deleteQuestionList: vi.fn(),
    addQuestion: vi.fn(),
    updateQuestion: vi.fn(),
    deleteQuestion: vi.fn(),
    getTemplates: vi.fn(),
    createFromTemplate: vi.fn(),
    clearAllData: vi.fn(),
  },
  DataStoreError: class extends Error {
    constructor(
      message: string,
      public code: string
    ) {
      super(message);
      this.name = 'DataStoreError';
    }
  },
}));

describe('QuestionListStore - NurseryDataStore Migration', () => {
  const mockQuestionList: QuestionList = {
    id: 'list1',
    title: 'テスト保育園',
    nurseryName: 'テスト保育園',
    visitDate: new Date('2024-02-01'),
    questions: [
      {
        id: 'q1',
        text: 'テスト質問',
        answer: '',
        isAnswered: false,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
    ],
    sharedWith: ['user2'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    isTemplate: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // ストアの状態をリセット
    useQuestionListStore.setState({
      questionLists: [],
      currentList: null,
      templates: [],
      loading: { isLoading: false },
      error: null,
      syncState: { isOnline: true, pendingChanges: 0 },
    });
  });

  describe('nurseryDataStore経由でのデータ取得', () => {
    it('loadQuestionListsがnurseryDataStoreのCompat APIを使用する', async () => {
      // Given: nurseryDataStore.getAllQuestionListsCompat が QuestionList を返す
      const { nurseryDataStore } = await import('../services/nurseryDataStore');
      vi.mocked(nurseryDataStore.getAllQuestionListsCompat).mockResolvedValue([
        mockQuestionList,
      ]);

      // When: loadQuestionLists を実行
      await useQuestionListStore.getState().loadQuestionLists();

      // Then: nurseryDataStore.getAllQuestionListsCompat が呼ばれる
      expect(nurseryDataStore.getAllQuestionListsCompat).toHaveBeenCalledTimes(
        1
      );

      // Then: ストアに QuestionList が保存される
      const state = useQuestionListStore.getState();
      expect(state.questionLists).toEqual([mockQuestionList]);
      expect(state.error).toBeNull();
    });

    it('createQuestionListがnurseryDataStoreのCompat APIを使用する', async () => {
      // Given: nurseryDataStore.createQuestionListCompat が成功
      const { nurseryDataStore } = await import('../services/nurseryDataStore');
      vi.mocked(nurseryDataStore.createQuestionListCompat).mockResolvedValue(
        'new-session-id'
      );
      vi.mocked(nurseryDataStore.getAllQuestionListsCompat).mockResolvedValue(
        []
      );

      const input: CreateQuestionListInput = {
        title: '新しい保育園',
        nurseryName: '新しい保育園',
        visitDate: new Date('2024-03-01'),
        questions: [{ text: '新しい質問', answer: '', isAnswered: false }],
        isTemplate: false,
      };

      // When: createQuestionList を実行
      const result = await useQuestionListStore
        .getState()
        .createQuestionList(input);

      // Then: nurseryDataStore.createQuestionListCompat が呼ばれる
      expect(nurseryDataStore.createQuestionListCompat).toHaveBeenCalledWith(
        input
      );
      expect(result).toBe('new-session-id');
    });

    it('updateQuestionListがnurseryDataStoreのCompat APIを使用する', async () => {
      // Given: nurseryDataStore.updateQuestionListCompat が成功
      const { nurseryDataStore } = await import('../services/nurseryDataStore');
      vi.mocked(nurseryDataStore.updateQuestionListCompat).mockResolvedValue();
      vi.mocked(nurseryDataStore.getAllQuestionListsCompat).mockResolvedValue(
        []
      );

      const updates: UpdateQuestionListInput = {
        nurseryName: '更新された保育園',
        visitDate: new Date('2024-03-15'),
      };

      // When: updateQuestionList を実行
      await useQuestionListStore
        .getState()
        .updateQuestionList('session1', updates);

      // Then: nurseryDataStore.updateQuestionListCompat が呼ばれる
      expect(nurseryDataStore.updateQuestionListCompat).toHaveBeenCalledWith(
        'session1',
        updates
      );
    });
  });

  describe('エラーハンドリング', () => {
    it('NurseryDataStoreError を適切に処理する', async () => {
      // Given: nurseryDataStore でエラーが発生
      const { nurseryDataStore, NurseryDataStoreError } = await import(
        '../services/nurseryDataStore'
      );
      const error = new NurseryDataStoreError(
        'データ読み込みエラー',
        'LOAD_FAILED'
      );
      vi.mocked(nurseryDataStore.getAllQuestionListsCompat).mockRejectedValue(
        error
      );

      // When: loadQuestionLists を実行
      await useQuestionListStore.getState().loadQuestionLists();

      // Then: エラーが適切に処理される
      const state = useQuestionListStore.getState();
      expect(state.error).toEqual({
        message: 'データ読み込みエラー',
        code: 'LOAD_FAILED',
        timestamp: expect.any(Date),
      });
    });
  });

  describe('段階的移行中の混在状態', () => {
    it('一部機能は従来のdataStoreを使用し続ける', async () => {
      // Given: テンプレート機能は従来のdataStoreを使用
      const { dataStore } = await import('../services/dataStore');
      const mockTemplates: QuestionList[] = [
        { ...mockQuestionList, id: 'template1', isTemplate: true },
      ];
      vi.mocked(dataStore.getTemplates).mockResolvedValue(mockTemplates);

      // When: loadTemplates を実行
      await useQuestionListStore.getState().loadTemplates();

      // Then: 従来のdataStore.getTemplates が呼ばれる
      expect(dataStore.getTemplates).toHaveBeenCalledTimes(1);

      const state = useQuestionListStore.getState();
      expect(state.templates).toEqual(mockTemplates);
    });

    it('質問操作は従来のdataStoreを使用し続ける', async () => {
      // Given: 質問追加は従来のdataStoreを使用
      const { dataStore } = await import('../services/dataStore');
      vi.mocked(dataStore.addQuestion).mockResolvedValue('new-question-id');
      vi.mocked(dataStore.getQuestionList).mockResolvedValue(mockQuestionList);

      const input: CreateQuestionInput = {
        text: '新しい質問',
        answer: '',
        isAnswered: false,
      };

      // When: addQuestion を実行
      const result = await useQuestionListStore
        .getState()
        .addQuestion('list1', input);

      // Then: 従来のdataStore.addQuestion が呼ばれる
      expect(dataStore.addQuestion).toHaveBeenCalledWith('list1', input);
      expect(result).toBe('new-question-id');
    });
  });

  describe('データ整合性の確保', () => {
    it('nurseryDataStore経由で取得したデータが正しい形式である', async () => {
      // Given: nurseryDataStore が変換されたデータを返す
      const { nurseryDataStore } = await import('../services/nurseryDataStore');
      const convertedData: QuestionList = {
        ...mockQuestionList,
        id: 'session-id', // VisitSessionのIDが使用される
        title: mockQuestionList.nurseryName!, // nurseryNameがtitleになる
      };
      vi.mocked(nurseryDataStore.getAllQuestionListsCompat).mockResolvedValue([
        convertedData,
      ]);

      // When: loadQuestionLists を実行
      await useQuestionListStore.getState().loadQuestionLists();

      // Then: 変換されたデータが正しく保存される
      const state = useQuestionListStore.getState();
      expect(state.questionLists[0].id).toBe('session-id');
      expect(state.questionLists[0].title).toBe('テスト保育園');
      expect(state.questionLists[0].nurseryName).toBe('テスト保育園');
    });
  });
});

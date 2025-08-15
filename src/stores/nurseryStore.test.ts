import { describe, test, expect, vi, beforeEach } from 'vitest';
import type {
  Nursery,
  CreateNurseryInput,
  UpdateNurseryInput,
  CreateVisitSessionInput,
  UpdateVisitSessionInput,
  VisitSession,
  VisitSessionStatus,
} from '../types/data';
import { createQuestionMock } from '../test/test-utils';

// Vitestモックホイスティングに対応したモック定義
vi.mock('../services/nurseryDataStore', () => {
  const mockDataStore = {
    createNursery: vi.fn().mockResolvedValue('nursery-1'),
    getNursery: vi.fn().mockResolvedValue(null),
    getAllNurseries: vi.fn().mockResolvedValue([]),
    updateNursery: vi.fn().mockResolvedValue(undefined),
    deleteNursery: vi.fn().mockResolvedValue(undefined),
    createVisitSession: vi.fn().mockResolvedValue('session-1'),
    getVisitSession: vi.fn().mockResolvedValue(null),
    updateVisitSession: vi.fn().mockResolvedValue(undefined),
    deleteVisitSession: vi.fn().mockResolvedValue(undefined),
    addQuestion: vi.fn().mockResolvedValue('question-1'),
    updateQuestion: vi.fn().mockResolvedValue(undefined),
    deleteQuestion: vi.fn().mockResolvedValue(undefined),
    clearAllData: vi.fn(),
  };

  return {
    createNurseryDataStore: vi.fn().mockReturnValue(mockDataStore),
    NurseryDataStoreError: class extends Error {
      constructor(
        message: string,
        public code: string,
        public cause?: Error
      ) {
        super(message);
        this.name = 'NurseryDataStoreError';
      }
    },
  };
});

// 実際の実装をテスト
import { useNurseryStore } from './nurseryStore';
import { createNurseryDataStore } from '../services/nurseryDataStore';

// モックされたcreateNurseryDataStoreからmockDataStoreを取得
const mockCreateNurseryDataStore = vi.mocked(createNurseryDataStore);
const mockDataStore = mockCreateNurseryDataStore();

// 各モック関数を個別に型安全にアクセス
const mockGetAllNurseries = vi.mocked(mockDataStore.getAllNurseries);
const mockCreateNursery = vi.mocked(mockDataStore.createNursery);
const mockGetNursery = vi.mocked(mockDataStore.getNursery);
const mockUpdateNursery = vi.mocked(mockDataStore.updateNursery);
const mockDeleteNursery = vi.mocked(mockDataStore.deleteNursery);
const mockCreateVisitSession = vi.mocked(mockDataStore.createVisitSession);
const mockGetVisitSession = vi.mocked(mockDataStore.getVisitSession);
const mockUpdateVisitSession = vi.mocked(mockDataStore.updateVisitSession);
const mockDeleteVisitSession = vi.mocked(mockDataStore.deleteVisitSession);

describe('NurseryStore (TDD Green Phase)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('保育園管理機能', () => {
    test('保育園一覧を読み込めること', async () => {
      const mockNurseries: Nursery[] = [
        {
          id: 'nursery-1',
          name: 'テスト保育園A',
          visitSessions: [],
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
      ];

      mockGetAllNurseries.mockResolvedValue(mockNurseries);

      const store = useNurseryStore.getState();
      await store.loadNurseries();

      expect(useNurseryStore.getState().nurseries).toEqual(mockNurseries);
    });

    test('新しい保育園を作成できること', async () => {
      const newNurseryInput: CreateNurseryInput = {
        name: '新しい保育園',
      };

      const mockNursery: Nursery = {
        id: 'nursery-new',
        ...newNurseryInput,
        visitSessions: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // 統合ストアのモック設定
      mockCreateNursery.mockResolvedValue('nursery-new');
      mockGetNursery.mockResolvedValue(mockNursery);
      mockGetAllNurseries.mockResolvedValue([mockNursery]);

      const nurseryId = await useNurseryStore
        .getState()
        .createNursery(newNurseryInput);
      expect(nurseryId).toBe('nursery-new');
      expect(mockCreateNursery).toHaveBeenCalledWith(newNurseryInput);
    });

    test('保育園情報を更新できること', async () => {
      const updates: UpdateNurseryInput = {
        name: '更新された保育園名',
      };

      mockUpdateNursery.mockResolvedValue(undefined);
      mockGetAllNurseries.mockResolvedValue([]);

      await useNurseryStore.getState().updateNursery('nursery-1', updates);
      expect(mockUpdateNursery).toHaveBeenCalledWith('nursery-1', updates);
    });

    test('保育園を削除できること', async () => {
      mockDeleteNursery.mockResolvedValue(undefined);
      mockGetAllNurseries.mockResolvedValue([]);

      await useNurseryStore.getState().deleteNursery('nursery-1');
      expect(mockDeleteNursery).toHaveBeenCalledWith('nursery-1');
    });

    test('現在の保育園を設定できること', async () => {
      const mockNursery: Nursery = {
        id: 'nursery-1',
        name: 'テスト保育園',
        visitSessions: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockGetNursery.mockResolvedValue(mockNursery);

      await useNurseryStore.getState().setCurrentNursery('nursery-1');
      expect(useNurseryStore.getState().currentNursery).toEqual(mockNursery);
    });
  });

  describe('見学セッション管理機能', () => {
    test('見学セッションを作成できること', async () => {
      const sessionInput: CreateVisitSessionInput = {
        visitDate: new Date('2024-02-15'),
        status: 'planned',
      };

      const mockSession: VisitSession = {
        id: 'session-new',
        visitDate: sessionInput.visitDate,
        status: sessionInput.status as VisitSessionStatus,
        questions: [],
        insights: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockNursery: Nursery = {
        id: 'nursery-1',
        name: 'テスト保育園',
        visitSessions: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCreateVisitSession.mockResolvedValue('session-new');
      mockGetVisitSession.mockResolvedValue(mockSession);
      mockGetNursery.mockResolvedValue(mockNursery);

      const sessionId = await useNurseryStore
        .getState()
        .createVisitSession('nursery-1', sessionInput);
      expect(sessionId).toBe('session-new');
      expect(mockCreateVisitSession).toHaveBeenCalledWith(
        'nursery-1',
        sessionInput
      );
    });

    test('見学セッション情報を更新できること', async () => {
      const updates: UpdateVisitSessionInput = {
        status: 'completed',
      };

      // 現在の保育園を設定（updateVisitSessionが内部でsetCurrentNurseryを呼ぶため）
      const mockNursery: Nursery = {
        id: 'nursery-1',
        name: 'テスト保育園',
        visitSessions: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      useNurseryStore.setState({ currentNursery: mockNursery });

      mockUpdateVisitSession.mockResolvedValue(undefined);
      mockGetNursery.mockResolvedValue(mockNursery);

      await useNurseryStore.getState().updateVisitSession('session-1', updates);
      expect(mockUpdateVisitSession).toHaveBeenCalledWith('session-1', updates);
    });

    test('見学セッションを削除できること', async () => {
      // 現在の保育園を設定（deleteVisitSessionが内部でsetCurrentNurseryを呼ぶため）
      const mockNursery: Nursery = {
        id: 'nursery-1',
        name: 'テスト保育園',
        visitSessions: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      useNurseryStore.setState({ currentNursery: mockNursery });

      mockDeleteVisitSession.mockResolvedValue(undefined);
      mockGetNursery.mockResolvedValue(mockNursery);

      await useNurseryStore.getState().deleteVisitSession('session-1');
      expect(mockDeleteVisitSession).toHaveBeenCalledWith('session-1');
    });
  });

  describe('エラーハンドリング', () => {
    test('データストアエラーが適切に処理されること', async () => {
      const dataStoreError = new Error('データベース接続エラー');
      mockGetAllNurseries.mockRejectedValue(dataStoreError);

      await useNurseryStore.getState().loadNurseries();
      expect(useNurseryStore.getState().error).toEqual({
        message: 'データベース接続エラー', // handleError関数が実際のエラーメッセージを使用
        code: 'LOAD_NURSERIES_FAILED',
        timestamp: expect.any(Date),
      });
    });

    test('エラーをクリアできること', () => {
      // 最初にエラーを設定
      useNurseryStore.setState({
        error: {
          message: 'テストエラー',
          code: 'TEST_ERROR',
          timestamp: new Date(),
        },
      });

      useNurseryStore.getState().clearError();
      expect(useNurseryStore.getState().error).toBeNull();
    });
  });

  describe('統計情報', () => {
    test('保育園の統計情報を取得できること', () => {
      // テスト用の保育園データを設定
      const mockNursery: Nursery = {
        id: 'nursery-1',
        name: 'テスト保育園',
        visitSessions: [
          {
            id: 'session-1',
            visitDate: new Date(),
            status: 'completed',
            questions: [
              createQuestionMock({
                id: 'q1',
                text: '質問1',
                isAnswered: true,
                answer: 'はい',
              }),
              createQuestionMock({
                id: 'q2',
                text: '質問2',
                isAnswered: false,
                answer: '',
              }),
            ],
            insights: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: 'session-2',
            visitDate: new Date(),
            status: 'planned',
            questions: [
              createQuestionMock({
                id: 'q3',
                text: '質問3',
                isAnswered: true,
                answer: 'いいえ',
              }),
            ],
            insights: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      useNurseryStore.setState({ nurseries: [mockNursery] });

      const stats = useNurseryStore.getState().getNurseryStats('nursery-1');
      expect(stats).toEqual({
        totalSessions: 2,
        completedSessions: 1,
        plannedSessions: 1,
        cancelledSessions: 0,
        totalQuestions: 3,
        totalAnsweredQuestions: 2,
        overallProgress: 66.67,
      });
    });
  });

  describe('ローディング状態管理', () => {
    test('非同期操作中はローディング状態になること', async () => {
      // モックの設定
      let resolveLoadNurseries: () => void;
      const loadNurseriesPromise = new Promise<Nursery[]>((resolve) => {
        resolveLoadNurseries = () => resolve([]);
      });

      mockGetAllNurseries.mockReturnValue(loadNurseriesPromise);

      // 非同期操作の開始
      const loadingPromise = useNurseryStore.getState().loadNurseries();

      // 一瞬待ってからローディング状態を確認
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(useNurseryStore.getState().loading.isLoading).toBe(true);
      expect(useNurseryStore.getState().loading.operation).toBe(
        '保育園リストを読み込み中...'
      );

      // 非同期操作を完了
      resolveLoadNurseries!();
      await loadingPromise;

      expect(useNurseryStore.getState().loading.isLoading).toBe(false);
    });
  });

  afterEach(() => {
    // 各テスト後にストアの状態をリセット
    useNurseryStore.setState({
      nurseries: [],
      currentNursery: null,
      currentVisitSession: null,
      loading: { isLoading: false },
      error: null,
      syncState: {
        isOnline: true,
        pendingChanges: 0,
      },
      storageConfig: {
        encryptionEnabled: false,
        autoBackup: true,
      },
    });
  });
});

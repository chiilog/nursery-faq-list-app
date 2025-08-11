import { describe, test, expect, vi, beforeEach } from 'vitest';
import type {
  Nursery,
  CreateNurseryInput,
  UpdateNurseryInput,
  CreateVisitSessionInput,
  UpdateVisitSessionInput,
} from '../types/data';
import { createQuestionMock } from '../test/test-utils';

// モック関数を先に定義（TDD Green Phase）
vi.mock('../services/nurseryDataStore', () => ({
  nurseryDataStore: {
    createNursery: vi.fn(),
    getNursery: vi.fn(),
    getAllNurseries: vi.fn(),
    updateNursery: vi.fn(),
    deleteNursery: vi.fn(),
    createVisitSession: vi.fn(),
    getVisitSession: vi.fn(),
    updateVisitSession: vi.fn(),
    deleteVisitSession: vi.fn(),
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

// 実際の実装をテスト
import { useNurseryStore } from './nurseryStore';
import { nurseryDataStore } from '../services/nurseryDataStore';

describe('NurseryStore (TDD Green Phase)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('保育園管理機能', () => {
    test('保育園一覧を読み込めること', async () => {
      // Green: 実装されたので成功することが期待される
      const mockNurseries: Nursery[] = [
        {
          id: 'nursery-1',
          name: 'テスト保育園A',
          visitSessions: [],
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
      ];

      (nurseryDataStore.getAllNurseries as any).mockResolvedValue(
        mockNurseries
      );

      const store = useNurseryStore.getState();
      await store.loadNurseries();

      expect(useNurseryStore.getState().nurseries).toEqual(mockNurseries);
    });

    test('新しい保育園を作成できること', async () => {
      // Green: 実装されたので成功することが期待される
      const newNurseryInput: CreateNurseryInput = {
        name: '新しい保育園',
      };

      const mockNurseries: Nursery[] = [
        {
          id: 'nursery-new',
          ...newNurseryInput,
          visitSessions: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (nurseryDataStore.createNursery as any).mockResolvedValue('nursery-new');
      (nurseryDataStore.getAllNurseries as any).mockResolvedValue(
        mockNurseries
      );

      const nurseryId = await useNurseryStore
        .getState()
        .createNursery(newNurseryInput);
      expect(nurseryId).toBe('nursery-new');
      expect(nurseryDataStore.createNursery).toHaveBeenCalledWith(
        newNurseryInput
      );
    });

    test('保育園情報を更新できること', async () => {
      // Green: 実装されたので成功することが期待される
      const updates: UpdateNurseryInput = {
        name: '更新された保育園名',
      };

      (nurseryDataStore.updateNursery as any).mockResolvedValue(undefined);
      (nurseryDataStore.getAllNurseries as any).mockResolvedValue([]);

      await useNurseryStore.getState().updateNursery('nursery-1', updates);
      expect(nurseryDataStore.updateNursery).toHaveBeenCalledWith(
        'nursery-1',
        updates
      );
    });

    test('保育園を削除できること', async () => {
      // Green: 実装されたので成功することが期待される
      (nurseryDataStore.deleteNursery as any).mockResolvedValue(undefined);
      (nurseryDataStore.getAllNurseries as any).mockResolvedValue([]);

      await useNurseryStore.getState().deleteNursery('nursery-1');
      expect(nurseryDataStore.deleteNursery).toHaveBeenCalledWith('nursery-1');
    });

    test('現在の保育園を設定できること', async () => {
      // Green: 実装されたので成功することが期待される
      const mockNursery: Nursery = {
        id: 'nursery-1',
        name: 'テスト保育園',
        visitSessions: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (nurseryDataStore.getNursery as any).mockResolvedValue(mockNursery);

      await useNurseryStore.getState().setCurrentNursery('nursery-1');
      expect(useNurseryStore.getState().currentNursery).toEqual(mockNursery);
    });
  });

  describe('見学セッション管理機能', () => {
    test('見学セッションを作成できること', async () => {
      // Green: 実装されたので成功することが期待される
      const sessionInput: CreateVisitSessionInput = {
        visitDate: new Date('2024-02-15'),
        status: 'planned',
      };

      const mockNursery: Nursery = {
        id: 'nursery-1',
        name: 'テスト保育園',
        visitSessions: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (nurseryDataStore.createVisitSession as any).mockResolvedValue(
        'session-new'
      );
      (nurseryDataStore.getNursery as any).mockResolvedValue(mockNursery);

      const sessionId = await useNurseryStore
        .getState()
        .createVisitSession('nursery-1', sessionInput);
      expect(sessionId).toBe('session-new');
      expect(nurseryDataStore.createVisitSession).toHaveBeenCalledWith(
        'nursery-1',
        sessionInput
      );
    });

    test('見学セッション情報を更新できること', async () => {
      // Green: 実装されたので成功することが期待される
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

      (nurseryDataStore.updateVisitSession as any).mockResolvedValue(undefined);
      (nurseryDataStore.getNursery as any).mockResolvedValue(mockNursery);

      await useNurseryStore.getState().updateVisitSession('session-1', updates);
      expect(nurseryDataStore.updateVisitSession).toHaveBeenCalledWith(
        'session-1',
        updates
      );
    });

    test('見学セッションを削除できること', async () => {
      // Green: 実装されたので成功することが期待される

      // 現在の保育園を設定（deleteVisitSessionが内部でsetCurrentNurseryを呼ぶため）
      const mockNursery: Nursery = {
        id: 'nursery-1',
        name: 'テスト保育園',
        visitSessions: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      useNurseryStore.setState({ currentNursery: mockNursery });

      (nurseryDataStore.deleteVisitSession as any).mockResolvedValue(undefined);
      (nurseryDataStore.getNursery as any).mockResolvedValue(mockNursery);

      await useNurseryStore.getState().deleteVisitSession('session-1');
      expect(nurseryDataStore.deleteVisitSession).toHaveBeenCalledWith(
        'session-1'
      );
    });
  });

  describe('エラーハンドリング', () => {
    test('データストアエラーが適切に処理されること', async () => {
      // Green: 実装されたので成功することが期待される
      const dataStoreError = new Error('データベース接続エラー');
      (nurseryDataStore.getAllNurseries as any).mockRejectedValue(
        dataStoreError
      );

      await useNurseryStore.getState().loadNurseries();
      expect(useNurseryStore.getState().error).toEqual({
        message: '保育園リストの読み込みに失敗しました',
        code: 'LOAD_NURSERIES_FAILED',
        timestamp: expect.any(Date),
      });
    });

    test('エラーをクリアできること', () => {
      // Green: 実装されたので成功することが期待される

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
      // Green: 実装されたので成功することが期待される

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
      // Green: 実装されたので成功することが期待される

      // モックの設定
      let resolveLoadNurseries: () => void;
      const loadNurseriesPromise = new Promise<Nursery[]>((resolve) => {
        resolveLoadNurseries = () => resolve([]);
      });

      (nurseryDataStore.getAllNurseries as any).mockReturnValue(
        loadNurseriesPromise
      );

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
    });
  });
});

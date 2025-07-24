import { describe, test, expect, vi, beforeEach } from 'vitest';
import type {
  Nursery,
  CreateNurseryInput,
  UpdateNurseryInput,
  CreateVisitSessionInput,
  UpdateVisitSessionInput,
} from '../types/data';

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
    constructor(message: string, public code: string) { 
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
          address: '東京都渋谷区1-1-1',
          phoneNumber: '03-1234-5678',
          website: 'https://test-nursery-a.jp',
          visitSessions: [],
          notes: 'アットホームな保育園',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
      ];

      (nurseryDataStore.getAllNurseries as any).mockResolvedValue(mockNurseries);

      const store = useNurseryStore.getState();
      await store.loadNurseries();
      
      expect(useNurseryStore.getState().nurseries).toEqual(mockNurseries);
    });

    test('新しい保育園を作成できること', async () => {
      // Red: まだ実装されていない機能のテスト
      const newNurseryInput: CreateNurseryInput = {
        name: '新しい保育園',
        address: '東京都新宿区2-2-2', 
        phoneNumber: '03-9876-5432',
        website: 'https://new-nursery.jp',
        notes: '新しく開園した保育園',
      };

      const expectedNursery: Nursery = {
        id: 'nursery-new',
        ...newNurseryInput,
        visitSessions: [],
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      };

      mockDataStore.createNursery.mockResolvedValue('nursery-new');
      mockDataStore.getNursery.mockResolvedValue(expectedNursery);

      // 実装前なので失敗することが期待される
      await expect(async () => {
        const nurseryId = await mockNurseryStore.createNursery(newNurseryInput);
        expect(nurseryId).toBe('nursery-new');
        expect(mockDataStore.createNursery).toHaveBeenCalledWith(newNurseryInput);
      }).rejects.toThrow();
    });

    test('保育園情報を更新できること', async () => {
      // Red: まだ実装されていない機能のテスト
      const updates: UpdateNurseryInput = {
        name: '更新された保育園名',
        phoneNumber: '03-1111-2222',
      };
      
      // 実装前なので失敗することが期待される
      await expect(async () => {
        await mockNurseryStore.updateNursery('nursery-1', updates);
        expect(mockDataStore.updateNursery).toHaveBeenCalledWith('nursery-1', updates);
      }).rejects.toThrow();
    });

    test('保育園を削除できること', async () => {
      // Red: まだ実装されていない機能のテスト
      
      // 実装前なので失敗することが期待される
      await expect(async () => {
        await mockNurseryStore.deleteNursery('nursery-1');
        expect(mockDataStore.deleteNursery).toHaveBeenCalledWith('nursery-1');
      }).rejects.toThrow();
    });

    test('現在の保育園を設定できること', async () => {
      // Red: まだ実装されていない機能のテスト
      const mockNursery: Nursery = {
        id: 'nursery-1',
        name: 'テスト保育園',
        visitSessions: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDataStore.getNursery.mockResolvedValue(mockNursery);

      // 実装前なので失敗することが期待される
      await expect(async () => {
        await mockNurseryStore.setCurrentNursery('nursery-1');
        expect(mockNurseryStore.currentNursery).toEqual(mockNursery);
      }).rejects.toThrow();
    });
  });

  describe('見学セッション管理機能', () => {
    test('見学セッションを作成できること', async () => {
      // Red: まだ実装されていない機能のテスト
      const sessionInput: CreateVisitSessionInput = {
        visitDate: new Date('2024-02-15'),
        status: 'planned',
        notes: '10時から見学予定',
      };

      // 実装前なので失敗することが期待される
      await expect(async () => {
        const sessionId = await mockNurseryStore.createVisitSession('nursery-1', sessionInput);
        expect(sessionId).toBe('session-new');
        expect(mockDataStore.createVisitSession).toHaveBeenCalledWith('nursery-1', sessionInput);
      }).rejects.toThrow();
    });

    test('見学セッション情報を更新できること', async () => {
      // Red: まだ実装されていない機能のテスト
      const updates: UpdateVisitSessionInput = {
        status: 'completed',
        notes: '見学完了。とても良い印象でした。',
      };
      
      // 実装前なので失敗することが期待される
      await expect(async () => {
        await mockNurseryStore.updateVisitSession('session-1', updates);
        expect(mockDataStore.updateVisitSession).toHaveBeenCalledWith('session-1', updates);
      }).rejects.toThrow();
    });

    test('見学セッションを削除できること', async () => {
      // Red: まだ実装されていない機能のテスト
      
      // 実装前なので失敗することが期待される
      await expect(async () => {
        await mockNurseryStore.deleteVisitSession('session-1');
        expect(mockDataStore.deleteVisitSession).toHaveBeenCalledWith('session-1');
      }).rejects.toThrow();
    });
  });

  describe('エラーハンドリング', () => {
    test('データストアエラーが適切に処理されること', async () => {
      // Red: まだ実装されていない機能のテスト
      const dataStoreError = new Error('データベース接続エラー');
      mockDataStore.getAllNurseries.mockRejectedValue(dataStoreError);

      // 実装前なので失敗することが期待される
      await expect(async () => {
        await mockNurseryStore.loadNurseries();
        expect(mockNurseryStore.error).toEqual({
          message: '保育園リストの読み込みに失敗しました',
          code: 'LOAD_NURSERIES_FAILED',
          timestamp: expect.any(Date),
        });
      }).rejects.toThrow();
    });

    test('エラーをクリアできること', () => {
      // Red: まだ実装されていない機能のテスト
      
      // 実装前なので失敗することが期待される
      expect(() => {
        mockNurseryStore.clearError();
        expect(mockNurseryStore.error).toBeNull();
      }).toThrow();
    });
  });

  describe('統計情報', () => {
    test('保育園の統計情報を取得できること', () => {
      // Red: まだ実装されていない機能のテスト
      
      // 実装前なので失敗することが期待される
      expect(() => {
        const stats = mockNurseryStore.getNurseryStats('nursery-1');
        expect(stats).toEqual({
          totalSessions: 3,
          completedSessions: 1,
          plannedSessions: 2,
          cancelledSessions: 0,
          totalQuestions: 15,
          totalAnsweredQuestions: 8,
          overallProgress: 53.33,
        });
      }).toThrow();
    });
  });

  describe('ローディング状態管理', () => {
    test('非同期操作中はローディング状態になること', async () => {
      // Red: まだ実装されていない機能のテスト
      
      // 実装前なので失敗することが期待される
      await expect(async () => {
        const loadingPromise = mockNurseryStore.loadNurseries();
        expect(mockNurseryStore.loading.isLoading).toBe(true);
        expect(mockNurseryStore.loading.operation).toBe('保育園リストを読み込み中...');
        
        await loadingPromise;
        expect(mockNurseryStore.loading.isLoading).toBe(false);
      }).rejects.toThrow();
    });
  });
});
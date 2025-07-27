import { describe, test, expect, vi, beforeEach } from 'vitest';
import type {
  Nursery,
  CreateNurseryInput,
  UpdateNurseryInput,
  VisitSession,
  CreateVisitSessionInput,
  UpdateVisitSessionInput,
} from '../types/data';

// テスト用の型定義
interface MockLocalStorageData {
  [key: string]: {
    id: string;
    name: string;
    visitSessions?: any[];
    createdAt: string | Date;
    updatedAt: string | Date;
    [key: string]: any;
  };
}

// モック化したlocalStorageとnurseryDataStore（実装前）
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// 実際の実装をテスト
import { nurseryDataStore } from './nurseryDataStore';

describe('NurseryDataStore (TDD Green Phase)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.clear();
  });

  describe('保育園データ管理', () => {
    test('保育園を作成して保存できること', async () => {
      // Red: まだ実装されていない機能のテスト
      const nurseryInput: CreateNurseryInput = {
        name: 'テスト保育園',
      };

      // Green: 実装されたので成功することが期待される
      const nurseryId = await nurseryDataStore.createNursery(nurseryInput);
      expect(nurseryId).toMatch(/^nursery-[a-f0-9-]+$/);
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });

    test('保育園IDで保育園データを取得できること', async () => {
      // Red: まだ実装されていない機能のテスト
      const mockNursery: Nursery = {
        id: 'nursery-1',
        name: 'テスト保育園',
        address: '東京都渋谷区1-1-1',
        visitSessions: [],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      mockLocalStorage.getItem.mockReturnValue(
        JSON.stringify({ 'nursery-1': mockNursery })
      );

      // Green: 実装されたので成功することが期待される
      const nursery = await nurseryDataStore.getNursery('nursery-1');
      expect(nursery).toEqual(mockNursery);
    });

    test('全保育園データを取得できること', async () => {
      // Red: まだ実装されていない機能のテスト
      const mockNurseries: Nursery[] = [
        {
          id: 'nursery-1',
          name: 'テスト保育園A',
          visitSessions: [],
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
        {
          id: 'nursery-2',
          name: 'テスト保育園B',
          visitSessions: [],
          createdAt: new Date('2024-01-02'),
          updatedAt: new Date('2024-01-02'),
        },
      ];

      mockLocalStorage.getItem.mockReturnValue(
        JSON.stringify({
          'nursery-1': mockNurseries[0],
          'nursery-2': mockNurseries[1],
        })
      );

      // Green: 実装されたので成功することが期待される
      const nurseries = await nurseryDataStore.getAllNurseries();
      expect(nurseries).toEqual(mockNurseries);
    });

    test('保育園データを更新できること', async () => {
      // Red: まだ実装されていない機能のテスト
      const updates: UpdateNurseryInput = {
        name: '更新されたテスト保育園',
        phoneNumber: '03-9999-8888',
      };

      const existingNursery: Nursery = {
        id: 'nursery-1',
        name: 'テスト保育園',
        visitSessions: [],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      mockLocalStorage.getItem.mockReturnValue(
        JSON.stringify({ 'nursery-1': existingNursery })
      );

      // Green: 実装されたので成功することが期待される
      await nurseryDataStore.updateNursery('nursery-1', updates);
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });

    test('保育園データを削除できること', async () => {
      // Red: まだ実装されていない機能のテスト
      const existingData = {
        'nursery-1': {
          id: 'nursery-1',
          name: 'テスト保育園A',
          visitSessions: [],
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
        'nursery-2': {
          id: 'nursery-2',
          name: 'テスト保育園B',
          visitSessions: [],
          createdAt: new Date('2024-01-02'),
          updatedAt: new Date('2024-01-02'),
        },
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(existingData));

      // Green: 実装されたので成功することが期待される
      await nurseryDataStore.deleteNursery('nursery-1');

      const setItemCalls = mockLocalStorage.setItem.mock.calls;
      const lastCall = setItemCalls[setItemCalls.length - 1];
      const updatedData = JSON.parse(lastCall[1]) as MockLocalStorageData;
      expect(updatedData).not.toHaveProperty('nursery-1');
      expect(updatedData).toHaveProperty('nursery-2');
    });
  });

  describe('見学セッションデータ管理', () => {
    test('見学セッションを作成できること', async () => {
      // Red: まだ実装されていない機能のテスト
      const sessionInput: CreateVisitSessionInput = {
        visitDate: new Date('2024-02-15'),
        status: 'planned',
        notes: '午前中に見学予定',
      };

      const existingNursery: Nursery = {
        id: 'nursery-1',
        name: 'テスト保育園',
        visitSessions: [],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      mockLocalStorage.getItem.mockReturnValue(
        JSON.stringify({ 'nursery-1': existingNursery })
      );

      // Green: 実装されたので成功することが期待される
      const sessionId = await nurseryDataStore.createVisitSession(
        'nursery-1',
        sessionInput
      );
      expect(sessionId).toMatch(/^session-[a-f0-9-]+$/);
    });

    test('見学セッションを更新できること', async () => {
      // Red: まだ実装されていない機能のテスト
      const updates: UpdateVisitSessionInput = {
        status: 'completed',
        notes: '見学完了。とても良い印象',
      };

      const existingSession: VisitSession = {
        id: 'session-1',
        visitDate: new Date('2024-02-15'),
        status: 'planned',
        questions: [],
        notes: '午前中に見学予定',
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-02-01'),
      };

      const existingNursery: Nursery = {
        id: 'nursery-1',
        name: 'テスト保育園',
        visitSessions: [existingSession],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      mockLocalStorage.getItem.mockReturnValue(
        JSON.stringify({ 'nursery-1': existingNursery })
      );

      // Green: 実装されたので成功することが期待される
      await nurseryDataStore.updateVisitSession('session-1', updates);
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });

    test('見学セッションを削除できること', async () => {
      // Red: まだ実装されていない機能のテスト
      const existingSession: VisitSession = {
        id: 'session-1',
        visitDate: new Date('2024-02-15'),
        status: 'planned',
        questions: [],
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-02-01'),
      };

      const existingNursery: Nursery = {
        id: 'nursery-1',
        name: 'テスト保育園',
        visitSessions: [existingSession],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      mockLocalStorage.getItem.mockReturnValue(
        JSON.stringify({ 'nursery-1': existingNursery })
      );

      // Green: 実装されたので成功することが期待される
      await nurseryDataStore.deleteVisitSession('session-1');

      const setItemCalls = mockLocalStorage.setItem.mock.calls;
      const lastCall = setItemCalls[setItemCalls.length - 1];
      const updatedData = JSON.parse(lastCall[1]) as MockLocalStorageData;
      const nursery = updatedData['nursery-1'];
      expect(nursery.visitSessions).toHaveLength(0);
    });
  });

  describe('データ整合性', () => {
    test('存在しない保育園にアクセスした場合はnullを返すこと', async () => {
      // Red: まだ実装されていない機能のテスト
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify({}));

      // Green: 実装されたので成功することが期待される
      const nursery = await nurseryDataStore.getNursery('non-existent');
      expect(nursery).toBeNull();
    });

    test('保存時にupdatedAtが更新されること', async () => {
      // Red: まだ実装されていない機能のテスト
      const nurseryInput: CreateNurseryInput = {
        name: 'テスト保育園',
      };

      // Green: 実装されたので成功することが期待される
      const nurseryId = await nurseryDataStore.createNursery(nurseryInput);

      const setItemCalls = mockLocalStorage.setItem.mock.calls;
      const lastCall = setItemCalls[setItemCalls.length - 1];
      const savedData = JSON.parse(lastCall[1]) as MockLocalStorageData;
      const savedNursery = savedData[nurseryId];

      expect(savedNursery.createdAt).toBeDefined();
      expect(savedNursery.updatedAt).toBeDefined();
      expect(new Date(savedNursery.updatedAt).getTime()).toBeGreaterThanOrEqual(
        new Date(savedNursery.createdAt).getTime()
      );
    });
  });

  describe('エラーハンドリング', () => {
    test('localStorage エラーが適切に処理されること', async () => {
      // Red: まだ実装されていない機能のテスト
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('localStorage quota exceeded');
      });

      const nurseryInput: CreateNurseryInput = {
        name: 'テスト保育園',
      };

      // Green: 実装されたので成功することが期待される
      await expect(
        nurseryDataStore.createNursery(nurseryInput)
      ).rejects.toThrow('データの保存に失敗しました');
    });

    test('不正なJSONデータが適切に処理されること', async () => {
      // Red: まだ実装されていない機能のテスト
      mockLocalStorage.getItem.mockReturnValue('invalid json');

      // Green: 実装されたので成功することが期待される
      await expect(nurseryDataStore.getAllNurseries()).rejects.toThrow(
        'データの読み込みに失敗しました'
      );
    });
  });
});

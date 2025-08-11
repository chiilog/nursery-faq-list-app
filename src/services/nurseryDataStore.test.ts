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
    visitSessions: {
      id: string;
      visitDate: string;
      status: string;
      questions: any[];
      createdAt: string;
      updatedAt: string;
      [key: string]: any;
    }[];
    createdAt: string | Date;
    updatedAt: string | Date;
    [key: string]: any;
  };
}

// モック化したlocalStorage
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

// nurseryDataStoreの実装をテスト
import { nurseryDataStore } from './nurseryDataStore';

describe('NurseryDataStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.clear();
  });

  describe('保育園データ管理', () => {
    test('保育園を作成して保存できること', async () => {
      const nurseryInput: CreateNurseryInput = {
        name: 'テスト保育園',
      };

      const nurseryId = await nurseryDataStore.createNursery(nurseryInput);

      expect(nurseryId).toMatch(/^nursery-[a-f0-9-]+$/);
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });

    test('保育園作成時に必ず見学セッションが作成されること', async () => {
      const nurseryInput: CreateNurseryInput = {
        name: 'テスト保育園',
        // 見学日を指定しない
      };

      const nurseryId = await nurseryDataStore.createNursery(nurseryInput);

      // 保存されたデータを確認
      const setItemCalls = mockLocalStorage.setItem.mock.calls;
      const lastCall = setItemCalls[setItemCalls.length - 1];
      const savedData = JSON.parse(lastCall[1]) as MockLocalStorageData;
      const savedNursery = savedData[nurseryId];

      // 見学セッションが1つ作成されていることを確認
      expect(savedNursery.visitSessions).toHaveLength(1);
      expect(savedNursery.visitSessions[0]).toMatchObject({
        id: expect.stringMatching(/^session-[a-f0-9-]+$/),
        status: 'planned',
        questions: [],
      });

      // 見学日がnull（未定）になっていることを確認
      expect(savedNursery.visitSessions[0].visitDate).toBeNull();
    });

    test('見学日指定時は指定した日付で見学セッションが作成されること', async () => {
      const specifiedDate = new Date('2025-03-15');
      const nurseryInput: CreateNurseryInput = {
        name: 'テスト保育園',
        visitDate: specifiedDate,
      };

      const nurseryId = await nurseryDataStore.createNursery(nurseryInput);

      // 保存されたデータを確認
      const setItemCalls = mockLocalStorage.setItem.mock.calls;
      const lastCall = setItemCalls[setItemCalls.length - 1];
      const savedData = JSON.parse(lastCall[1]) as MockLocalStorageData;
      const savedNursery = savedData[nurseryId];

      // 見学セッションが指定日付で作成されていることを確認
      expect(savedNursery.visitSessions).toHaveLength(1);
      const visitDate = new Date(savedNursery.visitSessions[0].visitDate);
      expect(visitDate.toISOString()).toBe(specifiedDate.toISOString());
    });

    test('保育園IDで保育園データを取得できること', async () => {
      const mockNursery: Nursery = {
        id: 'nursery-1',
        name: 'テスト保育園',
        visitSessions: [],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      mockLocalStorage.getItem.mockReturnValue(
        JSON.stringify({ 'nursery-1': mockNursery })
      );

      const nursery = await nurseryDataStore.getNursery('nursery-1');

      expect(nursery).not.toBeNull();
      expect(nursery?.createdAt).toBeInstanceOf(Date);
      expect(nursery?.updatedAt).toBeInstanceOf(Date);
      expect(nursery).toEqual(mockNursery);
    });

    test('全保育園データを取得できること', async () => {
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

      const nurseries = await nurseryDataStore.getAllNurseries();

      // マイグレーション処理により、空のvisitSessionsにデフォルトセッションが追加される
      expect(nurseries).toHaveLength(2);
      expect(nurseries[0].id).toBe('nursery-1');
      expect(nurseries[0].name).toBe('テスト保育園A');
      expect(nurseries[0].visitSessions).toHaveLength(1);
      expect(nurseries[0].visitSessions[0].visitDate).toBeNull();

      expect(nurseries[1].id).toBe('nursery-2');
      expect(nurseries[1].name).toBe('テスト保育園B');
      expect(nurseries[1].visitSessions).toHaveLength(1);
      expect(nurseries[1].visitSessions[0].visitDate).toBeNull();
    });

    test('保育園データを更新できること', async () => {
      const updates: UpdateNurseryInput = {
        name: '更新されたテスト保育園',
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

      await nurseryDataStore.updateNursery('nursery-1', updates);

      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });

    test('保育園データを削除できること', async () => {
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

      const sessionId = await nurseryDataStore.createVisitSession(
        'nursery-1',
        sessionInput
      );

      expect(sessionId).toMatch(/^session-[a-f0-9-]+$/);
    });

    test('見学セッションを更新できること', async () => {
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

      await nurseryDataStore.updateVisitSession('session-1', updates);

      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });

    test('見学セッションを削除できること', async () => {
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
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify({}));

      const nursery = await nurseryDataStore.getNursery('non-existent');

      expect(nursery).toBeNull();
    });

    test('保存時にupdatedAtが更新されること', async () => {
      const nurseryInput: CreateNurseryInput = {
        name: 'テスト保育園',
      };

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
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('localStorage quota exceeded');
      });
      const nurseryInput: CreateNurseryInput = {
        name: 'テスト保育園',
      };

      await expect(
        nurseryDataStore.createNursery(nurseryInput)
      ).rejects.toThrow('データの保存に失敗しました');
    });

    test('不正なJSONデータが適切に処理されること', async () => {
      mockLocalStorage.getItem.mockReturnValue('invalid json');

      await expect(nurseryDataStore.getAllNurseries()).rejects.toThrow(
        'データの読み込みに失敗しました'
      );
    });
  });
});
